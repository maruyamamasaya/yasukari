import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import tableStyles from "../../../../styles/AdminTable.module.css";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import {
  RentalAvailabilityDay,
  RentalAvailabilityMap,
  RentalAvailabilityStatus,
  Vehicle,
} from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

type SlotFormState = {
  date: string;
  status: RentalAvailabilityStatus;
  note: string;
};

const STATUS_LABELS: Record<RentalAvailabilityStatus, string> = {
  AVAILABLE: "レンタル可",
  UNAVAILABLE: "貸出不可",
  MAINTENANCE: "メンテナンス",
};

const initialSlotForm: SlotFormState = {
  date: "",
  status: "AVAILABLE",
  note: "",
};

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const getUpcomingWeekDates = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, offset) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + offset);
    return formatDateInput(nextDate);
  });
};

const buildCalendarWeeks = (month: Date) => {
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDay = firstDayOfMonth.getDay();

  const cells: (Date | null)[] = Array.from({ length: startDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
};

const normalizeAvailabilityMap = (value: unknown): RentalAvailabilityMap => {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<RentalAvailabilityMap>(
    (acc, [date, raw]) => {
      if (typeof date !== "string") {
        return acc;
      }

      const normalizedEntry = (() => {
        if (Array.isArray(raw)) {
          if (raw.length === 0) {
            return null;
          }

          const [firstSlot] = raw as Record<string, unknown>[];
          const noteCandidate =
            typeof firstSlot?.note === "string" && firstSlot.note.trim().length > 0
              ? firstSlot.note.trim()
              : undefined;

          return {
            status: "AVAILABLE",
            ...(noteCandidate ? { note: noteCandidate } : {}),
          } satisfies RentalAvailabilityDay;
        }

        if (typeof raw !== "object" || raw === null) {
          return null;
        }

        const { status, note } = raw as Record<string, unknown>;
        const isValidStatus =
          status === "AVAILABLE" || status === "UNAVAILABLE" || status === "MAINTENANCE";
        if (!isValidStatus) {
          return null;
        }

        const trimmedNote =
          typeof note === "string" && note.trim().length > 0 ? note.trim() : undefined;

        return { status, ...(trimmedNote ? { note: trimmedNote } : {}) } satisfies RentalAvailabilityDay;
      })();

      if (normalizedEntry) {
        acc[date] = normalizedEntry;
      }

      return acc;
    },
    {}
  );
};

export default function BikeScheduleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<RentalAvailabilityMap>({});
  const [slotForm, setSlotForm] = useState<SlotFormState>(initialSlotForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) {
          throw new Error("failed to load");
        }
        const data: Vehicle[] = await response.json();
        setVehicles(data);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to load vehicles for schedule management", error);
        setLoadError("車両一覧の取得に失敗しました。しばらく待ってから再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVehicles();
  }, []);

  const selectedVehicle = useMemo(
    () =>
      selectedVehicleId
        ? vehicles.find((vehicle) => vehicle.managementNumber === selectedVehicleId) ?? null
        : null,
    [selectedVehicleId, vehicles]
  );

  useEffect(() => {
    if (selectedVehicle) {
      setAvailabilityMap(
        normalizeAvailabilityMap(selectedVehicle.rentalAvailability)
      );
    } else {
      setAvailabilityMap({});
    }
    setSaveSuccess(null);
    setSaveError(null);
  }, [selectedVehicle]);

  const upcomingWeekDates = useMemo(() => getUpcomingWeekDates(), []);

  const displayMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
  }, [calendarMonthOffset]);

  const calendarWeeks = useMemo(
    () => buildCalendarWeeks(displayMonth),
    [displayMonth]
  );

  const sortedDates = useMemo(
    () => Object.keys(availabilityMap).sort((a, b) => a.localeCompare(b)),
    [availabilityMap]
  );

  const handleSlotFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedVehicle) {
      setFormError("スケジュールを追加する車両を選択してください。");
      return;
    }

    if (!slotForm.date) {
      setFormError("日付と状態を入力してください。");
      return;
    }

    setFormError(null);
    const { date, status, note } = slotForm;
    const trimmedNote = note.trim();

    setAvailabilityMap((prev) => ({
      ...prev,
      [date]: {
        status,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
    }));

    setSlotForm((prev) => ({ ...initialSlotForm, status: prev.status }));
  };

  const handleRemoveSlot = (date: string) => {
    setAvailabilityMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[date];
      return nextMap;
    });
  };

  const handleSave = async () => {
    if (!selectedVehicle) {
      setSaveError("スケジュールを保存する車両を選択してください。");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const payload = {
      managementNumber: selectedVehicle.managementNumber,
      modelId: selectedVehicle.modelId,
      storeId: selectedVehicle.storeId,
      publishStatus: selectedVehicle.publishStatus,
      tags: selectedVehicle.tags ?? [],
      rentalAvailability: availabilityMap,
      policyNumber1: selectedVehicle.policyNumber1,
      policyBranchNumber1: selectedVehicle.policyBranchNumber1,
      policyNumber2: selectedVehicle.policyNumber2,
      policyBranchNumber2: selectedVehicle.policyBranchNumber2,
      inspectionExpiryDate: selectedVehicle.inspectionExpiryDate,
      licensePlateNumber: selectedVehicle.licensePlateNumber,
      previousLicensePlateNumber: selectedVehicle.previousLicensePlateNumber,
      liabilityInsuranceExpiryDate: selectedVehicle.liabilityInsuranceExpiryDate,
      videoUrl: selectedVehicle.videoUrl,
      notes: selectedVehicle.notes,
    };

    try {
      const response = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { message?: string };
        throw new Error(errorBody.message ?? "保存に失敗しました。");
      }

      const updated = (await response.json()) as Vehicle;
      setSaveSuccess("レンタル可能日の更新が完了しました。");
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.managementNumber === updated.managementNumber ? updated : vehicle
        )
      );
    } catch (error) {
      console.error("Failed to save rental availability", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "レンタル可能日の保存に失敗しました。"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>バイクスケジュール管理</title>
      </Head>
      <DashboardLayout
        title="バイクスケジュール管理"
        description="車両ごとにレンタル可能日をカレンダー形式で管理します。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              <div>
                <h2 className={styles.menuGroupTitle}>スケジュール設定</h2>
                <p className={styles.menuGroupNote}>
                  各車両のレンタル可能日を日単位で管理します（キー: 日付、値: ステータス）。
                </p>
                <p className={styles.menuGroupNote}>
                  直近1週間の状況を確認しつつ、詳細カレンダーを開いて任意の日を登録・更新できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              <div className={formStyles.formRow}>
                <label className={formStyles.formLabel} htmlFor="vehicle">
                  車両を選択
                </label>
                <select
                  id="vehicle"
                  className={formStyles.formSelect}
                  value={selectedVehicleId ?? ""}
                  onChange={(event) => setSelectedVehicleId(event.target.value || null)}
                  disabled={isLoading || vehicles.length === 0}
                >
                  <option value="">選択してください</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.managementNumber} value={vehicle.managementNumber}>
                      {vehicle.managementNumber} / {getStoreLabel(vehicle.storeId)}
                    </option>
                  ))}
                </select>
              </div>

              {loadError && <p className={formStyles.formError}>{loadError}</p>}

              {selectedVehicle && (
                <div className={formStyles.formRow}>
                  <div className={formStyles.formLabel}>直近1週間</div>
                  <div>
                    <p className={styles.menuGroupNote}>
                      今日から7日間の公開状態とメモを一覧表示します。
                    </p>
                    <table className={tableStyles.table}>
                      <thead>
                        <tr>
                          <th>日付</th>
                          <th>状態</th>
                          <th>メモ</th>
                          <th>クイック操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingWeekDates.map((date) => {
                          const entry = availabilityMap[date];
                          return (
                            <tr key={date}>
                              <td>{date}</td>
                              <td>{entry ? STATUS_LABELS[entry.status] : "未設定"}</td>
                              <td>{entry?.note ?? "-"}</td>
                              <td>
                                <button
                                  type="button"
                                  className={formStyles.secondaryButton}
                                  onClick={() =>
                                    setSlotForm((prev) => ({ ...prev, date }))
                                  }
                                >
                                  フォームに反映
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className={styles.buttonRow} style={{ marginTop: "0.75rem" }}>
                      <button
                        type="button"
                        className={formStyles.secondaryButton}
                        onClick={() => setShowCalendar((prev) => !prev)}
                      >
                        {showCalendar ? "詳細カレンダーを閉じる" : "詳細カレンダーを表示"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedVehicle && showCalendar && (
                <div className={formStyles.formRow}>
                  <div className={formStyles.formLabel}>詳細カレンダー</div>
                  <div>
                    <div className={styles.buttonRow} style={{ alignItems: "center" }}>
                      <button
                        type="button"
                        className={formStyles.secondaryButton}
                        onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                      >
                        前月
                      </button>
                      <div className={styles.menuGroupTitle}>
                        {displayMonth.getFullYear()}年{displayMonth.getMonth() + 1}月
                      </div>
                      <button
                        type="button"
                        className={formStyles.secondaryButton}
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                      >
                        翌月
                      </button>
                    </div>
                    <table className={tableStyles.table}>
                      <thead>
                        <tr>
                          {"日月火水木金土".split("").map((weekday) => (
                            <th key={weekday}>{weekday}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {calendarWeeks.map((week, weekIndex) => (
                          <tr key={`week-${weekIndex}`}>
                            {week.map((day, dayIndex) => {
                              if (!day) {
                                return <td key={`${weekIndex}-${dayIndex}`}></td>;
                              }

                              const dateKey = formatDateInput(day);
                              const entry = availabilityMap[dateKey];
                              return (
                                <td
                                  key={`${weekIndex}-${dayIndex}`}
                                  style={{ verticalAlign: "top", minWidth: "120px" }}
                                  onClick={() =>
                                    setSlotForm((prev) => ({ ...prev, date: dateKey }))
                                  }
                                >
                                  <div className={styles.menuGroupTitle}>{day.getDate()}日</div>
                                  <div className={styles.menuGroupNote}>
                                    {entry ? STATUS_LABELS[entry.status] : "未設定"}
                                  </div>
                                  {entry?.note && (
                                    <div className={styles.menuGroupNote}>{entry.note}</div>
                                  )}
                                  <button
                                    type="button"
                                    className={formStyles.secondaryButton}
                                    onClick={() =>
                                      setSlotForm((prev) => ({
                                        ...prev,
                                        date: dateKey,
                                      }))
                                    }
                                  >
                                    この日を編集
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className={styles.menuGroupNote}>
                      カレンダーセルをクリックすると、下の入力フォームに日付が自動入力されます。
                    </p>
                  </div>
                </div>
              )}

              {selectedVehicle && (
                <div className={formStyles.formRow}>
                  <div className={formStyles.formLabel}>登録済み一覧</div>
                  <div>
                    {sortedDates.length === 0 ? (
                      <p className={styles.menuGroupNote}>まだスケジュールは登録されていません。</p>
                    ) : (
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>日付</th>
                            <th>状態</th>
                            <th>メモ</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedDates.map((date) => {
                            const entry = availabilityMap[date];
                            if (!entry) {
                              return null;
                            }
                            return (
                              <tr key={date}>
                                <td>{date}</td>
                                <td>{STATUS_LABELS[entry.status]}</td>
                                <td>{entry.note ?? "-"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={formStyles.secondaryButton}
                                    onClick={() => handleRemoveSlot(date)}
                                  >
                                    削除
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {selectedVehicle && (
                <form className={formStyles.form} onSubmit={handleSlotFormSubmit}>
                  <h3 className={styles.menuGroupTitle}>スケジュールを追加</h3>
                  <div className={formStyles.formGrid}>
                    <div className={formStyles.formRow}>
                      <label className={formStyles.formLabel} htmlFor="date">
                        日付
                      </label>
                      <input
                        type="date"
                        id="date"
                        className={formStyles.formInput}
                        value={slotForm.date}
                        onChange={(event) =>
                          setSlotForm((prev) => ({ ...prev, date: event.target.value }))
                        }
                      />
                    </div>
                    <div className={formStyles.formRow}>
                      <label className={formStyles.formLabel} htmlFor="status">
                        状態
                      </label>
                      <select
                        id="status"
                        className={formStyles.formSelect}
                        value={slotForm.status}
                        onChange={(event) =>
                          setSlotForm((prev) => ({
                            ...prev,
                            status: event.target.value as RentalAvailabilityStatus,
                          }))
                        }
                      >
                        {(
                          ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"] as RentalAvailabilityStatus[]
                        ).map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={formStyles.formRow}>
                      <label className={formStyles.formLabel} htmlFor="note">
                        メモ（任意）
                      </label>
                      <input
                        type="text"
                        id="note"
                        className={formStyles.formInput}
                        value={slotForm.note}
                        onChange={(event) =>
                          setSlotForm((prev) => ({ ...prev, note: event.target.value }))
                        }
                        placeholder="レンタル可・整備予定など"
                      />
                    </div>
                  </div>
                  {formError && <p className={formStyles.formError}>{formError}</p>}
                  <button type="submit" className={formStyles.submitButton}>
                    スケジュールを追加
                  </button>
                </form>
              )}

              {selectedVehicle && (
                <div className={styles.menuActions}>
                  {saveError && <p className={formStyles.formError}>{saveError}</p>}
                  {saveSuccess && <p className={formStyles.formSuccess}>{saveSuccess}</p>}
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      className={formStyles.secondaryButton}
                      onClick={() => setAvailabilityMap({})}
                      disabled={isSaving}
                    >
                      すべてクリア
                    </button>
                    <button
                      type="button"
                      className={formStyles.submitButton}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? "保存中..." : "データベースへ保存"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

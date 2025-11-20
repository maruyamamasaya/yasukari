import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import tableStyles from "../../../../styles/AdminTable.module.css";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import {
  RentalAvailabilityDay,
  RentalAvailabilityMap,
  RentalAvailabilityStatus,
  Vehicle,
  BikeModel,
} from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

const STATUS_LABELS: Record<RentalAvailabilityStatus, string> = {
  AVAILABLE: "レンタル可",
  UNAVAILABLE: "貸出不可",
  MAINTENANCE: "メンテナンス",
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
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<RentalAvailabilityMap>({});
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<RentalAvailabilityStatus>("AVAILABLE");
  const [activeNote, setActiveNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const [vehicleResponse, modelResponse] = await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/bike-models"),
        ]);

        if (!vehicleResponse.ok || !modelResponse.ok) {
          throw new Error("failed to load");
        }

        const data: Vehicle[] = await vehicleResponse.json();
        const models: BikeModel[] = await modelResponse.json();
        setVehicles(data);
        setBikeModels(models);
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
      const normalized = normalizeAvailabilityMap(selectedVehicle.rentalAvailability);
      setAvailabilityMap(normalized);
    } else {
      setAvailabilityMap({});
    }
    setActiveDate(null);
    setActiveNote("");
    setActiveStatus("AVAILABLE");
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

  const handleRemoveSlot = (date: string) => {
    setAvailabilityMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[date];
      return nextMap;
    });
  };

  const handleSelectDate = (date: string) => {
    setActiveDate(date);
    const entry = availabilityMap[date];
    setActiveStatus(entry?.status ?? "AVAILABLE");
    setActiveNote(entry?.note ?? "");
    setFormError(null);
  };

  const handleApplyDate = () => {
    if (!selectedVehicle) {
      setFormError("編集する車両を選択してください。");
      return;
    }

    if (!activeDate) {
      setFormError("日を選択してください。");
      return;
    }

    const trimmedNote = activeNote.trim();
    setAvailabilityMap((prev) => ({
      ...prev,
      [activeDate]: {
        status: activeStatus,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
    }));
    setFormError(null);
    setSaveSuccess(null);
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
              {loadError && <p className={formStyles.formError}>{loadError}</p>}
              <div className={styles.menuGroupTitle}>車両別スケジュール</div>
              <p className={styles.menuGroupNote}>
                直近1週間のステータスを一覧で確認し、詳細カレンダーから日別の予定を調整できます。
              </p>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>車両名</th>
                    {upcomingWeekDates.map((date) => (
                      <th key={date}>{date.split("-")[2]}日</th>
                    ))}
                    <th>詳細カレンダー</th>
                    <th>編集</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const modelName =
                      bikeModels.find((model) => model.modelId === vehicle.modelId)?.modelName ??
                      "-";
                    const map = normalizeAvailabilityMap(vehicle.rentalAvailability);
                    return (
                      <tr key={vehicle.managementNumber}>
                        <td>{vehicle.managementNumber}</td>
                        <td>
                          <div>{modelName}</div>
                          <div className={styles.menuGroupNote}>{getStoreLabel(vehicle.storeId)}</div>
                        </td>
                        {upcomingWeekDates.map((date) => {
                          const entry = map[date];
                          return (
                            <td key={`${vehicle.managementNumber}-${date}`}>
                              {entry ? STATUS_LABELS[entry.status] : "-"}
                            </td>
                          );
                        })}
                        <td>
                          <button
                            type="button"
                            className={formStyles.secondaryButton}
                            onClick={() => {
                              setSelectedVehicleId(vehicle.managementNumber);
                              setShowCalendar(true);
                            }}
                            disabled={isLoading}
                          >
                            開く
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={formStyles.submitButton}
                            onClick={() => {
                              setSelectedVehicleId(vehicle.managementNumber);
                              setShowCalendar(true);
                            }}
                            disabled={isLoading}
                          >
                            編集
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {selectedVehicle && (
                <div className={styles.menuGroup} style={{ marginTop: "1.5rem" }}>
                  <div className={styles.menuGroupTitle}>
                    {selectedVehicle.managementNumber} / {getStoreLabel(selectedVehicle.storeId)}
                  </div>
                  <div className={styles.menuGroupNote}>
                    週次サマリーとカレンダーを並べて確認できます。日を選択してステータスとメモを更新してください。
                  </div>
                  <div className={styles.cardGrid} style={{ gap: "1rem" }}>
                    <div className={styles.menuGroup}>
                      <div className={styles.menuGroupTitle}>直近1週間</div>
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>日</th>
                            <th>ステータス</th>
                            <th>メモ</th>
                            <th>操作</th>
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
                                    onClick={() => handleSelectDate(date)}
                                  >
                                    選択
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {showCalendar && (
                      <div className={styles.menuGroup}>
                        <div className={styles.menuGroupTitle}>カレンダー</div>
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
                                  const isSelected = activeDate === dateKey;
                                  return (
                                    <td
                                      key={`${weekIndex}-${dayIndex}`}
                                      style={{
                                        verticalAlign: "top",
                                        minWidth: "120px",
                                        backgroundColor: isSelected ? "#f4f6fb" : undefined,
                                        cursor: "pointer",
                                      }}
                                      onClick={() => handleSelectDate(dateKey)}
                                    >
                                      <div className={styles.menuGroupTitle}>{day.getDate()}日</div>
                                      <div className={styles.menuGroupNote}>
                                        {entry ? STATUS_LABELS[entry.status] : "未設定"}
                                      </div>
                                      {entry?.note && (
                                        <div className={styles.menuGroupNote}>{entry.note}</div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className={styles.menuGroupNote}>
                          セルを選択すると下部の入力欄に反映されます。
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.menuGroup}>
                    <div className={styles.menuGroupTitle}>選択中の内容</div>
                    {formError && <p className={formStyles.formError}>{formError}</p>}
                    <div className={formStyles.formGrid}>
                      <div className={formStyles.formRow}>
                        <div className={formStyles.formLabel}>対象日</div>
                        <div className={styles.menuGroupNote}>{activeDate ?? "未選択"}</div>
                      </div>
                      <div className={formStyles.formRow}>
                        <div className={formStyles.formLabel}>ステータス</div>
                        <select
                          className={formStyles.formSelect}
                          value={activeStatus}
                          onChange={(event) =>
                            setActiveStatus(event.target.value as RentalAvailabilityStatus)
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
                        <div className={formStyles.formLabel}>メモ</div>
                        <input
                          type="text"
                          className={formStyles.formInput}
                          value={activeNote}
                          onChange={(event) => setActiveNote(event.target.value)}
                          placeholder="任意で入力"
                        />
                      </div>
                    </div>
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        className={formStyles.secondaryButton}
                        onClick={handleApplyDate}
                      >
                        更新
                      </button>
                      <button
                        type="button"
                        className={formStyles.secondaryButton}
                        onClick={() => activeDate && handleRemoveSlot(activeDate)}
                        disabled={!activeDate}
                      >
                        削除
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
                    {saveError && <p className={formStyles.formError}>{saveError}</p>}
                    {saveSuccess && <p className={formStyles.formSuccess}>{saveSuccess}</p>}
                  </div>

                  {sortedDates.length > 0 && (
                    <div className={styles.menuGroup}>
                      <div className={styles.menuGroupTitle}>登録済み一覧</div>
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>日</th>
                            <th>ステータス</th>
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
                                    onClick={() => handleSelectDate(date)}
                                  >
                                    選択
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

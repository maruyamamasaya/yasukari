import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import tableStyles from "../../../../styles/AdminTable.module.css";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import {
  RentalAvailabilityMap,
  RentalAvailabilitySlot,
  Vehicle,
} from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

type SlotFormState = {
  date: string;
  startTime: string;
  endTime: string;
  note: string;
};

const initialSlotForm: SlotFormState = {
  date: "",
  startTime: "",
  endTime: "",
  note: "",
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
      setAvailabilityMap(selectedVehicle.rentalAvailability ?? {});
    } else {
      setAvailabilityMap({});
    }
    setSaveSuccess(null);
    setSaveError(null);
  }, [selectedVehicle]);

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

    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setFormError("日付、開始時間、終了時間をすべて入力してください。");
      return;
    }

    setFormError(null);
    const { date, startTime, endTime, note } = slotForm;
    const newSlot: RentalAvailabilitySlot = {
      startTime: `${date}T${startTime}`,
      endTime: `${date}T${endTime}`,
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    setAvailabilityMap((prev) => {
      const existingSlots = prev[date] ?? [];
      return {
        ...prev,
        [date]: [...existingSlots, newSlot],
      };
    });

    setSlotForm(initialSlotForm);
  };

  const handleRemoveSlot = (date: string, index: number) => {
    setAvailabilityMap((prev) => {
      const slots = prev[date] ?? [];
      const updatedSlots = slots.filter((_, slotIndex) => slotIndex !== index);
      const nextMap = { ...prev };
      if (updatedSlots.length > 0) {
        nextMap[date] = updatedSlots;
      } else {
        delete nextMap[date];
      }
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
      setSaveSuccess("レンタル可能日時の更新が完了しました。");
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
          : "レンタル可能日時の保存に失敗しました。"
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
        description="車両ごとにレンタル可能な日時をカレンダーマップ形式で管理します。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              <div>
                <h2 className={styles.menuGroupTitle}>スケジュール設定</h2>
                <p className={styles.menuGroupNote}>
                  各車両のレンタル可能な日時をMap形式（キー: 日付、値: 時間帯の配列）で保存します。
                </p>
                <p className={styles.menuGroupNote}>
                  車両一覧のカラム単位でスケジュールを管理する前提で、データベースに保存される形をそのまま編集できます。
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
                  <div className={formStyles.formLabel}>現在のマップ</div>
                  <div>
                    {sortedDates.length === 0 ? (
                      <p className={styles.menuGroupNote}>まだスケジュールは登録されていません。</p>
                    ) : (
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>日付</th>
                            <th>時間帯</th>
                            <th>メモ</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedDates.map((date) =>
                            (availabilityMap[date] ?? []).map((slot, index) => (
                              <tr key={`${date}-${index}`}>
                                <td>{date}</td>
                                <td>
                                  {slot.startTime} - {slot.endTime}
                                </td>
                                <td>{slot.note ?? "-"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={formStyles.secondaryButton}
                                    onClick={() => handleRemoveSlot(date, index)}
                                  >
                                    削除
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
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
                      <label className={formStyles.formLabel} htmlFor="startTime">
                        開始時間
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        className={formStyles.formInput}
                        value={slotForm.startTime}
                        onChange={(event) =>
                          setSlotForm((prev) => ({ ...prev, startTime: event.target.value }))
                        }
                      />
                    </div>
                    <div className={formStyles.formRow}>
                      <label className={formStyles.formLabel} htmlFor="endTime">
                        終了時間
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        className={formStyles.formInput}
                        value={slotForm.endTime}
                        onChange={(event) =>
                          setSlotForm((prev) => ({ ...prev, endTime: event.target.value }))
                        }
                      />
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
                    スロットを追加
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

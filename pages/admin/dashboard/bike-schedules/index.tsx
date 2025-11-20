import Head from "next/head";
import Link from "next/link";
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

  const upcomingWeekDates = useMemo(() => getUpcomingWeekDates(), []);

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
              {loadError && <p className={styles.menuGroupNote}>{loadError}</p>}
              <div className={styles.menuGroupTitle}>車両別スケジュール</div>
              <p className={styles.menuGroupNote}>
                直近1週間のステータスを一覧で確認し、詳細カレンダーを別ページで開けます。
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
                          <Link
                            href={`/admin/dashboard/bike-schedules/${vehicle.managementNumber}`}
                            className={formStyles.submitButton}
                          >
                            詳細を開く
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {isLoading && <p className={styles.menuGroupNote}>読み込み中です...</p>}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

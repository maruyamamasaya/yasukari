import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import tableStyles from "../../../../styles/AdminTable.module.css";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { Vehicle, BikeModel } from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

export default function BikeScheduleManagementPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getExpiryStatus = (expiryDate?: string | null) => {
    if (!expiryDate) {
      return null;
    }
    const parsed = new Date(expiryDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    const normalizedExpiry = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
    );

    if (normalizedExpiry < normalizedToday) {
      return "expired";
    }

    const warningStart = new Date(normalizedExpiry);
    warningStart.setMonth(warningStart.getMonth() - 1);
    if (normalizedToday >= warningStart) {
      return "warning";
    }

    return null;
  };

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

  return (
    <>
      <Head>
        <title>バイクスケジュール管理</title>
      </Head>
      <DashboardLayout
        title="バイクスケジュール管理"
        description="車両ごとのスケジュールをカレンダーから直接更新できます。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              {loadError && <p className={styles.menuGroupNote}>{loadError}</p>}
              <div className={styles.menuGroupTitle}>車両別スケジュール</div>
              <p className={styles.menuGroupNote}>
                各車両のスケジュールを詳細カレンダーで管理します。ボタンを押して日別の
                ステータスとメモを設定してください。
              </p>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>車両名</th>
                    <th>店舗</th>
                    <th>自賠責満了日</th>
                    <th>車検満了日</th>
                    <th className={tableStyles.centerCell}>スケジュール設定</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const modelName =
                      bikeModels.find((model) => model.modelId === vehicle.modelId)?.modelName ??
                      "-";
                    const schedulePath = `/admin/dashboard/bike-schedules/${vehicle.managementNumber}`;
                    const liabilityStatus = getExpiryStatus(
                      vehicle.liabilityInsuranceExpiryDate,
                    );
                    const inspectionStatus = getExpiryStatus(vehicle.inspectionExpiryDate);
                    return (
                      <tr
                        key={vehicle.managementNumber}
                        tabIndex={0}
                        className={tableStyles.clickableRow}
                        onClick={() => {
                          void router.push(schedulePath);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            void router.push(schedulePath);
                          }
                        }}
                      >
                        <td>{vehicle.managementNumber}</td>
                        <td>{modelName}</td>
                        <td>{getStoreLabel(vehicle.storeId)}</td>
                        <td
                          className={
                            liabilityStatus === "expired"
                              ? tableStyles.expiredCell
                              : liabilityStatus === "warning"
                                ? tableStyles.warningCell
                                : undefined
                          }
                        >
                          {vehicle.liabilityInsuranceExpiryDate ?? "-"}
                        </td>
                        <td
                          className={
                            inspectionStatus === "expired"
                              ? tableStyles.expiredCell
                              : inspectionStatus === "warning"
                                ? tableStyles.warningCell
                                : undefined
                          }
                        >
                          {vehicle.inspectionExpiryDate ?? "-"}
                        </td>
                        <td className={tableStyles.centerCell}>
                          <Link
                            href={schedulePath}
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
              <p className={styles.menuGroupNote}>
                自賠責満了日・車検満了日のセルは、満了日まで1か月以内で黄色、満了日が過ぎている場合は薄い赤色で表示されます。
              </p>
              {isLoading && <p className={styles.menuGroupNote}>読み込み中です...</p>}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

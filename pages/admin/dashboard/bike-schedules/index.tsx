import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import tableStyles from "../../../../styles/AdminTable.module.css";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { Vehicle, BikeModel } from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

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
                    <th>スケジュール設定</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const modelName =
                      bikeModels.find((model) => model.modelId === vehicle.modelId)?.modelName ??
                      "-";
                    return (
                      <tr key={vehicle.managementNumber}>
                        <td>{vehicle.managementNumber}</td>
                        <td>{modelName}</td>
                        <td>{getStoreLabel(vehicle.storeId)}</td>
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

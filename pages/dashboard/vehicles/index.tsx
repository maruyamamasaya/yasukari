import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import formStyles from "../../../styles/AdminForm.module.css";
import tableStyles from "../../../styles/AdminTable.module.css";
import styles from "../../../styles/Dashboard.module.css";
import { BikeModel, Vehicle } from "../../../lib/dashboard/types";

export default function VehicleListPage() {
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsResponse, vehiclesResponse] = await Promise.all([
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (modelsResponse.ok) {
          const modelData: BikeModel[] = await modelsResponse.json();
          setBikeModels(modelData.sort((a, b) => a.modelId - b.modelId));
          setModelError(null);
        } else {
          setModelError("車種一覧の取得に失敗しました。");
        }

        if (vehiclesResponse.ok) {
          const vehicleData: Vehicle[] = await vehiclesResponse.json();
          setVehicles(
            vehicleData.sort((a, b) => a.managementNumber.localeCompare(b.managementNumber))
          );
          setVehicleError(null);
        } else {
          setVehicleError("車両一覧の取得に失敗しました。");
        }
      } catch (loadError) {
        console.error("Failed to load vehicle list", loadError);
        setModelError((prev) => prev ?? "車種一覧の取得に失敗しました。");
        setVehicleError((prev) => prev ?? "車両一覧の取得に失敗しました。");
      }
    };

    void loadData();
  }, []);

  const modelNameMap = useMemo(
    () =>
      bikeModels.reduce<Record<number, string>>((acc, model) => {
        acc[model.modelId] = model.modelName;
        return acc;
      }, {}),
    [bikeModels]
  );

  return (
    <>
      <Head>
        <title>車両一覧 | 管理ダッシュボード</title>
      </Head>
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h1 className={styles.sectionTitle}>車両一覧</h1>
            <Link href="/dashboard/vehicles/register" className={styles.iconButton}>
              車両登録
            </Link>
          </div>
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          {vehicleError && <p className={formStyles.error}>{vehicleError}</p>}
          <div className={formStyles.card}>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>管理番号</th>
                    <th>車種</th>
                    <th>店舗ID</th>
                    <th>掲載状態</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={4}>登録済みの車両はまだありません。</td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.managementNumber}>
                        <td>{vehicle.managementNumber}</td>
                        <td>{modelNameMap[vehicle.modelId] ?? "-"}</td>
                        <td>{vehicle.storeId}</td>
                        <td>
                          <span
                            className={`${tableStyles.badge} ${
                              vehicle.publishStatus === "ON"
                                ? tableStyles.badgeOn
                                : tableStyles.badgeOff
                            }`}
                          >
                            {vehicle.publishStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

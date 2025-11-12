import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeModel, Vehicle } from "../../../../lib/dashboard/types";

const vehicleColumnDefinitions: { key: keyof Vehicle | "modelName"; label: string }[] = [
  { key: "managementNumber", label: "管理番号" },
  { key: "modelId", label: "車種ID" },
  { key: "modelName", label: "車種名" },
  { key: "storeId", label: "店舗ID" },
  { key: "publishStatus", label: "掲載状態" },
  { key: "tags", label: "タグ" },
  { key: "policyNumber1", label: "保険証券番号1" },
  { key: "policyBranchNumber1", label: "保険取扱支店番号1" },
  { key: "policyNumber2", label: "保険証券番号2" },
  { key: "policyBranchNumber2", label: "保険取扱支店番号2" },
  { key: "inspectionExpiryDate", label: "車検満了日" },
  { key: "licensePlateNumber", label: "ナンバープレート" },
  { key: "previousLicensePlateNumber", label: "前ナンバー" },
  { key: "liabilityInsuranceExpiryDate", label: "自賠責満了日" },
  { key: "videoUrl", label: "動画URL" },
  { key: "notes", label: "備考" },
  { key: "createdAt", label: "作成日時" },
  { key: "updatedAt", label: "更新日時" },
];

export default function VehicleAllListPage() {
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

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "-";
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <>
      <Head>
        <title>バイク全件表示 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="バイク全件表示"
        actions={
          <Link href="/admin/dashboard/vehicles" className={styles.iconButton}>
            車両一覧へ戻る
          </Link>
        }
      >
        <section className={styles.section}>
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          {vehicleError && <p className={formStyles.error}>{vehicleError}</p>}
          <div className={formStyles.card}>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    {vehicleColumnDefinitions.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={vehicleColumnDefinitions.length}>
                        登録済みの車両はまだありません。
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.managementNumber}>
                        {vehicleColumnDefinitions.map((column) => {
                          if (column.key === "modelName") {
                            return (
                              <td key={column.key}>
                                {modelNameMap[vehicle.modelId] ?? "-"}
                              </td>
                            );
                          }

                          const value = vehicle[column.key as keyof Vehicle];
                          return <td key={column.key}>{formatValue(value)}</td>;
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

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

  const selectedVehicle = useMemo(
    () =>
      selectedVehicleId == null
        ? null
        : vehicles.find((vehicle) => vehicle.managementNumber === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles]
  );

  const vehicleDetailEntries = useMemo(() => {
    if (!selectedVehicle) {
      return [];
    }

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

    return [
      { label: "管理番号", value: formatValue(selectedVehicle.managementNumber) },
      { label: "車種ID", value: formatValue(selectedVehicle.modelId) },
      {
        label: "車種名",
        value:
          modelNameMap[selectedVehicle.modelId] ??
          formatValue(selectedVehicle.modelId),
      },
      { label: "店舗ID", value: formatValue(selectedVehicle.storeId) },
      { label: "掲載状態", value: formatValue(selectedVehicle.publishStatus) },
      { label: "タグ", value: formatValue(selectedVehicle.tags) },
      { label: "保険証券番号1", value: formatValue(selectedVehicle.policyNumber1) },
      {
        label: "保険取扱支店番号1",
        value: formatValue(selectedVehicle.policyBranchNumber1),
      },
      { label: "保険証券番号2", value: formatValue(selectedVehicle.policyNumber2) },
      {
        label: "保険取扱支店番号2",
        value: formatValue(selectedVehicle.policyBranchNumber2),
      },
      {
        label: "車検満了日",
        value: formatValue(selectedVehicle.inspectionExpiryDate),
      },
      { label: "ナンバープレート", value: formatValue(selectedVehicle.licensePlateNumber) },
      {
        label: "前ナンバー",
        value: formatValue(selectedVehicle.previousLicensePlateNumber),
      },
      {
        label: "自賠責満了日",
        value: formatValue(selectedVehicle.liabilityInsuranceExpiryDate),
      },
      { label: "動画URL", value: formatValue(selectedVehicle.videoUrl) },
      { label: "備考", value: formatValue(selectedVehicle.notes) },
      { label: "作成日時", value: formatValue(selectedVehicle.createdAt) },
      { label: "更新日時", value: formatValue(selectedVehicle.updatedAt) },
    ];
  }, [modelNameMap, selectedVehicle]);

  const handleRowSelect = (managementNumber: string) => {
    setSelectedVehicleId((current) =>
      current === managementNumber ? null : managementNumber
    );
  };

  return (
    <>
      <Head>
        <title>車両一覧 | 管理ダッシュボード</title>
      </Head>
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h1 className={styles.sectionTitle}>車両一覧</h1>
            <div className={styles.sectionActions}>
              <Link href="/dashboard/vehicles/all" className={styles.iconButton}>
                バイク全件表示
              </Link>
              <Link href="/dashboard/vehicles/register" className={styles.iconButton}>
                <span aria-hidden>＋</span>
                車両登録
              </Link>
            </div>
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
                      <tr
                        key={vehicle.managementNumber}
                        tabIndex={0}
                        className={`${tableStyles.clickableRow} ${
                          selectedVehicleId === vehicle.managementNumber
                            ? tableStyles.selectedRow
                            : ""
                        }`}
                        onClick={() => handleRowSelect(vehicle.managementNumber)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleRowSelect(vehicle.managementNumber);
                          }
                        }}
                      >
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
          {selectedVehicle && (
            <div className={styles.detailPanel}>
              <h2 className={styles.detailTitle}>
                {selectedVehicle.managementNumber}の詳細情報
              </h2>
              <dl className={styles.detailGrid}>
                {vehicleDetailEntries.map(({ label, value }) => (
                  <div key={label} className={styles.detailItem}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

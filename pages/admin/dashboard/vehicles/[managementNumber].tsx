import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel, Vehicle } from "../../../../lib/dashboard/types";
import { getStoreLabel } from "../../../../lib/dashboard/storeOptions";

export default function VehicleDetailPage() {
  const router = useRouter();
  const managementNumberParam = router.query.managementNumber;
  const managementNumber = useMemo(
    () => (Array.isArray(managementNumberParam) ? managementNumberParam[0] : managementNumberParam),
    [managementNumberParam]
  );

  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  useEffect(() => {
    if (!managementNumber) {
      return;
    }

    const loadData = async () => {
      try {
        const [classesResponse, modelsResponse, vehiclesResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (classesResponse.ok) {
          const classData: BikeClass[] = await classesResponse.json();
          setBikeClasses(classData.sort((a, b) => a.classId - b.classId));
          setClassError(null);
        } else {
          setClassError("クラス一覧の取得に失敗しました。");
        }

        if (modelsResponse.ok) {
          const modelData: BikeModel[] = await modelsResponse.json();
          setBikeModels(modelData.sort((a, b) => a.modelId - b.modelId));
          setModelError(null);
        } else {
          setModelError("車種一覧の取得に失敗しました。");
        }

        if (vehiclesResponse.ok) {
          const vehicleData: Vehicle[] = await vehiclesResponse.json();
          const foundVehicle =
            vehicleData.find((item) => item.managementNumber === managementNumber) ?? null;

          if (!foundVehicle) {
            setVehicleError("指定の車両が見つかりませんでした。");
            setVehicle(null);
            return;
          }

          setVehicle(foundVehicle);
          setVehicleError(null);
        } else {
          setVehicleError("車両の取得に失敗しました。");
        }
      } catch (loadError) {
        console.error("Failed to load vehicle detail", loadError);
        setClassError((prev) => prev ?? "クラス一覧の取得に失敗しました。");
        setModelError((prev) => prev ?? "車種一覧の取得に失敗しました。");
        setVehicleError((prev) => prev ?? "車両の取得に失敗しました。");
      }
    };

    void loadData();
  }, [managementNumber]);

  const modelMap = useMemo(
    () =>
      bikeModels.reduce<Record<number, BikeModel>>((acc, current) => {
        acc[current.modelId] = current;
        return acc;
      }, {}),
    [bikeModels]
  );

  const classNameMap = useMemo(
    () =>
      bikeClasses.reduce<Record<number, string>>((acc, bikeClass) => {
        acc[bikeClass.classId] = bikeClass.className;
        return acc;
      }, {}),
    [bikeClasses]
  );

  const model = vehicle ? modelMap[vehicle.modelId] : undefined;
  const className = model ? classNameMap[model.classId] : undefined;

  const handleBack = () => {
    void router.push("/admin/dashboard/vehicles");
  };

  if (!managementNumber) {
    return null;
  }

  return (
    <>
      <Head>
        <title>車両詳細</title>
      </Head>
      <DashboardLayout>
        <div className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>車両詳細</h1>
          <button type="button" className={styles.tableToolbarButton} onClick={handleBack}>
            戻る
          </button>
        </div>
        {classError && <p className={formStyles.error}>{classError}</p>}
        {modelError && <p className={formStyles.error}>{modelError}</p>}
        {vehicleError && <p className={formStyles.error}>{vehicleError}</p>}
        {vehicle && (
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>管理番号</dt>
              <dd>{vehicle.managementNumber}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>クラス</dt>
              <dd>{className ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>車種</dt>
              <dd>{model?.modelName ?? vehicle.modelId}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>店舗</dt>
              <dd>{getStoreLabel(vehicle.storeId)}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>掲載状態</dt>
              <dd>{vehicle.publishStatus}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>タグ</dt>
              <dd>{vehicle.tags.length > 0 ? vehicle.tags.join(", ") : "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>保険証番号1</dt>
              <dd>{vehicle.policyNumber1 ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>保険証枝番1</dt>
              <dd>{vehicle.policyBranchNumber1 ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>保険証番号2</dt>
              <dd>{vehicle.policyNumber2 ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>保険証枝番2</dt>
              <dd>{vehicle.policyBranchNumber2 ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>車検満了日</dt>
              <dd>{vehicle.inspectionExpiryDate ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>ナンバープレート番号</dt>
              <dd>{vehicle.licensePlateNumber ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>旧ナンバープレート番号</dt>
              <dd>{vehicle.previousLicensePlateNumber ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>自賠責満了日</dt>
              <dd>{vehicle.liabilityInsuranceExpiryDate ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>動画URL</dt>
              <dd>{vehicle.videoUrl ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>備考</dt>
              <dd>{vehicle.notes ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>作成日時</dt>
              <dd>{vehicle.createdAt ?? "-"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>更新日時</dt>
              <dd>{vehicle.updatedAt ?? "-"}</dd>
            </div>
          </dl>
        )}
      </DashboardLayout>
    </>
  );
}

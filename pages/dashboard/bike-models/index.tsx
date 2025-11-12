import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import formStyles from "../../../styles/AdminForm.module.css";
import tableStyles from "../../../styles/AdminTable.module.css";
import styles from "../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel } from "../../../lib/dashboard/types";

export default function BikeModelListPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesResponse, modelsResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
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
      } catch (loadError) {
        console.error("Failed to load bike model list", loadError);
        setClassError((prev) => prev ?? "クラス一覧の取得に失敗しました。");
        setModelError((prev) => prev ?? "車種一覧の取得に失敗しました。");
      }
    };

    void loadData();
  }, []);

  const classNameMap = useMemo(
    () =>
      bikeClasses.reduce<Record<number, string>>((acc, bikeClass) => {
        acc[bikeClass.classId] = bikeClass.className;
        return acc;
      }, {}),
    [bikeClasses]
  );

  const selectedModel = useMemo(
    () =>
      selectedModelId == null
        ? null
        : bikeModels.find((model) => model.modelId === selectedModelId) ?? null,
    [bikeModels, selectedModelId]
  );

  const modelDetailEntries = useMemo(() => {
    if (!selectedModel) {
      return [];
    }

    const entries: { label: string; value: string }[] = [];
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

    entries.push({ label: "車種ID", value: formatValue(selectedModel.modelId) });
    entries.push({ label: "車種名", value: formatValue(selectedModel.modelName) });
    entries.push({ label: "クラスID", value: formatValue(selectedModel.classId) });
    entries.push({
      label: "クラス名",
      value: classNameMap[selectedModel.classId] ?? "-",
    });
    entries.push({
      label: "掲載状態",
      value: formatValue(selectedModel.publishStatus),
    });
    entries.push({
      label: "排気量 (cc)",
      value: formatValue(selectedModel.displacementCc),
    });
    entries.push({
      label: "必要免許",
      value: formatValue(selectedModel.requiredLicense),
    });
    entries.push({
      label: "全長 (mm)",
      value: formatValue(selectedModel.lengthMm),
    });
    entries.push({
      label: "全幅 (mm)",
      value: formatValue(selectedModel.widthMm),
    });
    entries.push({
      label: "全高 (mm)",
      value: formatValue(selectedModel.heightMm),
    });
    entries.push({
      label: "シート高 (mm)",
      value: formatValue(selectedModel.seatHeightMm),
    });
    entries.push({
      label: "乗車定員",
      value: formatValue(selectedModel.seatCapacity),
    });
    entries.push({
      label: "車両重量 (kg)",
      value: formatValue(selectedModel.vehicleWeightKg),
    });
    entries.push({
      label: "燃料タンク容量 (L)",
      value: formatValue(selectedModel.fuelTankCapacityL),
    });
    entries.push({ label: "燃料種別", value: formatValue(selectedModel.fuelType) });
    entries.push({ label: "最高出力", value: formatValue(selectedModel.maxPower) });
    entries.push({ label: "最大トルク", value: formatValue(selectedModel.maxTorque) });
    entries.push({
      label: "メイン画像URL",
      value: formatValue(selectedModel.mainImageUrl),
    });
    entries.push({ label: "作成日時", value: formatValue(selectedModel.createdAt) });
    entries.push({ label: "更新日時", value: formatValue(selectedModel.updatedAt) });

    return entries;
  }, [classNameMap, selectedModel]);

  const handleRowSelect = (modelId: number) => {
    setSelectedModelId((current) => (current === modelId ? null : modelId));
  };

  return (
    <>
      <Head>
        <title>車種一覧 | 管理ダッシュボード</title>
      </Head>
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h1 className={styles.sectionTitle}>車種一覧</h1>
            <div className={styles.sectionActions}>
              <Link
                href="/dashboard/bike-models/register"
                className={styles.iconButton}
              >
                <span aria-hidden>＋</span>
                車種登録
              </Link>
            </div>
          </div>
          {classError && <p className={formStyles.error}>{classError}</p>}
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          <div className={formStyles.card}>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>車種名</th>
                    <th>クラス</th>
                    <th>掲載状態</th>
                  </tr>
                </thead>
                <tbody>
                  {bikeModels.length === 0 ? (
                    <tr>
                      <td colSpan={4}>登録済みの車種はまだありません。</td>
                    </tr>
                  ) : (
                    bikeModels.map((model) => (
                      <tr
                        key={model.modelId}
                        tabIndex={0}
                        className={`${tableStyles.clickableRow} ${
                          selectedModelId === model.modelId ? tableStyles.selectedRow : ""
                        }`}
                        onClick={() => handleRowSelect(model.modelId)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleRowSelect(model.modelId);
                          }
                        }}
                      >
                        <td>{model.modelId}</td>
                        <td>{model.modelName}</td>
                        <td>{classNameMap[model.classId] ?? "-"}</td>
                        <td>
                          <span
                            className={`${tableStyles.badge} ${
                              model.publishStatus === "ON"
                                ? tableStyles.badgeOn
                                : tableStyles.badgeOff
                            }`}
                          >
                            {model.publishStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {selectedModel && (
            <div className={styles.detailPanel}>
              <h2 className={styles.detailTitle}>
                {selectedModel.modelName}の詳細情報
              </h2>
              <dl className={styles.detailGrid}>
                {modelDetailEntries.map(({ label, value }) => (
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

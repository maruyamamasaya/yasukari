import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel } from "../../../../lib/dashboard/types";

export default function BikeModelListPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ON" | "OFF">("ALL");
  const [sortState, setSortState] = useState<{
    key: "modelId" | "modelName" | "className" | "publishStatus";
    direction: "asc" | "desc";
  }>({ key: "modelId", direction: "asc" });

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

  const filteredModels = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = bikeModels.filter((model) => {
      const matchesKeyword = keyword
        ? [
            model.modelName,
            classNameMap[model.classId] ?? "",
            model.modelId,
          ].some((value) =>
            String(value ?? "").toLowerCase().includes(keyword)
          )
        : true;

      const matchesStatus =
        statusFilter === "ALL" ? true : model.publishStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    const sorted = [...filtered].sort((a, b) => {
      const getValue = (
        model: BikeModel
      ): string | number => {
        switch (sortState.key) {
          case "modelId":
            return model.modelId;
          case "modelName":
            return model.modelName;
          case "className":
            return classNameMap[model.classId] ?? "";
          case "publishStatus":
            return model.publishStatus ?? "";
          default:
            return "";
        }
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * directionMultiplier;
      }

      return String(aValue).localeCompare(String(bValue), "ja") * directionMultiplier;
    });

    return sorted;
  }, [
    bikeModels,
    classNameMap,
    searchTerm,
    sortState.direction,
    sortState.key,
    statusFilter,
  ]);

  const handleSort = (
    key: "modelId" | "modelName" | "className" | "publishStatus"
  ) => {
    setSortState((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleSortKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as typeof sortState.key;
    setSortState((current) => ({ key: nextKey, direction: current.direction }));
  };

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value as "ALL" | "ON" | "OFF";
    setStatusFilter(nextValue);
  };

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
      <DashboardLayout
        title="車種一覧"
        actions={
          <Link href="/admin/dashboard/bike-models/register" className={styles.iconButton}>
            <span aria-hidden>＋</span>
            車種登録
          </Link>
        }
      >
        <section className={styles.section}>
          {classError && <p className={formStyles.error}>{classError}</p>}
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          <div className={formStyles.card}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarGroup}>
                <input
                  type="search"
                  className={styles.tableSearchInput}
                  placeholder="車種名・クラス名・IDで検索"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="車種一覧を検索"
                />
                <select
                  className={styles.tableSelect}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  aria-label="掲載状態で絞り込み"
                >
                  <option value="ALL">掲載状態（すべて）</option>
                  <option value="ON">掲載中のみ</option>
                  <option value="OFF">非掲載のみ</option>
                </select>
              </div>
              <div className={styles.tableToolbarGroup}>
                <label>
                  <span className={tableStyles.visuallyHidden}>並び替え項目</span>
                  <select
                    className={styles.tableSelect}
                    value={sortState.key}
                    onChange={handleSortKeyChange}
                  >
                    <option value="modelId">IDで並び替え</option>
                    <option value="modelName">車種名で並び替え</option>
                    <option value="className">クラス名で並び替え</option>
                    <option value="publishStatus">掲載状態で並び替え</option>
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.tableToolbarButton}
                  onClick={() =>
                    setSortState((current) => ({
                      key: current.key,
                      direction: current.direction === "asc" ? "desc" : "asc",
                    }))
                  }
                >
                  {sortState.direction === "asc" ? "昇順" : "降順"}
                </button>
              </div>
            </div>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th
                      aria-sort={
                        sortState.key === "modelId"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("modelId")}
                      >
                        <span>ID</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "modelId"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "modelId"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th
                      aria-sort={
                        sortState.key === "modelName"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("modelName")}
                      >
                        <span>車種名</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "modelName"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "modelName"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th
                      aria-sort={
                        sortState.key === "className"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("className")}
                      >
                        <span>クラス</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "className"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "className"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th
                      aria-sort={
                        sortState.key === "publishStatus"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("publishStatus")}
                      >
                        <span>掲載状態</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "publishStatus"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "publishStatus"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.length === 0 ? (
                    <tr>
                      <td colSpan={4}>登録済みの車種はまだありません。</td>
                    </tr>
                  ) : (
                    filteredModels.map((model) => (
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
      </DashboardLayout>
    </>
  );
}

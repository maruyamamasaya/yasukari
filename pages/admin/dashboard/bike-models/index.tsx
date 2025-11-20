import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import {
  BikeClass,
  BikeModel,
  PublishStatus,
} from "../../../../lib/dashboard/types";
import { REQUIRED_LICENSE_OPTIONS } from "../../../../lib/dashboard/licenseOptions";
import { toNumber } from "../../../../lib/dashboard/utils";

type ModelFormState = {
  classId: string;
  modelName: string;
  publishStatus: PublishStatus;
  displacementCc: string;
  requiredLicense: string;
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  seatHeightMm: string;
  seatCapacity: string;
  vehicleWeightKg: string;
  fuelTankCapacityL: string;
  fuelType: string;
  maxPower: string;
  maxTorque: string;
  mainImageUrl: string;
};

export default function BikeModelListPage() {
  const router = useRouter();
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModelIds, setSelectedModelIds] = useState<Set<number>>(
    () => new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ON" | "OFF">("ALL");
  const [sortState, setSortState] = useState<{
    key: "modelId" | "modelName" | "className" | "publishStatus";
    direction: "asc" | "desc";
  }>({ key: "modelId", direction: "asc" });
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailForm, setDetailForm] = useState<ModelFormState | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

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

  useEffect(() => {
    if (!selectedModel) {
      setDetailForm(null);
      setIsDetailEditing(false);
      setDetailError(null);
      setDetailSuccess(null);
      return;
    }

    setDetailForm({
      classId: String(selectedModel.classId ?? ""),
      modelName: selectedModel.modelName ?? "",
      publishStatus: selectedModel.publishStatus ?? "ON",
      displacementCc: selectedModel.displacementCc?.toString() ?? "",
      requiredLicense: selectedModel.requiredLicense ?? "",
      lengthMm: selectedModel.lengthMm?.toString() ?? "",
      widthMm: selectedModel.widthMm?.toString() ?? "",
      heightMm: selectedModel.heightMm?.toString() ?? "",
      seatHeightMm: selectedModel.seatHeightMm?.toString() ?? "",
      seatCapacity: selectedModel.seatCapacity?.toString() ?? "",
      vehicleWeightKg: selectedModel.vehicleWeightKg?.toString() ?? "",
      fuelTankCapacityL: selectedModel.fuelTankCapacityL?.toString() ?? "",
      fuelType: selectedModel.fuelType ?? "",
      maxPower: selectedModel.maxPower ?? "",
      maxTorque: selectedModel.maxTorque ?? "",
      mainImageUrl: selectedModel.mainImageUrl ?? "",
    });
    setIsDetailEditing(false);
    setDetailError(null);
    setDetailSuccess(null);
  }, [selectedModel]);

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

  const handleDetailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedModel || !detailForm) {
      return;
    }

    setDetailSuccess(null);
    setDetailError(null);

    if (!detailForm.classId) {
      setDetailError("所属クラスを選択してください。");
      return;
    }
    if (!detailForm.modelName.trim()) {
      setDetailError("車種名を入力してください。");
      return;
    }

    const classId = Number(detailForm.classId);
    if (!bikeClasses.some((item) => item.classId === classId)) {
      setDetailError("選択されたクラスが存在しません。");
      return;
    }

    const payload: Record<string, unknown> = {
      modelId: selectedModel.modelId,
      classId,
      modelName: detailForm.modelName.trim(),
      publishStatus: detailForm.publishStatus,
    };

    const numberFields: Array<
      keyof Pick<
        ModelFormState,
        | "displacementCc"
        | "lengthMm"
        | "widthMm"
        | "heightMm"
        | "seatHeightMm"
        | "seatCapacity"
        | "vehicleWeightKg"
        | "fuelTankCapacityL"
      >
    > = [
      "displacementCc",
      "lengthMm",
      "widthMm",
      "heightMm",
      "seatHeightMm",
      "seatCapacity",
      "vehicleWeightKg",
      "fuelTankCapacityL",
    ];

    numberFields.forEach((field) => {
      const value = toNumber(detailForm[field]);
      if (value !== undefined) {
        payload[field] = value;
      }
    });

    const stringFields: Array<
      keyof Pick<
        ModelFormState,
        "requiredLicense" | "fuelType" | "maxPower" | "maxTorque" | "mainImageUrl"
      >
    > = ["requiredLicense", "fuelType", "maxPower", "maxTorque", "mainImageUrl"];

    stringFields.forEach((field) => {
      const value = detailForm[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    setIsSavingDetail(true);
    try {
      const response = await fetch("/api/bike-models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setDetailError(errorBody?.message ?? "車種の更新に失敗しました。");
        return;
      }

      const updatedModel: BikeModel = await response.json();
      setBikeModels((current) =>
        current
          .map((model) => (model.modelId === updatedModel.modelId ? updatedModel : model))
          .sort((a, b) => a.modelId - b.modelId)
      );
      setDetailSuccess("車種情報を更新しました。");
      setIsDetailEditing(false);
    } catch (saveError) {
      console.error("Failed to update bike model", saveError);
      setDetailError("車種の更新に失敗しました。");
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleRowSelect = (modelId: number) => {
    void router.push(`/admin/dashboard/bike-models/${modelId}`);
  };

  const toggleModelSelection = (modelId: number) => {
    setSelectedModelIds((current) => {
      const next = new Set(current);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }

      if (next.size === 0) {
        setDeleteConfirmationChecked(false);
      }

      return next;
    });
  };

  const handleDeleteSelectedModels = async () => {
    const modelIds = Array.from(selectedModelIds);

    if (modelIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/bike-models", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelIds }),
      });

      const responseData: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof (responseData as { message?: unknown }).message === "string"
            ? ((responseData as { message: string }).message ?? "")
            : "車種の削除に失敗しました。";
        throw new Error(message || "車種の削除に失敗しました。");
      }

      const deletedIds = Array.isArray(
        (responseData as { deletedIds?: unknown })?.deletedIds
      )
        ? ((responseData as { deletedIds: unknown[] }).deletedIds.filter(
            (value): value is number => typeof value === "number"
          ))
        : modelIds;

      setBikeModels((current) =>
        current.filter((model) => !deletedIds.includes(model.modelId))
      );
      setSelectedModelIds(new Set<number>());
      setDeleteConfirmationChecked(false);
      setSelectedModelId((current) => {
        if (current == null) {
          return current;
        }
        return deletedIds.includes(current) ? null : current;
      });
    } catch (error) {
      console.error("Failed to delete bike models", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "車種の削除に失敗しました。"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedModelCount = selectedModelIds.size;
  const isDeleteDisabled =
    selectedModelCount === 0 || !deleteConfirmationChecked || isDeleting;

  const createCsvCell = (value: string | number | null | undefined) => {
    const textValue = value ?? "";
    const escapedValue = String(textValue).replace(/"/g, '""');
    return /[",\n]/.test(escapedValue)
      ? `"${escapedValue}"`
      : escapedValue;
  };

  const handleDownloadCsv = () => {
    const headers = ["車種ID", "車種名", "クラス", "掲載状態"];
    const rows = filteredModels.map((model) => [
      model.modelId,
      model.modelName ?? "",
      classNameMap[model.classId] ?? "",
      model.publishStatus ?? "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(createCsvCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bike-models.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>車種一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="車種一覧"
        actions={[
          {
            label: "＋ 車種登録",
            href: "/admin/dashboard/bike-models/register",
          },
        ]}
      >
        <section className={styles.section}>
          {classError && <p className={formStyles.error}>{classError}</p>}
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          {deleteError && <p className={formStyles.error}>{deleteError}</p>}
          <div className={formStyles.card}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>車種一覧</h2>
            </div>
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
              <div className={styles.tableToolbarGroup}>
                <span className={styles.tableSelectionCount}>
                  選択中: {selectedModelCount}件
                </span>
                <label className={styles.confirmationCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.confirmationCheckbox}
                    checked={deleteConfirmationChecked}
                    disabled={isDeleting || selectedModelCount === 0}
                    onChange={(event) =>
                      setDeleteConfirmationChecked(event.target.checked)
                    }
                  />
                  削除することを確認しました
                </label>
                <button
                  type="button"
                  className={styles.tableDangerButton}
                  disabled={isDeleteDisabled}
                  onClick={handleDeleteSelectedModels}
                >
                  車種削除
                </button>
              </div>
              <div
                className={styles.tableToolbarGroup}
                style={{ marginLeft: "auto" }}
              >
                <button
                  type="button"
                  className={styles.tableToolbarButton}
                  onClick={handleDownloadCsv}
                >
                  CSVダウンロード
                </button>
              </div>
            </div>
            <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
              <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
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
                        <td>
                          <label className={tableStyles.selectionLabel}>
                            <input
                              type="checkbox"
                              className={tableStyles.selectionCheckbox}
                              checked={selectedModelIds.has(model.modelId)}
                              disabled={isDeleting}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                event.stopPropagation();
                                toggleModelSelection(model.modelId);
                              }}
                              aria-label={`車種ID ${model.modelId} を削除対象として選択`}
                            />
                            <div className={tableStyles.modelIdCell}>
                              <div className={tableStyles.thumbnailWrapper}>
                                {model.mainImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={model.mainImageUrl}
                                    alt={`${model.modelName}のサムネイル`}
                                    className={tableStyles.thumbnailImage}
                                  />
                                ) : (
                                  <span className={tableStyles.thumbnailPlaceholder}>No image</span>
                                )}
                              </div>
                              <span className={tableStyles.modelIdText}>{model.modelId}</span>
                            </div>
                          </label>
                        </td>
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
          {false && selectedModel && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>
                  {selectedModel.modelName}の詳細情報
                </h2>
                <button
                  type="button"
                  className={styles.detailEditButton}
                  onClick={() => setIsDetailEditing((current) => !current)}
                  disabled={isSavingDetail}
                  aria-pressed={isDetailEditing}
                >
                  {isDetailEditing ? "閲覧に戻る" : "編集に切り替え"}
                </button>
              </div>
              {detailError && <p className={formStyles.error}>{detailError}</p>}
              {detailSuccess && <p className={formStyles.hint}>{detailSuccess}</p>}
              <form onSubmit={handleDetailSubmit}>
                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>車種ID</dt>
                    <dd>
                      {selectedModel.modelId}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>車種名</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.modelName ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, modelName: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : (
                        selectedModel.modelName || "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>クラス</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <select
                            value={detailForm?.classId ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, classId: event.target.value }
                                  : prev
                              )
                            }
                          >
                            <option value="">クラスを選択</option>
                            {bikeClasses.map((item) => (
                              <option key={item.classId} value={item.classId}>
                                {item.className}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        classNameMap[selectedModel.classId] ?? "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>掲載状態</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <select
                            value={detailForm?.publishStatus ?? "ON"}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      publishStatus: event.target.value as PublishStatus,
                                    }
                                  : prev
                              )
                            }
                          >
                            <option value="ON">公開 (ON)</option>
                            <option value="OFF">非公開 (OFF)</option>
                          </select>
                        </div>
                      ) : (
                        selectedModel.publishStatus
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>排気量 (cc)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.displacementCc ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, displacementCc: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.displacementCc ? (
                        selectedModel.displacementCc.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>必要免許</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <select
                            value={detailForm?.requiredLicense ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, requiredLicense: event.target.value }
                                  : prev
                              )
                            }
                          >
                            <option value="">選択してください</option>
                            {REQUIRED_LICENSE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : selectedModel.requiredLicense ? (
                        selectedModel.requiredLicense
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>全長 (mm)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.lengthMm ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, lengthMm: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.lengthMm ? (
                        selectedModel.lengthMm.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>全幅 (mm)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.widthMm ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, widthMm: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.widthMm ? (
                        selectedModel.widthMm.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>全高 (mm)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.heightMm ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, heightMm: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.heightMm ? (
                        selectedModel.heightMm.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>シート高 (mm)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.seatHeightMm ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, seatHeightMm: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.seatHeightMm ? (
                        selectedModel.seatHeightMm.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>乗車定員</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.seatCapacity ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, seatCapacity: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.seatCapacity ? (
                        selectedModel.seatCapacity.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>車両重量 (kg)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.vehicleWeightKg ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, vehicleWeightKg: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.vehicleWeightKg ? (
                        selectedModel.vehicleWeightKg.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>燃料タンク容量 (L)</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="number"
                            min="0"
                            value={detailForm?.fuelTankCapacityL ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, fuelTankCapacityL: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.fuelTankCapacityL ? (
                        selectedModel.fuelTankCapacityL.toLocaleString()
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>燃料種別</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.fuelType ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, fuelType: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.fuelType ? (
                        selectedModel.fuelType
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>最高出力</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.maxPower ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, maxPower: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.maxPower ? (
                        selectedModel.maxPower
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>最大トルク</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.maxTorque ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, maxTorque: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.maxTorque ? (
                        selectedModel.maxTorque
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>メイン画像URL</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="url"
                            value={detailForm?.mainImageUrl ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, mainImageUrl: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedModel.mainImageUrl ? (
                        selectedModel.mainImageUrl
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>作成日時</dt>
                    <dd>{selectedModel.createdAt ?? "-"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>更新日時</dt>
                    <dd>{selectedModel.updatedAt ?? "-"}</dd>
                  </div>
                </dl>
                {isDetailEditing && (
                  <div className={formStyles.actions}>
                    <button
                      type="button"
                      className={styles.tableToolbarButton}
                      onClick={() => {
                        if (!selectedModel) {
                          return;
                        }
                        setDetailForm({
                          classId: String(selectedModel.classId ?? ""),
                          modelName: selectedModel.modelName ?? "",
                          publishStatus: selectedModel.publishStatus ?? "ON",
                          displacementCc: selectedModel.displacementCc?.toString() ?? "",
                          requiredLicense: selectedModel.requiredLicense ?? "",
                          lengthMm: selectedModel.lengthMm?.toString() ?? "",
                          widthMm: selectedModel.widthMm?.toString() ?? "",
                          heightMm: selectedModel.heightMm?.toString() ?? "",
                          seatHeightMm: selectedModel.seatHeightMm?.toString() ?? "",
                          seatCapacity: selectedModel.seatCapacity?.toString() ?? "",
                          vehicleWeightKg:
                            selectedModel.vehicleWeightKg?.toString() ?? "",
                          fuelTankCapacityL:
                            selectedModel.fuelTankCapacityL?.toString() ?? "",
                          fuelType: selectedModel.fuelType ?? "",
                          maxPower: selectedModel.maxPower ?? "",
                          maxTorque: selectedModel.maxTorque ?? "",
                          mainImageUrl: selectedModel.mainImageUrl ?? "",
                        });
                        setDetailError(null);
                        setDetailSuccess(null);
                        setIsDetailEditing(false);
                      }}
                    >
                      変更を破棄
                    </button>
                    <button
                      type="submit"
                      className={formStyles.primaryButton}
                      disabled={isSavingDetail}
                    >
                      {isSavingDetail ? "保存中..." : "変更を保存"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}

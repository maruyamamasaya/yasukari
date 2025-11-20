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
  Vehicle,
} from "../../../../lib/dashboard/types";
import { STORE_OPTIONS, getStoreLabel } from "../../../../lib/dashboard/storeOptions";
import { parseTags } from "../../../../lib/dashboard/utils";

type VehicleFormState = {
  managementNumber: string;
  modelId: string;
  storeId: string;
  publishStatus: PublishStatus;
  tags: string;
  policyNumber1: string;
  policyBranchNumber1: string;
  policyNumber2: string;
  policyBranchNumber2: string;
  inspectionExpiryDate: string;
  licensePlateNumber: string;
  previousLicensePlateNumber: string;
  liabilityInsuranceExpiryDate: string;
  videoUrl: string;
  notes: string;
};

export default function VehicleListPage() {
  const router = useRouter();
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(
    () => new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ON" | "OFF">("ALL");
  const [sortState, setSortState] = useState<{
    key: "managementNumber" | "modelName" | "storeId" | "publishStatus";
    direction: "asc" | "desc";
  }>({ key: "managementNumber", direction: "asc" });
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailForm, setDetailForm] = useState<VehicleFormState | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsResponse, vehiclesResponse, classesResponse] = await Promise.all([
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
          fetch("/api/bike-classes"),
        ]);

        if (modelsResponse.ok) {
          const modelData: BikeModel[] = await modelsResponse.json();
          setBikeModels(modelData.sort((a, b) => a.modelId - b.modelId));
          setModelError(null);
        } else {
          setModelError("車種一覧の取得に失敗しました。");
        }

        if (classesResponse.ok) {
          const classData: BikeClass[] = await classesResponse.json();
          setBikeClasses(classData.sort((a, b) => a.classId - b.classId));
          setClassError(null);
        } else {
          setClassError("バイククラス一覧の取得に失敗しました。");
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
        setClassError((prev) => prev ?? "バイククラス一覧の取得に失敗しました。");
        setVehicleError((prev) => prev ?? "車両一覧の取得に失敗しました。");
      }
    };

    void loadData();
  }, []);

  const modelMap = useMemo(
    () =>
      bikeModels.reduce<Record<number, BikeModel>>((acc, model) => {
        acc[model.modelId] = model;
        return acc;
      }, {}),
    [bikeModels]
  );

  const modelNameMap = useMemo(
    () =>
      Object.values(modelMap).reduce<Record<number, string>>((acc, model) => {
        acc[model.modelId] = model.modelName;
        return acc;
      }, {}),
    [modelMap]
  );

  const classNameMap = useMemo(
    () =>
      bikeClasses.reduce<Record<number, string>>((acc, bikeClass) => {
        acc[bikeClass.classId] = bikeClass.className;
        return acc;
      }, {}),
    [bikeClasses]
  );

  const getClassNameByModelId = (modelId: number) => {
    const model = modelMap[modelId];
    if (!model) {
      return "-";
    }
    return classNameMap[model.classId] ?? "-";
  };

  const selectedVehicle = useMemo(
    () =>
      selectedVehicleId == null
        ? null
        : vehicles.find((vehicle) => vehicle.managementNumber === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles]
  );

  useEffect(() => {
    if (!selectedVehicle) {
      setDetailForm(null);
      setIsDetailEditing(false);
      setDetailError(null);
      setDetailSuccess(null);
      return;
    }

    setDetailForm({
      managementNumber: selectedVehicle.managementNumber ?? "",
      modelId: selectedVehicle.modelId?.toString() ?? "",
      storeId: selectedVehicle.storeId ?? "",
      publishStatus: selectedVehicle.publishStatus ?? "ON",
      tags: (selectedVehicle.tags ?? []).join(","),
      policyNumber1: selectedVehicle.policyNumber1 ?? "",
      policyBranchNumber1: selectedVehicle.policyBranchNumber1 ?? "",
      policyNumber2: selectedVehicle.policyNumber2 ?? "",
      policyBranchNumber2: selectedVehicle.policyBranchNumber2 ?? "",
      inspectionExpiryDate: selectedVehicle.inspectionExpiryDate ?? "",
      licensePlateNumber: selectedVehicle.licensePlateNumber ?? "",
      previousLicensePlateNumber: selectedVehicle.previousLicensePlateNumber ?? "",
      liabilityInsuranceExpiryDate:
        selectedVehicle.liabilityInsuranceExpiryDate ?? "",
      videoUrl: selectedVehicle.videoUrl ?? "",
      notes: selectedVehicle.notes ?? "",
    });
    setIsDetailEditing(false);
    setDetailError(null);
    setDetailSuccess(null);
  }, [selectedVehicle]);

  const filteredVehicles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = vehicles.filter((vehicle) => {
      const modelName = modelNameMap[vehicle.modelId] ?? "";
      const storeLabel = getStoreLabel(vehicle.storeId);
      const matchesKeyword = keyword
        ? [
            vehicle.managementNumber,
            modelName,
            storeLabel,
          ].some((value) =>
            String(value ?? "").toLowerCase().includes(keyword)
          )
        : true;

      const matchesStatus =
        statusFilter === "ALL" ? true : vehicle.publishStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    const sorted = [...filtered].sort((a, b) => {
      const getValue = (
        vehicle: Vehicle
      ): string | number => {
        switch (sortState.key) {
          case "managementNumber":
            return vehicle.managementNumber;
          case "modelName":
            return modelNameMap[vehicle.modelId] ?? "";
          case "storeId":
            return getStoreLabel(vehicle.storeId);
          case "publishStatus":
            return vehicle.publishStatus ?? "";
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
    modelNameMap,
    searchTerm,
    sortState.direction,
    sortState.key,
    statusFilter,
    vehicles,
  ]);

  const handleSort = (
    key: "managementNumber" | "modelName" | "storeId" | "publishStatus"
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
    const nextStatus = event.target.value as "ALL" | "ON" | "OFF";
    setStatusFilter(nextStatus);
  };

  const handleDetailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVehicle || !detailForm) {
      return;
    }

    setDetailSuccess(null);
    setDetailError(null);

    if (!detailForm.modelId) {
      setDetailError("車種を選択してください。");
      return;
    }

    if (!detailForm.storeId.trim()) {
      setDetailError("店舗を選択してください。");
      return;
    }

    const modelId = Number(detailForm.modelId);
    if (!bikeModels.some((model) => model.modelId === modelId)) {
      setDetailError("選択された車種が存在しません。");
      return;
    }

    const payload: Record<string, unknown> = {
      managementNumber: selectedVehicle.managementNumber,
      modelId,
      storeId: detailForm.storeId.trim(),
      publishStatus: detailForm.publishStatus,
      tags: parseTags(detailForm.tags),
    };

    const optionalFields: Array<
      keyof Omit<
        VehicleFormState,
        "managementNumber" | "modelId" | "storeId" | "publishStatus" | "tags"
      >
    > = [
      "policyNumber1",
      "policyBranchNumber1",
      "policyNumber2",
      "policyBranchNumber2",
      "inspectionExpiryDate",
      "licensePlateNumber",
      "previousLicensePlateNumber",
      "liabilityInsuranceExpiryDate",
      "videoUrl",
      "notes",
    ];

    optionalFields.forEach((field) => {
      const value = detailForm[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    setIsSavingDetail(true);
    try {
      const response = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setDetailError(errorBody?.message ?? "車両の更新に失敗しました。");
        return;
      }

      const updatedVehicle: Vehicle = await response.json();
      setVehicles((current) =>
        current
          .map((vehicle) =>
            vehicle.managementNumber === updatedVehicle.managementNumber
              ? updatedVehicle
              : vehicle
          )
          .sort((a, b) => a.managementNumber.localeCompare(b.managementNumber))
      );
      setDetailSuccess("車両情報を更新しました。");
      setIsDetailEditing(false);
    } catch (saveError) {
      console.error("Failed to update vehicle", saveError);
      setDetailError("車両の更新に失敗しました。");
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleRowSelect = (managementNumber: string) => {
    void router.push(`/admin/dashboard/vehicles/${managementNumber}`);
  };

  const toggleVehicleSelection = (managementNumber: string) => {
    setSelectedVehicleIds((current) => {
      const next = new Set(current);
      if (next.has(managementNumber)) {
        next.delete(managementNumber);
      } else {
        next.add(managementNumber);
      }

      if (next.size === 0) {
        setDeleteConfirmationChecked(false);
      }

      return next;
    });
  };

  const handleDeleteSelectedVehicles = async () => {
    const managementNumbers = Array.from(selectedVehicleIds);

    if (managementNumbers.length === 0) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/vehicles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ managementNumbers }),
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
            : "車両の削除に失敗しました。";
        throw new Error(message || "車両の削除に失敗しました。");
      }

      const deletedIds = Array.isArray(
        (responseData as { deletedIds?: unknown })?.deletedIds
      )
        ? ((responseData as { deletedIds: unknown[] }).deletedIds.filter(
            (value): value is string => typeof value === "string"
          ))
        : managementNumbers;

      setVehicles((current) =>
        current.filter(
          (vehicle) => !deletedIds.includes(vehicle.managementNumber)
        )
      );
      setSelectedVehicleIds(new Set<string>());
      setDeleteConfirmationChecked(false);
      setSelectedVehicleId((current) => {
        if (current == null) {
          return current;
        }
        return deletedIds.includes(current) ? null : current;
      });
    } catch (error) {
      console.error("Failed to delete vehicles", error);
      setDeleteError(
        error instanceof Error ? error.message : "車両の削除に失敗しました。"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedVehicleCount = selectedVehicleIds.size;
  const isDeleteDisabled =
    selectedVehicleCount === 0 || !deleteConfirmationChecked || isDeleting;

  return (
    <>
      <Head>
        <title>車両一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="車両一覧"
        actions={[
          {
            label: "＋ 車両登録",
            href: "/admin/dashboard/vehicles/register",
          },
        ]}
      >
        <section className={styles.section}>
          {classError && <p className={formStyles.error}>{classError}</p>}
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          {vehicleError && <p className={formStyles.error}>{vehicleError}</p>}
          {deleteError && <p className={formStyles.error}>{deleteError}</p>}
          <div className={formStyles.card}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>車両一覧</h2>
            </div>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarGroup}>
                <input
                  type="search"
                  className={styles.tableSearchInput}
                  placeholder="管理番号・車種名・店舗名で検索"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="車両一覧を検索"
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
                    <option value="managementNumber">管理番号で並び替え</option>
                    <option value="modelName">車種名で並び替え</option>
                    <option value="storeId">店舗で並び替え</option>
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
                  選択中: {selectedVehicleCount}件
                </span>
                <label className={styles.confirmationCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.confirmationCheckbox}
                    checked={deleteConfirmationChecked}
                    disabled={isDeleting || selectedVehicleCount === 0}
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
                  onClick={handleDeleteSelectedVehicles}
                >
                  車両削除
                </button>
              </div>
            </div>
            <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
              <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                <thead>
                  <tr>
                    <th
                      aria-sort={
                        sortState.key === "managementNumber"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("managementNumber")}
                      >
                        <span>管理番号</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "managementNumber"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "managementNumber"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th>バイククラス</th>
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
                        <span>車種</span>
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
                        sortState.key === "storeId"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("storeId")}
                      >
                        <span>店舗</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "storeId"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "storeId"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th>車検満了日</th>
                    <th>自賠責満了日</th>
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
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7}>登録済みの車両はまだありません。</td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
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
                        <td>
                          <label className={tableStyles.selectionLabel}>
                            <input
                              type="checkbox"
                              className={tableStyles.selectionCheckbox}
                              checked={selectedVehicleIds.has(
                                vehicle.managementNumber
                              )}
                              disabled={isDeleting}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                event.stopPropagation();
                                toggleVehicleSelection(vehicle.managementNumber);
                              }}
                              aria-label={`管理番号 ${vehicle.managementNumber} を削除対象として選択`}
                            />
                            <span>{vehicle.managementNumber}</span>
                          </label>
                        </td>
                        <td>{getClassNameByModelId(vehicle.modelId)}</td>
                        <td>{modelNameMap[vehicle.modelId] ?? "-"}</td>
                    <td>{getStoreLabel(vehicle.storeId)}</td>
                        <td>{vehicle.inspectionExpiryDate ?? "-"}</td>
                        <td>{vehicle.liabilityInsuranceExpiryDate ?? "-"}</td>
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
          {false && selectedVehicle && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>
                  {selectedVehicle.managementNumber}の詳細情報
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
                    <dt>管理番号</dt>
                    <dd>
                      {selectedVehicle.managementNumber}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>車種</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <select
                            value={detailForm?.modelId ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, modelId: event.target.value } : prev
                              )
                            }
                          >
                            <option value="">車種を選択</option>
                            {bikeModels.map((model) => (
                              <option key={model.modelId} value={model.modelId}>
                                {model.modelName}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        modelNameMap[selectedVehicle.modelId] ?? selectedVehicle.modelId
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>店舗</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <select
                            value={detailForm?.storeId ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, storeId: event.target.value } : prev
                              )
                            }
                          >
                            <option value="">店舗を選択</option>
                            {STORE_OPTIONS.map((store) => (
                              <option key={store.id} value={store.id}>
                                {store.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        getStoreLabel(selectedVehicle.storeId)
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
                        selectedVehicle.publishStatus
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>タグ</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.tags ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, tags: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.tags?.length ? (
                        selectedVehicle.tags.join(", ")
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>保険証券番号1</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.policyNumber1 ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, policyNumber1: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.policyNumber1 ? (
                        selectedVehicle.policyNumber1
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>保険取扱支店番号1</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.policyBranchNumber1 ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, policyBranchNumber1: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.policyBranchNumber1 ? (
                        selectedVehicle.policyBranchNumber1
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>保険証券番号2</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.policyNumber2 ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, policyNumber2: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.policyNumber2 ? (
                        selectedVehicle.policyNumber2
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>保険取扱支店番号2</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.policyBranchNumber2 ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, policyBranchNumber2: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.policyBranchNumber2 ? (
                        selectedVehicle.policyBranchNumber2
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>車検満了日</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="date"
                            value={detailForm?.inspectionExpiryDate ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, inspectionExpiryDate: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.inspectionExpiryDate ? (
                        selectedVehicle.inspectionExpiryDate
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>ナンバープレート</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.licensePlateNumber ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? { ...prev, licensePlateNumber: event.target.value }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.licensePlateNumber ? (
                        selectedVehicle.licensePlateNumber
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>前ナンバー</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            value={detailForm?.previousLicensePlateNumber ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      previousLicensePlateNumber: event.target.value,
                                    }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.previousLicensePlateNumber ? (
                        selectedVehicle.previousLicensePlateNumber
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>自賠責満了日</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="date"
                            value={detailForm?.liabilityInsuranceExpiryDate ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      liabilityInsuranceExpiryDate: event.target.value,
                                    }
                                  : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.liabilityInsuranceExpiryDate ? (
                        selectedVehicle.liabilityInsuranceExpiryDate
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>動画URL</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <input
                            type="url"
                            value={detailForm?.videoUrl ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, videoUrl: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.videoUrl ? (
                        selectedVehicle.videoUrl
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>備考</dt>
                    <dd>
                      {isDetailEditing ? (
                        <div className={formStyles.field}>
                          <textarea
                            value={detailForm?.notes ?? ""}
                            onChange={(event) =>
                              setDetailForm((prev) =>
                                prev ? { ...prev, notes: event.target.value } : prev
                              )
                            }
                          />
                        </div>
                      ) : selectedVehicle.notes ? (
                        selectedVehicle.notes
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>作成日時</dt>
                    <dd>{selectedVehicle.createdAt ?? "-"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>更新日時</dt>
                    <dd>{selectedVehicle.updatedAt ?? "-"}</dd>
                  </div>
                </dl>
                {isDetailEditing && (
                  <div className={formStyles.actions}>
                    <button
                      type="button"
                      className={styles.tableToolbarButton}
                      onClick={() => {
                        if (!selectedVehicle) {
                          return;
                        }
                        setDetailForm({
                          managementNumber: selectedVehicle.managementNumber ?? "",
                          modelId: selectedVehicle.modelId?.toString() ?? "",
                          storeId: selectedVehicle.storeId ?? "",
                          publishStatus: selectedVehicle.publishStatus ?? "ON",
                          tags: (selectedVehicle.tags ?? []).join(","),
                          policyNumber1: selectedVehicle.policyNumber1 ?? "",
                          policyBranchNumber1: selectedVehicle.policyBranchNumber1 ?? "",
                          policyNumber2: selectedVehicle.policyNumber2 ?? "",
                          policyBranchNumber2: selectedVehicle.policyBranchNumber2 ?? "",
                          inspectionExpiryDate: selectedVehicle.inspectionExpiryDate ?? "",
                          licensePlateNumber: selectedVehicle.licensePlateNumber ?? "",
                          previousLicensePlateNumber:
                            selectedVehicle.previousLicensePlateNumber ?? "",
                          liabilityInsuranceExpiryDate:
                            selectedVehicle.liabilityInsuranceExpiryDate ?? "",
                          videoUrl: selectedVehicle.videoUrl ?? "",
                          notes: selectedVehicle.notes ?? "",
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

import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeModel, Vehicle } from "../../../../lib/dashboard/types";

export default function VehicleListPage() {
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
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

  const filteredVehicles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = vehicles.filter((vehicle) => {
      const modelName = modelNameMap[vehicle.modelId] ?? "";
      const matchesKeyword = keyword
        ? [
            vehicle.managementNumber,
            modelName,
            vehicle.storeId ?? "",
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
            return vehicle.storeId ?? "";
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
        actions={
          <Link href="/admin/dashboard/vehicles/register" className={styles.iconButton}>
            <span aria-hidden>＋</span>
            車両登録
          </Link>
        }
      >
        <section className={styles.section}>
          {modelError && <p className={formStyles.error}>{modelError}</p>}
          {vehicleError && <p className={formStyles.error}>{vehicleError}</p>}
          {deleteError && <p className={formStyles.error}>{deleteError}</p>}
          <div className={formStyles.card}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>車両一覧</h2>
              <Link
                href="/admin/dashboard/vehicles/register"
                className={styles.detailEditButton}
                aria-label="車両一覧を編集"
              >
                ✎ 編集
              </Link>
            </div>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarGroup}>
                <input
                  type="search"
                  className={styles.tableSearchInput}
                  placeholder="管理番号・車種名・店舗IDで検索"
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
                    <option value="storeId">店舗IDで並び替え</option>
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
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
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
                        <span>店舗ID</span>
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
                      <td colSpan={4}>登録済みの車両はまだありません。</td>
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
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>
                  {selectedVehicle.managementNumber}の詳細情報
                </h2>
                <Link
                  href={`/admin/dashboard/vehicles/register?managementNumber=${selectedVehicle.managementNumber}`}
                  className={styles.detailEditButton}
                  aria-label={`${selectedVehicle.managementNumber}の詳細情報を編集`}
                >
                  ✎ 編集
                </Link>
              </div>
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
      </DashboardLayout>
    </>
  );
}

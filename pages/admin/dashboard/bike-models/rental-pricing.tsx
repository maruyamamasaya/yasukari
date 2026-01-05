import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel } from "../../../../lib/dashboard/types";

type VehicleRentalPrice = {
  vehicle_type_id: number;
  days: number;
  price: number;
};

type PricingStatus = {
  isComplete: boolean;
  missingDays: number[];
  error?: boolean;
};

const MAX_DAYS = 31;

export default function BikeModelRentalPricingListPage() {
  const router = useRouter();
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pricingStatus, setPricingStatus] = useState<Record<number, PricingStatus>>({});
  const [isPricingStatusLoading, setIsPricingStatusLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ON" | "OFF">("ALL");
  const [pricingFilter, setPricingFilter] = useState<
    "ALL" | "COMPLETE" | "INCOMPLETE" | "ERROR" | "CHECKING"
  >("ALL");
  const [sortState, setSortState] = useState<{
    key: "modelId" | "modelName" | "className" | "publishStatus" | "pricingStatus";
    direction: "asc" | "desc";
  }>({ key: "modelId", direction: "asc" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesResponse, modelsResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
        ]);

        if (!classesResponse.ok || !modelsResponse.ok) {
          setError("車種情報の取得に失敗しました。");
          return;
        }

        const [classData, modelData] = await Promise.all([
          classesResponse.json() as Promise<BikeClass[]>,
          modelsResponse.json() as Promise<BikeModel[]>,
        ]);

        setBikeClasses(classData.sort((a, b) => a.classId - b.classId));
        setBikeModels(modelData.sort((a, b) => a.modelId - b.modelId));
        setError(null);
      } catch (loadError) {
        console.error("Failed to load bike model rental pricing list", loadError);
        setError("車種情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
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

  const getPricingMeta = (modelId: number) => {
    const status = pricingStatus[modelId];

    if (!status && isPricingStatusLoading) {
      return {
        key: "CHECKING" as const,
        label: "確認中...",
        sortValue: 4,
        badgeClass: tableStyles.badgeNeutral,
        missingDays: 0,
      };
    }

    if (status?.error) {
      return {
        key: "ERROR" as const,
        label: "取得失敗",
        sortValue: 1,
        badgeClass: tableStyles.badgeOff,
        missingDays: 0,
      };
    }

    if (status?.isComplete) {
      return {
        key: "COMPLETE" as const,
        label: "登録済み",
        sortValue: 3,
        badgeClass: tableStyles.badgeOn,
        missingDays: 0,
      };
    }

    return {
      key: "INCOMPLETE" as const,
      label: "未登録",
      sortValue: 2,
      badgeClass: tableStyles.badgeOff,
      missingDays: status?.missingDays.length ?? 0,
    };
  };

  const filteredModels = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = bikeModels.filter((model) => {
      const matchesKeyword = keyword
        ? [
            model.modelName,
            classNameMap[model.classId] ?? "",
            model.modelId,
          ].some((value) => String(value ?? "").toLowerCase().includes(keyword))
        : true;

      const matchesStatus =
        statusFilter === "ALL" ? true : model.publishStatus === statusFilter;
      const pricingMeta = getPricingMeta(model.modelId);
      const matchesPricing =
        pricingFilter === "ALL" ? true : pricingMeta.key === pricingFilter;

      return matchesKeyword && matchesStatus && matchesPricing;
    });

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const getValue = (model: BikeModel): string | number => {
        switch (sortState.key) {
          case "modelId":
            return model.modelId;
          case "modelName":
            return model.modelName;
          case "className":
            return classNameMap[model.classId] ?? "";
          case "publishStatus":
            return model.publishStatus ?? "";
          case "pricingStatus":
            return getPricingMeta(model.modelId).sortValue;
          default:
            return "";
        }
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        if (sortState.key === "pricingStatus" && aValue === bValue) {
          const aMissing = getPricingMeta(a.modelId).missingDays;
          const bMissing = getPricingMeta(b.modelId).missingDays;
          return (aMissing - bMissing) * directionMultiplier;
        }

        return (aValue - bValue) * directionMultiplier;
      }

      return String(aValue).localeCompare(String(bValue), "ja") * directionMultiplier;
    });
  }, [
    bikeModels,
    classNameMap,
    pricingFilter,
    searchTerm,
    sortState.direction,
    sortState.key,
    statusFilter,
    pricingStatus,
    isPricingStatusLoading,
  ]);

  const handleSort = (
    key: "modelId" | "modelName" | "className" | "publishStatus" | "pricingStatus"
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

  const handlePricingFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value as typeof pricingFilter;
    setPricingFilter(nextValue);
  };

  useEffect(() => {
    if (bikeModels.length === 0) {
      setPricingStatus({});
      return;
    }

    let isCancelled = false;

    const loadPricingStatus = async () => {
      setIsPricingStatusLoading(true);
      try {
        const results = await Promise.all(
          bikeModels.map(async (model) => {
            try {
              const response = await fetch(
                `/api/vehicle-rental-prices?vehicle_type_id=${model.modelId}`
              );

              if (!response.ok) {
                throw new Error("Failed to load pricing");
              }

              const items: VehicleRentalPrice[] = await response.json();
              const registeredDays = new Set(items.map((item) => item.days));
              const missingDays = Array.from(
                { length: MAX_DAYS },
                (_, index) => index + 1
              ).filter((day) => !registeredDays.has(day));

              return {
                modelId: model.modelId,
                status: {
                  isComplete: missingDays.length === 0,
                  missingDays,
                } as PricingStatus,
              };
            } catch (pricingError) {
              console.error("Failed to load rental pricing status", {
                modelId: model.modelId,
                pricingError,
              });
              return {
                modelId: model.modelId,
                status: { isComplete: false, missingDays: [], error: true },
              };
            }
          })
        );

        if (isCancelled) {
          return;
        }

        setPricingStatus(
          results.reduce<Record<number, PricingStatus>>((acc, current) => {
            acc[current.modelId] = current.status;
            return acc;
          }, {})
        );
      } finally {
        if (!isCancelled) {
          setIsPricingStatusLoading(false);
        }
      }
    };

    void loadPricingStatus();

    return () => {
      isCancelled = true;
    };
  }, [bikeModels]);

  return (
    <>
      <Head>
        <title>料金設定</title>
      </Head>
      <DashboardLayout title="料金設定">
        <div className={styles.sectionHeader}>
          <div>
            <h1 className={styles.pageTitle}>車種ごとの料金設定</h1>
            <p className={styles.pageDescription}>
              各車種の行をクリックすると、料金設定ページに移動できます。
            </p>
          </div>
        </div>

        {error && <p className={formStyles.error}>{error}</p>}

        <div className={styles.tableToolbar}>
          <div className={styles.tableToolbarGroup}>
            <input
              type="search"
              className={styles.tableSearchInput}
              placeholder="車種名・クラス名・IDで検索"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="料金設定一覧を検索"
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
            <select
              className={styles.tableSelect}
              value={pricingFilter}
              onChange={handlePricingFilterChange}
              aria-label="料金登録状況で絞り込み"
            >
              <option value="ALL">料金登録（すべて）</option>
              <option value="COMPLETE">登録済み</option>
              <option value="INCOMPLETE">未登録</option>
              <option value="CHECKING">確認中</option>
              <option value="ERROR">取得失敗</option>
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
                <option value="pricingStatus">料金登録で並び替え</option>
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

        <div className={tableStyles.wrapper} aria-busy={isLoading}>
          <div className={tableStyles.tableWrapper}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th
                    scope="col"
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
                      <span>車種ID</span>
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
                    scope="col"
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
                    scope="col"
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
                    scope="col"
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
                  <th
                    scope="col"
                    aria-sort={
                      sortState.key === "pricingStatus"
                        ? sortState.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className={tableStyles.sortableHeaderButton}
                      onClick={() => handleSort("pricingStatus")}
                    >
                      <span>料金登録</span>
                      <span
                        aria-hidden
                        className={`${tableStyles.sortIcon} ${
                          sortState.key === "pricingStatus"
                            ? sortState.direction === "asc"
                              ? tableStyles.sortIconAsc
                              : tableStyles.sortIconDesc
                            : ""
                        }`}
                      />
                      <span className={tableStyles.visuallyHidden}>
                        {sortState.key === "pricingStatus"
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
                    <td colSpan={5} className={tableStyles.emptyRow}>
                      {isLoading
                        ? "読み込み中..."
                        : bikeModels.length === 0
                        ? "登録済みの車種はまだありません。"
                        : "条件に一致する車種はありません。"}
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model) => (
                    <tr
                      key={model.modelId}
                      className={tableStyles.clickableRow}
                      tabIndex={0}
                      onClick={() => {
                        void router.push(
                          `/admin/dashboard/bike-models/${model.modelId}/rental-pricing`
                        );
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void router.push(
                            `/admin/dashboard/bike-models/${model.modelId}/rental-pricing`
                          );
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
                      <td>
                        {(() => {
                          const status = pricingStatus[model.modelId];
                          const pricingMeta = getPricingMeta(model.modelId);

                          if (pricingMeta.key !== "INCOMPLETE") {
                            return (
                              <span
                                className={`${tableStyles.badge} ${pricingMeta.badgeClass}`}
                              >
                                {pricingMeta.label}
                              </span>
                            );
                          }

                          return (
                            <div>
                              <span
                                className={`${tableStyles.badge} ${pricingMeta.badgeClass}`}
                              >
                                {pricingMeta.label}
                              </span>
                              {status?.missingDays.length ? (
                                <div className={tableStyles.statusNote}>
                                  不足 {status.missingDays.length}日分
                                </div>
                              ) : null}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

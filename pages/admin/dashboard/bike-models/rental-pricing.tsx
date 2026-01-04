import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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

        <div className={tableStyles.wrapper} aria-busy={isLoading}>
          <div className={tableStyles.tableWrapper}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th scope="col">車種ID</th>
                  <th scope="col">車種名</th>
                  <th scope="col">クラス</th>
                  <th scope="col">掲載状態</th>
                  <th scope="col">料金登録</th>
                </tr>
              </thead>
              <tbody>
                {bikeModels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={tableStyles.emptyRow}>
                      {isLoading ? "読み込み中..." : "登録済みの車種はまだありません。"}
                    </td>
                  </tr>
                ) : (
                  bikeModels.map((model) => (
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

                          if (!status && isPricingStatusLoading) {
                            return (
                              <span
                                className={`${tableStyles.badge} ${tableStyles.badgeNeutral}`}
                              >
                                確認中...
                              </span>
                            );
                          }

                          if (status?.error) {
                            return (
                              <span
                                className={`${tableStyles.badge} ${tableStyles.badgeOff}`}
                              >
                                取得失敗
                              </span>
                            );
                          }

                          if (status?.isComplete) {
                            return (
                              <span
                                className={`${tableStyles.badge} ${tableStyles.badgeOn}`}
                              >
                                登録済み
                              </span>
                            );
                          }

                          return (
                            <div>
                              <span
                                className={`${tableStyles.badge} ${tableStyles.badgeOff}`}
                              >
                                未登録
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

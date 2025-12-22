import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel } from "../../../../lib/dashboard/types";

export default function BikeModelRentalPricingListPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              編集ボタンから各車種の料金設定ページに移動できます。
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
                  <th scope="col">操作</th>
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
                    <tr key={model.modelId}>
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
                        <div className={tableStyles.actions}>
                          <Link
                            href={`/admin/dashboard/bike-models/${model.modelId}/rental-pricing`}
                            className={`${tableStyles.link} ${tableStyles.actionButton}`}
                          >
                            編集
                          </Link>
                        </div>
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

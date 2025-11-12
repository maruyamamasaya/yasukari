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

  return (
    <>
      <Head>
        <title>車種一覧 | 管理ダッシュボード</title>
      </Head>
      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h1 className={styles.sectionTitle}>車種一覧</h1>
            <Link href="/dashboard/bike-models/register" className={styles.iconButton}>
              車種登録
            </Link>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

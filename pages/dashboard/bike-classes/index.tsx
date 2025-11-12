import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import formStyles from "../../../styles/AdminForm.module.css";
import tableStyles from "../../../styles/AdminTable.module.css";
import styles from "../../../styles/Dashboard.module.css";
import { BikeClass } from "../../../lib/dashboard/types";

export default function BikeClassListPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setError("クラス一覧の取得に失敗しました。");
          return;
        }
        const data: BikeClass[] = await response.json();
        setBikeClasses(data.sort((a, b) => a.classId - b.classId));
      } catch (loadError) {
        console.error("Failed to load bike classes", loadError);
        setError("クラス一覧の取得に失敗しました。");
      }
    };

    void loadClasses();
  }, []);

  return (
    <>
      <Head>
        <title>バイククラス一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="バイククラス一覧"
        actions={
          <Link href="/dashboard/bike-classes/register" className={styles.iconButton}>
            <span aria-hidden>＋</span>
            バイククラス登録
          </Link>
        }
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          <div className={formStyles.card}>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>クラス名</th>
                  </tr>
                </thead>
                <tbody>
                  {bikeClasses.length === 0 ? (
                    <tr>
                      <td colSpan={2}>登録済みのクラスはまだありません。</td>
                    </tr>
                  ) : (
                    bikeClasses.map((item) => (
                      <tr key={item.classId}>
                        <td>{item.classId}</td>
                        <td>{item.className}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

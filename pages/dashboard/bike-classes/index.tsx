import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { formatDateTime } from "../../../lib/dashboard";
import type { BikeClass } from "../../../types/dashboard";
import styles from "../../../styles/DashboardPage.module.css";

const PAGE_SIZE = 20;

export default function BikeClassListPage() {
  const [items, setItems] = useState<BikeClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          throw new Error("一覧の取得に失敗しました。");
        }
        const data: BikeClass[] = await response.json();
        setItems(data.sort((a, b) => a.classId - b.classId));
        setError(null);
        setCurrentPage(1);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("一覧の取得に失敗しました。");
        }
      }
    };

    void fetchClasses();
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return items.slice(startIndex, startIndex + PAGE_SIZE);
  }, [items, currentPage]);

  return (
    <>
      <Head>
        <title>バイククラス一覧 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="バイククラス一覧">
        <section className={styles.section}>
          {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>クラス名</th>
                  <th>作成日時</th>
                  <th>更新日時</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.classId}>
                    <td>{item.classId}</td>
                    <td>{item.className}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>{formatDateTime(item.updatedAt)}</td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={4}>データがありません。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              前へ
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              次へ
            </button>
          </div>
          <Link href="/dashboard/bike-classes/new" className={styles.linkButton}>
            ＋ 登録へ
          </Link>
        </section>
      </DashboardLayout>
    </>
  );
}

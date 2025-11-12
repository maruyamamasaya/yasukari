import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import tableStyles from "../../../styles/AdminTable.module.css";

type BikeClass = {
  classId: number;
  className: string;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 20;

export default function BikeClassListPage() {
  const [classes, setClasses] = useState<BikeClass[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setMessage("クラス一覧の取得に失敗しました。");
          return;
        }
        const data: BikeClass[] = await response.json();
        data.sort((a, b) => a.classId - b.classId);
        setClasses(data);
        setMessage(null);
      } catch (error) {
        console.error("Failed to load bike classes", error);
        setMessage("クラス一覧の取得に失敗しました。");
      }
    };

    void load();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(classes.length / PAGE_SIZE)), [
    classes.length,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const paginated = classes.slice(start, start + PAGE_SIZE);

  return (
    <AdminLayout title="バイククラス一覧">
      {message ? <div className={tableStyles.message}>{message}</div> : null}
      <div className={tableStyles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>クラス名</th>
              <th>作成日時</th>
              <th>更新日時</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={item.classId}>
                <td>{item.classId}</td>
                <td>{item.className}</td>
                <td>{item.createdAt}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4}>データがありません。</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className={tableStyles.pagination}>
        <div>
          {classes.length} 件中 {paginated.length > 0 ? `${start + 1}-${start + paginated.length}` : 0} 件を表示
        </div>
        <div className={tableStyles.pageButtons}>
          <button
            type="button"
            className={tableStyles.pageButton}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            前へ
          </button>
          <button
            type="button"
            className={tableStyles.pageButton}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            次へ
          </button>
        </div>
      </div>
      <div className={tableStyles.pagination}>
        <Link href="/dashboard/bike-classes/new" className={tableStyles.createLink}>
          ＋ 新規登録
        </Link>
      </div>
    </AdminLayout>
  );
}

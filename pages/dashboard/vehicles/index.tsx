import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { formatDateTime } from "../../../lib/dashboard";
import type { BikeModel, Vehicle } from "../../../types/dashboard";
import styles from "../../../styles/DashboardPage.module.css";

const PAGE_SIZE = 20;

export default function VehicleListPage() {
  const [modelMap, setModelMap] = useState<Record<number, string>>({});
  const [items, setItems] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelResponse, vehicleResponse] = await Promise.all([
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (!modelResponse.ok || !vehicleResponse.ok) {
          throw new Error("一覧の取得に失敗しました。");
        }

        const [modelData, vehicleData] = (await Promise.all([
          modelResponse.json(),
          vehicleResponse.json(),
        ])) as [BikeModel[], Vehicle[]];

        const map = modelData.reduce<Record<number, string>>((acc, model) => {
          acc[model.modelId] = model.modelName;
          return acc;
        }, {});

        const sortedVehicles = [...vehicleData].sort((a, b) =>
          a.managementNumber.localeCompare(b.managementNumber)
        );

        setModelMap(map);
        setItems(sortedVehicles);
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

    void fetchData();
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
        <title>車両一覧 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="車両一覧">
        <section className={styles.section}>
          {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>管理番号</th>
                  <th>車種</th>
                  <th>店舗ID</th>
                  <th>掲載</th>
                  <th>タグ</th>
                  <th>保険番号1</th>
                  <th>枝番1</th>
                  <th>保険番号2</th>
                  <th>枝番2</th>
                  <th>車検満了日</th>
                  <th>ナンバー</th>
                  <th>旧ナンバー</th>
                  <th>自賠責満了日</th>
                  <th>動画URL</th>
                  <th>メモ</th>
                  <th>作成日時</th>
                  <th>更新日時</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.managementNumber}>
                    <td>{item.managementNumber}</td>
                    <td>{modelMap[item.modelId] ?? item.modelId}</td>
                    <td>{item.storeId}</td>
                    <td>{item.publishStatus}</td>
                    <td>{item.tags.length > 0 ? item.tags.join(", ") : "-"}</td>
                    <td>{item.policyNumber1 ?? "-"}</td>
                    <td>{item.policyBranchNumber1 ?? "-"}</td>
                    <td>{item.policyNumber2 ?? "-"}</td>
                    <td>{item.policyBranchNumber2 ?? "-"}</td>
                    <td>{item.inspectionExpiryDate ?? "-"}</td>
                    <td>{item.licensePlateNumber ?? "-"}</td>
                    <td>{item.previousLicensePlateNumber ?? "-"}</td>
                    <td>{item.liabilityInsuranceExpiryDate ?? "-"}</td>
                    <td>{item.videoUrl ? (
                      <a href={item.videoUrl} target="_blank" rel="noreferrer">
                        リンク
                      </a>
                    ) : (
                      "-"
                    )}</td>
                    <td>{item.notes ?? "-"}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>{formatDateTime(item.updatedAt)}</td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={17}>データがありません。</td>
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
          <Link href="/dashboard/vehicles/new" className={styles.linkButton}>
            ＋ 登録へ
          </Link>
        </section>
      </DashboardLayout>
    </>
  );
}

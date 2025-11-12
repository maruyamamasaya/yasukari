import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { formatDateTime, formatNumber } from "../../../lib/dashboard";
import type { BikeClass, BikeModel } from "../../../types/dashboard";
import styles from "../../../styles/DashboardPage.module.css";

const PAGE_SIZE = 20;

export default function BikeModelListPage() {
  const [classes, setClasses] = useState<Record<number, string>>({});
  const [models, setModels] = useState<BikeModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classResponse, modelResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
        ]);

        if (!classResponse.ok || !modelResponse.ok) {
          throw new Error("一覧の取得に失敗しました。");
        }

        const [classData, modelData] = (await Promise.all([
          classResponse.json(),
          modelResponse.json(),
        ])) as [BikeClass[], BikeModel[]];

        const classMap = classData.reduce<Record<number, string>>((acc, item) => {
          acc[item.classId] = item.className;
          return acc;
        }, {});

        setClasses(classMap);
        setModels(modelData.sort((a, b) => a.modelId - b.modelId));
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

  const totalPages = Math.max(1, Math.ceil(models.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return models.slice(startIndex, startIndex + PAGE_SIZE);
  }, [models, currentPage]);

  return (
    <>
      <Head>
        <title>車種一覧 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="車種一覧">
        <section className={styles.section}>
          {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>クラス</th>
                  <th>車種名</th>
                  <th>掲載</th>
                  <th>排気量</th>
                  <th>必要免許</th>
                  <th>全長</th>
                  <th>全幅</th>
                  <th>全高</th>
                  <th>シート高</th>
                  <th>乗車定員</th>
                  <th>車両重量</th>
                  <th>燃料タンク</th>
                  <th>燃料種別</th>
                  <th>最高出力</th>
                  <th>最大トルク</th>
                  <th>画像URL</th>
                  <th>作成日時</th>
                  <th>更新日時</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.modelId}>
                    <td>{item.modelId}</td>
                    <td>{classes[item.classId] ?? item.classId}</td>
                    <td>{item.modelName}</td>
                    <td>{item.publishStatus}</td>
                    <td>{formatNumber(item.displacementCc)}</td>
                    <td>{item.requiredLicense ?? "-"}</td>
                    <td>{formatNumber(item.lengthMm)}</td>
                    <td>{formatNumber(item.widthMm)}</td>
                    <td>{formatNumber(item.heightMm)}</td>
                    <td>{formatNumber(item.seatHeightMm)}</td>
                    <td>{formatNumber(item.seatCapacity)}</td>
                    <td>{formatNumber(item.vehicleWeightKg)}</td>
                    <td>{formatNumber(item.fuelTankCapacityL)}</td>
                    <td>{item.fuelType ?? "-"}</td>
                    <td>{item.maxPower ?? "-"}</td>
                    <td>{item.maxTorque ?? "-"}</td>
                    <td>{item.mainImageUrl ? (
                      <a href={item.mainImageUrl} target="_blank" rel="noreferrer">
                        リンク
                      </a>
                    ) : (
                      "-"
                    )}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>{formatDateTime(item.updatedAt)}</td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={19}>データがありません。</td>
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
          <Link href="/dashboard/bike-models/new" className={styles.linkButton}>
            ＋ 登録へ
          </Link>
        </section>
      </DashboardLayout>
    </>
  );
}

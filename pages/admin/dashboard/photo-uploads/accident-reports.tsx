import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

type AccidentReport = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  uploadedAt: string;
  imageUrl: string;
};

export default function AccidentReportListPage() {
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetch("/api/admin/accident-reports");
        if (!response.ok) {
          throw new Error("事故・転倒報告の取得に失敗しました。");
        }
        const data = (await response.json()) as { reports?: AccidentReport[] };
        if (isMounted) {
          setReports(data.reports ?? []);
        }
      } catch (error) {
        console.error("Failed to load accident reports", error);
        if (isMounted) {
          setErrorMessage("事故・転倒報告の取得に失敗しました。");
          setReports([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>事故・転倒報告 | 写真アップロード確認</title>
      </Head>
      <DashboardLayout
        title="事故・転倒報告"
        description="事故・転倒報告で送付された写真を一覧で確認できます。"
      >
        <div className={formStyles.cardStack}>
          <section className={formStyles.card}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>事故・転倒報告一覧</h2>
              <p className={styles.sectionNote}>
                S3に保存された写真とユーザー情報、送信日時を確認できます。
              </p>
              {isLoading ? (
                <p className={styles.sectionNote}>読み込み中です…</p>
              ) : null}
              {errorMessage ? (
                <p className={styles.sectionNote}>{errorMessage}</p>
              ) : null}
            </header>
            {!isLoading && reports.length === 0 ? (
              <div className={styles.emptyState}>
                現在確認待ちの事故・転倒報告はありません。
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {reports.map((report) => (
                  <div key={report.id} className={styles.photoCard}>
                    <img
                      src={report.imageUrl}
                      alt={`${report.userName}の事故・転倒報告写真`}
                      className={styles.photoThumb}
                    />
                    <div className={styles.photoMeta}>
                      <span className={styles.photoName}>{report.userName}</span>
                      <span className={styles.photoSubtext}>ID: {report.userId}</span>
                      <span className={styles.photoSubtext}>{report.email}</span>
                      <span className={styles.photoSubtext}>{report.phone}</span>
                      <span className={styles.photoSubtext}>{report.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}

import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

type ReturnCompletion = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  uploadedAt: string;
  imageUrl: string;
};

export default function ReturnCompletionListPage() {
  const [reports, setReports] = useState<ReturnCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReturnCompletion | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetch("/api/admin/return-completions");
        if (!response.ok) {
          throw new Error("返却完了報告の取得に失敗しました。");
        }
        const data = (await response.json()) as { reports?: ReturnCompletion[] };
        if (isMounted) {
          setReports(data.reports ?? []);
        }
      } catch (error) {
        console.error("Failed to load return completions", error);
        if (isMounted) {
          setErrorMessage("返却完了報告の取得に失敗しました。");
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

  useEffect(() => {
    if (!selectedReport) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedReport(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedReport]);

  return (
    <>
      <Head>
        <title>バイクの返却完了 | 写真アップロード確認</title>
      </Head>
      <DashboardLayout
        title="バイクの返却完了"
        description="返却完了時に送付された写真を一覧で確認できます。"
      >
        <div className={formStyles.cardStack}>
          <section className={formStyles.card}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>返却完了一覧</h2>
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
                現在確認待ちの返却完了写真はありません。
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {reports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    className={styles.photoCard}
                    onClick={() => setSelectedReport(report)}
                    aria-label={`${report.userName}の返却完了写真の詳細を表示`}
                  >
                    <img
                      src={report.imageUrl}
                      alt={`${report.userName}の返却完了写真`}
                      className={styles.photoThumb}
                    />
                    <div className={styles.photoMeta}>
                      <span className={styles.photoName}>{report.userName}</span>
                      <span className={styles.photoSubtext}>ID: {report.userId}</span>
                      <span className={styles.photoSubtext}>{report.email}</span>
                      <span className={styles.photoSubtext}>{report.phone}</span>
                      <span className={styles.photoSubtext}>{report.uploadedAt}</span>
                      <span className={styles.photoDetailHint}>クリックで詳細</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
        {selectedReport ? (
          <div
            className={styles.modalOverlay}
            role="presentation"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className={styles.modalCard}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedReport.userName}の返却完了詳細`}
              onClick={(event) => event.stopPropagation()}
            >
              <header className={styles.modalHeader}>
                <div>
                  <p className={styles.modalTitle}>返却完了の詳細</p>
                  <p className={styles.modalSubtitle}>{selectedReport.userName}</p>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setSelectedReport(null)}
                >
                  閉じる
                </button>
              </header>
              <div className={styles.modalContent}>
                <img
                  src={selectedReport.imageUrl}
                  alt={`${selectedReport.userName}の返却完了写真の拡大表示`}
                  className={styles.modalImage}
                />
                <dl className={styles.modalMeta}>
                  <div>
                    <dt>ユーザーID</dt>
                    <dd>{selectedReport.userId}</dd>
                  </div>
                  <div>
                    <dt>メール</dt>
                    <dd>{selectedReport.email}</dd>
                  </div>
                  <div>
                    <dt>電話番号</dt>
                    <dd>{selectedReport.phone}</dd>
                  </div>
                  <div>
                    <dt>送信日時</dt>
                    <dd>{selectedReport.uploadedAt}</dd>
                  </div>
                  <div>
                    <dt>画像URL</dt>
                    <dd>
                      <a
                        href={selectedReport.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.modalLink}
                      >
                        画像を新しいタブで開く
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ) : null}
      </DashboardLayout>
    </>
  );
}

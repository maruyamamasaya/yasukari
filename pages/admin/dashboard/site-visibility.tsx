import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/SiteVisibility.module.css";

const MAINTENANCE_PREVIEW_PATH = "/maintenance";

export default function SiteVisibilityPage() {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = useMemo(
    () => (enabled ? "工事中を表示中" : "通常表示中"),
    [enabled]
  );

  const statusDescription = useMemo(
    () =>
      enabled
        ? "現在すべてのページが工事中ページへリダイレクトされています。"
        : "現在サイトは通常通り公開されています。",
    [enabled]
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/maintenance");
        if (!response.ok) {
          throw new Error("Failed to load status");
        }
        const data = (await response.json()) as { enabled?: boolean };
        setEnabled(Boolean(data.enabled));
        setError(null);
      } catch (err) {
        setError("ステータスの取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setEnabled(Boolean(data.enabled));
    } catch (err) {
      setError("更新に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusClassName = enabled
    ? `${styles.statusBadge} ${styles.statusBadgeActive}`
    : `${styles.statusBadge} ${styles.statusBadgeInactive}`;

  return (
    <DashboardLayout
      title="サイト表示切替"
      description="サイトを一時的に工事中ページへ切り替える設定ページです。"
      showDashboardLink
    >
      <Head>
        <title>サイト表示切替 | 管理画面</title>
      </Head>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>MAINTENANCE MODE</p>
          <h1 className={styles.pageTitle}>サイト表示を工事中ページに切替</h1>
          <p className={styles.lead}>
            年末年始などの一時停止時にご利用ください。ボタンを押すと、
            /admin/dashboard 配下を除くすべてのページが /maintenance へリダイレクトされます。
          </p>
          <div className={styles.statusRow}>
            <span className={statusClassName}>{statusLabel}</span>
            <span className={styles.statusDescription}>{statusDescription}</span>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.actions}>
            <Link
              href={MAINTENANCE_PREVIEW_PATH}
              target="_blank"
              rel="noreferrer"
              className={styles.previewButton}
            >
              工事中ページを確認
            </Link>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={handleToggle}
              disabled={isLoading || isUpdating}
            >
              {enabled ? "工事中ページを解除" : "工事中ページを表示"}
            </button>
          </div>
          <p className={styles.helperText}>
            {isLoading
              ? "状態を取得中です..."
              : "切替後も管理画面から解除できます。"}
          </p>
        </div>
      </div>
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>切替時の挙動</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>リダイレクト対象</h3>
            <p>
              工事中ページを表示すると、/admin/dashboard を除く全ページが
              /maintenance へリダイレクトされます。
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>プレビュー</h3>
            <p>
              「工事中ページを確認」から現在のメンテナンスページを別タブで確認できます。
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>解除</h3>
            <p>
              工事が完了したら「工事中ページを解除」をクリックして通常表示に戻してください。
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

import Head from "next/head";
import Link from "next/link";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";

export default function AccessoryOptionsPage() {
  return (
    <>
      <Head>
        <title>オプション（用品） | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="オプション（用品）"
        description="用品の料金を確認・登録できます。"
        showHomeAction={false}
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              <div>
                <h2 className={styles.menuGroupTitle}>オプション（用品）</h2>
                <p className={styles.menuGroupNote}>
                  用品の料金を確認・登録できます。
                </p>
              </div>
              <div className={styles.menuLinkList}>
                <div className={styles.menuLinkRow}>
                  <Link
                    href="/admin/dashboard/accessories"
                    className={styles.menuLink}
                  >
                    用品一覧
                  </Link>
                  <div className={styles.menuLinkRowActions}>
                    <Link
                      href="/admin/dashboard/accessories/register"
                      className={styles.menuLinkAction}
                    >
                      ＋登録
                    </Link>
                  </div>
                </div>
                <div className={styles.menuLinkRow}>
                  <Link
                    href="/admin/dashboard/accessories/register"
                    className={styles.menuLink}
                  >
                    用品登録
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

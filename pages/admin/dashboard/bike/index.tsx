import Head from "next/head";
import Link from "next/link";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";

const ADMIN_DASHBOARD_ROOT = "/admin/dashboard";

const bikeManagementLinks = [
  {
    label: "クラス一覧",
    href: `${ADMIN_DASHBOARD_ROOT}/bike-classes`,
    actions: [{ label: "＋登録", href: `${ADMIN_DASHBOARD_ROOT}/bike-classes/register` }],
  },
  {
    label: "車種一覧",
    href: `${ADMIN_DASHBOARD_ROOT}/bike-models`,
    actions: [{ label: "＋登録", href: `${ADMIN_DASHBOARD_ROOT}/bike-models/register` }],
  },
  {
    label: "車両一覧",
    href: `${ADMIN_DASHBOARD_ROOT}/vehicles`,
    actions: [{ label: "＋登録", href: `${ADMIN_DASHBOARD_ROOT}/vehicles/register` }],
  },
  {
    label: "バイクスケジュール管理",
    href: `${ADMIN_DASHBOARD_ROOT}/bike-schedules`,
  },
];

export default function BikeManagementPage() {
  return (
    <>
      <Head>
        <title>バイク管理</title>
      </Head>
      <DashboardLayout
        title="バイク管理"
        description="バイクに関する情報を確認・登録できます。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            <div className={styles.menuGroup}>
              <div>
                <h2 className={styles.menuGroupTitle}>バイク管理</h2>
                <p className={styles.menuGroupNote}>
                  バイクに関する情報を確認・登録できます。
                </p>
              </div>
              <div className={styles.menuLinkList}>
                {bikeManagementLinks.map((link) => (
                  <div key={link.href} className={styles.menuLinkRow}>
                    <Link href={link.href} className={styles.menuLink}>
                      {link.label}
                    </Link>
                    <div className={styles.menuLinkRowActions}>
                      {link.actions?.map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          className={styles.menuLinkAction}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}


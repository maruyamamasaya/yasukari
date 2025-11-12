import Head from "next/head";
import Link from "next/link";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";

const ADMIN_DASHBOARD_ROOT = "/admin/dashboard";

type MenuLink = {
  label: string;
  href: string;
  actions?: { label: string; href: string }[];
  disabled?: boolean;
};

type MenuSection = {
  title: string;
  description?: string;
  links?: MenuLink[];
};

const bikeManagementLinks: MenuLink[] = [
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
    label: "バイク全件表示",
    href: `${ADMIN_DASHBOARD_ROOT}/vehicles/all`,
  },
];

const menuSections: MenuSection[] = [
  {
    title: "ダッシュボード",
    description: "管理メニューのトップページです。",
  },
  {
    title: "新着情報管理",
    description: "新着情報の管理メニューは準備中です。",
  },
  {
    title: "バイク管理",
    description: "バイクに関する情報を確認・登録できます。",
    links: bikeManagementLinks,
  },
  {
    title: "オプション（用品）",
    description: "オプション管理メニューは準備中です。",
  },
  {
    title: "会員管理",
    description: "会員管理メニューは準備中です。",
  },
  {
    title: "予約管理",
    description: "予約管理メニューは準備中です。",
  },
  {
    title: "ブログ管理",
    description: "ブログ管理メニューは準備中です。",
  },
  {
    title: "祭日管理",
    description: "祭日管理メニューは準備中です。",
  },
  {
    title: "休日管理",
    description: "休日管理メニューは準備中です。",
  },
  {
    title: "クーポン管理",
    description: "クーポン管理メニューは準備中です。",
  },
];

export default function DashboardTopPage() {
  return (
    <>
      <Head>
        <title>管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="管理ダッシュボード"
        description="レンタルバイク『ヤスカリ』の運用に必要な情報を確認・登録できる管理メニューです。"
      >
        <section className={styles.menuSection}>
          <div className={styles.menuGroups}>
            {menuSections.map((section) => (
              <div key={section.title} className={styles.menuGroup}>
                <div>
                  <h2 className={styles.menuGroupTitle}>{section.title}</h2>
                  {section.description && (
                    <p className={styles.menuGroupNote}>{section.description}</p>
                  )}
                </div>
                {section.links && section.links.length > 0 && (
                  <div className={styles.menuLinkList}>
                    {section.links.map((link) => (
                      <div key={link.href} className={styles.menuLinkRow}>
                        <Link
                          href={link.href}
                          className={`${styles.menuLink} ${
                            link.disabled ? styles.menuLinkDisabled : ""
                          }`}
                          aria-disabled={link.disabled}
                        >
                          {link.label}
                        </Link>
                        {link.actions && link.actions.length > 0 && (
                          <div className={styles.menuLinkRowActions}>
                            {link.actions.map((action) => (
                              <Link
                                key={action.href}
                                href={action.href}
                                className={styles.menuLinkAction}
                              >
                                {action.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

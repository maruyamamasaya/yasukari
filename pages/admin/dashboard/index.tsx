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
];

const blogManagementLinks: MenuLink[] = [
  {
    label: "記事一覧",
    href: `${ADMIN_DASHBOARD_ROOT}/blog`,
    actions: [{ label: "＋投稿", href: `${ADMIN_DASHBOARD_ROOT}/blog/new` }],
  },
];

const menuSections: MenuSection[] = [
  {
    title: "ダッシュボード",
    description: "管理メニューのトップページです。",
  },
  {
    title: "新着情報管理",
    description: "トップページ上部の告知バーに表示される内容を編集できます。",
    links: [
      {
        label: "トップバー設定",
        href: `${ADMIN_DASHBOARD_ROOT}/announcements`,
      },
    ],
  },
  {
    title: "バイク管理",
    description: "バイクに関する情報を確認・登録できます。",
    links: bikeManagementLinks,
  },
  {
    title: "オプション（用品）",
    description: "用品の料金を確認・登録できます。",
    links: [
      {
        label: "用品一覧",
        href: `${ADMIN_DASHBOARD_ROOT}/accessories`,
        actions: [
          { label: "＋登録", href: `${ADMIN_DASHBOARD_ROOT}/accessories/register` },
        ],
      },
      {
        label: "用品登録",
        href: `${ADMIN_DASHBOARD_ROOT}/accessories/register`,
      },
    ],
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
    title: "サポート",
    description: "チャットボットへの問い合わせ内容を確認できます。",
    links: [
      {
        label: "チャットボット問い合わせ一覧",
        href: `${ADMIN_DASHBOARD_ROOT}/chatbot/inquiries`,
      },
    ],
  },
  {
    title: "ブログ管理",
    description: "ブログ記事を確認・追加・編集できます。",
    links: blogManagementLinks,
  },
  {
    title: "祭日管理",
    description: "店舗の営業日と休日を管理できます。",
    links: [
      { label: "祭日管理", href: `${ADMIN_DASHBOARD_ROOT}/holiday-manager` },
    ],
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
        showHomeAction={false}
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

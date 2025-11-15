import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";

import styles from "../../styles/Dashboard.module.css";

type NavItem = {
  label: string;
  href?: string;
  disabled?: boolean;
  children?: NavItem[];
};

type DashboardLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  showHomeAction?: boolean;
  showDashboardLink?: boolean;
};

const ADMIN_DASHBOARD_ROOT = "/admin/dashboard";

const NAV_ITEMS: NavItem[] = [
  {
    label: "ダッシュボード",
    href: ADMIN_DASHBOARD_ROOT,
  },
  {
    label: "新着情報管理",
    disabled: true,
  },
  {
    label: "バイク管理",
    children: [
      { label: "クラス一覧", href: `${ADMIN_DASHBOARD_ROOT}/bike-classes` },
      { label: "車種一覧", href: `${ADMIN_DASHBOARD_ROOT}/bike-models` },
      { label: "車両一覧", href: `${ADMIN_DASHBOARD_ROOT}/vehicles` },
    ],
  },
  {
    label: "オプション（用品）",
    disabled: true,
  },
  {
    label: "会員管理",
    disabled: true,
  },
  {
    label: "予約管理",
    disabled: true,
  },
  {
    label: "サポート",
    children: [
      {
        label: "チャットボット問い合わせ一覧",
        href: `${ADMIN_DASHBOARD_ROOT}/chatbot/inquiries`,
      },
    ],
  },
  {
    label: "ブログ管理",
    disabled: true,
  },
  {
    label: "祭日管理",
    href: `${ADMIN_DASHBOARD_ROOT}/holiday-manager`,
  },
  {
    label: "休日管理",
    disabled: true,
  },
  {
    label: "クーポン管理",
    disabled: true,
  },
];

const isActivePath = (pathname: string, href?: string): boolean => {
  if (!href) {
    return false;
  }

  if (href === ADMIN_DASHBOARD_ROOT) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const hasActiveChild = (pathname: string, item: NavItem): boolean => {
  if (!item.children) {
    return false;
  }

  return item.children.some((child) => isActivePath(pathname, child.href));
};

export default function DashboardLayout({
  title,
  description,
  actions,
  children,
  showHomeAction = true,
  showDashboardLink = true,
}: DashboardLayoutProps) {
  const router = useRouter();

  const navigation = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => showDashboardLink || item.href !== ADMIN_DASHBOARD_ROOT
      ).map((item) => ({
        ...item,
        isActive:
          isActivePath(router.pathname, item.href) || hasActiveChild(router.pathname, item),
      })),
    [router.pathname, showDashboardLink]
  );

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>管理メニュー</div>
        </div>
        <nav className={styles.sidebarNav} aria-label="管理メニュー">
          <ul className={styles.sidebarNavList}>
            {navigation.map((item) => (
              <li key={item.label} className={styles.sidebarNavItem}>
                {item.href && !item.disabled ? (
                  <Link
                    href={item.href}
                    className={`${styles.sidebarNavLink} ${
                      item.isActive ? styles.sidebarNavLinkActive : ""
                    }`}
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`${styles.sidebarNavLink} ${styles.sidebarNavLinkDisabled}`}
                    aria-disabled
                  >
                    {item.label}
                  </span>
                )}
                {item.children && item.children.length > 0 && (
                  <ul className={styles.sidebarSubNav}>
                    {item.children.map((child) => {
                      const childActive = isActivePath(router.pathname, child.href);
                      return (
                        <li key={child.label} className={styles.sidebarSubNavItem}>
                          {child.href && !child.disabled ? (
                            <Link
                              href={child.href}
                              className={`${styles.sidebarSubNavLink} ${
                                childActive ? styles.sidebarNavLinkActive : ""
                              }`}
                              aria-current={childActive ? "page" : undefined}
                            >
                              {child.label}
                            </Link>
                          ) : (
                            <span
                              className={`${styles.sidebarSubNavLink} ${styles.sidebarNavLinkDisabled}`}
                              aria-disabled
                            >
                              {child.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {description && (
              <p className={styles.pageDescription}>{description}</p>
            )}
          </div>
          {(showHomeAction || actions) && (
            <div className={styles.pageActions}>
              {showHomeAction && (
                <Link href={ADMIN_DASHBOARD_ROOT} className={styles.iconButton}>
                  管理ホームに戻る
                </Link>
              )}
              {actions}
            </div>
          )}
        </header>
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <small>&copy; レンタルバイク『ヤスカリ』</small>
        </footer>
      </div>
    </div>
  );
}


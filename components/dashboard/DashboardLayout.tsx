import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import styles from "../../styles/DashboardLayout.module.css";

const navigationItems = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/dashboard/bike-classes/new", label: "バイククラス登録" },
  { href: "/dashboard/bike-classes", label: "バイククラス一覧" },
  { href: "/dashboard/bike-models/new", label: "車種登録" },
  { href: "/dashboard/bike-models", label: "車種一覧" },
  { href: "/dashboard/vehicles/new", label: "車両登録" },
  { href: "/dashboard/vehicles", label: "車両一覧" },
] as const;

type DashboardLayoutProps = {
  pageTitle: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function DashboardLayout({
  pageTitle,
  children,
  actions,
}: DashboardLayoutProps) {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>管理メニュー</h1>
        <nav className={styles.nav} aria-label="Dashboard navigation">
          <ul className={styles.navList}>
            {navigationItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.href} className={isActive ? styles.activeItem : undefined}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h2 className={styles.pageTitle}>{pageTitle}</h2>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

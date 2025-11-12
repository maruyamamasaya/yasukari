import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import styles from "../../styles/AdminLayout.module.css";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/dashboard/bike-classes", label: "バイククラス一覧" },
  { href: "/dashboard/bike-models", label: "車種一覧" },
  { href: "/dashboard/vehicles", label: "車両一覧" },
  { href: "/dashboard/bike-classes/new", label: "バイククラス登録" },
  { href: "/dashboard/bike-models/new", label: "車種登録" },
  { href: "/dashboard/vehicles/new", label: "車両登録" },
] as const;

type AdminLayoutProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
      </Head>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>管理メニュー</div>
        <nav className={styles.navList}>
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle ? <p className={styles.pageSubtitle}>{subtitle}</p> : null}
        </header>
        <section className={styles.contentCard}>{children}</section>
      </main>
    </div>
  );
}

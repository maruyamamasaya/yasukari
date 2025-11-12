import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Dashboard.module.css";

const managementLinks = [
  { href: "/dashboard/bike-classes", label: "バイククラス一覧" },
  { href: "/dashboard/bike-models", label: "車種一覧" },
  { href: "/dashboard/vehicles", label: "車両一覧" },
  { href: "/dashboard/bike-classes/register", label: "バイククラス登録" },
  { href: "/dashboard/bike-models/register", label: "車種登録" },
  { href: "/dashboard/vehicles/register", label: "車両登録" },
];

export default function DashboardTopPage() {
  return (
    <>
      <Head>
        <title>管理ダッシュボード</title>
      </Head>
      <div className={styles.container}>
        <section className={styles.menuSection}>
          <h1 className={styles.pageTitle}>管理ダッシュボード</h1>
          <div className={styles.menuGrid}>
            {managementLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.menuCard}>
                <span className={styles.menuCardLabel}>{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

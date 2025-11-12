import Head from "next/head";
import Link from "next/link";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import styles from "../../styles/DashboardPage.module.css";

const quickLinks = [
  { href: "/dashboard/bike-classes/new", label: "バイククラス登録" },
  { href: "/dashboard/bike-classes", label: "バイククラス一覧" },
  { href: "/dashboard/bike-models/new", label: "車種登録" },
  { href: "/dashboard/bike-models", label: "車種一覧" },
  { href: "/dashboard/vehicles/new", label: "車両登録" },
  { href: "/dashboard/vehicles", label: "車両一覧" },
];

export default function DashboardHomePage() {
  return (
    <>
      <Head>
        <title>ダッシュボード | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="ダッシュボード">
        <section className={styles.section}>
          <div className={styles.cardGrid}>
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className={styles.cardLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

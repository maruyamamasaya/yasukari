import Head from "next/head";
import Link from "next/link";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { HOLIDAY_MANAGER_STORES } from "../../../../lib/dashboard/holidayStores";
import styles from "../../../../styles/HolidayManager.module.css";

export default function HolidayManagerTopPage() {
  return (
    <>
      <Head>
        <title>休日管理</title>
      </Head>
      <DashboardLayout
        title="休日管理"
        description="店舗ごとの営業日と休日を管理します。対象店舗を選択してください。"
      >
        <main className={styles.managerRoot}>
          <section className={styles.storeSelection}>
            <div className={styles.storeHeader}>
              <h2 className={styles.storeTitle}>店舗を選択</h2>
              <p className={styles.storeLead}>
                各店舗の休日設定ページから営業日と備考を更新できます。
              </p>
            </div>
            <div className={styles.storeGrid}>
              {HOLIDAY_MANAGER_STORES.map((store) => (
                <Link
                  key={store.id}
                  href={`/admin/dashboard/holiday-manager/${store.id}`}
                  className={styles.storeLinkCard}
                >
                  <div className={styles.storeLinkLabel}>{store.label}</div>
                  <div className={styles.storeLinkAction}>設定ページへ</div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </DashboardLayout>
    </>
  );
}

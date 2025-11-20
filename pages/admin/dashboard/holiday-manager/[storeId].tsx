import Head from "next/head";

import StoreHolidayManager from "../../../../components/dashboard/holiday-manager/StoreHolidayManager";
import {
  HOLIDAY_MANAGER_STORES,
  findHolidayStoreById,
} from "../../../../lib/dashboard/holidayStores";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/HolidayManager.module.css";

type HolidayManagerStorePageProps = {
  storeId: string;
  storeLabel: string;
};

export default function HolidayManagerStorePage({
  storeId,
  storeLabel,
}: HolidayManagerStorePageProps) {
  return (
    <>
      <Head>
        <title>休日管理 | {storeLabel}</title>
      </Head>
      <DashboardLayout
        title="休日管理"
        description={`${storeLabel}の営業日と休日、備考を管理します。`}
      >
        <main className={styles.managerRoot}>
          <StoreHolidayManager storeId={storeId} storeLabel={storeLabel} />
        </main>
      </DashboardLayout>
    </>
  );
}

export async function getStaticPaths() {
  const paths = HOLIDAY_MANAGER_STORES.map((store) => ({
    params: { storeId: store.id },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { storeId: string } }) {
  const store = findHolidayStoreById(params.storeId);

  if (!store) {
    return { notFound: true };
  }

  return {
    props: {
      storeId: store.id,
      storeLabel: store.label,
    },
  };
}

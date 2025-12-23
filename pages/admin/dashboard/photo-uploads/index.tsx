import Head from "next/head";
import Link from "next/link";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { PHOTO_UPLOADS } from "../../../../lib/dashboard/photoUploads";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

export default function PhotoUploadListPage() {
  return (
    <>
      <Head>
        <title>写真アップロード確認</title>
      </Head>
      <DashboardLayout
        title="写真アップロード確認"
        description="ユーザーからアップロードされた写真の一覧を確認できます。クリックすると詳細が表示されます。"
      >
        <div className={formStyles.cardStack}>
          <section className={formStyles.card}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>アップロード一覧</h2>
              <p className={styles.sectionNote}>
                最新のアップロード順に表示されています。最大5列のグリッドで確認できます。
              </p>
            </header>
            {PHOTO_UPLOADS.length === 0 ? (
              <div className={styles.emptyState}>
                現在確認待ちの写真はありません。
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {PHOTO_UPLOADS.map((upload) => (
                  <Link
                    key={upload.id}
                    href={`/admin/dashboard/photo-uploads/${upload.id}`}
                    className={styles.photoCard}
                  >
                    <img
                      src={upload.imageUrl}
                      alt={`${upload.fileName} のサムネイル`}
                      className={styles.photoThumb}
                    />
                    <div className={styles.photoMeta}>
                      <span className={styles.photoName}>{upload.fileName}</span>
                      <span className={styles.photoSubtext}>
                        {upload.uploaderName}
                      </span>
                      <span className={styles.photoSubtext}>
                        {upload.uploadedAt}
                      </span>
                      <span
                        className={`${styles.photoBadge} ${
                          upload.status === "確認済み"
                            ? styles.photoBadgeConfirmed
                            : ""
                        }`}
                      >
                        {upload.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}

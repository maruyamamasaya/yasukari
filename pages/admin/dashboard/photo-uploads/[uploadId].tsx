import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { findPhotoUpload } from "../../../../lib/dashboard/photoUploads";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

export default function PhotoUploadDetailPage() {
  const router = useRouter();
  const uploadId =
    typeof router.query.uploadId === "string" ? router.query.uploadId : undefined;
  const upload = findPhotoUpload(uploadId);

  return (
    <>
      <Head>
        <title>写真アップロード詳細</title>
      </Head>
      <DashboardLayout
        title="写真アップロード詳細"
        description="クリックした写真の情報を確認できます。"
        actions={[
          { label: "一覧へ戻る", href: "/admin/dashboard/photo-uploads" },
        ]}
      >
        <div className={formStyles.cardStack}>
          {upload ? (
            <section className={styles.detailLayout}>
              <div className={styles.detailImageCard}>
                <img
                  src={upload.imageUrl}
                  alt={`${upload.fileName} の写真`}
                  className={styles.detailImage}
                />
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>コメント</span>
                  <p className={styles.detailNote}>{upload.notes}</p>
                </div>
              </div>
              <aside className={styles.detailMetaCard}>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>ファイル名</span>
                  <span className={styles.detailMetaValue}>
                    {upload.fileName}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>アップロード者</span>
                  <span className={styles.detailMetaValue}>
                    {upload.uploaderName}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>アップロード日時</span>
                  <span className={styles.detailMetaValue}>
                    {upload.uploadedAt}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>ステータス</span>
                  <span className={styles.detailMetaValue}>
                    {upload.status}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>確認操作</span>
                  <p className={styles.detailNote}>
                    S3上のオリジナル画像と突き合わせて確認してください。
                  </p>
                </div>
                <Link href="/admin/dashboard/photo-uploads" className={formStyles.primaryButton}>
                  一覧に戻る
                </Link>
              </aside>
            </section>
          ) : (
            <section className={formStyles.card}>
              <div className={styles.emptyState}>
                指定された写真が見つかりませんでした。
              </div>
              <Link
                href="/admin/dashboard/photo-uploads"
                className={formStyles.primaryButton}
              >
                一覧へ戻る
              </Link>
            </section>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

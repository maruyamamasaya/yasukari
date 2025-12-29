import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import {
  findPhotoUpload,
  loadPhotoUploads,
  savePhotoUploads,
  type PhotoUpload,
} from "../../../../lib/dashboard/photoUploads";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

export default function PhotoUploadDetailPage() {
  const router = useRouter();
  const uploadId =
    typeof router.query.uploadId === "string" ? router.query.uploadId : undefined;
  const [upload, setUpload] = useState<PhotoUpload | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadPhotoUploads();
    setUpload(findPhotoUpload(stored, uploadId));
  }, [uploadId]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy url", error);
    }
  };

  const handleDelete = () => {
    if (!upload) {
      return;
    }
    const stored = loadPhotoUploads();
    const nextUploads = stored.filter((item) => item.id !== upload.id);
    savePhotoUploads(nextUploads);
    router.push("/admin/dashboard/photo-uploads");
  };

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
                  src={upload.s3Url}
                  alt={`${upload.fileName} の写真`}
                  className={styles.detailImage}
                />
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>コメント</span>
                  <p className={styles.detailNote}>
                    {upload.notes ?? "メモは登録されていません。"}
                  </p>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>S3 URL</span>
                  <div className={styles.detailUrlRow}>
                    <input
                      type="text"
                      readOnly
                      value={upload.s3Url}
                      className={styles.photoUrlInput}
                    />
                    <button
                      type="button"
                      className={styles.copyButton}
                      onClick={() => handleCopy(upload.s3Url)}
                    >
                      {copied ? "コピー済み" : "URLをコピー"}
                    </button>
                  </div>
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
                    {upload.uploaderName ?? "未設定"}
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
                <div className={styles.detailActions}>
                  <Link
                    href="/admin/dashboard/photo-uploads"
                    className={formStyles.primaryButton}
                  >
                    一覧に戻る
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDelete}
                  >
                    削除
                  </button>
                </div>
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

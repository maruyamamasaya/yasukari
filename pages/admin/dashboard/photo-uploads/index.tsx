import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import {
  loadPhotoUploads,
  savePhotoUploads,
  type PhotoUpload,
} from "../../../../lib/dashboard/photoUploads";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/PhotoUploads.module.css";

export default function PhotoUploadListPage() {
  const [uploads, setUploads] = useState<PhotoUpload[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setUploads(loadPhotoUploads());
  }, []);

  const uploadedCountText = useMemo(() => {
    return uploads.length === 0 ? "未登録" : `${uploads.length}件`;
  }, [uploads.length]);

  const handleCopy = async (uploadId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(uploadId);
      window.setTimeout(() => {
        setCopiedId((current) => (current === uploadId ? null : current));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy url", error);
      setErrorMessage("URLのコピーに失敗しました。");
    }
  };

  const handleDelete = (uploadId: string) => {
    const nextUploads = uploads.filter((upload) => upload.id !== uploadId);
    setUploads(nextUploads);
    savePhotoUploads(nextUploads);
  };

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          const [, base64] = result.split(",");
          resolve(base64 ?? "");
        } else {
          reject(new Error("Invalid file result"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const formatUploadDate = () => {
    const now = new Date();
    return now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createUploadId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `upload-${Date.now()}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      setErrorMessage("登録する画像ファイルを選択してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await readFileAsBase64(selectedFile);
      const response = await fetch("/api/admin/photo-uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          fileName: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error("画像のアップロードに失敗しました。");
      }

      const result = (await response.json()) as { url?: string };
      if (!result.url) {
        throw new Error("S3のURLが取得できませんでした。");
      }

      const newUpload: PhotoUpload = {
        id: createUploadId(),
        fileName: selectedFile.name,
        uploadedAt: formatUploadDate(),
        status: "登録済み",
        s3Url: result.url,
        uploaderName: "管理者",
        notes: notes.trim() ? notes.trim() : undefined,
      };

      const nextUploads = [newUpload, ...uploads];
      setUploads(nextUploads);
      savePhotoUploads(nextUploads);
      setSuccessMessage("画像を登録しました。");
      setNotes("");
      setSelectedFile(null);
      formRef.current?.reset();
    } catch (error) {
      console.error("Failed to upload photo", error);
      setErrorMessage("画像の登録に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h2 className={styles.sectionTitle}>画像アップロード</h2>
              <p className={styles.sectionNote}>
                WEB素材として利用する画像をS3へ登録します。登録後は一覧からURLをコピーして共有できます。
              </p>
            </header>
            <form
              className={styles.uploadForm}
              onSubmit={handleSubmit}
              ref={formRef}
            >
              <div className={styles.uploadGrid}>
                <label className={formStyles.field}>
                  <span>登録する画像</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <label className={formStyles.field}>
                  <span>用途メモ</span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="例）WEB素材：バイク一覧"
                  />
                </label>
              </div>
              <div className={styles.uploadActions}>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "アップロード中..." : "画像を登録する"}
                </button>
                <span className={styles.uploadStatus}>
                  登録件数: {uploadedCountText}
                </span>
              </div>
              {errorMessage ? (
                <p className={styles.statusError}>{errorMessage}</p>
              ) : null}
              {successMessage ? (
                <p className={styles.statusSuccess}>{successMessage}</p>
              ) : null}
            </form>
          </section>
          <section className={formStyles.card}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>アップロード一覧</h2>
              <p className={styles.sectionNote}>
                最新の登録順に表示されています。S3のURLはコピーしてWEB素材の管理に利用してください。
              </p>
            </header>
            {uploads.length === 0 ? (
              <div className={styles.emptyState}>
                現在確認待ちの写真はありません。
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {uploads.map((upload) => (
                  <div key={upload.id} className={styles.photoCard}>
                    <Link
                      href={`/admin/dashboard/photo-uploads/${upload.id}`}
                      className={styles.photoLink}
                    >
                      <img
                        src={upload.s3Url}
                        alt={`${upload.fileName} のサムネイル`}
                        className={styles.photoThumb}
                      />
                      <div className={styles.photoMeta}>
                        <span className={styles.photoName}>
                          {upload.fileName}
                        </span>
                        <span className={styles.photoSubtext}>
                          登録日: {upload.uploadedAt}
                        </span>
                        {upload.notes ? (
                          <span className={styles.photoSubtext}>
                            メモ: {upload.notes}
                          </span>
                        ) : null}
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
                    <div className={styles.photoActions}>
                      <div className={styles.photoUrlRow}>
                        <input
                          type="text"
                          readOnly
                          value={upload.s3Url}
                          className={styles.photoUrlInput}
                        />
                        <button
                          type="button"
                          className={styles.copyButton}
                          onClick={() => handleCopy(upload.id, upload.s3Url)}
                        >
                          {copiedId === upload.id ? "コピー済み" : "URLをコピー"}
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(upload.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}

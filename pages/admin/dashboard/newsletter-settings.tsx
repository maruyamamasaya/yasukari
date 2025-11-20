import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import formStyles from "../../../styles/AdminForm.module.css";
import styles from "../../../styles/NewsletterSettings.module.css";
import { NewsletterSettings } from "../../../types/newsletter";

const DEFAULT_SETTINGS: NewsletterSettings = {
  subject: "",
  htmlContent: "",
};

export default function NewsletterSettingsPage() {
  const [formState, setFormState] = useState<NewsletterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/newsletter-settings");
        if (!response.ok) {
          throw new Error("メルマガ設定の取得に失敗しました。");
        }
        const data = (await response.json()) as NewsletterSettings;
        setFormState({
          subject: data.subject ?? "",
          previewText: data.previewText ?? "",
          htmlContent: data.htmlContent ?? "",
          updatedAt: data.updatedAt,
        });
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "データの取得に失敗しました。時間をおいて再度お試しください。"
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/newsletter-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formState.subject,
          previewText: formState.previewText,
          htmlContent: formState.htmlContent,
        }),
      });

      const payload = (await response.json()) as NewsletterSettings | { message?: string };

      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "保存に失敗しました。");
      }

      const savedSettings = payload as NewsletterSettings;
      setFormState((prev) => ({ ...prev, updatedAt: savedSettings.updatedAt }));
      setNotice("メルマガ設定を保存しました。配信機能は別途追加予定です。");
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = useMemo(() => {
    if (!formState.htmlContent || formState.htmlContent.trim().length === 0) {
      return "";
    }
    return formState.htmlContent;
  }, [formState.htmlContent]);

  return (
    <>
      <Head>
        <title>メルマガ配信設定 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="メルマガ配信設定"
        description="メルマガ配信用の件名やHTML本文を保存します。配信機能は今後追加予定です。"
      >
        <form onSubmit={handleSubmit} className={formStyles.cardStack}>
          <div className={formStyles.card}>
            <div className={formStyles.header}>
              <h2 className={formStyles.title}>コンテンツ設定</h2>
              <p className={formStyles.description}>
                配信予定のメルマガ本文をHTMLで保存します。画像やリンクを含んだリッチテキストもそのまま保存可能です。
              </p>
              {formState.updatedAt && (
                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    最終更新: {new Date(formState.updatedAt).toLocaleString("ja-JP")}
                  </div>
                </div>
              )}
            </div>

            {error && <div className={formStyles.error}>{error}</div>}
            {notice && <div className={formStyles.success}>{notice}</div>}

            <div className={formStyles.body}>
              <div className={formStyles.field}>
                <label htmlFor="subject">件名*</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formState.subject}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  placeholder="【ヤスカリ】春のツーリング応援セールのご案内"
                  disabled={loading}
                />
                <p className={formStyles.hint}>配信時のメール件名として使用します。</p>
              </div>

              <div className={formStyles.field}>
                <label htmlFor="previewText">プレビューテキスト（任意）</label>
                <input
                  id="previewText"
                  name="previewText"
                  type="text"
                  value={formState.previewText ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, previewText: event.target.value }))
                  }
                  placeholder="今だけの限定クーポンをご用意しました。"
                  disabled={loading}
                />
                <p className={formStyles.hint}>
                  メールクライアントで件名の下に表示される補足文です。空欄の場合は本文が使用されます。
                </p>
              </div>

              <div className={formStyles.field}>
                <label htmlFor="htmlContent">HTML本文*</label>
                <textarea
                  id="htmlContent"
                  name="htmlContent"
                  required
                  value={formState.htmlContent}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, htmlContent: event.target.value }))
                  }
                  rows={14}
                  placeholder="<h1>春のツーリング応援セール</h1>\n<p>最新モデルをお得にレンタルできるキャンペーンのご案内です。</p>"
                  disabled={loading}
                  spellCheck={false}
                />
                <p className={formStyles.hint}>
                  画像URLやスタイルを含むHTMLをそのまま保存します。配信機能は今後追加されます。
                </p>
              </div>
            </div>

            <div className={formStyles.actions}>
              <button type="submit" className={formStyles.primaryButton} disabled={saving || loading}>
                {saving ? "保存中..." : "設定を保存"}
              </button>
            </div>
          </div>

          <div className={formStyles.card}>
            <div className={formStyles.header}>
              <h2 className={formStyles.title}>プレビュー</h2>
              <p className={formStyles.description}>
                HTMLとして保存される内容をそのまま確認できます。配信処理は実装されていないため、保存のみ行います。
              </p>
            </div>

            <div className={styles.previewGrid}>
              {previewHtml ? (
                <iframe
                  title="Newsletter preview"
                  className={styles.previewFrame}
                  srcDoc={previewHtml}
                  sandbox=""
                />
              ) : (
                <div className={styles.emptyPreview}>HTML本文を入力するとプレビューが表示されます。</div>
              )}
              <p className={styles.previewHint}>
                画像や外部リンクを利用する場合は、HTTPSでアクセスできるURLをご利用ください。メールクライアントによってはスタイルが簡略化されます。
              </p>
            </div>
          </div>
        </form>
      </DashboardLayout>
    </>
  );
}

import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import formStyles from "../../../styles/AdminForm.module.css";
import { AnnouncementBannerSettings } from "../../../types/announcement";
import { CustomerBlogMeta } from "../../../lib/dashboard/customerBlog";

const LINK_TYPE_LABELS: Record<AnnouncementBannerSettings["linkType"], string> = {
  none: "リンクなし",
  blog: "ブログ記事",
  external: "外部リンク",
};

const DEFAULT_SETTINGS: AnnouncementBannerSettings = {
  text: "",
  linkType: "none",
};

export default function AnnouncementManagerPage() {
  const [formState, setFormState] = useState<AnnouncementBannerSettings>(DEFAULT_SETTINGS);
  const [blogs, setBlogs] = useState<CustomerBlogMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bannerResponse, blogResponse] = await Promise.all([
          fetch("/api/announcement-banner"),
          fetch("/api/customer-blog"),
        ]);

        if (!bannerResponse.ok) {
          throw new Error("お知らせの取得に失敗しました。");
        }
        if (!blogResponse.ok) {
          throw new Error("ブログ一覧の取得に失敗しました。");
        }

        const banner = (await bannerResponse.json()) as AnnouncementBannerSettings;
        const blogList = (await blogResponse.json()) as CustomerBlogMeta[];

        setFormState({
          text: banner.text ?? "",
          linkType: banner.linkType ?? "none",
          blogSlug: banner.blogSlug,
          externalUrl: banner.externalUrl,
        });
        setBlogs(blogList);
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "データの取得に失敗しました。"
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchInitialData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload: AnnouncementBannerSettings = {
        text: formState.text,
        linkType: formState.linkType,
        blogSlug: formState.linkType === "blog" ? formState.blogSlug : undefined,
        externalUrl:
          formState.linkType === "external" ? formState.externalUrl : undefined,
      };

      const response = await fetch("/api/announcement-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "更新に失敗しました。");
      }

      setNotice("トップページの新着テキストを更新しました。");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error ? submitError.message : "更新に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  const previewLink = useMemo(() => {
    if (formState.linkType === "blog" && formState.blogSlug) {
      return `/blog_for_custmor/${formState.blogSlug}`;
    }
    if (formState.linkType === "external" && formState.externalUrl) {
      return formState.externalUrl;
    }
    return null;
  }, [formState.blogSlug, formState.externalUrl, formState.linkType]);

  return (
    <>
      <Head>
        <title>新着情報管理</title>
      </Head>
      <DashboardLayout
        title="新着情報管理"
        description="トップページの告知バーに表示するテキストとリンク先を更新できます。"
        showHomeAction={false}
      >
        <form onSubmit={handleSubmit} className={formStyles.cardStack}>
          <div className={formStyles.card}>
            <div className={formStyles.header}>
              <h2 className={formStyles.title}>トップバー設定</h2>
              <p className={formStyles.description}>
                「🎉 今週限定：初回レンタル30%OFF...」と表示されている告知バーの文言と遷移先を変更します。
                ブログ記事か外部URL、またはリンクなしを選択できます。
              </p>
            </div>

            {error && <div className={formStyles.error}>{error}</div>}
            {notice && <div className={formStyles.success}>{notice}</div>}

            <div className={formStyles.body}>
              <div className={formStyles.field}>
                <label htmlFor="text">表示テキスト*</label>
                <textarea
                  id="text"
                  name="text"
                  required
                  value={formState.text}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, text: event.target.value }))
                  }
                  rows={3}
                  placeholder="🎉 今週限定：初回レンタル30%OFF + 新着モデル入荷！"
                  disabled={loading}
                />
                <p className={formStyles.hint}>全ユーザーに表示される1行のテキストです。</p>
              </div>

              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <label htmlFor="linkType">リンク種別</label>
                  <select
                    id="linkType"
                    name="linkType"
                    value={formState.linkType}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        linkType: event.target.value as AnnouncementBannerSettings["linkType"],
                      }))
                    }
                    disabled={loading}
                  >
                    {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className={formStyles.hint}>
                    ブログ記事を選ぶとページへ、外部リンクを選ぶと指定URLへ遷移します。
                  </p>
                </div>

                {formState.linkType === "blog" && (
                  <div className={formStyles.field}>
                    <label htmlFor="blogSlug">ブログ記事</label>
                    <select
                      id="blogSlug"
                      name="blogSlug"
                      value={formState.blogSlug ?? ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, blogSlug: event.target.value }))
                      }
                      disabled={loading}
                      required
                    >
                      <option value="" disabled>
                        記事を選択してください
                      </option>
                      {blogs.map((blog) => (
                        <option key={blog.slug} value={blog.slug}>
                          {blog.title}
                        </option>
                      ))}
                    </select>
                    <p className={formStyles.hint}>「新着ブログ・お知らせ」に公開されている記事が選択できます。</p>
                  </div>
                )}

                {formState.linkType === "external" && (
                  <div className={formStyles.field}>
                    <label htmlFor="externalUrl">外部リンクURL</label>
                    <input
                      id="externalUrl"
                      name="externalUrl"
                      type="url"
                      value={formState.externalUrl ?? ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, externalUrl: event.target.value }))
                      }
                      placeholder="https://example.com/announcement"
                      disabled={loading}
                      required
                    />
                    <p className={formStyles.hint}>https:// から始まるURLを入力してください。</p>
                  </div>
                )}
              </div>

              {previewLink && (
                <div className={formStyles.field}>
                  <label>リンク先プレビュー</label>
                  <div className="text-blue-700 break-all">{previewLink}</div>
                </div>
              )}
            </div>

            <div className={formStyles.actions}>
              <button
                type="submit"
                className={formStyles.primaryButton}
                disabled={loading || saving}
              >
                {saving ? "保存中..." : "設定を保存"}
              </button>
            </div>
          </div>
        </form>
      </DashboardLayout>
    </>
  );
}

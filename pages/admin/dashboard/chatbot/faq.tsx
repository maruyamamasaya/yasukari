import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/ChatbotFaqManager.module.css";
import { ChatbotFaqCategory, ChatbotFaqData, ChatbotFaqItem } from "../../../../types/chatbotFaq";

function createEmptyItem(): ChatbotFaqItem {
  return { q: "", a: "" };
}

function createNewCategory(): ChatbotFaqCategory {
  return {
    id: `category-${Date.now()}`,
    title: "新規カテゴリ",
    faqs: [createEmptyItem()],
  };
}

export default function ChatbotFaqManagerPage() {
  const [categories, setCategories] = useState<ChatbotFaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/chatbot/faq");
        const data = (await response.json()) as ChatbotFaqData;
        if (!response.ok) {
          throw new Error("message" in data && typeof data.message === "string" ? data.message : "読込に失敗しました。");
        }
        setCategories(data.categories ?? []);
        setUpdatedAt(data.updatedAt);
      } catch (fetchError) {
        console.error(fetchError);
        setError("QAデータの取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/chatbot/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });

      const payload = (await response.json()) as ChatbotFaqData | { message?: string };

      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "保存に失敗しました。");
      }

      const data = payload as ChatbotFaqData;
      setCategories(data.categories ?? []);
      setUpdatedAt(data.updatedAt);
      setNotice("チャットボットのQAを保存しました。");
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (index: number, key: keyof ChatbotFaqCategory, value: string) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === index
          ? {
              ...category,
              [key]: value,
            }
          : category
      )
    );
  };

  const handleFaqChange = (categoryIndex: number, faqIndex: number, key: keyof ChatbotFaqItem, value: string) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              faqs: category.faqs.map((faq, j) => (j === faqIndex ? { ...faq, [key]: value } : faq)),
            }
          : category
      )
    );
  };

  const handleAddCategory = () => {
    setCategories((prev) => [...prev, createNewCategory()]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFaq = (categoryIndex: number) => {
    setCategories((prev) =>
      prev.map((category, i) => (i === categoryIndex ? { ...category, faqs: [...category.faqs, createEmptyItem()] } : category))
    );
  };

  const handleRemoveFaq = (categoryIndex: number, faqIndex: number) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? { ...category, faqs: category.faqs.filter((_, j) => j !== faqIndex) }
          : category
      )
    );
  };

  const handleExportCsv = () => {
    const rows: string[][] = [["category_id", "category_title", "question", "answer"]];

    categories.forEach((category) => {
      category.faqs.forEach((faq) => {
        rows.push([category.id, category.title, faq.q, faq.a]);
      });
    });

    const escapeCell = (value: string) => {
      const normalized = value.replace(/\r?\n/g, "\\n");
      if (/[",\n]/.test(normalized)) {
        return `"${normalized.replace(/"/g, '""')}"`;
      }
      return normalized;
    };

    const csv = rows.map((row) => row.map((cell) => escapeCell(cell)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
    a.download = `chatbot-faq-${timestamp}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const totalFaqs = useMemo(() => categories.reduce((sum, category) => sum + category.faqs.length, 0), [categories]);

  return (
    <>
      <Head>
        <title>チャットボットQA管理 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="チャットボットQA管理"
        description="チャットボットで利用するFAQカテゴリとQ&Aを編集し、CSVでバックアップできます。"
      >
        <div className={formStyles.cardStack}>
          <div className={formStyles.card}>
            <div className={formStyles.header}>
              <h2 className={formStyles.title}>QAカテゴリ設定</h2>
              <p className={formStyles.description}>
                質問と回答の組み合わせをカテゴリごとに管理します。カテゴリーIDはチャットボットの内部参照として利用されます。
              </p>
            <div className={styles.managerMeta}>
              <span>
                カテゴリ: {categories.length.toLocaleString()}件 / QA: {totalFaqs.toLocaleString()}件
              </span>
              {updatedAt && <span>最終更新: {new Date(updatedAt).toLocaleString("ja-JP")}</span>}
            </div>
            <div className={styles.treeGuide}>
              <p>階層構造でカテゴリ → Q&amp;Aの順に並びます。カテゴリ名をクリックすると詳細を開閉できます。</p>
              <ul>
                <li>カテゴリ名とIDを編集してからQ&amp;Aを追加してください。</li>
                <li>各Q&amp;Aはカテゴリ配下に表示されます。</li>
                <li>CSVバックアップで編集内容を保存できます。</li>
              </ul>
            </div>
            </div>

            {error && <div className={formStyles.error}>{error}</div>}
            {notice && <div className={formStyles.success}>{notice}</div>}

            <div className={formStyles.actions} style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
              <button
                type="button"
                className={formStyles.secondaryButton}
                onClick={handleExportCsv}
                disabled={loading || categories.length === 0}
              >
                CSVでバックアップ
              </button>
              <button
                type="button"
                className={formStyles.secondaryButton}
                onClick={handleAddCategory}
                disabled={loading}
              >
                カテゴリを追加
              </button>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                className={formStyles.primaryButton}
                onClick={handleSave}
                disabled={loading || saving || categories.length === 0}
              >
                {saving ? "保存中..." : "変更を保存"}
              </button>
            </div>

            <div className={styles.categoryList}>
              {loading ? (
                <p className={styles.helperText}>読み込み中です…</p>
              ) : categories.length === 0 ? (
                <p className={styles.helperText}>カテゴリがありません。新規追加してください。</p>
              ) : (
                categories.map((category, index) => (
                  <details className={styles.categoryNode} key={category.id || index} open>
                    <summary className={styles.categorySummary}>
                      <span className={styles.badge}>カテゴリ {index + 1}</span>
                      <span className={styles.categoryTitleText}>{category.title || "カテゴリ名未入力"}</span>
                      <span className={styles.countPill}>{category.faqs.length.toLocaleString()}件</span>
                    </summary>
                    <div className={styles.categoryContent}>
                      <div className={styles.categoryFields}>
                        <div className={formStyles.field}>
                          <label htmlFor={`category-id-${index}`}>カテゴリーID</label>
                          <input
                            id={`category-id-${index}`}
                            type="text"
                            value={category.id}
                            onChange={(event) => handleCategoryChange(index, "id", event.target.value)}
                            placeholder="unique-id"
                            disabled={saving}
                          />
                        </div>
                        <div className={formStyles.field}>
                          <label htmlFor={`category-title-${index}`}>カテゴリー名</label>
                          <input
                            id={`category-title-${index}`}
                            type="text"
                            value={category.title}
                            onChange={(event) => handleCategoryChange(index, "title", event.target.value)}
                            placeholder="料金・保険"
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className={styles.faqTree}>
                        {category.faqs.map((faq, faqIndex) => (
                          <div className={styles.faqNode} key={`${category.id}-${faqIndex}`}>
                            <div className={styles.faqHeader}>
                              <span className={styles.faqIndex}>Q&amp;A {faqIndex + 1}</span>
                            </div>
                            <div className={styles.faqFields}>
                              <div className={formStyles.field}>
                                <label htmlFor={`faq-q-${index}-${faqIndex}`}>質問</label>
                                <input
                                  id={`faq-q-${index}-${faqIndex}`}
                                  type="text"
                                  value={faq.q}
                                  onChange={(event) => handleFaqChange(index, faqIndex, "q", event.target.value)}
                                  placeholder="営業時間はいつですか？"
                                  disabled={saving}
                                />
                              </div>
                              <div className={formStyles.field}>
                                <label htmlFor={`faq-a-${index}-${faqIndex}`}>回答</label>
                                <textarea
                                  id={`faq-a-${index}-${faqIndex}`}
                                  value={faq.a}
                                  onChange={(event) => handleFaqChange(index, faqIndex, "a", event.target.value)}
                                  rows={3}
                                  placeholder="月・木曜が定休日です。営業時間は10:00〜19:00です。"
                                  disabled={saving}
                                />
                              </div>
                            </div>
                            <div className={styles.itemControls}>
                              <button
                                type="button"
                                className={formStyles.secondaryButton}
                                onClick={() => handleRemoveFaq(index, faqIndex)}
                                disabled={saving || category.faqs.length <= 1}
                              >
                                このQ&Aを削除
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className={formStyles.secondaryButton}
                          onClick={() => handleAddFaq(index)}
                          disabled={saving}
                        >
                          質問を追加
                        </button>
                      </div>

                      <div className={styles.cardFooter}>
                        <p className={styles.helperText}>
                          カテゴリー単位で削除できます。必要に応じてIDとタイトルを更新してください。
                        </p>
                        <button
                          type="button"
                          className={formStyles.secondaryButton}
                          onClick={() => handleRemoveCategory(index)}
                          disabled={saving}
                        >
                          カテゴリを削除
                        </button>
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

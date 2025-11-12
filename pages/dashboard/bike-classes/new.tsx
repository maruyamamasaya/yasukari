import Head from "next/head";
import { FormEvent, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/DashboardPage.module.css";

export default function BikeClassCreatePage() {
  const [className, setClassName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!className.trim()) {
      setError("クラス名を入力してください。");
      setFeedback(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/bike-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: className.trim() }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "登録に失敗しました。");
      }

      setClassName("");
      setFeedback("登録しました。");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("登録に失敗しました。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>バイククラス登録 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="バイククラス登録">
        <section className={styles.section}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.fieldGrid} ${styles.twoColumns}`}>
              <div className={styles.field}>
                <label htmlFor="className">クラス名</label>
                <input
                  id="className"
                  name="className"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  placeholder="例：スクーター"
                />
              </div>
            </div>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </button>
            {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}
            {feedback && <p className={`${styles.feedback} ${styles.success}`}>{feedback}</p>}
          </form>
        </section>
      </DashboardLayout>
    </>
  );
}

import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";

export default function BikeClassRegisterPage() {
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    if (!className.trim()) {
      setError("クラス名を入力してください。");
      return;
    }

    try {
      const response = await fetch("/api/bike-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: className.trim() }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(errorBody?.message ?? "クラスの登録に失敗しました。");
        return;
      }

      setClassName("");
      setError(null);
      setSuccess("クラスを登録しました。");
    } catch (submitError) {
      console.error("Failed to register bike class", submitError);
      setError("クラスの登録に失敗しました。");
    }
  };

  return (
    <>
      <Head>
        <title>バイククラス登録 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="バイククラス登録"
        actions={
          <Link href="/admin/dashboard/bike-classes" className={styles.iconButton}>
            クラス一覧へ戻る
          </Link>
        }
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p className={formStyles.hint}>{success}</p>}
          <article className={formStyles.card}>
            <form onSubmit={handleSubmit} className={formStyles.body}>
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <label htmlFor="className">クラス名</label>
                  <input
                    id="className"
                    name="className"
                    placeholder="例：スクーター"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                  />
                </div>
              </div>
              <div className={formStyles.actions}>
                <button type="submit" className={formStyles.primaryButton}>
                  登録する
                </button>
              </div>
            </form>
          </article>
        </section>
      </DashboardLayout>
    </>
  );
}

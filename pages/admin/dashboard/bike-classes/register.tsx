import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass } from "../../../../lib/dashboard/types";

export default function BikeClassRegisterPage() {
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const classIdParam = router.query.classId;
    const classIdValue = Array.isArray(classIdParam)
      ? classIdParam[0]
      : classIdParam;
    const parsedClassId = classIdValue ? Number(classIdValue) : NaN;

    if (!classIdValue || Number.isNaN(parsedClassId)) {
      setCurrentClassId(null);
      setClassName("");
      return;
    }

    const loadClass = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setError("クラス情報の取得に失敗しました。");
          setCurrentClassId(null);
          return;
        }

        const classes: BikeClass[] = await response.json();
        const targetClass = classes.find(
          (item) => item.classId === parsedClassId
        );

        if (!targetClass) {
          setError("指定されたクラスが見つかりませんでした。");
          setCurrentClassId(null);
          setClassName("");
          return;
        }

        setCurrentClassId(targetClass.classId);
        setClassName(targetClass.className);
      } catch (loadError) {
        console.error("Failed to load bike class", loadError);
        setError("クラス情報の取得に失敗しました。");
        setCurrentClassId(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadClass();
  }, [router.isReady, router.query.classId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    const isEditMode = currentClassId != null;
    if (!className.trim()) {
      setError("クラス名を入力してください。");
      return;
    }

    try {
      const payload = { className: className.trim() };
      const response = await fetch("/api/bike-classes", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode ? { ...payload, classId: currentClassId } : payload
        ),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(
          errorBody?.message ??
            (isEditMode ? "クラスの更新に失敗しました。" : "クラスの登録に失敗しました。")
        );
        return;
      }

      const result: BikeClass = await response.json();
      setClassName(result.className);
      setCurrentClassId(isEditMode ? result.classId : null);
      setError(null);
      setSuccess(
        isEditMode ? "クラス情報を更新しました。" : "クラスを登録しました。"
      );
    } catch (submitError) {
      console.error("Failed to register bike class", submitError);
      setError(
        isEditMode ? "クラスの更新に失敗しました。" : "クラスの登録に失敗しました。"
      );
    }
  };

  return (
    <>
      <Head>
        <title>バイククラス登録 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="バイククラス登録"
        actions={[
          {
            label: "クラス一覧へ戻る",
            href: "/admin/dashboard/bike-classes",
          },
        ]}
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
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className={formStyles.actions}>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                  disabled={isLoading}
                >
                  {currentClassId ? "更新する" : "登録する"}
                </button>
              </div>
            </form>
          </article>
        </section>
      </DashboardLayout>
    </>
  );
}

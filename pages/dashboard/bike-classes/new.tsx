import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import formStyles from "../../../styles/AdminForm.module.css";

type ApiError = {
  message?: string;
};

export default function BikeClassCreatePage() {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!className.trim()) {
      setMessage("クラス名を入力してください。");
      return;
    }

    try {
      const response = await fetch("/api/bike-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: className.trim() }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as ApiError | null;
        setMessage(error?.message ?? "登録に失敗しました。");
        return;
      }

      setMessage(null);
      await router.push("/dashboard/bike-classes");
    } catch (error) {
      console.error("Failed to register bike class", error);
      setMessage("登録に失敗しました。");
    }
  };

  return (
    <AdminLayout title="バイククラス登録">
      <form className={formStyles.formWrapper} onSubmit={handleSubmit}>
        {message ? <div className={formStyles.message}>{message}</div> : null}
        <div className={formStyles.formGrid}>
          <div className={formStyles.field}>
            <label htmlFor="className">クラス名</label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.formActions}>
          <button type="submit" className={formStyles.submitButton}>
            登録する
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

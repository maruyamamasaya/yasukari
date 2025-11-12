import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import type { BikeClass } from "../../../types/dashboard";
import styles from "../../../styles/DashboardPage.module.css";

type ModelForm = {
  classId: string;
  modelName: string;
  publishStatus: "ON" | "OFF";
  displacementCc: string;
  requiredLicense: string;
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  seatHeightMm: string;
  seatCapacity: string;
  vehicleWeightKg: string;
  fuelTankCapacityL: string;
  fuelType: string;
  maxPower: string;
  maxTorque: string;
  mainImageUrl: string;
};

const emptyForm: ModelForm = {
  classId: "",
  modelName: "",
  publishStatus: "ON",
  displacementCc: "",
  requiredLicense: "",
  lengthMm: "",
  widthMm: "",
  heightMm: "",
  seatHeightMm: "",
  seatCapacity: "",
  vehicleWeightKg: "",
  fuelTankCapacityL: "",
  fuelType: "",
  maxPower: "",
  maxTorque: "",
  mainImageUrl: "",
};

function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function BikeModelCreatePage() {
  const [classes, setClasses] = useState<BikeClass[]>([]);
  const [form, setForm] = useState<ModelForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          throw new Error("クラス情報の取得に失敗しました。");
        }
        const data: BikeClass[] = await response.json();
        setClasses(data.sort((a, b) => a.classId - b.classId));
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("クラス情報の取得に失敗しました。");
        }
      }
    };

    void fetchClasses();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.classId) {
      setError("クラスを選択してください。");
      setFeedback(null);
      return;
    }
    if (!form.modelName.trim()) {
      setError("車種名を入力してください。");
      setFeedback(null);
      return;
    }

    const classId = Number(form.classId);
    if (!classes.some((item) => item.classId === classId)) {
      setError("選択したクラスが見つかりません。");
      setFeedback(null);
      return;
    }

    const payload: Record<string, unknown> = {
      classId,
      modelName: form.modelName.trim(),
      publishStatus: form.publishStatus,
    };

    const numericFields: Array<keyof Pick<ModelForm, "displacementCc" | "lengthMm" | "widthMm" | "heightMm" | "seatHeightMm" | "seatCapacity" | "vehicleWeightKg" | "fuelTankCapacityL">> = [
      "displacementCc",
      "lengthMm",
      "widthMm",
      "heightMm",
      "seatHeightMm",
      "seatCapacity",
      "vehicleWeightKg",
      "fuelTankCapacityL",
    ];

    numericFields.forEach((field) => {
      const numericValue = toNumber(form[field]);
      if (numericValue !== undefined) {
        payload[field] = numericValue;
      }
    });

    const optionalFields: Array<keyof Pick<ModelForm, "requiredLicense" | "fuelType" | "maxPower" | "maxTorque" | "mainImageUrl">> = [
      "requiredLicense",
      "fuelType",
      "maxPower",
      "maxTorque",
      "mainImageUrl",
    ];

    optionalFields.forEach((field) => {
      const value = form[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/bike-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "登録に失敗しました。");
      }

      await response.json();
      setForm({ ...emptyForm });
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
        <title>車種登録 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="車種登録">
        <section className={styles.section}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.fieldGrid} ${styles.twoColumns}`}>
              <div className={styles.field}>
                <label htmlFor="classId">クラス</label>
                <select
                  id="classId"
                  value={form.classId}
                  onChange={(event) => setForm((prev) => ({ ...prev, classId: event.target.value }))}
                >
                  <option value="">選択してください</option>
                  {classes.map((item) => (
                    <option key={item.classId} value={item.classId}>
                      {item.className}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="modelName">車種名</label>
                <input
                  id="modelName"
                  value={form.modelName}
                  onChange={(event) => setForm((prev) => ({ ...prev, modelName: event.target.value }))}
                  placeholder="例：CB400SF"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="publishStatus">掲載</label>
                <select
                  id="publishStatus"
                  value={form.publishStatus}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      publishStatus: event.target.value as "ON" | "OFF",
                    }))
                  }
                >
                  <option value="ON">ON</option>
                  <option value="OFF">OFF</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="displacementCc">排気量 (cc)</label>
                <input
                  id="displacementCc"
                  type="number"
                  min="0"
                  value={form.displacementCc}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, displacementCc: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="requiredLicense">必要免許</label>
                <input
                  id="requiredLicense"
                  value={form.requiredLicense}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, requiredLicense: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="lengthMm">全長 (mm)</label>
                <input
                  id="lengthMm"
                  type="number"
                  min="0"
                  value={form.lengthMm}
                  onChange={(event) => setForm((prev) => ({ ...prev, lengthMm: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="widthMm">全幅 (mm)</label>
                <input
                  id="widthMm"
                  type="number"
                  min="0"
                  value={form.widthMm}
                  onChange={(event) => setForm((prev) => ({ ...prev, widthMm: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="heightMm">全高 (mm)</label>
                <input
                  id="heightMm"
                  type="number"
                  min="0"
                  value={form.heightMm}
                  onChange={(event) => setForm((prev) => ({ ...prev, heightMm: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="seatHeightMm">シート高 (mm)</label>
                <input
                  id="seatHeightMm"
                  type="number"
                  min="0"
                  value={form.seatHeightMm}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seatHeightMm: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="seatCapacity">乗車定員</label>
                <input
                  id="seatCapacity"
                  type="number"
                  min="0"
                  value={form.seatCapacity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seatCapacity: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="vehicleWeightKg">車両重量 (kg)</label>
                <input
                  id="vehicleWeightKg"
                  type="number"
                  min="0"
                  value={form.vehicleWeightKg}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, vehicleWeightKg: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="fuelTankCapacityL">燃料タンク (L)</label>
                <input
                  id="fuelTankCapacityL"
                  type="number"
                  min="0"
                  value={form.fuelTankCapacityL}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fuelTankCapacityL: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="fuelType">燃料種別</label>
                <input
                  id="fuelType"
                  value={form.fuelType}
                  onChange={(event) => setForm((prev) => ({ ...prev, fuelType: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="maxPower">最高出力</label>
                <input
                  id="maxPower"
                  value={form.maxPower}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxPower: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="maxTorque">最大トルク</label>
                <input
                  id="maxTorque"
                  value={form.maxTorque}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxTorque: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="mainImageUrl">画像URL</label>
                <input
                  id="mainImageUrl"
                  value={form.mainImageUrl}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, mainImageUrl: event.target.value }))
                  }
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

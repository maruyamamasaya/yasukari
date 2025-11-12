import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import type { BikeModel, Vehicle } from "../../../types/dashboard";
import styles from "../../../styles/DashboardPage.module.css";

type VehicleForm = {
  managementNumber: string;
  modelId: string;
  storeId: string;
  publishStatus: "ON" | "OFF";
  tags: string;
  policyNumber1: string;
  policyBranchNumber1: string;
  policyNumber2: string;
  policyBranchNumber2: string;
  inspectionExpiryDate: string;
  licensePlateNumber: string;
  previousLicensePlateNumber: string;
  liabilityInsuranceExpiryDate: string;
  videoUrl: string;
  notes: string;
};

const emptyForm: VehicleForm = {
  managementNumber: "",
  modelId: "",
  storeId: "",
  publishStatus: "ON",
  tags: "",
  policyNumber1: "",
  policyBranchNumber1: "",
  policyNumber2: "",
  policyBranchNumber2: "",
  inspectionExpiryDate: "",
  licensePlateNumber: "",
  previousLicensePlateNumber: "",
  liabilityInsuranceExpiryDate: "",
  videoUrl: "",
  notes: "",
};

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function VehicleCreatePage() {
  const [models, setModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelResponse, vehicleResponse] = await Promise.all([
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (!modelResponse.ok || !vehicleResponse.ok) {
          throw new Error("初期データの取得に失敗しました。");
        }

        const [modelData, vehicleData] = (await Promise.all([
          modelResponse.json(),
          vehicleResponse.json(),
        ])) as [BikeModel[], Vehicle[]];

        setModels(modelData.sort((a, b) => a.modelId - b.modelId));
        setVehicles(vehicleData);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("初期データの取得に失敗しました。");
        }
      }
    };

    void fetchData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.managementNumber.trim()) {
      setError("管理番号を入力してください。");
      setFeedback(null);
      return;
    }
    if (!form.modelId) {
      setError("車種を選択してください。");
      setFeedback(null);
      return;
    }
    if (!form.storeId.trim()) {
      setError("店舗IDを入力してください。");
      setFeedback(null);
      return;
    }

    if (
      vehicles.some(
        (item) => item.managementNumber === form.managementNumber.trim()
      )
    ) {
      setError("同じ管理番号が既に存在します。");
      setFeedback(null);
      return;
    }

    const modelId = Number(form.modelId);
    if (!models.some((item) => item.modelId === modelId)) {
      setError("選択した車種が見つかりません。");
      setFeedback(null);
      return;
    }

    const payload: Record<string, unknown> = {
      managementNumber: form.managementNumber.trim(),
      modelId,
      storeId: form.storeId.trim(),
      publishStatus: form.publishStatus,
      tags: parseTags(form.tags),
    };

    const optionalTextFields: Array<keyof Pick<VehicleForm, "policyNumber1" | "policyBranchNumber1" | "policyNumber2" | "policyBranchNumber2" | "inspectionExpiryDate" | "licensePlateNumber" | "previousLicensePlateNumber" | "liabilityInsuranceExpiryDate" | "videoUrl" | "notes">> = [
      "policyNumber1",
      "policyBranchNumber1",
      "policyNumber2",
      "policyBranchNumber2",
      "inspectionExpiryDate",
      "licensePlateNumber",
      "previousLicensePlateNumber",
      "liabilityInsuranceExpiryDate",
      "videoUrl",
      "notes",
    ];

    optionalTextFields.forEach((field) => {
      const value = form[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/vehicles", {
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

      const vehicle: Vehicle = await response.json();
      setVehicles((prev) => [...prev, vehicle]);
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
        <title>車両登録 | 管理メニュー</title>
      </Head>
      <DashboardLayout pageTitle="車両登録">
        <section className={styles.section}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.fieldGrid} ${styles.twoColumns}`}>
              <div className={styles.field}>
                <label htmlFor="managementNumber">管理番号</label>
                <input
                  id="managementNumber"
                  value={form.managementNumber}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, managementNumber: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="modelId">車種</label>
                <select
                  id="modelId"
                  value={form.modelId}
                  onChange={(event) => setForm((prev) => ({ ...prev, modelId: event.target.value }))}
                >
                  <option value="">選択してください</option>
                  {models.map((item) => (
                    <option key={item.modelId} value={item.modelId}>
                      {item.modelName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="storeId">店舗ID</label>
                <input
                  id="storeId"
                  value={form.storeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, storeId: event.target.value }))}
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
                <label htmlFor="tags">タグ (カンマ区切り)</label>
                <input
                  id="tags"
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="policyNumber1">保険証券番号1</label>
                <input
                  id="policyNumber1"
                  value={form.policyNumber1}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, policyNumber1: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="policyBranchNumber1">保険枝番1</label>
                <input
                  id="policyBranchNumber1"
                  value={form.policyBranchNumber1}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, policyBranchNumber1: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="policyNumber2">保険証券番号2</label>
                <input
                  id="policyNumber2"
                  value={form.policyNumber2}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, policyNumber2: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="policyBranchNumber2">保険枝番2</label>
                <input
                  id="policyBranchNumber2"
                  value={form.policyBranchNumber2}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, policyBranchNumber2: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="inspectionExpiryDate">車検満了日</label>
                <input
                  id="inspectionExpiryDate"
                  type="date"
                  value={form.inspectionExpiryDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, inspectionExpiryDate: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="licensePlateNumber">ナンバープレート</label>
                <input
                  id="licensePlateNumber"
                  value={form.licensePlateNumber}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, licensePlateNumber: event.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="previousLicensePlateNumber">旧ナンバー</label>
                <input
                  id="previousLicensePlateNumber"
                  value={form.previousLicensePlateNumber}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      previousLicensePlateNumber: event.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="liabilityInsuranceExpiryDate">自賠責満了日</label>
                <input
                  id="liabilityInsuranceExpiryDate"
                  type="date"
                  value={form.liabilityInsuranceExpiryDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      liabilityInsuranceExpiryDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="videoUrl">動画URL</label>
                <input
                  id="videoUrl"
                  value={form.videoUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                />
              </div>
            </div>
            <div className={`${styles.fieldGrid} ${styles.twoColumns}`}>
              <div className={styles.field}>
                <label htmlFor="notes">メモ</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
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

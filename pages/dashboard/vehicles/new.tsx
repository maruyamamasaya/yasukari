import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import formStyles from "../../../styles/AdminForm.module.css";

type BikeModel = {
  modelId: number;
  modelName: string;
};

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

type ApiError = {
  message?: string;
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

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

export default function VehicleCreatePage() {
  const router = useRouter();
  const [models, setModels] = useState<BikeModel[]>([]);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/bike-models");
        if (!response.ok) {
          setMessage("車種一覧の取得に失敗しました。");
          return;
        }
        const data: BikeModel[] = await response.json();
        data.sort((a, b) => a.modelId - b.modelId);
        setModels(data);
      } catch (error) {
        console.error("Failed to load bike models", error);
        setMessage("車種一覧の取得に失敗しました。");
      }
    };

    void loadModels();
  }, []);

  const handleChange = (
    field: keyof VehicleForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.managementNumber.trim()) {
      setMessage("管理番号を入力してください。");
      return;
    }
    if (!form.modelId) {
      setMessage("車種を選択してください。");
      return;
    }
    if (!form.storeId.trim()) {
      setMessage("店舗IDを入力してください。");
      return;
    }

    const payload = {
      managementNumber: form.managementNumber.trim(),
      modelId: Number(form.modelId),
      storeId: form.storeId.trim(),
      publishStatus: form.publishStatus,
      tags: parseTags(form.tags),
      policyNumber1: form.policyNumber1.trim() || undefined,
      policyBranchNumber1: form.policyBranchNumber1.trim() || undefined,
      policyNumber2: form.policyNumber2.trim() || undefined,
      policyBranchNumber2: form.policyBranchNumber2.trim() || undefined,
      inspectionExpiryDate: form.inspectionExpiryDate || undefined,
      licensePlateNumber: form.licensePlateNumber.trim() || undefined,
      previousLicensePlateNumber:
        form.previousLicensePlateNumber.trim() || undefined,
      liabilityInsuranceExpiryDate: form.liabilityInsuranceExpiryDate || undefined,
      videoUrl: form.videoUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as ApiError | null;
        setMessage(error?.message ?? "登録に失敗しました。");
        return;
      }

      setMessage(null);
      await router.push("/dashboard/vehicles");
    } catch (error) {
      console.error("Failed to register vehicle", error);
      setMessage("登録に失敗しました。");
    }
  };

  return (
    <AdminLayout title="車両登録">
      <form className={formStyles.formWrapper} onSubmit={handleSubmit}>
        {message ? <div className={formStyles.message}>{message}</div> : null}
        <div className={formStyles.formGrid}>
          <div className={formStyles.field}>
            <label htmlFor="managementNumber">管理番号</label>
            <input
              id="managementNumber"
              type="text"
              value={form.managementNumber}
              onChange={(event) => handleChange("managementNumber", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="modelId">車種</label>
            <select
              id="modelId"
              value={form.modelId}
              onChange={(event) => handleChange("modelId", event.target.value)}
            >
              <option value="">選択してください</option>
              {models.map((item) => (
                <option key={item.modelId} value={item.modelId}>
                  {item.modelName}
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label htmlFor="storeId">店舗ID</label>
            <input
              id="storeId"
              type="text"
              value={form.storeId}
              onChange={(event) => handleChange("storeId", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="publishStatus">掲載状態</label>
            <select
              id="publishStatus"
              value={form.publishStatus}
              onChange={(event) =>
                handleChange("publishStatus", event.target.value as VehicleForm["publishStatus"])
              }
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label htmlFor="tags">タグ (カンマ区切り)</label>
            <input
              id="tags"
              type="text"
              value={form.tags}
              onChange={(event) => handleChange("tags", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="policyNumber1">証券番号1</label>
            <input
              id="policyNumber1"
              type="text"
              value={form.policyNumber1}
              onChange={(event) => handleChange("policyNumber1", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="policyBranchNumber1">枝番1</label>
            <input
              id="policyBranchNumber1"
              type="text"
              value={form.policyBranchNumber1}
              onChange={(event) => handleChange("policyBranchNumber1", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="policyNumber2">証券番号2</label>
            <input
              id="policyNumber2"
              type="text"
              value={form.policyNumber2}
              onChange={(event) => handleChange("policyNumber2", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="policyBranchNumber2">枝番2</label>
            <input
              id="policyBranchNumber2"
              type="text"
              value={form.policyBranchNumber2}
              onChange={(event) => handleChange("policyBranchNumber2", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="inspectionExpiryDate">車検満了日</label>
            <input
              id="inspectionExpiryDate"
              type="date"
              value={form.inspectionExpiryDate}
              onChange={(event) => handleChange("inspectionExpiryDate", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="licensePlateNumber">ナンバー</label>
            <input
              id="licensePlateNumber"
              type="text"
              value={form.licensePlateNumber}
              onChange={(event) => handleChange("licensePlateNumber", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="previousLicensePlateNumber">旧ナンバー</label>
            <input
              id="previousLicensePlateNumber"
              type="text"
              value={form.previousLicensePlateNumber}
              onChange={(event) =>
                handleChange("previousLicensePlateNumber", event.target.value)
              }
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="liabilityInsuranceExpiryDate">自賠責満了日</label>
            <input
              id="liabilityInsuranceExpiryDate"
              type="date"
              value={form.liabilityInsuranceExpiryDate}
              onChange={(event) =>
                handleChange("liabilityInsuranceExpiryDate", event.target.value)
              }
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="videoUrl">動画URL</label>
            <input
              id="videoUrl"
              type="url"
              value={form.videoUrl}
              onChange={(event) => handleChange("videoUrl", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="notes">メモ</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
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

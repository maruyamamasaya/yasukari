import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import formStyles from "../../../styles/AdminForm.module.css";

type BikeClass = {
  classId: number;
  className: string;
};

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

type ApiError = {
  message?: string;
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

export default function BikeModelCreatePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<BikeClass[]>([]);
  const [form, setForm] = useState<ModelForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setMessage("クラス一覧の取得に失敗しました。");
          return;
        }
        const data: BikeClass[] = await response.json();
        data.sort((a, b) => a.classId - b.classId);
        setClasses(data);
      } catch (error) {
        console.error("Failed to load bike classes", error);
        setMessage("クラス一覧の取得に失敗しました。");
      }
    };

    void loadClasses();
  }, []);

  const handleChange = (
    field: keyof ModelForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const parseNumber = (label: string, value: string) => {
    if (!value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`${label}は数値で入力してください。`);
    }
    return parsed;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.classId) {
      setMessage("クラスを選択してください。");
      return;
    }
    if (!form.modelName.trim()) {
      setMessage("車種名を入力してください。");
      return;
    }

    try {
      const payload = {
        classId: Number(form.classId),
        modelName: form.modelName.trim(),
        publishStatus: form.publishStatus,
        displacementCc: parseNumber("排気量", form.displacementCc),
        lengthMm: parseNumber("全長", form.lengthMm),
        widthMm: parseNumber("全幅", form.widthMm),
        heightMm: parseNumber("全高", form.heightMm),
        seatHeightMm: parseNumber("シート高", form.seatHeightMm),
        seatCapacity: parseNumber("定員", form.seatCapacity),
        vehicleWeightKg: parseNumber("車両重量", form.vehicleWeightKg),
        fuelTankCapacityL: parseNumber("タンク容量", form.fuelTankCapacityL),
        requiredLicense: form.requiredLicense.trim() || undefined,
        fuelType: form.fuelType.trim() || undefined,
        maxPower: form.maxPower.trim() || undefined,
        maxTorque: form.maxTorque.trim() || undefined,
        mainImageUrl: form.mainImageUrl.trim() || undefined,
      };

      const response = await fetch("/api/bike-models", {
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
      await router.push("/dashboard/bike-models");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        console.error("Failed to register bike model", error);
        setMessage("登録に失敗しました。");
      }
    }
  };

  return (
    <AdminLayout title="車種登録">
      <form className={formStyles.formWrapper} onSubmit={handleSubmit}>
        {message ? <div className={formStyles.message}>{message}</div> : null}
        <div className={formStyles.formGrid}>
          <div className={formStyles.field}>
            <label htmlFor="classId">クラス</label>
            <select
              id="classId"
              value={form.classId}
              onChange={(event) => handleChange("classId", event.target.value)}
            >
              <option value="">選択してください</option>
              {classes.map((item) => (
                <option key={item.classId} value={item.classId}>
                  {item.className}
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label htmlFor="modelName">車種名</label>
            <input
              id="modelName"
              type="text"
              value={form.modelName}
              onChange={(event) => handleChange("modelName", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="publishStatus">掲載状態</label>
            <select
              id="publishStatus"
              value={form.publishStatus}
              onChange={(event) =>
                handleChange("publishStatus", event.target.value as ModelForm["publishStatus"])
              }
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label htmlFor="displacementCc">排気量 (cc)</label>
            <input
              id="displacementCc"
              type="number"
              value={form.displacementCc}
              onChange={(event) => handleChange("displacementCc", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="requiredLicense">必要免許</label>
            <input
              id="requiredLicense"
              type="text"
              value={form.requiredLicense}
              onChange={(event) => handleChange("requiredLicense", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="lengthMm">全長 (mm)</label>
            <input
              id="lengthMm"
              type="number"
              value={form.lengthMm}
              onChange={(event) => handleChange("lengthMm", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="widthMm">全幅 (mm)</label>
            <input
              id="widthMm"
              type="number"
              value={form.widthMm}
              onChange={(event) => handleChange("widthMm", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="heightMm">全高 (mm)</label>
            <input
              id="heightMm"
              type="number"
              value={form.heightMm}
              onChange={(event) => handleChange("heightMm", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="seatHeightMm">シート高 (mm)</label>
            <input
              id="seatHeightMm"
              type="number"
              value={form.seatHeightMm}
              onChange={(event) => handleChange("seatHeightMm", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="seatCapacity">定員</label>
            <input
              id="seatCapacity"
              type="number"
              value={form.seatCapacity}
              onChange={(event) => handleChange("seatCapacity", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="vehicleWeightKg">車両重量 (kg)</label>
            <input
              id="vehicleWeightKg"
              type="number"
              value={form.vehicleWeightKg}
              onChange={(event) => handleChange("vehicleWeightKg", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="fuelTankCapacityL">タンク容量 (L)</label>
            <input
              id="fuelTankCapacityL"
              type="number"
              value={form.fuelTankCapacityL}
              onChange={(event) => handleChange("fuelTankCapacityL", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="fuelType">燃料</label>
            <input
              id="fuelType"
              type="text"
              value={form.fuelType}
              onChange={(event) => handleChange("fuelType", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="maxPower">最高出力</label>
            <input
              id="maxPower"
              type="text"
              value={form.maxPower}
              onChange={(event) => handleChange("maxPower", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="maxTorque">最大トルク</label>
            <input
              id="maxTorque"
              type="text"
              value={form.maxTorque}
              onChange={(event) => handleChange("maxTorque", event.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="mainImageUrl">画像URL</label>
            <input
              id="mainImageUrl"
              type="url"
              value={form.mainImageUrl}
              onChange={(event) => handleChange("mainImageUrl", event.target.value)}
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

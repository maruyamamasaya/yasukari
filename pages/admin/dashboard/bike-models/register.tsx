import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, PublishStatus } from "../../../../lib/dashboard/types";
import { toNumber } from "../../../../lib/dashboard/utils";

type ModelFormState = {
  classId: string;
  modelName: string;
  publishStatus: PublishStatus;
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

const emptyForm: ModelFormState = {
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

export default function BikeModelRegisterPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [form, setForm] = useState<ModelFormState>(emptyForm);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setLoadError("クラス一覧の取得に失敗しました。");
          return;
        }
        const data: BikeClass[] = await response.json();
        setBikeClasses(data.sort((a, b) => a.classId - b.classId));
        setLoadError(null);
      } catch (fetchError) {
        console.error("Failed to load classes", fetchError);
        setLoadError("クラス一覧の取得に失敗しました。");
      }
    };

    void loadClasses();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);

    if (!form.classId) {
      setError("所属クラスを選択してください。");
      return;
    }
    if (!form.modelName.trim()) {
      setError("車種名を入力してください。");
      return;
    }

    const classId = Number(form.classId);
    if (!bikeClasses.some((item) => item.classId === classId)) {
      setError("選択されたクラスが存在しません。");
      return;
    }

    const payload: Record<string, unknown> = {
      classId,
      modelName: form.modelName.trim(),
      publishStatus: form.publishStatus,
    };

    const numberFields: Array<
      keyof Pick<
        ModelFormState,
        | "displacementCc"
        | "lengthMm"
        | "widthMm"
        | "heightMm"
        | "seatHeightMm"
        | "seatCapacity"
        | "vehicleWeightKg"
        | "fuelTankCapacityL"
      >
    > = [
      "displacementCc",
      "lengthMm",
      "widthMm",
      "heightMm",
      "seatHeightMm",
      "seatCapacity",
      "vehicleWeightKg",
      "fuelTankCapacityL",
    ];

    numberFields.forEach((field) => {
      const value = toNumber(form[field]);
      if (value !== undefined) {
        payload[field] = value;
      }
    });

    const stringFields: Array<
      keyof Pick<
        ModelFormState,
        "requiredLicense" | "fuelType" | "maxPower" | "maxTorque" | "mainImageUrl"
      >
    > = ["requiredLicense", "fuelType", "maxPower", "maxTorque", "mainImageUrl"];

    stringFields.forEach((field) => {
      const value = form[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    try {
      const response = await fetch("/api/bike-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(errorBody?.message ?? "車種の登録に失敗しました。");
        return;
      }

      setForm({ ...emptyForm });
      setError(null);
      setSuccess("車種を登録しました。");
    } catch (submitError) {
      console.error("Failed to register bike model", submitError);
      setError("車種の登録に失敗しました。");
    }
  };

  return (
    <>
      <Head>
        <title>車種登録 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="車種登録"
        actions={[
          {
            label: "車種一覧へ戻る",
            href: "/admin/dashboard/bike-models",
          },
        ]}
      >
        <section className={styles.section}>
          {loadError && <p className={formStyles.error}>{loadError}</p>}
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p className={formStyles.hint}>{success}</p>}
          <article className={formStyles.card}>
            <form onSubmit={handleSubmit} className={formStyles.body}>
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <label htmlFor="modelClass">所属クラス</label>
                  <select
                    id="modelClass"
                    value={form.classId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, classId: event.target.value }))
                    }
                  >
                    <option value="">クラスを選択</option>
                    {bikeClasses.map((item) => (
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
                    value={form.modelName}
                    placeholder="例：CB400SF"
                    onChange={(event) => setForm((prev) => ({ ...prev, modelName: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="modelStatus">掲載状態</label>
                  <select
                    id="modelStatus"
                    value={form.publishStatus}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        publishStatus: event.target.value as PublishStatus,
                      }))
                    }
                  >
                    <option value="ON">公開 (ON)</option>
                    <option value="OFF">非公開 (OFF)</option>
                  </select>
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="displacement">排気量 (cc)</label>
                  <input
                    id="displacement"
                    type="number"
                    min="0"
                    value={form.displacementCc}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, displacementCc: event.target.value }))
                    }
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="requiredLicense">必要免許</label>
                  <input
                    id="requiredLicense"
                    value={form.requiredLicense}
                    placeholder="例：普通二輪"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, requiredLicense: event.target.value }))
                    }
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="length">全長 (mm)</label>
                  <input
                    id="length"
                    type="number"
                    min="0"
                    value={form.lengthMm}
                    onChange={(event) => setForm((prev) => ({ ...prev, lengthMm: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="width">全幅 (mm)</label>
                  <input
                    id="width"
                    type="number"
                    min="0"
                    value={form.widthMm}
                    onChange={(event) => setForm((prev) => ({ ...prev, widthMm: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="height">全高 (mm)</label>
                  <input
                    id="height"
                    type="number"
                    min="0"
                    value={form.heightMm}
                    onChange={(event) => setForm((prev) => ({ ...prev, heightMm: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="seatHeight">シート高 (mm)</label>
                  <input
                    id="seatHeight"
                    type="number"
                    min="0"
                    value={form.seatHeightMm}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, seatHeightMm: event.target.value }))
                    }
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="seatCapacity">乗車定員 (人)</label>
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
                <div className={formStyles.field}>
                  <label htmlFor="vehicleWeight">車両重量 (kg)</label>
                  <input
                    id="vehicleWeight"
                    type="number"
                    min="0"
                    value={form.vehicleWeightKg}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, vehicleWeightKg: event.target.value }))
                    }
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="tankCapacity">タンク容量 (L)</label>
                  <input
                    id="tankCapacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.fuelTankCapacityL}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, fuelTankCapacityL: event.target.value }))
                    }
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="fuelType">使用燃料</label>
                  <input
                    id="fuelType"
                    value={form.fuelType}
                    placeholder="例：レギュラー"
                    onChange={(event) => setForm((prev) => ({ ...prev, fuelType: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="maxPower">最高出力</label>
                  <input
                    id="maxPower"
                    value={form.maxPower}
                    placeholder="例：77PS/11,000rpm"
                    onChange={(event) => setForm((prev) => ({ ...prev, maxPower: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="maxTorque">最大トルク</label>
                  <input
                    id="maxTorque"
                    value={form.maxTorque}
                    placeholder="例：8.0kgf・m/8,000rpm"
                    onChange={(event) => setForm((prev) => ({ ...prev, maxTorque: event.target.value }))}
                  />
                </div>
                <div className={formStyles.field}>
                  <label htmlFor="mainImageUrl">メイン画像URL</label>
                  <input
                    id="mainImageUrl"
                    type="url"
                    value={form.mainImageUrl}
                    placeholder="https://example.com/bikes/model.jpg"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, mainImageUrl: event.target.value }))
                    }
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

import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "../styles/Dashboard.module.css";

type BikeClass = {
  classId: number;
  className: string;
  createdAt: string;
  updatedAt: string;
};

type BikeModel = {
  modelId: number;
  classId: number;
  modelName: string;
  publishStatus: "ON" | "OFF";
  displacementCc?: number;
  requiredLicense?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  seatHeightMm?: number;
  seatCapacity?: number;
  vehicleWeightKg?: number;
  fuelTankCapacityL?: number;
  fuelType?: string;
  maxPower?: string;
  maxTorque?: string;
  mainImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type Vehicle = {
  managementNumber: string;
  modelId: number;
  storeId: string;
  publishStatus: "ON" | "OFF";
  tags: string[];
  policyNumber1?: string;
  policyBranchNumber1?: string;
  policyNumber2?: string;
  policyBranchNumber2?: string;
  inspectionExpiryDate?: string;
  licensePlateNumber?: string;
  previousLicensePlateNumber?: string;
  liabilityInsuranceExpiryDate?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

const menuItems = [
  { id: "dashboard-overview", label: "ダッシュボード" },
  { id: "news", label: "新着情報管理" },
  { id: "bike", label: "バイク管理" },
  { id: "classes", label: "クラス" },
  { id: "models", label: "車種" },
  { id: "vehicles", label: "車両" },
  { id: "options", label: "オプション（用品）" },
  { id: "members", label: "会員管理" },
  { id: "reservations", label: "予約管理" },
  { id: "blogs", label: "ブログ管理" },
  { id: "holidays", label: "祭日管理" },
  { id: "closed", label: "休日管理" },
  { id: "coupons", label: "クーポン管理" },
];

const emptyModelForm: ModelForm = {
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

const emptyVehicleForm: VehicleForm = {
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

function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function DashboardPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [className, setClassName] = useState("");
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [modelForm, setModelForm] = useState<ModelForm>(emptyModelForm);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(emptyVehicleForm);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesResponse, modelsResponse, vehiclesResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (classesResponse.ok) {
          const data: BikeClass[] = await classesResponse.json();
          setBikeClasses(data.sort((a, b) => a.classId - b.classId));
        } else {
          setClassError("クラス一覧の取得に失敗しました。");
        }

        if (modelsResponse.ok) {
          const data: BikeModel[] = await modelsResponse.json();
          setBikeModels(data.sort((a, b) => a.modelId - b.modelId));
        } else {
          setModelError("車種一覧の取得に失敗しました。");
        }

        if (vehiclesResponse.ok) {
          const data: Vehicle[] = await vehiclesResponse.json();
          setVehicles(
            data.sort((a, b) => a.managementNumber.localeCompare(b.managementNumber))
          );
        } else {
          setVehicleError("車両一覧の取得に失敗しました。");
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setClassError((prev) => prev ?? "クラス一覧の取得に失敗しました。");
        setModelError((prev) => prev ?? "車種一覧の取得に失敗しました。");
        setVehicleError((prev) => prev ?? "車両一覧の取得に失敗しました。");
      }
    };

    void loadData();
  }, []);

  const classNameMap = useMemo(
    () =>
      bikeClasses.reduce<Record<number, string>>((acc, bikeClass) => {
        acc[bikeClass.classId] = bikeClass.className;
        return acc;
      }, {}),
    [bikeClasses]
  );

  const modelNameMap = useMemo(
    () =>
      bikeModels.reduce<Record<number, string>>((acc, model) => {
        acc[model.modelId] = model.modelName;
        return acc;
      }, {}),
    [bikeModels]
  );

  const handleClassSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!className.trim()) {
      setClassError("クラス名を入力してください。");
      return;
    }

    try {
      const response = await fetch("/api/bike-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: className.trim() }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setClassError(error?.message ?? "クラスの登録に失敗しました。");
        return;
      }

      const newClass: BikeClass = await response.json();
      setBikeClasses((prev) =>
        [...prev, newClass].sort((a, b) => a.classId - b.classId)
      );
      setClassName("");
      setClassError(null);
    } catch (error) {
      console.error("Failed to register bike class", error);
      setClassError("クラスの登録に失敗しました。");
    }
  };

  const handleModelSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modelForm.classId) {
      setModelError("所属クラスを選択してください。");
      return;
    }
    if (!modelForm.modelName.trim()) {
      setModelError("車種名を入力してください。");
      return;
    }
    const classId = Number(modelForm.classId);
    if (!bikeClasses.some((item) => item.classId === classId)) {
      setModelError("選択されたクラスが存在しません。");
      return;
    }
    const payload: Record<string, unknown> = {
      classId,
      modelName: modelForm.modelName.trim(),
      publishStatus: modelForm.publishStatus,
    };

    const numberFields: Array<
      keyof Pick<
        ModelForm,
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
      const value = toNumber(modelForm[field]);
      if (value !== undefined) {
        payload[field] = value;
      }
    });

    const stringFields: Array<
      keyof Pick<
        ModelForm,
        "requiredLicense" | "fuelType" | "maxPower" | "maxTorque" | "mainImageUrl"
      >
    > = ["requiredLicense", "fuelType", "maxPower", "maxTorque", "mainImageUrl"];

    stringFields.forEach((field) => {
      const value = modelForm[field].trim();
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
        const error = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setModelError(error?.message ?? "車種の登録に失敗しました。");
        return;
      }

      const newModel: BikeModel = await response.json();
      setBikeModels((prev) =>
        [...prev, newModel].sort((a, b) => a.modelId - b.modelId)
      );
      setModelForm(() => ({ ...emptyModelForm }));
      setModelError(null);
    } catch (error) {
      console.error("Failed to register bike model", error);
      setModelError("車種の登録に失敗しました。");
    }
  };

  const handleVehicleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleForm.managementNumber.trim()) {
      setVehicleError("管理番号を入力してください。");
      return;
    }
    if (!vehicleForm.modelId) {
      setVehicleError("車種を選択してください。");
      return;
    }
    if (!vehicleForm.storeId.trim()) {
      setVehicleError("店舗IDを入力してください。");
      return;
    }
    const modelId = Number(vehicleForm.modelId);
    if (!bikeModels.some((item) => item.modelId === modelId)) {
      setVehicleError("選択された車種が存在しません。");
      return;
    }
    if (vehicles.some((vehicle) => vehicle.managementNumber === vehicleForm.managementNumber.trim())) {
      setVehicleError("同じ管理番号が既に登録されています。");
      return;
    }
    const payload: Record<string, unknown> = {
      managementNumber: vehicleForm.managementNumber.trim(),
      modelId,
      storeId: vehicleForm.storeId.trim(),
      publishStatus: vehicleForm.publishStatus,
      tags: parseTags(vehicleForm.tags),
    };

    const optionalVehicleFields: Array<
      keyof Pick<
        VehicleForm,
        | "policyNumber1"
        | "policyBranchNumber1"
        | "policyNumber2"
        | "policyBranchNumber2"
        | "licensePlateNumber"
        | "previousLicensePlateNumber"
        | "videoUrl"
        | "notes"
      >
    > = [
      "policyNumber1",
      "policyBranchNumber1",
      "policyNumber2",
      "policyBranchNumber2",
      "licensePlateNumber",
      "previousLicensePlateNumber",
      "videoUrl",
      "notes",
    ];

    optionalVehicleFields.forEach((field) => {
      const value = vehicleForm[field].trim();
      if (value) {
        payload[field] = value;
      }
    });

    if (vehicleForm.inspectionExpiryDate) {
      payload.inspectionExpiryDate = vehicleForm.inspectionExpiryDate;
    }

    if (vehicleForm.liabilityInsuranceExpiryDate) {
      payload.liabilityInsuranceExpiryDate = vehicleForm.liabilityInsuranceExpiryDate;
    }

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setVehicleError(error?.message ?? "車両の登録に失敗しました。");
        return;
      }

      const newVehicle: Vehicle = await response.json();
      setVehicles((prev) =>
        [...prev, newVehicle].sort((a, b) =>
          a.managementNumber.localeCompare(b.managementNumber)
        )
      );
      setVehicleForm(() => ({ ...emptyVehicleForm }));
      setVehicleError(null);
    } catch (error) {
      console.error("Failed to register vehicle", error);
      setVehicleError("車両の登録に失敗しました。");
    }
  };

  return (
    <>
      <Head>
        <title>管理ダッシュボード | YASUKARI</title>
        <meta
          name="description"
          content="バイククラス・車種・車両を一元管理できるYASUKARIの管理ダッシュボードページです。"
        />
      </Head>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <p className={styles.menuTitle}>管理メニュー</p>
          <ul className={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <a className={styles.menuButton} href={`#${item.id}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
        <main className={styles.main}>
          <section id="dashboard-overview" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.tagline}>Overview</span>
              <h1 className={styles.sectionTitle}>管理ダッシュボード</h1>
              <p className={styles.sectionDescription}>
                DynamoDBで設計された各種マスタを整然と管理するための内部向けダッシュボードです。メニューから操作したい領域を選択し、必要情報を登録してください。
              </p>
            </div>
              <div className={styles.placeholderCard}>
                <strong>運用メモ</strong>
                <p>
                  IDはすべて自動採番され、UIからは確認できません。登録されたレコードは画面下部の一覧に即時反映され、API経由でDynamoDBへ永続化されます。
                </p>
                <p className={styles.hint}>
                  ※APIが利用するAWS認証情報とテーブル名（環境変数）を正しく設定してから運用を開始してください。
                </p>
              </div>
          </section>

          <section id="bike" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.tagline}>Bike Management</span>
              <h2 className={styles.sectionTitle}>バイク管理</h2>
              <p className={styles.sectionDescription}>
                クラス・車種・車両の3階層でバイク情報を管理します。各フォームの必須項目を入力し、「登録する」ボタンからデータを追加してください。
              </p>
            </div>
            <div className={styles.successList}>
              <article id="classes" className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>バイククラス登録</h3>
                  <p className={styles.formDescription}>
                    例：スクーター、ネイキッド、大型ツアラーなど。クラス名のみを入力すれば自動でIDが採番されます。
                  </p>
                </div>
                {classError && <p className={styles.errorMessage}>{classError}</p>}
                <form onSubmit={handleClassSubmit} className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="className">クラス名</label>
                    <input
                      id="className"
                      name="className"
                      placeholder="例：スクーター"
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.primaryButton}>
                      登録する
                    </button>
                  </div>
                </form>
              </article>

              <article id="models" className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>車種登録</h3>
                  <p className={styles.formDescription}>
                    クラスに紐づく車種を登録します。必要なスペックは任意で入力でき、未入力の場合は空欄のまま保持されます。
                  </p>
                </div>
                {modelError && <p className={styles.errorMessage}>{modelError}</p>}
                <form onSubmit={handleModelSubmit} className={styles.successList}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label htmlFor="modelClass">所属クラス</label>
                      <select
                        id="modelClass"
                        value={modelForm.classId}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, classId: event.target.value }))
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
                    <div className={styles.field}>
                      <label htmlFor="modelName">車種名</label>
                      <input
                        id="modelName"
                        placeholder="例：CB400SF"
                        value={modelForm.modelName}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, modelName: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="modelStatus">掲載状態</label>
                      <select
                        id="modelStatus"
                        value={modelForm.publishStatus}
                        onChange={(event) =>
                          setModelForm((prev) => ({
                            ...prev,
                            publishStatus: event.target.value as "ON" | "OFF",
                          }))
                        }
                      >
                        <option value="ON">公開 (ON)</option>
                        <option value="OFF">非公開 (OFF)</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="displacement">排気量 (cc)</label>
                      <input
                        id="displacement"
                        type="number"
                        min="0"
                        value={modelForm.displacementCc}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, displacementCc: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="requiredLicense">必要免許</label>
                      <input
                        id="requiredLicense"
                        placeholder="例：普通二輪"
                        value={modelForm.requiredLicense}
                        onChange={(event) =>
                          setModelForm((prev) => ({
                            ...prev,
                            requiredLicense: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="length">全長 (mm)</label>
                      <input
                        id="length"
                        type="number"
                        min="0"
                        value={modelForm.lengthMm}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, lengthMm: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="width">全幅 (mm)</label>
                      <input
                        id="width"
                        type="number"
                        min="0"
                        value={modelForm.widthMm}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, widthMm: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="height">全高 (mm)</label>
                      <input
                        id="height"
                        type="number"
                        min="0"
                        value={modelForm.heightMm}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, heightMm: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="seatHeight">シート高 (mm)</label>
                      <input
                        id="seatHeight"
                        type="number"
                        min="0"
                        value={modelForm.seatHeightMm}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, seatHeightMm: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="seatCapacity">乗車定員 (人)</label>
                      <input
                        id="seatCapacity"
                        type="number"
                        min="0"
                        value={modelForm.seatCapacity}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, seatCapacity: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="weight">車両重量 (kg)</label>
                      <input
                        id="weight"
                        type="number"
                        min="0"
                        value={modelForm.vehicleWeightKg}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, vehicleWeightKg: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="tank">タンク容量 (L)</label>
                      <input
                        id="tank"
                        type="number"
                        min="0"
                        step="0.1"
                        value={modelForm.fuelTankCapacityL}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, fuelTankCapacityL: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="fuelType">使用燃料</label>
                      <input
                        id="fuelType"
                        placeholder="例：レギュラー"
                        value={modelForm.fuelType}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, fuelType: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="maxPower">最高出力</label>
                      <input
                        id="maxPower"
                        placeholder="例：77PS/11,000rpm"
                        value={modelForm.maxPower}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, maxPower: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="maxTorque">最大トルク</label>
                      <input
                        id="maxTorque"
                        placeholder="例：8.0kgf・m/8,000rpm"
                        value={modelForm.maxTorque}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, maxTorque: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="mainImageUrl">メイン画像URL</label>
                      <input
                        id="mainImageUrl"
                        type="url"
                        placeholder="https://example.com/bikes/model.jpg"
                        value={modelForm.mainImageUrl}
                        onChange={(event) =>
                          setModelForm((prev) => ({ ...prev, mainImageUrl: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.primaryButton}>
                      登録する
                    </button>
                  </div>
                </form>
              </article>

              <article id="vehicles" className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>車両登録</h3>
                  <p className={styles.formDescription}>
                    レンタルに利用する実車の管理情報を登録します。管理番号はユニークとなるよう入力してください。
                  </p>
                </div>
                {vehicleError && <p className={styles.errorMessage}>{vehicleError}</p>}
                <form onSubmit={handleVehicleSubmit} className={styles.successList}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label htmlFor="managementNumber">管理番号</label>
                      <input
                        id="managementNumber"
                        placeholder="例：NC42-1602585"
                        value={vehicleForm.managementNumber}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            managementNumber: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="vehicleModel">車種</label>
                      <select
                        id="vehicleModel"
                        value={vehicleForm.modelId}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({ ...prev, modelId: event.target.value }))
                        }
                      >
                        <option value="">車種を選択</option>
                        {bikeModels.map((model) => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.modelName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="storeId">店舗ID</label>
                      <input
                        id="storeId"
                        placeholder="例：tokyo-honten"
                        value={vehicleForm.storeId}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({ ...prev, storeId: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="vehicleStatus">掲載状態</label>
                      <select
                        id="vehicleStatus"
                        value={vehicleForm.publishStatus}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            publishStatus: event.target.value as "ON" | "OFF",
                          }))
                        }
                      >
                        <option value="ON">公開 (ON)</option>
                        <option value="OFF">非公開 (OFF)</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="tags">タグ</label>
                      <input
                        id="tags"
                        placeholder="カンマ区切りで入力 (例：beginner,touring)"
                        value={vehicleForm.tags}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({ ...prev, tags: event.target.value }))
                        }
                      />
                      <p className={styles.hint}>※ カンマで区切ると複数タグになります。</p>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="policyNumber1">証券番号1</label>
                      <input
                        id="policyNumber1"
                        value={vehicleForm.policyNumber1}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            policyNumber1: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="policyBranchNumber1">枝番号1</label>
                      <input
                        id="policyBranchNumber1"
                        value={vehicleForm.policyBranchNumber1}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            policyBranchNumber1: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="policyNumber2">証券番号2</label>
                      <input
                        id="policyNumber2"
                        value={vehicleForm.policyNumber2}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            policyNumber2: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="policyBranchNumber2">枝番号2</label>
                      <input
                        id="policyBranchNumber2"
                        value={vehicleForm.policyBranchNumber2}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            policyBranchNumber2: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="inspectionExpiryDate">車検期日</label>
                      <input
                        id="inspectionExpiryDate"
                        type="date"
                        value={vehicleForm.inspectionExpiryDate}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            inspectionExpiryDate: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="licensePlateNumber">ナンバープレート</label>
                      <input
                        id="licensePlateNumber"
                        value={vehicleForm.licensePlateNumber}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            licensePlateNumber: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="previousLicensePlateNumber">旧ナンバープレート</label>
                      <input
                        id="previousLicensePlateNumber"
                        value={vehicleForm.previousLicensePlateNumber}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
                            ...prev,
                            previousLicensePlateNumber: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="liabilityInsuranceExpiryDate">自賠責期日</label>
                      <input
                        id="liabilityInsuranceExpiryDate"
                        type="date"
                        value={vehicleForm.liabilityInsuranceExpiryDate}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({
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
                        type="url"
                        placeholder="https://example.com/video"
                        value={vehicleForm.videoUrl}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({ ...prev, videoUrl: event.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="notes">備考</label>
                      <textarea
                        id="notes"
                        placeholder="整備履歴や補足事項を記載"
                        value={vehicleForm.notes}
                        onChange={(event) =>
                          setVehicleForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.primaryButton}>
                      登録する
                    </button>
                  </div>
                </form>
              </article>
            </div>
          </section>

          <section id="models-list" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.tagline}>Master Data</span>
              <h2 className={styles.sectionTitle}>登録済みデータ一覧</h2>
              <p className={styles.sectionDescription}>
                画面上で登録されたデータのサマリです。必要に応じてCSV出力やAPI連携に拡張してください。
              </p>
            </div>
            <div className={styles.successList}>
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>バイククラス</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>クラス名</th>
                        <th>作成日時</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikeClasses.length === 0 ? (
                        <tr>
                          <td colSpan={3}>登録済みのクラスはまだありません。</td>
                        </tr>
                      ) : (
                        bikeClasses.map((item) => (
                          <tr key={item.classId}>
                            <td>{item.classId}</td>
                            <td>{item.className}</td>
                            <td>{item.createdAt}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>車種</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>車種名</th>
                        <th>クラス</th>
                        <th>掲載状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikeModels.length === 0 ? (
                        <tr>
                          <td colSpan={4}>登録済みの車種はまだありません。</td>
                        </tr>
                      ) : (
                        bikeModels.map((model) => (
                          <tr key={model.modelId}>
                            <td>{model.modelId}</td>
                            <td>{model.modelName}</td>
                            <td>{classNameMap[model.classId] ?? "-"}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  model.publishStatus === "ON" ? styles.badgeOn : styles.badgeOff
                                }`}
                              >
                                {model.publishStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>車両</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>管理番号</th>
                        <th>車種</th>
                        <th>店舗ID</th>
                        <th>掲載状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.length === 0 ? (
                        <tr>
                          <td colSpan={4}>登録済みの車両はまだありません。</td>
                        </tr>
                      ) : (
                        vehicles.map((vehicle) => (
                          <tr key={vehicle.managementNumber}>
                            <td>{vehicle.managementNumber}</td>
                            <td>{modelNameMap[vehicle.modelId] ?? "-"}</td>
                            <td>{vehicle.storeId}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  vehicle.publishStatus === "ON" ? styles.badgeOn : styles.badgeOff
                                }`}
                              >
                                {vehicle.publishStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section id="news" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>新着情報管理</h2>
              <p>
                お知らせ記事やキャンペーン情報の登録フォームをここに追加できます。ニュースカテゴリや公開期間の設定に対応する設計を想定してください。
              </p>
            </div>
          </section>

          <section id="options" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>オプション（用品）管理</h2>
              <p>
                レンタル用品の在庫・料金管理を想定したプレースホルダーです。用品カテゴリや貸出可否フラグを持たせる設計が可能です。
              </p>
            </div>
          </section>

          <section id="members" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>会員管理</h2>
              <p>会員のステータスや本人確認情報を管理するUIを配置予定です。</p>
            </div>
          </section>

          <section id="reservations" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>予約管理</h2>
              <p>予約一覧、ステータス更新、キャンセルフローを扱うセクションを想定しています。</p>
            </div>
          </section>

          <section id="blogs" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>ブログ管理</h2>
              <p>レンタルバイクブログの投稿・下書き・公開予約を管理するUIを配置予定です。</p>
            </div>
          </section>

          <section id="holidays" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>祭日管理</h2>
              <p>国民の祝日や臨時営業日の登録を行うセクション用のプレースホルダーです。</p>
            </div>
          </section>

          <section id="closed" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>休日管理</h2>
              <p>店舗ごとの定休日やメンテナンス休業日の設定UIを追加してください。</p>
            </div>
          </section>

          <section id="coupons" className={styles.section}>
            <div className={styles.placeholderCard}>
              <h2 className={styles.formTitle}>クーポン管理</h2>
              <p>割引クーポンの発行・利用履歴確認を管理するセクションです。</p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

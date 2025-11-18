import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import {
  BikeClass,
  DurationPriceKey,
  ExtraPriceKey,
} from "../../../../lib/dashboard/types";

const durationOptions: { key: DurationPriceKey; label: string }[] = [
  { key: "24h", label: "24時間" },
  { key: "2d", label: "2日間" },
  { key: "4d", label: "4日間" },
  { key: "1w", label: "1週間" },
  { key: "2w", label: "2週間" },
  { key: "1m", label: "1ヶ月" },
];

const extraDurationOptions: { key: ExtraPriceKey; label: string }[] = [
  { key: "24h", label: "24時間" },
];

const createEmptyPriceState = <K extends string>(
  options: readonly { key: K }[]
): Record<K, string> =>
  options.reduce(
    (state, option) => ({
      ...state,
      [option.key]: "",
    }),
    {} as Record<K, string>
  );

const normalizeClassIdentifier = (input: string): string | null => {
  const numericPart = input.match(/\d+/)?.[0];
  if (!numericPart) {
    return null;
  }

  return `class_${numericPart}`;
};

const parsePriceValueFromInput = (value: string): number | null | undefined => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return undefined;
  }

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const priceMapFromState = <K extends string>(
  state: Record<K, string>,
  label: string,
  options: readonly { key: K }[]
): Partial<Record<K, number>> | undefined => {
  const entries: [K, number][] = [];

  options.forEach(({ key }) => {
    const raw = state[key];
    if (!raw.trim()) {
      return;
    }

    const numericValue = parsePriceValueFromInput(raw);
    if (numericValue == null) {
      throw new Error(`${label}には数値を入力してください。`);
    }

    entries.push([key, numericValue]);
  });

  return entries.length > 0
    ? (Object.fromEntries(entries) as Partial<Record<K, number>>)
    : undefined;
};

const priceStateFromClass = <K extends string>(
  prices: Partial<Record<K, number>> | undefined,
  options: readonly { key: K }[]
): Record<K, string> => {
  const nextState = createEmptyPriceState(options);
  options.forEach(({ key }) => {
    const value = prices?.[key];
    if (typeof value === "number") {
      nextState[key] = String(value);
    }
  });
  return nextState;
};

export default function BikeClassRegisterPage() {
  const [className, setClassName] = useState("");
  const [classIdentifier, setClassIdentifier] = useState("");
  const [basePrices, setBasePrices] = useState<Record<DurationPriceKey, string>>(
    () => createEmptyPriceState(durationOptions)
  );
  const [insurancePrices, setInsurancePrices] = useState<
    Record<DurationPriceKey, string>
  >(() => createEmptyPriceState(durationOptions));
  const [extraPrices, setExtraPrices] = useState<Record<ExtraPriceKey, string>>(
    () => createEmptyPriceState(extraDurationOptions)
  );
  const [theftInsurance, setTheftInsurance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const resetFormState = () => {
    setClassName("");
    setClassIdentifier("");
    setBasePrices(createEmptyPriceState(durationOptions));
    setInsurancePrices(createEmptyPriceState(durationOptions));
    setExtraPrices(createEmptyPriceState(extraDurationOptions));
    setTheftInsurance("");
  };

  const applyClassData = (targetClass: BikeClass) => {
    setCurrentClassId(targetClass.classId);
    setClassName(targetClass.className);
    setClassIdentifier(targetClass.class_id ?? "");
    setBasePrices(
      priceStateFromClass(targetClass.base_prices, durationOptions)
    );
    setInsurancePrices(
      priceStateFromClass(targetClass.insurance_prices, durationOptions)
    );
    setExtraPrices(
      priceStateFromClass(targetClass.extra_prices, extraDurationOptions)
    );
    setTheftInsurance(
      typeof targetClass.theft_insurance === "number"
        ? String(targetClass.theft_insurance)
        : ""
    );
  };

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
      resetFormState();
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
          resetFormState();
          return;
        }

        applyClassData(targetClass);
      } catch (loadError) {
        console.error("Failed to load bike class", loadError);
        setError("クラス情報の取得に失敗しました。");
        setCurrentClassId(null);
        resetFormState();
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

    const normalizedIdentifier = classIdentifier.trim()
      ? normalizeClassIdentifier(classIdentifier.trim())
      : undefined;
    if (classIdentifier.trim() && !normalizedIdentifier) {
      setError("ID欄には #1 のように数字を含めて入力してください。");
      return;
    }

    let normalizedBasePrices: Partial<Record<DurationPriceKey, number>> | undefined;
    let normalizedInsurancePrices:
      | Partial<Record<DurationPriceKey, number>>
      | undefined;
    let normalizedExtraPrices:
      | Partial<Record<ExtraPriceKey, number>>
      | undefined;
    const normalizedTheftInsurance = parsePriceValueFromInput(theftInsurance);

    try {
      normalizedBasePrices = priceMapFromState(
        basePrices,
        "基本料金",
        durationOptions
      );
      normalizedInsurancePrices = priceMapFromState(
        insurancePrices,
        "車両保証",
        durationOptions
      );
      normalizedExtraPrices = priceMapFromState(
        extraPrices,
        "追加料金",
        extraDurationOptions
      );
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "金額の入力値を確認してください。"
      );
      return;
    }

    if (normalizedTheftInsurance === null) {
      setError("盗難補償には数値を入力してください。");
      return;
    }

    try {
      const payload = {
        className: className.trim(),
        class_id: normalizedIdentifier,
        base_prices: normalizedBasePrices,
        insurance_prices: normalizedInsurancePrices,
        extra_prices: normalizedExtraPrices,
        theft_insurance: normalizedTheftInsurance ?? undefined,
      };
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
      applyClassData(result);
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
                  <label htmlFor="classIdentifier">ID</label>
                  <input
                    id="classIdentifier"
                    name="classIdentifier"
                    placeholder="例：#1"
                    value={classIdentifier}
                    onChange={(event) => setClassIdentifier(event.target.value)}
                    disabled={isLoading}
                  />
                  <p className={formStyles.hint}>
                    ID #1 と入力すると class_1 として保存されます。
                  </p>
                </div>
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
              <div className={formStyles.field}>
                <label>基本料金</label>
                <div className={formStyles.grid}>
                  {durationOptions.map((option) => (
                    <div className={formStyles.field} key={`base-${option.key}`}>
                      <label htmlFor={`base-${option.key}`}>
                        基本料金{option.label}
                      </label>
                      <input
                        id={`base-${option.key}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={basePrices[option.key]}
                        onChange={(event) =>
                          setBasePrices((current) => ({
                            ...current,
                            [option.key]: event.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={formStyles.field}>
                <label>車両保証</label>
                <div className={formStyles.grid}>
                  {durationOptions.map((option) => (
                    <div
                      className={formStyles.field}
                      key={`insurance-${option.key}`}
                    >
                      <label htmlFor={`insurance-${option.key}`}>
                        車両保証{option.label}
                      </label>
                      <input
                        id={`insurance-${option.key}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={insurancePrices[option.key]}
                        onChange={(event) =>
                          setInsurancePrices((current) => ({
                            ...current,
                            [option.key]: event.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={formStyles.field}>
                <label>追加料金</label>
                <div className={formStyles.grid}>
                  {extraDurationOptions.map((option) => (
                    <div className={formStyles.field} key={`extra-${option.key}`}>
                      <label htmlFor={`extra-${option.key}`}>
                        追加料金{option.label}
                      </label>
                      <input
                        id={`extra-${option.key}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={extraPrices[option.key]}
                        onChange={(event) =>
                          setExtraPrices((current) => ({
                            ...current,
                            [option.key]: event.target.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={formStyles.field}>
                <label htmlFor="theftInsurance">盗難補償</label>
                <input
                  id="theftInsurance"
                  name="theftInsurance"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={theftInsurance}
                  onChange={(event) => setTheftInsurance(event.target.value)}
                  disabled={isLoading}
                />
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

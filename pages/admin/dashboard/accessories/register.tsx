import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { Accessory, AccessoryPriceKey } from "../../../../lib/dashboard/types";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";

const priceLabels: Record<AccessoryPriceKey, string> = {
  "24h": "24時間料金",
  "2d": "2日間料金",
  "4d": "4日間料金",
  "1w": "1週間料金",
};

const createEmptyPriceState = (): Record<AccessoryPriceKey, string> => ({
  "24h": "",
  "2d": "",
  "4d": "",
  "1w": "",
});

const parsePriceInput = (value: string): number | null | undefined => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return undefined;
  }

  const numericValue = Number(normalized);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  return null;
};

const buildPriceMap = (
  prices: Record<AccessoryPriceKey, string>
): Partial<Record<AccessoryPriceKey, number>> => {
  const entries: [AccessoryPriceKey, number][] = [];

  PRICE_KEYS.forEach((key) => {
    const raw = prices[key];
    if (!raw.trim()) {
      return;
    }

    const numericValue = parsePriceInput(raw);
    if (numericValue == null) {
      throw new Error(`${priceLabels[key]}には数値を入力してください。`);
    }

    entries.push([key, numericValue]);
  });

  if (entries.length === 0) {
    throw new Error("料金を1つ以上入力してください。");
  }

  return Object.fromEntries(entries);
};

const mapPricesToState = (
  prices?: Partial<Record<AccessoryPriceKey, number>>
): Record<AccessoryPriceKey, string> => {
  const nextState = createEmptyPriceState();
  PRICE_KEYS.forEach((key) => {
    const value = prices?.[key];
    if (typeof value === "number") {
      nextState[key] = String(value);
    }
  });
  return nextState;
};

export default function AccessoryRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [priceState, setPriceState] = useState<Record<AccessoryPriceKey, string>>(
    createEmptyPriceState
  );
  const [currentAccessoryId, setCurrentAccessoryId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setPriceState(createEmptyPriceState());
    setCurrentAccessoryId(null);
  };

  const applyAccessory = (accessory: Accessory) => {
    setCurrentAccessoryId(accessory.accessory_id);
    setName(accessory.name);
    setPriceState(mapPricesToState(accessory.prices));
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const accessoryIdParam = router.query.accessoryId;
    const accessoryIdValue = Array.isArray(accessoryIdParam)
      ? accessoryIdParam[0]
      : accessoryIdParam;
    const parsedId = accessoryIdValue ? Number(accessoryIdValue) : NaN;

    if (!accessoryIdValue || Number.isNaN(parsedId)) {
      resetForm();
      return;
    }

    const loadAccessory = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await fetch("/api/accessories");
        if (!response.ok) {
          setError("用品情報の取得に失敗しました。");
          resetForm();
          return;
        }

        const items: Accessory[] = await response.json();
        const target = items.find((item) => item.accessory_id === parsedId);
        if (!target) {
          setError("指定された用品が見つかりませんでした。");
          resetForm();
          return;
        }

        applyAccessory(target);
      } catch (loadError) {
        console.error("Failed to load accessory", loadError);
        setError("用品情報の取得に失敗しました。");
        resetForm();
      } finally {
        setIsLoading(false);
      }
    };

    void loadAccessory();
  }, [router.isReady, router.query.accessoryId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("用品名を入力してください。");
      return;
    }

    let prices: Partial<Record<AccessoryPriceKey, number>>;
    try {
      prices = buildPriceMap(priceState);
    } catch (priceError) {
      setError(
        priceError instanceof Error
          ? priceError.message
          : "料金の入力内容を確認してください。"
      );
      return;
    }

    const isEditMode = currentAccessoryId != null;
    const payload = isEditMode
      ? { accessory_id: currentAccessoryId, name: name.trim(), prices }
      : { name: name.trim(), prices };

    try {
      const response = await fetch("/api/accessories", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof (responseData as { message?: unknown }).message === "string"
            ? (responseData as { message?: string }).message ?? ""
            : isEditMode
              ? "用品の更新に失敗しました。"
              : "用品の登録に失敗しました。";
        throw new Error(message || "用品の登録に失敗しました。");
      }

      const accessory: Accessory | null =
        responseData && typeof responseData === "object"
          ? (responseData as Accessory)
          : null;

      if (accessory) {
        applyAccessory(accessory);
      } else if (!isEditMode) {
        resetForm();
      }

      setSuccess(isEditMode ? "用品を更新しました。" : "用品を登録しました。");
    } catch (submitError) {
      console.error("Failed to submit accessory", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditMode
            ? "用品の更新に失敗しました。"
            : "用品の登録に失敗しました。"
      );
    }
  };

  const handlePriceChange = (key: AccessoryPriceKey, value: string) => {
    setPriceState((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <Head>
        <title>用品{currentAccessoryId ? "編集" : "登録"} | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title={`用品${currentAccessoryId ? "編集" : "登録"}`}
        description="レンタル用品の料金を登録・更新できます。"
        showDashboardLink={!currentAccessoryId}
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p className={formStyles.success}>{success}</p>}
          <form className={formStyles.card} onSubmit={handleSubmit}>
            <div className={formStyles.fieldRow}>
              <label className={formStyles.label} htmlFor="accessory-name">
                用品名
              </label>
              <div className={formStyles.inputWrapper}>
                <input
                  id="accessory-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例：グローブ"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={formStyles.fieldGroup}>
              <div className={formStyles.fieldGroupHeader}>
                <h3>料金</h3>
                <p className={formStyles.fieldNote}>
                  金額は数値のみ入力してください（カンマは不要です）。
                </p>
              </div>
              <div className={formStyles.fieldGrid}>
                {PRICE_KEYS.map((key) => (
                  <label key={key} className={formStyles.labelColumn}>
                    <span className={formStyles.label}>{priceLabels[key]}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={priceState[key]}
                      onChange={(event) =>
                        handlePriceChange(key, event.target.value)
                      }
                      placeholder="例：1240"
                      disabled={isLoading}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={formStyles.actions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading
                  ? "送信中..."
                  : currentAccessoryId
                    ? "用品を更新"
                    : "用品を登録"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={resetForm}
                disabled={isLoading}
              >
                入力内容をリセット
              </button>
            </div>
          </form>
        </section>
      </DashboardLayout>
    </>
  );
}

const PRICE_KEYS: AccessoryPriceKey[] = ["24h", "2d", "4d", "1w"];

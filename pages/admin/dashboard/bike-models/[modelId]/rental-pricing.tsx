import Head from "next/head";
import { useRouter } from "next/router";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";
import styles from "../../../../../styles/Dashboard.module.css";
import { BikeModel } from "../../../../../lib/dashboard/types";
import { toNumber } from "../../../../../lib/dashboard/utils";

type VehicleRentalPrice = {
  vehicle_type_id: number;
  days: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
};

type BaseRate = {
  days: number;
  label: string;
  placeholder?: string;
};

type RateOption = {
  days: number;
  label: string;
  price: number;
};

type Plan = {
  cost: number;
  breakdown: string;
};

const MAX_DAYS = 31;

const BASE_RATES: BaseRate[] = [
  { days: 1, label: "24時間", placeholder: "例: 4,000" },
  { days: 2, label: "2日間", placeholder: "例: 7,000" },
  { days: 4, label: "4日間", placeholder: "例: 10,000" },
  { days: 7, label: "1週間", placeholder: "例: 14,000" },
  { days: 14, label: "2週間", placeholder: "例: 23,000" },
  { days: 31, label: "1ヶ月", placeholder: "例: 40,000" },
];

const buildPlans = (options: RateOption[], maxDays: number): (Plan | null)[] => {
  const sorted = [...options].sort((a, b) => a.days - b.days || a.price - b.price);
  const reversed = [...sorted].reverse();
  const plans: (Plan | null)[] = Array.from({ length: maxDays }, () => null);

  for (let day = 1; day <= maxDays; day += 1) {
    const lower = reversed.find((option) => option.days <= day);
    const upper = sorted.find((option) => option.days >= day);

    if (!lower && !upper) {
      plans[day - 1] = null;
      continue;
    }

    const fallbackUpper = upper ?? lower!;
    const fallbackLower = lower ?? upper!;

    const isSameDay = fallbackLower.days === fallbackUpper.days;
    const baseLower = lower ?? fallbackLower;
    const baseUpper = upper ?? fallbackUpper;
    const spanDays = baseUpper.days - baseLower.days;
    const increment = spanDays === 0 ? 0 : (baseUpper.price - baseLower.price) / spanDays;
    const rawPrice = baseLower.price + increment * (day - baseLower.days);
    const roundedPrice = Math.floor(rawPrice / 10) * 10;

    const breakdown = isSameDay
      ? `${baseLower.label}の設定料金`
      : `${baseLower.label}から${baseUpper.label}までを等間隔に調整（1日あたり約${Math.round(
          increment
        ).toLocaleString()}円ずつ増加、10円単位で切り捨て）`;

    plans[day - 1] = { cost: roundedPrice, breakdown };
  }

  return plans;
};

const formatPrice = (price: number | null) =>
  typeof price === "number" ? `${price.toLocaleString()}円` : "-";

export default function BikeModelRentalPricingPage() {
  const router = useRouter();
  const modelIdParam = router.query.modelId;
  const modelId = useMemo(() => {
    const modelIdValue = Array.isArray(modelIdParam) ? modelIdParam[0] : modelIdParam;
    return typeof modelIdValue === "string" ? toNumber(modelIdValue) : undefined;
  }, [modelIdParam]);

  const [model, setModel] = useState<BikeModel | null>(null);
  const [prices, setPrices] = useState<VehicleRentalPrice[]>([]);
  const [baseInputs, setBaseInputs] = useState<Record<number, string>>(() =>
    BASE_RATES.reduce<Record<number, string>>((acc, rate) => {
      acc[rate.days] = "";
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || modelId == null) {
      return;
    }

    const loadModel = async () => {
      try {
        const response = await fetch("/api/bike-models");
        if (!response.ok) {
          setError("車種情報の取得に失敗しました。");
          return;
        }

        const models: BikeModel[] = await response.json();
        const found = models.find((item) => item.modelId === modelId) ?? null;
        if (!found) {
          setError("指定された車種が見つかりません。");
          return;
        }

        setModel(found);
      } catch (loadError) {
        console.error("Failed to load bike model", loadError);
        setError("車種情報の取得に失敗しました。");
      }
    };

    void loadModel();
  }, [modelId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || modelId == null) {
      return;
    }

    const loadPrices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/vehicle-rental-prices?vehicle_type_id=${modelId}`
        );

        if (!response.ok) {
          setError("料金情報の取得に失敗しました。");
          setPrices([]);
          return;
        }

        const items: VehicleRentalPrice[] = await response.json();
        setPrices(items);
      } catch (loadError) {
        console.error("Failed to load rental prices", loadError);
        setError("料金情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPrices();
  }, [modelId, router.isReady]);

  const sortedPrices = useMemo(
    () => [...prices].sort((a, b) => a.days - b.days),
    [prices]
  );

  useEffect(() => {
    if (prices.length === 0) {
      return;
    }

    setBaseInputs((prev) => {
      const next = { ...prev };
      BASE_RATES.forEach(({ days }) => {
        if (prev[days]) {
          return;
        }
        const matched = prices.find((price) => price.days === days);
        if (matched) {
          next[days] = String(matched.price);
        }
      });
      return next;
    });
  }, [prices]);

  const baseOptions = useMemo(() => {
    const options: RateOption[] = [];
    BASE_RATES.forEach(({ days, label }) => {
      const cleaned = baseInputs[days]?.replace(/,/g, "").trim();
      if (!cleaned) {
        return;
      }

      const parsed = Number(cleaned);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        options.push({ days, label, price: parsed });
      }
    });
    return options;
  }, [baseInputs]);

  const autoPlans = useMemo(() => buildPlans(baseOptions, MAX_DAYS), [baseOptions]);

  const handleBaseInputChange = (day: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBaseInputs((prev) => ({ ...prev, [day]: value }));
  };

  const handleSaveAutoPrices = async () => {
    if (isSubmitting) {
      return;
    }

    if (modelId == null) {
      setError("車種IDを正しく指定してください。");
      return;
    }

    const computed = autoPlans
      .map((plan, index) => (plan ? { days: index + 1, price: plan.cost } : null))
      .filter((item): item is { days: number; price: number } => item != null);

    if (computed.length === 0) {
      setError("自動計算できる料金がありません。基準料金を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updated: VehicleRentalPrice[] = [];
      for (const entry of computed) {
        const response = await fetch("/api/vehicle-rental-prices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicle_type_id: modelId,
            days: entry.days,
            price: entry.price,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message ?? "料金の保存に失敗しました。");
        }

        const item: VehicleRentalPrice = await response.json();
        updated.push(item);
      }

      setPrices((prev) => {
        const targetDays = new Set(updated.map((item) => item.days));
        const others = prev.filter((price) => !targetDays.has(price.days));
        return [...others, ...updated];
      });
      setSuccess("自動計算した料金を保存しました。");
    } catch (submitError) {
      console.error("Failed to save rental price", submitError);
      setError(submitError instanceof Error ? submitError.message : "料金の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (price: VehicleRentalPrice) => {
    if (isSubmitting) {
      return;
    }

    if (!window.confirm(`${price.days}日目の料金を削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vehicle-rental-prices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type_id: price.vehicle_type_id,
          days: price.days,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message ?? "料金の削除に失敗しました。");
        return;
      }

      setPrices((prev) => prev.filter((item) => item.days !== price.days));
      setSuccess("料金を削除しました。");
    } catch (deleteError) {
      console.error("Failed to delete rental price", deleteError);
      setError("料金の削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyToBase = (price: VehicleRentalPrice) => {
    setBaseInputs((prev) => ({ ...prev, [price.days]: String(price.price) }));
  };

  if (modelId == null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>日毎料金設定 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title={model ? `${model.modelName}の日毎料金設定` : "日毎料金設定"}
        actions={[
          { label: "車種詳細へ戻る", href: `/admin/dashboard/bike-models/${modelId}` },
          { label: "車種一覧へ", href: "/admin/dashboard/bike-models" },
        ]}
      >
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>日毎の料金設定</h1>
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p className={formStyles.success}>{success}</p>}
          {model && (
            <div className={formStyles.card}>
              <div className={formStyles.body}>
                <h2 className={styles.sectionTitle}>車種情報</h2>
                <dl className={styles.definitionList}>
                  <div className={styles.definitionItem}>
                    <dt>車種ID</dt>
                    <dd>{model.modelId}</dd>
                  </div>
                  <div className={styles.definitionItem}>
                    <dt>車種名</dt>
                    <dd>{model.modelName}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div className={formStyles.card}>
            <div className={formStyles.body}>
              <h2 className={styles.sectionTitle}>基準となる日数の料金を入力</h2>
              <p className={formStyles.hint}>
                1, 2, 4, 7, 14, 31日目の料金を入力すると、残りの日数は
                <a
                  href="https://yasukaribike.com/admin/dashboard/bike-classes/1/monthly-pricing"
                  target="_blank"
                  rel="noreferrer"
                >
                  1ヶ月料金表
                </a>
                と同じ計算方法で自動補完されます（10円単位で切り捨て）。
              </p>
              <div className={formStyles.fields}>
                {BASE_RATES.map((rate) => (
                  <div className={formStyles.fieldRow} key={rate.days}>
                    <label className={formStyles.label} htmlFor={`base-${rate.days}`}>
                      {rate.label}
                    </label>
                    <div className={formStyles.inputGroup}>
                      <input
                        id={`base-${rate.days}`}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={baseInputs[rate.days] ?? ""}
                        placeholder={rate.placeholder}
                        onChange={handleBaseInputChange(rate.days)}
                        className={formStyles.input}
                      />
                      <span className={formStyles.inlineAddon}>円</span>
                    </div>
                    <p className={formStyles.hint}>{rate.days}日目の料金</p>
                  </div>
                ))}
              </div>
              <div className={formStyles.actions}>
                <button
                  type="button"
                  className={formStyles.submit}
                  onClick={() => void handleSaveAutoPrices()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "計算結果を保存中..." : "自動計算した料金を保存"}
                </button>
              </div>
            </div>
          </div>

          <div className={formStyles.card}>
            <div className={formStyles.body}>
              <h2 className={styles.sectionTitle}>自動計算結果（プレビュー）</h2>
              <p className={formStyles.hint}>
                上記の基準料金をもとに1日目〜31日目までを等間隔で補完した結果です。保存すると料金テーブルに反映されます。
              </p>
              <div className={tableStyles.wrapper}>
                <div className={tableStyles.tableWrapper}>
                  <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                    <thead>
                      <tr>
                        <th scope="col">日数</th>
                        <th scope="col">料金</th>
                        <th scope="col">内訳</th>
                      </tr>
                    </thead>
                    <tbody>
                      {autoPlans.every((plan) => plan == null) && (
                        <tr>
                          <td colSpan={3}>計算できる基準料金がありません。</td>
                        </tr>
                      )}
                      {autoPlans.map((plan, index) => (
                        <tr key={index + 1}>
                          <td>{index + 1}日目</td>
                          <td>{formatPrice(plan?.cost ?? null)}</td>
                          <td>{plan ? plan.breakdown : "基準料金を入力してください"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className={formStyles.card}>
            <div className={formStyles.body}>
              <h2 className={styles.sectionTitle}>設定済みの料金</h2>
              {isLoading && <p className={formStyles.hint}>読み込み中です…</p>}
              {!isLoading && sortedPrices.length === 0 && (
                <p className={formStyles.hint}>まだ料金が登録されていません。</p>
              )}
              {!isLoading && sortedPrices.length > 0 && (
                <div className={tableStyles.wrapper}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th scope="col">日数</th>
                        <th scope="col">料金</th>
                        <th scope="col">更新日</th>
                        <th scope="col" className={tableStyles.actions}>
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPrices.map((price) => (
                        <tr key={`${price.vehicle_type_id}-${price.days}`}>
                          <td>{price.days}日目</td>
                          <td>{price.price.toLocaleString()}円</td>
                          <td>{price.updatedAt ? new Date(price.updatedAt).toLocaleString() : "-"}</td>
                          <td className={tableStyles.actions}>
                            <button
                              type="button"
                              className={styles.tableToolbarButton}
                              onClick={() => handleApplyToBase(price)}
                              disabled={isSubmitting}
                            >
                              基準に反映
                            </button>
                            <button
                              type="button"
                              className={styles.tableToolbarButton}
                              onClick={() => void handleDelete(price)}
                              disabled={isSubmitting}
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

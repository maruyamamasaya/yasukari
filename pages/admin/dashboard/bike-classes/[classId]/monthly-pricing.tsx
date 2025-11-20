import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";
import styles from "../../../../../styles/Dashboard.module.css";
import { BikeClass, DurationPriceKey, ExtraPriceKey } from "../../../../../lib/dashboard/types";

type RateOption = {
  days: number;
  label: string;
  price: number;
};

type Plan = {
  cost: number;
  usage: RateOption[];
};

const durationLabels: Record<DurationPriceKey, string> = {
  "24h": "24時間",
  "2d": "2日間",
  "4d": "4日間",
  "1w": "1週間",
  "2w": "2週間",
  "1m": "1ヶ月",
};

const durationDays: Record<DurationPriceKey, number> = {
  "24h": 1,
  "2d": 2,
  "4d": 4,
  "1w": 7,
  "2w": 14,
  "1m": 31,
};

const extraDurationDays: Record<ExtraPriceKey, number> = {
  "24h": 1,
};

const EXTRA_PRICE_LABEL: Record<ExtraPriceKey, string> = {
  "24h": "追加料金 (24時間)",
};

const MAX_DAYS = 31;

const buildRateOptions = (bikeClass: BikeClass): RateOption[] => {
  const options: RateOption[] = [];

  (Object.entries(bikeClass.base_prices ?? {}) as [DurationPriceKey, number][]) 
    .forEach(([key, price]) => {
      if (typeof price === "number" && Number.isFinite(price)) {
        options.push({
          days: durationDays[key],
          label: durationLabels[key],
          price,
        });
      }
    });

  (Object.entries(bikeClass.extra_prices ?? {}) as [ExtraPriceKey, number][]) 
    .forEach(([key, price]) => {
      if (typeof price === "number" && Number.isFinite(price)) {
        options.push({
          days: extraDurationDays[key],
          label: EXTRA_PRICE_LABEL[key],
          price,
        });
      }
    });

  return options.sort((a, b) => a.days - b.days || a.price - b.price);
};

const buildPlans = (options: RateOption[], maxDays: number): (Plan | null)[] => {
  const plans: (Plan | null)[] = Array.from({ length: maxDays + 1 }, () => null);
  plans[0] = { cost: 0, usage: [] };

  for (let day = 1; day <= maxDays; day += 1) {
    let bestPlan: Plan | null = null;

    options.forEach((option) => {
      if (option.days > day) return;
      const previous = plans[day - option.days];
      if (!previous) return;

      const nextCost = previous.cost + option.price;
      if (!bestPlan || nextCost < bestPlan.cost) {
        bestPlan = { cost: nextCost, usage: [...previous.usage, option] };
      }
    });

    plans[day] = bestPlan;
  }

  return plans;
};

const formatUsage = (usage: RateOption[]) => {
  const counts = usage.reduce<Record<string, { count: number; days: number }>>(
    (map, option) => {
      const current = map[option.label];
      map[option.label] = {
        count: (current?.count ?? 0) + 1,
        days: option.days,
      };
      return map;
    },
    {}
  );

  return Object.entries(counts)
    .map(([label, { count }]) => `${label}×${count}`)
    .join(" + ");
};

const formatPrice = (price: number | null) =>
  typeof price === "number" ? `${price.toLocaleString()}円` : "-";

export default function BikeClassMonthlyPricingPage() {
  const router = useRouter();
  const [bikeClass, setBikeClass] = useState<BikeClass | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const classIdParam = router.query.classId;
    const classIdValue = Array.isArray(classIdParam) ? classIdParam[0] : classIdParam;
    const parsedId = classIdValue ? Number(classIdValue) : NaN;

    if (!classIdValue || Number.isNaN(parsedId)) {
      setError("クラスIDを正しく指定してください。");
      return;
    }

    const loadClass = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setError("クラス情報の取得に失敗しました。");
          return;
        }

        const classes: BikeClass[] = await response.json();
        const target = classes.find((item) => item.classId === parsedId);

        if (!target) {
          setError("指定されたクラスが見つかりませんでした。");
          return;
        }

        setBikeClass(target);
      } catch (loadError) {
        console.error("Failed to load bike class", loadError);
        setError("クラス情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void loadClass();
  }, [router.isReady, router.query.classId]);

  const dailyPlans = useMemo(() => {
    if (!bikeClass) {
      return [];
    }

    const options = buildRateOptions(bikeClass);
    if (options.length === 0) {
      return [];
    }

    const plans = buildPlans(options, MAX_DAYS);

    return plans.slice(1).map((plan, index) => ({
      day: index + 1,
      plan,
    }));
  }, [bikeClass]);

  return (
    <>
      <Head>
        <title>1ヶ月料金表 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title={bikeClass ? `${bikeClass.className}の1ヶ月料金表` : "1ヶ月料金表"}
        actions={[
          { label: "クラス一覧へ戻る", href: "/admin/dashboard/bike-classes" },
          bikeClass
            ? {
                label: "クラスを編集",
                href: `/admin/dashboard/bike-classes/register?classId=${bikeClass.classId}`,
              }
            : undefined,
        ].filter(Boolean) as { label: string; href: string }[]}
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          {!error && isLoading && <p className={formStyles.hint}>読み込み中です…</p>}
          {bikeClass && (
            <>
              <div className={formStyles.card}>
                <div className={formStyles.body}>
                  <h2 className={styles.sectionTitle}>クラス情報</h2>
                  <dl className={styles.definitionList}>
                    <div className={styles.definitionItem}>
                      <dt>クラスID</dt>
                      <dd>{bikeClass.classId}</dd>
                    </div>
                    <div className={styles.definitionItem}>
                      <dt>クラス名</dt>
                      <dd>{bikeClass.className}</dd>
                    </div>
                  </dl>
                  <p className={formStyles.hint}>
                    スポット料金と追加料金を組み合わせ、1日〜31日までの最安料金を自動計算しています。
                  </p>
                </div>
              </div>

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
                      {dailyPlans.length === 0 && (
                        <tr>
                          <td colSpan={3}>料金計算に必要なデータが不足しています。</td>
                        </tr>
                      )}
                      {dailyPlans.map(({ day, plan }) => (
                        <tr key={day}>
                          <td>{day}日</td>
                          <td>{formatPrice(plan?.cost ?? null)}</td>
                          <td>
                            {plan ? formatUsage(plan.usage) : "計算できませんでした"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}

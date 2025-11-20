import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";
import styles from "../../../../../styles/Dashboard.module.css";
import { BikeClass, DurationPriceKey } from "../../../../../lib/dashboard/types";

type RateOption = {
  days: number;
  label: string;
  price: number;
};

type Plan = {
  cost: number;
  breakdown: string;
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

  return options.sort((a, b) => a.days - b.days || a.price - b.price);
};

const buildPlans = (options: RateOption[], maxDays: number): (Plan | null)[] => {
  const sorted = [...options].sort((a, b) => a.days - b.days || a.price - b.price);
  const reversed = [...sorted].reverse();
  const plans: (Plan | null)[] = Array.from({ length: maxDays + 1 }, () => null);

  for (let day = 1; day <= maxDays; day += 1) {
    const lower = reversed.find((option) => option.days <= day);
    const upper = sorted.find((option) => option.days >= day);

    if (!lower && !upper) {
      plans[day] = null;
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

    plans[day] = { cost: roundedPrice, breakdown };
  }

  return plans;
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
                    設定されたスポット料金をもとに、区間ごとに等間隔で補間した1日〜31日の料金を表示します（10円単位で切り捨て）。
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
                          <td>{plan ? plan.breakdown : "計算できませんでした"}</td>
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

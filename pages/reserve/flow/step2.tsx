import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import type { Accessory, AccessoryPriceKey } from "../../../lib/dashboard/types";
import type { CouponRule } from "../../../lib/dashboard/types";

type AddOn = {
  key: string;
  label: string;
  price?: number;
};

const vehicleProtectionOptions: AddOn[] = [
  { key: "vehicle", label: "車両補償", price: 1650 },
  { key: "theft", label: "盗難補償", price: 1100 },
];

const ACCESSORY_DISPLAY_ORDER: Array<{ key: string; label: string }> = [
  { key: "halfCap", label: "半キャップ" },
  { key: "jetHelmet", label: "ジェットヘル" },
  { key: "brandHelmet", label: "ブランド・ヘルメット" },
  { key: "glove", label: "グローブ" },
];

const HELMET_ACCESSORY_KEYS = new Set(["halfCap", "jetHelmet", "brandHelmet"]);

const defaultFees = {
  rental: 3980,
  highSeason: 1100,
  couponDiscount: 0,
};

const formatAccessoryPrice = (price?: number) => `${(price ?? 0).toLocaleString()}円`;
const formatAccessoryTablePrice = (price?: number) =>
  typeof price === "number" ? `${price.toLocaleString()}円` : "—";

const accessoryTableColumns = [
  { label: "1日", keys: ["1d", "24h"] },
  { label: "3日", keys: ["3d", "2d", "4d"] },
  { label: "1週間", keys: ["1w"] },
  { label: "2週間", keys: ["2w"] },
  { label: "1ヶ月", keys: ["1m"] },
  { label: "遅延1日につき", keys: ["late", "late_1d"] },
] as const;

const getAccessoryTablePrice = (
  prices: Accessory["prices"],
  keys: readonly string[]
) => {
  const priceMap = prices as Record<string, number | undefined>;
  return keys
    .map((key) => priceMap[key])
    .find((value) => typeof value === "number");
};

const getHelmetSelectedTotal = (selection: Record<string, number>) =>
  Array.from(HELMET_ACCESSORY_KEYS).reduce(
    (total, key) => total + (selection[key] ?? 0),
    0
  );

export default function ReserveFlowStep2() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [accessoryError, setAccessoryError] = useState<string | null>(null);

  const [store, setStore] = useState("足立小台店");
  const [modelName, setModelName] = useState("車両");
  const [pickupDate, setPickupDate] = useState("2025-12-26");
  const [returnDate, setReturnDate] = useState("2025-12-27");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [managementNumber, setManagementNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(defaultFees.couponDiscount);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [rentalFee, setRentalFee] = useState(defaultFees.rental);
  const [rentalFeeError, setRentalFeeError] = useState<string | null>(null);

  const [protectionSelection, setProtectionSelection] = useState(() =>
    vehicleProtectionOptions.reduce<Record<string, boolean>>((acc, option) => {
      acc[option.key] = true;
      return acc;
    }, {})
  );

  const [accessorySelection, setAccessorySelection] = useState(() =>
    ACCESSORY_DISPLAY_ORDER.reduce<Record<string, number>>((acc, option) => {
      acc[option.key] = 0;
      return acc;
    }, {})
  );

  const helmetSelectionTotal = useMemo(
    () => getHelmetSelectedTotal(accessorySelection),
    [accessorySelection]
  );

  useEffect(() => {
    const controller = new AbortController();
    const verifySession = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to verify session");
        }

        const data = (await response.json().catch(() => ({}))) as {
          user?: { id?: string } | null;
        };

        if (!data.user) {
          await router.replace("/login");
          return;
        }

        setAuthChecked(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setAuthError("ログイン状態の確認に失敗しました。時間をおいて再度お試しください。");
          setAuthChecked(true);
        }
      }
    };

    void verifySession();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;

    const params = router.query;
    if (typeof params.store === "string" && params.store) setStore(params.store);
    if (typeof params.modelName === "string" && params.modelName) setModelName(params.modelName);
    if (typeof params.managementNumber === "string") setManagementNumber(params.managementNumber);
    if (typeof params.pickupDate === "string" && params.pickupDate) setPickupDate(params.pickupDate);
    if (typeof params.returnDate === "string" && params.returnDate) setReturnDate(params.returnDate);
    if (typeof params.pickupTime === "string" && params.pickupTime) setPickupTime(params.pickupTime);
    if (typeof params.returnTime === "string" && params.returnTime) setReturnTime(params.returnTime);
  }, [router.isReady, router.query]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAccessories = async () => {
      try {
        const response = await fetch("/api/accessories", { signal: controller.signal });

        if (!response.ok) {
          throw new Error("用品オプションの取得に失敗しました。");
        }

        const data: Accessory[] = await response.json();
        setAccessories(data);
        setAccessoryError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load accessories", error);
        setAccessoryError("用品オプションの取得に失敗しました。");
      }
    };

    void loadAccessories();

    return () => controller.abort();
  }, []);

  const rentalPriceKey = useMemo<AccessoryPriceKey>(() => {
    const pickup = pickupTime ? `${pickupTime}:00` : "00:00:00";
    const returnAt = returnTime ? `${returnTime}:00` : "00:00:00";

    const pickupDateTime = new Date(`${pickupDate}T${pickup}`);
    const returnDateTime = new Date(`${returnDate}T${returnAt}`);

    const diffMs = returnDateTime.getTime() - pickupDateTime.getTime();
    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return "24h";
    }

    const hours = diffMs / (1000 * 60 * 60);
    if (hours <= 24) return "24h";
    if (hours <= 48) return "2d";
    if (hours <= 96) return "4d";
    return "1w";
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const rentalDays = useMemo(() => {
    const pickup = pickupTime ? `${pickupTime}:00` : "00:00:00";
    const returnAt = returnTime ? `${returnTime}:00` : "00:00:00";

    const pickupDateTime = new Date(`${pickupDate}T${pickup}`);
    const returnDateTime = new Date(`${returnDate}T${returnAt}`);

    const diffMs = returnDateTime.getTime() - pickupDateTime.getTime();
    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return 1;
    }

    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(1, Math.ceil(hours / 24));
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const selectedProtectionFee = useMemo(
    () =>
      vehicleProtectionOptions.reduce((total, option) => {
        return protectionSelection[option.key] ? total + (option.price ?? 0) : total;
      }, 0),
    [protectionSelection]
  );

  const accessoryOptions = useMemo<AddOn[]>(() => {
    const accessoryMap = new Map(accessories.map((accessory) => [accessory.name, accessory]));

    return ACCESSORY_DISPLAY_ORDER.map((option) => {
      const accessory = accessoryMap.get(option.label);
      const price = accessory?.prices?.[rentalPriceKey];

      return {
        ...option,
        price,
      };
    });
  }, [accessories, rentalPriceKey]);

  const selectedAccessoryFee = useMemo(
    () =>
      accessoryOptions.reduce((total, option) => {
        const selectedCount = accessorySelection[option.key] ?? 0;
        return total + (option.price ?? 0) * selectedCount;
      }, 0),
    [accessoryOptions, accessorySelection]
  );

  const highSeasonFee = defaultFees.highSeason;
  const totalAmount = rentalFee + selectedAccessoryFee + selectedProtectionFee + highSeasonFee - couponDiscount;

  const formatDateLabel = (dateString: string, fallback: string) => {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return fallback;

    return parsed.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const pickupLabel = formatDateLabel(pickupDate, "2025年12月26日");
  const returnLabel = formatDateLabel(returnDate, "2025年12月27日");

  const toggleProtection = (key: string) => {
    setProtectionSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isCouponActive = (coupon: CouponRule, now: Date) => {
    const start = new Date(`${coupon.start_date}T00:00:00`);
    const end = new Date(`${coupon.end_date}T23:59:59`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    return now >= start && now <= end;
  };

  const calculateCouponDiscount = (coupon: CouponRule, baseAmount: number) => {
    if (typeof coupon.discount_amount === "number") {
      return Math.min(coupon.discount_amount, baseAmount);
    }
    if (typeof coupon.discount_percentage === "number") {
      return Math.min(Math.round((baseAmount * coupon.discount_percentage) / 100), baseAmount);
    }
    return 0;
  };

  const handleApplyCoupon = async () => {
    const trimmedCode = couponCode.trim();
    setCouponMessage(null);
    if (!trimmedCode) {
      setCouponError("クーポンコードを入力してください。");
      setCouponDiscount(0);
      return;
    }

    try {
      const response = await fetch("/api/coupon-rules");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }

      const coupons = (await response.json()) as CouponRule[];
      const matched = coupons.find((coupon) => coupon.coupon_code === trimmedCode);
      if (!matched) {
        setCouponError("クーポンコードが見つかりません。");
        setCouponDiscount(0);
        return;
      }

      const now = new Date();
      if (!isCouponActive(matched, now)) {
        setCouponError("クーポンの適用期間外です。");
        setCouponDiscount(0);
        return;
      }

      const baseAmount = rentalFee + selectedAccessoryFee + selectedProtectionFee + highSeasonFee;
      const discount = calculateCouponDiscount(matched, baseAmount);
      if (discount <= 0) {
        setCouponError("クーポンの割引額を計算できませんでした。");
        setCouponDiscount(0);
        return;
      }

      setCouponDiscount(discount);
      setCouponError(null);
      setCouponMessage("クーポンを適用しました。");
    } catch (error) {
      console.error("Failed to apply coupon", error);
      setCouponError("クーポンの適用に失敗しました。時間をおいて再度お試しください。");
      setCouponDiscount(0);
    }
  };

  useEffect(() => {
    if (!managementNumber) return;

    const controller = new AbortController();

    const loadRentalFee = async () => {
      try {
        const vehicleResponse = await fetch(`/api/vehicles/${managementNumber}`, {
          signal: controller.signal,
        });

        if (!vehicleResponse.ok) {
          throw new Error("Failed to load vehicle");
        }

        const vehicleData = (await vehicleResponse.json()) as { modelId?: number };
        if (!vehicleData.modelId) {
          throw new Error("Vehicle model not found");
        }

        const pricesResponse = await fetch(
          `/api/vehicle-rental-prices?vehicle_type_id=${vehicleData.modelId}`,
          { signal: controller.signal }
        );

        if (!pricesResponse.ok) {
          throw new Error("Failed to load rental prices");
        }

        const prices = (await pricesResponse.json()) as Array<{
          days: number;
          price: number;
        }>;
        const matched = prices.find((item) => item.days === rentalDays);

        if (matched?.price != null) {
          setRentalFee(matched.price);
          setRentalFeeError(null);
          return;
        }

        if (rentalDays > 31) {
          const monthPrice = prices.find((item) => item.days === 31)?.price;
          if (monthPrice != null) {
            const dailyRate = monthPrice / 31;
            const prorated = Math.round(dailyRate * rentalDays);
            setRentalFee(prorated);
            setRentalFeeError(null);
            return;
          }
        }

        setRentalFee(defaultFees.rental);
        setRentalFeeError("レンタル料金が設定されていません。");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load rental fee", error);
        setRentalFee(defaultFees.rental);
        setRentalFeeError("レンタル料金の取得に失敗しました。");
      }
    };

    void loadRentalFee();

    return () => controller.abort();
  }, [managementNumber, rentalDays]);

  const handleNext = () => {
    const params = new URLSearchParams({
      store,
      modelName,
      managementNumber,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      couponCode,
      couponDiscount: couponDiscount.toString(),
      accessoryTotal: selectedAccessoryFee.toString(),
      protectionTotal: selectedProtectionFee.toString(),
      totalAmount: totalAmount.toString(),
    });

    vehicleProtectionOptions.forEach((option) => {
      params.append(option.key, protectionSelection[option.key] ? "1" : "0");
    });

    accessoryOptions.forEach((option) => {
      params.append(option.key, String(accessorySelection[option.key] ?? 0));
    });

    void router.push(`/reserve/flow/step3?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      store,
      modelName,
      managementNumber,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
    });

    void router.push(`/reserve/flow/step1?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <title>オプション選択 - ステップ2</title>
      </Head>
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Step 2 / 3</p>
              <h1 className="text-2xl font-bold text-gray-900">オプションの選択</h1>
              <p className="text-sm text-gray-600">補償と用品オプションを選択し、お見積りを確認してください。</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
              >
                戻る
              </button>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
              >
                車種一覧に戻る
              </Link>
            </div>
          </header>

          {authError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</p>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">貸出・返却日時</p>
                    <h2 className="text-lg font-bold text-gray-900">{pickupLabel} {pickupTime} → {returnLabel} {returnTime}</h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{store}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">補償オプションの選択</h3>
                  <span className="text-xs text-gray-500">必須ではありません</span>
                </div>
                <div className="space-y-3">
                  {vehicleProtectionOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-600">あり / なし を切り替えできます</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {(option.price ?? 0).toLocaleString()}円
                        </span>
                        <input
                          type="checkbox"
                          checked={protectionSelection[option.key]}
                          onChange={() => toggleProtection(option.key)}
                          className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">用品オプションの選択</h3>
                  <span className="text-xs text-gray-500">必要なものを選択</span>
                </div>
                <p className="text-xs text-gray-500">
                  オプション：1種類あたり2個まで / ヘルメット合計2個まで
                </p>
                <a
                  href="https://yasukari.com/options"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  用品オプションの説明はこちら
                </a>
                {accessoryError ? (
                  <p className="text-xs text-red-600">{accessoryError}</p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  {accessoryOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{formatAccessoryPrice(option.price)}</span>
                        {(() => {
                          const isHelmetAccessory = HELMET_ACCESSORY_KEYS.has(option.key);
                          const currentValue = accessorySelection[option.key] ?? 0;
                          const otherHelmetCount = isHelmetAccessory
                            ? helmetSelectionTotal - currentValue
                            : helmetSelectionTotal;
                          const remainingHelmetSlots = Math.max(0, 2 - otherHelmetCount);
                          const maxSelectable = isHelmetAccessory
                            ? Math.min(2, remainingHelmetSlots)
                            : 2;
                          const selectableCounts = Array.from(
                            { length: maxSelectable + 1 },
                            (_, index) => index
                          );

                          return (
                        <select
                          value={accessorySelection[option.key]}
                          onChange={(event) => {
                            const selected = Number(event.target.value);
                            setAccessorySelection((prev) => ({
                              ...prev,
                              [option.key]: (() => {
                                const parsed = Number.isNaN(selected)
                                  ? 0
                                  : Math.min(2, Math.max(0, selected));

                                if (!HELMET_ACCESSORY_KEYS.has(option.key)) {
                                  return parsed;
                                }

                                const currentHelmetValue = prev[option.key] ?? 0;
                                const otherHelmets = getHelmetSelectedTotal(prev) - currentHelmetValue;
                                return Math.min(parsed, Math.max(0, 2 - otherHelmets));
                              })(),
                            }));
                          }}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          aria-label={`${option.label}の個数`}
                        >
                            {selectableCounts.map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                          );
                        })()}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <img
                    src="https://yasukari-file.s3.ap-northeast-1.amazonaws.com/PhotoUploads/1767026374539-623432f1-b568-4baa-ac07-b18b108d8751-rentalitem.jpg"
                    alt="用品オプションの説明"
                    className="w-full rounded-xl border border-gray-100 object-cover"
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">用品一覧</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-700">
                        <thead className="border-b border-gray-200 text-[11px] font-semibold text-gray-500">
                          <tr>
                            <th className="px-3 py-2">レンタルオプション</th>
                            {accessoryTableColumns.map((column) => (
                              <th key={column.label} className="px-3 py-2">
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {accessories.map((accessory) => (
                            <tr key={accessory.accessory_id}>
                              <td className="px-3 py-2 font-semibold text-gray-900">
                                {accessory.name}
                              </td>
                              {accessoryTableColumns.map((column) => (
                                <td key={column.label} className="px-3 py-2">
                                  {formatAccessoryTablePrice(
                                    getAccessoryTablePrice(accessory.prices, column.keys)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {accessories.length === 0 ? (
                            <tr>
                              <td
                                colSpan={accessoryTableColumns.length + 1}
                                className="px-3 py-3 text-center text-gray-500"
                              >
                                用品一覧のデータがありません。
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">割引クーポン</h3>
                  <span className="text-xs text-gray-500">任意入力</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="クーポン・コード"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError(null);
                      setCouponMessage(null);
                      setCouponDiscount(0);
                    }}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
                  >
                    適用する
                  </button>
                </div>
                {couponError ? (
                  <p className="text-xs text-red-600">{couponError}</p>
                ) : couponMessage ? (
                  <p className="text-xs text-emerald-600">{couponMessage}</p>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">お見積り</p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">2 / 3</span>
                </div>
                <dl className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">バイクレンタル料金</dt>
                    <dd className="font-semibold text-gray-900">{rentalFee.toLocaleString()}円</dd>
                  </div>
                  {rentalFeeError ? (
                    <p className="text-xs text-red-600">{rentalFeeError}</p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">用品オプション料金</dt>
                    <dd className="font-semibold text-gray-900">{selectedAccessoryFee.toLocaleString()}円</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">補償オプション料金</dt>
                    <dd className="font-semibold text-gray-900">{selectedProtectionFee.toLocaleString()}円</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">ハイシーズン追加料金</dt>
                    <dd className="font-semibold text-gray-900">{highSeasonFee.toLocaleString()}円</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">クーポン割引額</dt>
                    <dd className="font-semibold text-gray-900">-{couponDiscount.toLocaleString()}円</dd>
                  </div>
                </dl>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>レンタル料金合計（税込）</span>
                    <span>{totalAmount.toLocaleString()}円</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  ※ ゴールデンウィーク、お盆休み、年末年始の期間は１日につき550円の追加料金を頂戴します。
                  <br />
                  ※ お支払いはクレジットカード決済のみとなります。
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!authChecked}
                  className="inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-600 transition disabled:cursor-not-allowed disabled:bg-red-200"
                >
                  決済情報の入力へ
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

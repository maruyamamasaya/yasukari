import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import type { Accessory, AccessoryPriceKey } from "../../../lib/dashboard/types";

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

const defaultFees = {
  rental: 3980,
  highSeason: 1100,
  couponDiscount: 0,
};

const formatAccessoryPrice = (price?: number) =>
  typeof price === "number" ? `${price.toLocaleString()}円` : "料金未設定";

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

  const [protectionSelection, setProtectionSelection] = useState(() =>
    vehicleProtectionOptions.reduce<Record<string, boolean>>((acc, option) => {
      acc[option.key] = true;
      return acc;
    }, {})
  );

  const [accessorySelection, setAccessorySelection] = useState(() =>
    ACCESSORY_DISPLAY_ORDER.reduce<Record<string, boolean>>((acc, option) => {
      acc[option.key] = false;
      return acc;
    }, {})
  );

  useEffect(() => {
    const controller = new AbortController();
    const verifySession = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to verify session");
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

  const selectedProtectionFee = useMemo(
    () =>
      vehicleProtectionOptions.reduce((total, option) => {
        return protectionSelection[option.key] ? total + option.price : total;
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
        return accessorySelection[option.key] ? total + (option.price ?? 0) : total;
      }, 0),
    [accessoryOptions, accessorySelection]
  );

  const rentalFee = defaultFees.rental;
  const highSeasonFee = defaultFees.highSeason;
  const couponDiscount = defaultFees.couponDiscount;

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

  const toggleAccessory = (key: string) => {
    setAccessorySelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
      accessoryTotal: selectedAccessoryFee.toString(),
      protectionTotal: selectedProtectionFee.toString(),
      totalAmount: totalAmount.toString(),
    });

    vehicleProtectionOptions.forEach((option) => {
      params.append(option.key, protectionSelection[option.key] ? "1" : "0");
    });

    accessoryOptions.forEach((option) => {
      params.append(option.key, accessorySelection[option.key] ? "1" : "0");
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
                        <span className="text-sm font-semibold text-gray-900">{option.price.toLocaleString()}円</span>
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
                        <p className="text-xs text-gray-600">あり / なし を切り替えできます</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{formatAccessoryPrice(option.price)}</span>
                        <input
                          type="checkbox"
                          checked={accessorySelection[option.key]}
                          onChange={() => toggleAccessory(option.key)}
                          className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                      </div>
                    </label>
                  ))}
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
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
                  >
                    適用する
                  </button>
                </div>
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

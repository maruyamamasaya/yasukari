import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

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

export default function ReserveFlowStep3() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [store, setStore] = useState("足立小台店");
  const [pickupDate, setPickupDate] = useState("2025-12-26");
  const [returnDate, setReturnDate] = useState("2025-12-27");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [totalAmount, setTotalAmount] = useState(7830);

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
    if (typeof params.pickupDate === "string" && params.pickupDate) setPickupDate(params.pickupDate);
    if (typeof params.returnDate === "string" && params.returnDate) setReturnDate(params.returnDate);
    if (typeof params.pickupTime === "string" && params.pickupTime) setPickupTime(params.pickupTime);
    if (typeof params.returnTime === "string" && params.returnTime) setReturnTime(params.returnTime);
    if (typeof params.totalAmount === "string") {
      const parsed = Number(params.totalAmount);
      if (!Number.isNaN(parsed)) setTotalAmount(parsed);
    }
  }, [router.isReady, router.query]);

  const pickupLabel = useMemo(() => formatDateLabel(pickupDate, "2025年12月26日"), [pickupDate]);
  const returnLabel = useMemo(() => formatDateLabel(returnDate, "2025年12月27日"), [returnDate]);

  const payJpPublicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "pk_test_sample";

  const handlePayWithCard = () => {
    setStatusMessage(
      `Pay.JPの公開鍵(${payJpPublicKey})を使ってトークン化を行う処理をここに実装してください。現在はサンプルです。`
    );
  };

  const handleSubmitPayment = () => {
    setStatusMessage("決済フローのサンプルです。Pay.JPのトークン生成後にAPIへ送信してください。");
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      store,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      totalAmount: totalAmount.toString(),
    });

    void router.push(`/reserve/flow/step2?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <title>決済情報の入力 - ステップ3</title>
      </Head>
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Step 3 / 3</p>
              <h1 className="text-2xl font-bold text-gray-900">決済情報の入力</h1>
              <p className="text-sm text-gray-600">Pay.JP API を用いた決済入力のサンプル画面です。</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
            >
              車種一覧に戻る
            </Link>
          </header>

          {authError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</p>
          ) : null}

          <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">貸出・返却日時</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    {pickupLabel} {pickupTime} → {returnLabel} {returnTime}
                  </h2>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{store}</span>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                  <span>レンタル料金 合計（税込）</span>
                  <span>{totalAmount.toLocaleString()}円</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">クレジットカード情報入力</h3>
                <span className="text-xs text-gray-500">Pay.JP サンプル</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-gray-700">カード番号</span>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-gray-700">有効期限 (MM/YY)</span>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/25"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-gray-700">セキュリティコード</span>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                  />
                </label>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p>Pay.JP の公開鍵: {payJpPublicKey}</p>
                <p className="mt-1 text-gray-600">
                  NEXT_PUBLIC_PAYJP_PUBLIC_KEY を環境変数として設定すると、実際の公開鍵がここに表示されます。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePayWithCard}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50"
                >
                  クレジットカードで支払う
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300"
                >
                  戻る
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={!authChecked}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-600 transition disabled:cursor-not-allowed disabled:bg-red-200"
                >
                  決済する
                </button>
              </div>
              {statusMessage ? (
                <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{statusMessage}</p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

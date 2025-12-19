import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const timeOptions = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const formatDateLabel = (dateString: string, fallback: string) => {
  if (!dateString) return fallback;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export default function ReserveFlowStep1() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");

  const [store, setStore] = useState("足立小台店");
  const [modelName, setModelName] = useState("車両");
  const [managementNumber, setManagementNumber] = useState("");
  const [customerName, setCustomerName] = useState("山田 太郎");
  const [email, setEmail] = useState("sample@example.com");
  const [pickupDate, setPickupDate] = useState("2025-12-26");
  const [returnDate, setReturnDate] = useState("2025-12-27");
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");

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
    if (typeof params.customerName === "string" && params.customerName) setCustomerName(params.customerName);
    if (typeof params.email === "string" && params.email) setEmail(params.email);
  }, [router.isReady, router.query]);

  const pickupLabel = useMemo(
    () => `${formatDateLabel(pickupDate, "2025年12月26日")}`,
    [pickupDate]
  );
  const returnLabel = useMemo(
    () => `${formatDateLabel(returnDate, "2025年12月27日")}`,
    [returnDate]
  );

  const canProceed = pickupTime && returnTime;

  const handleNext = () => {
    if (!canProceed) return;

    const params = new URLSearchParams({
      store,
      modelName,
      managementNumber,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      customerName,
      email,
    });

    void router.push(`/reserve/flow/step2?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <title>予約内容の確認 - ステップ1</title>
      </Head>
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Step 1 / 3</p>
              <h1 className="text-2xl font-bold text-gray-900">予約内容を確認する</h1>
              <p className="text-sm text-gray-600">
                予約内容を確認して時間を指定してください。時間の選択が完了するまで次に進めません。
              </p>
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

          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">車両選択</p>
                    <h2 className="text-lg font-bold text-gray-900">{modelName}</h2>
                    {managementNumber ? (
                      <p className="text-sm text-gray-600">管理番号: {managementNumber}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{store}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">会員情報</p>
                    <h2 className="text-lg font-bold text-gray-900">ご本人さま</h2>
                  </div>
                  <span className="text-xs text-gray-500">ログイン中の会員さま限定</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-700">お名前</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-3 text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-700">メールアドレス</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-3 text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">貸出・返却日時</p>
                    <h2 className="text-lg font-bold text-gray-900">日時の指定</h2>
                  </div>
                  <p className="text-xs text-red-600">時間を選択すると進めます</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-800">貸出希望日</p>
                    <p className="text-sm text-gray-600">{pickupLabel}</p>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">時間を選択</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-800">返却日時</p>
                    <p className="text-sm text-gray-600">{returnLabel}</p>
                    <select
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">時間を選択</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {!canProceed ? (
                  <p className="text-sm text-red-600">貸出と返却の時間を選択すると、オプション選択へ進めます。</p>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">ご予約の概要</p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">1 / 3</span>
                </div>
                <dl className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start justify-between">
                    <dt className="text-gray-500">店舗</dt>
                    <dd className="font-semibold text-gray-900">{store}</dd>
                  </div>
                  <div className="flex items-start justify-between">
                    <dt className="text-gray-500">車種</dt>
                    <dd className="font-semibold text-gray-900">{modelName}</dd>
                  </div>
                  <div className="flex items-start justify-between">
                    <dt className="text-gray-500">貸出日時</dt>
                    <dd className="text-right">
                      <p className="font-semibold text-gray-900">{pickupLabel}</p>
                      <p className="text-xs text-gray-600">{pickupTime || "時間未選択"}</p>
                    </dd>
                  </div>
                  <div className="flex items-start justify-between">
                    <dt className="text-gray-500">返却日時</dt>
                    <dd className="text-right">
                      <p className="font-semibold text-gray-900">{returnLabel}</p>
                      <p className="text-xs text-gray-600">{returnTime || "時間未選択"}</p>
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={!canProceed || !authChecked}
                  onClick={handleNext}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-600 transition disabled:cursor-not-allowed disabled:bg-red-200"
                >
                  オプション選択へ
                </button>
              </div>
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">ログイン中の会員さま専用</p>
                <p className="mt-2 leading-relaxed">
                  予約内容の確認から決済まで、すべてログイン状態でご利用いただけます。ログアウト中の場合はログインページへリダイレクトされます。
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

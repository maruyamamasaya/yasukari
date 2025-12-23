import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import type { RegistrationData } from "../../../types/registration";
import type { Reservation } from "../../../lib/reservations";

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
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string; username?: string } | null>(null);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [registrationError, setRegistrationError] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingReservation, setIsSavingReservation] = useState(false);
  const [reservationPreview, setReservationPreview] = useState<Reservation | null>(null);

  const [store, setStore] = useState("足立小台店");
  const [modelName, setModelName] = useState("車両");
  const [managementNumber, setManagementNumber] = useState("未設定");
  const [pickupDate, setPickupDate] = useState("2025-12-26");
  const [returnDate, setReturnDate] = useState("2025-12-27");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [totalAmount, setTotalAmount] = useState(7830);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [protectionTotal, setProtectionTotal] = useState(0);
  const [accessoryTotal, setAccessoryTotal] = useState(0);

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

        const data = (await response.json()) as { user?: { id: string; email?: string; username?: string } };
        if (data.user) {
          setSessionUser({ id: data.user.id, email: data.user.email, username: data.user.username });
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
    if (typeof params.managementNumber === "string" && params.managementNumber)
      setManagementNumber(params.managementNumber);
    if (typeof params.pickupDate === "string" && params.pickupDate) setPickupDate(params.pickupDate);
    if (typeof params.returnDate === "string" && params.returnDate) setReturnDate(params.returnDate);
    if (typeof params.pickupTime === "string" && params.pickupTime) setPickupTime(params.pickupTime);
    if (typeof params.returnTime === "string" && params.returnTime) setReturnTime(params.returnTime);
    if (typeof params.totalAmount === "string") {
      const parsed = Number(params.totalAmount);
      if (!Number.isNaN(parsed)) setTotalAmount(parsed);
    }
    if (typeof params.couponCode === "string") setCouponCode(params.couponCode);
    if (typeof params.couponDiscount === "string") setCouponDiscount(Number(params.couponDiscount));
    if (typeof params.accessoryTotal === "string") setAccessoryTotal(Number(params.accessoryTotal));
    if (typeof params.protectionTotal === "string") setProtectionTotal(Number(params.protectionTotal));
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!authChecked) return;

    const controller = new AbortController();
    const fetchRegistration = async () => {
      try {
        const response = await fetch("/api/register/user", {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 404) {
          setRegistration(null);
          return;
        }

        if (!response.ok) {
          throw new Error("failed to load registration");
        }

        const data = (await response.json()) as { registration?: RegistrationData | null };
        setRegistration(data.registration ?? null);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setRegistrationError("本登録情報の取得に失敗しました。時間をおいて再度お試しください。");
        }
      }
    };

    void fetchRegistration();
    return () => controller.abort();
  }, [authChecked]);

  const pickupLabel = useMemo(() => formatDateLabel(pickupDate, "2025年12月26日"), [pickupDate]);
  const returnLabel = useMemo(() => formatDateLabel(returnDate, "2025年12月27日"), [returnDate]);

  const rentalDurationHours = useMemo(() => {
    const pickup = new Date(`${pickupDate}T${pickupTime}:00`);
    const returned = new Date(`${returnDate}T${returnTime}:00`);
    const diff = returned.getTime() - pickup.getTime();
    if (Number.isNaN(diff) || diff <= 0) return null;
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const payJpPublicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "pk_test_sample";

  const handlePayWithCard = () => {
    setStatusMessage(
      `Pay.JPの公開鍵(${payJpPublicKey})を使ってトークン化を行う処理をここに実装してください。現在はサンプルです。`
    );
  };

  const handleSubmitPayment = () => {
    setStatusMessage("決済フローのサンプルです。Pay.JPのトークン生成後にAPIへ送信してください。");
  };

  const handleTestPayment = async () => {
    if (!sessionUser) {
      setStatusMessage("ログイン情報を確認できませんでした。再度お試しください。");
      return;
    }

    setIsSavingReservation(true);
    setStatusMessage("決済データを保存しています…");

    const paymentId = `test-payment-${Date.now()}`;
    const pickupAt = new Date(`${pickupDate}T${pickupTime}:00`).toISOString();
    const returnAt = new Date(`${returnDate}T${returnTime}:00`).toISOString();

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeName: store,
          vehicleModel: modelName,
          vehicleCode: managementNumber,
          vehiclePlate: managementNumber,
          pickupAt,
          returnAt,
          paymentAmount: totalAmount,
          paymentId,
          paymentDate: new Date().toISOString(),
          rentalDurationHours,
          rentalCompletedAt: "",
          reservationCompletedFlag: false,
          memberName: registration ? `${registration.name1} ${registration.name2}` : sessionUser.username ?? "",
          memberEmail: registration?.email ?? sessionUser.email ?? "",
          memberPhone: registration?.mobile ?? registration?.tel ?? "",
          couponCode,
          couponDiscount,
          notes: "テスト決済経由で保存",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = (await response.json()) as { reservations?: Reservation[] };
      const reservation = data.reservations?.[0];
      setReservationPreview(reservation ?? null);
      setStatusMessage(
        reservation
          ? `テスト決済として予約ID ${reservation.id} を保存しました。マイページの予約状況に反映されます。`
          : "テスト決済を保存しました。しばらくしてから予約一覧を確認してください。"
      );

      if (reservation) {
        void router.push({
          pathname: "/reserve/flow/complete",
          query: {
            reservationId: reservation.id,
            store,
            modelName,
            managementNumber,
            pickupDate,
            returnDate,
            pickupTime,
            returnTime,
            totalAmount: totalAmount.toString(),
          },
        });
      }
    } catch (error) {
      console.error("Failed to save test payment", error);
      setStatusMessage("テスト決済の保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSavingReservation(false);
    }
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
      couponCode,
      couponDiscount: couponDiscount.toString(),
      accessoryTotal: accessoryTotal.toString(),
      protectionTotal: protectionTotal.toString(),
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
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{store}</span>
                  <span className="text-xs text-gray-500">{modelName} / {managementNumber}</span>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                  <span>レンタル料金 合計（税込）</span>
                  <span>{totalAmount.toLocaleString()}円</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                    <dt>用品・補償の内訳</dt>
                    <dd className="font-semibold text-gray-900">
                      {(accessoryTotal + protectionTotal).toLocaleString()}円
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                    <dt>クーポン</dt>
                    <dd className="font-semibold text-gray-900">{couponCode || "未使用"}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                    <dt>想定レンタル時間</dt>
                    <dd className="font-semibold text-gray-900">
                      {rentalDurationHours ? `${rentalDurationHours} 時間` : "算出不可"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                    <dt>完了フラグ</dt>
                    <dd className="font-semibold text-gray-900">未完了</dd>
                  </div>
                </dl>
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
                <button
                  type="button"
                  onClick={handleTestPayment}
                  disabled={!authChecked || isSavingReservation}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-emerald-600 transition disabled:cursor-not-allowed disabled:bg-emerald-200"
                >
                  {isSavingReservation ? "保存中…" : "テスト決済を保存"}
                </button>
              </div>
              {statusMessage ? (
                <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{statusMessage}</p>
              ) : null}
              {registrationError ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{registrationError}</p>
              ) : null}
              {reservationPreview ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">保存された予約情報（プレビュー）</p>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-emerald-800">予約ID</dt>
                      <dd className="font-mono">{reservationPreview.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800">利用ステータス</dt>
                      <dd>{reservationPreview.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800">貸出〜返却</dt>
                      <dd>
                        {formatDateLabel(reservationPreview.pickupAt, pickupLabel)} → {formatDateLabel(reservationPreview.returnAt, returnLabel)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800">決済金額</dt>
                      <dd>{reservationPreview.paymentAmount} 円</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

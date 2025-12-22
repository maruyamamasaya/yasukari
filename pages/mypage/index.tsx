import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { RegistrationData } from '../../types/registration';
import { REQUIRED_REGISTRATION_FIELDS } from '../../types/registration';
import type { Reservation } from '../../lib/reservations';

type SessionUser = {
  id: string;
  email?: string;
  username?: string;
};

type UserAttributes = {
  phone_number?: string;
  'custom:handle'?: string;
  'custom:locale'?: string;
  name?: string;
};

export default function MyPage() {
  const manualVideoUrl = process.env.NEXT_PUBLIC_MANUAL_VIDEO_URL ?? '/help#manual-video';
  const paymentInfoUrl = process.env.NEXT_PUBLIC_PAYMENT_INFO_URL ?? '/help#payment-info';
  const rentalContractUrl = process.env.NEXT_PUBLIC_RENTAL_CONTRACT_URL ?? '/help#rental-contract';

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [attributes, setAttributes] = useState<UserAttributes | null>(null);
  const [attributesError, setAttributesError] = useState('');
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsError, setReservationsError] = useState('');
  const [loadingReservations, setLoadingReservations] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load profile');
        }

        const data = (await response.json()) as { user?: SessionUser };
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('ログイン状態の確認に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchUser();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchAttributes = async () => {
      try {
        const response = await fetch('/api/user/attributes', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load attributes');
        }

        const data = (await response.json()) as { attributes?: UserAttributes };
        setAttributes(data.attributes ?? {});
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setAttributesError('ユーザー属性の取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAttributes(false);
        }
      }
    };

    void fetchAttributes();
    return () => controller.abort();
  }, [loading, router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchRegistration = async () => {
      try {
        const response = await fetch('/api/register/user', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (response.status === 404) {
          setRegistration(null);
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load registration');
        }

        const data = (await response.json()) as { registration?: RegistrationData | null };
        setRegistration(data.registration ?? null);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setRegistrationError('本登録情報の取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRegistration(false);
        }
      }
    };

    void fetchRegistration();
    return () => controller.abort();
  }, [loading, router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations/me', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load reservations');
        }

        const data = (await response.json()) as { reservations?: Reservation[] };
        setReservations(data.reservations ?? []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setReservationsError('予約状況の取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingReservations(false);
        }
      }
    };

    void fetchReservations();
    return () => controller.abort();
  }, [loading, router]);

  const localeLabel = (value: string | undefined) => {
    if (!value) return '未設定';
    if (value.toLowerCase().startsWith('jp')) return '日本語圏';
    if (value.toLowerCase().startsWith('en')) return '英語圏';
    return value;
  };

  const sexLabel = (value: string | undefined) => {
    if (value === '1') return '男性';
    if (value === '2') return '女性';
    return '未設定';
  };

  const isRegistrationComplete = useMemo(() => {
    if (!registration) return false;
    return REQUIRED_REGISTRATION_FIELDS.every((field) => Boolean(registration[field]));
  }, [registration]);

  const formatReservationDatetime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';

    return parsed.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reservationCompletionLabel = (flag: boolean) => (flag ? '予約完了' : '利用中');

  const markVehicleChangeSeen = async (reservationId: string) => {
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleChangeNotified: true }),
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, vehicleChangeNotified: true }
            : reservation
        )
      );
    } catch (error) {
      console.error('Failed to mark vehicle change as seen', error);
    }
  };

  useEffect(() => {
    reservations.forEach((reservation) => {
      if (reservation.vehicleChangedAt && !reservation.vehicleChangeNotified) {
        void markVehicleChangeSeen(reservation.id);
      }
    });
  }, [reservations]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        throw new Error(`failed to logout: ${response.status}`);
      }

      await router.replace('/login');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('ログアウト処理に失敗しました。時間をおいて再度お試しください。');
      setLoggingOut(false);
    }
  };

  return (
    <>
      <Head>
        <title>マイページ</title>
      </Head>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2 text-sm text-gray-600">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="text-red-600 hover:underline">
                  ホーム
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-600">マイページ</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-semibold text-gray-900">マイページ</h1>
          <p className="text-sm text-gray-500">ログイン中のプロフィール情報を確認できます。</p>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">万が一の故障時のご案内</p>
                <p className="mt-2">
                  万が一、ご利用中のバイクが故障した場合は貸し出し店舗より 180キロ圏内でしたら無料で24時間ロードサービスが使えます。
                  弊社営業時間内であれば一度店へお電話いただき、営業時間外でしたらそのままロードサービスをご手配ください。
                </p>
                <p className="mt-2 font-semibold">ロードサービス連絡先：0120-024-024</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">ログイン状態を確認しています…</p>
          </section>
        ) : (
          <>
            {error ? (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-sm text-red-700">{error}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">プロフィール情報</h2>
                </div>
                <Link
                  href="/mypage/profile-setup"
                  className="inline-flex items-center rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:text-red-800"
                >
                  基本情報を編集
                </Link>
              </div>

              {attributesError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{attributesError}</p>
              ) : null}

              {loadingAttributes ? (
                <p className="mt-3 text-sm text-gray-700">属性を取得しています…</p>
              ) : attributes ? (
                <dl className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-600">電話番号</dt>
                    <dd className="mt-1 text-gray-800">{attributes.phone_number ?? '未設定'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">ハンドルネーム</dt>
                    <dd className="mt-1 text-gray-800">{attributes['custom:handle'] ?? '未設定'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">ロケーション / 言語</dt>
                    <dd className="mt-1 text-gray-800">{localeLabel(attributes['custom:locale'])}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">ニックネーム</dt>
                    <dd className="mt-1 text-gray-800">{attributes.name ?? '未設定'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-gray-700">プロフィール情報を取得できませんでした。</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">本登録</h2>
                  <p className="mt-1 text-sm text-gray-600">レンタルに必要な基本情報を入力するフォームです。</p>
                  {loadingRegistration ? null : registration ? (
                    isRegistrationComplete ? (
                      <p className="mt-2 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                        本登録済み
                      </p>
                    ) : (
                      <p className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                        本登録が未完了です
                      </p>
                    )
                  ) : (
                    <p className="mt-2 inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                      本登録がまだ保存されていません
                    </p>
                  )}
                </div>
                <Link
                  href="/mypage/registration"
                  className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  本登録フォームへ進む
                </Link>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {registrationError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{registrationError}</p>
                ) : null}

                {loadingRegistration ? (
                  <p>本登録情報を読み込み中です…</p>
                ) : registration ? (
                  <div className="space-y-3">
                    {!isRegistrationComplete ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                        未入力の必須項目があります。内容を確認して本登録を完了してください。
                      </p>
                    ) : null}
                    <dl className="grid gap-4 md:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">氏名</dt>
                        <dd className="mt-1 text-gray-900">{`${registration.name1} ${registration.name2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">フリガナ</dt>
                        <dd className="mt-1 text-gray-900">{`${registration.kana1} ${registration.kana2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">性別</dt>
                        <dd className="mt-1 text-gray-900">{sexLabel(registration.sex)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">住所</dt>
                        <dd className="mt-1 text-gray-900">{`〒${registration.zip} ${registration.address1} ${registration.address2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">誕生日</dt>
                        <dd className="mt-1 text-gray-900">{registration.birth}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">免許証番号</dt>
                        <dd className="mt-1 text-gray-900">{registration.license ? '登録済み（番号は非表示）' : '未登録'}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                    本登録情報がまだありません。フォームから登録を進めてください。
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">予約状況</h2>
                  <p className="mt-1 text-sm text-gray-600">直近の予約や利用状況をここに表示します。</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  保存された予約を表示
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {reservationsError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{reservationsError}</p>
                ) : loadingReservations ? (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">予約データを読み込み中です…</p>
                ) : reservations.length === 0 ? (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                    まだ予約データがありません。テスト決済ボタンを押すと保存内容がここに表示されます。
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {reservations.map((reservation) => (
                      <li
                        key={reservation.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-100"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500">ID: {reservation.id}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {reservation.storeName} / {reservation.vehicleModel}
                            </p>
                            <p className="text-xs text-gray-600">{reservation.vehicleCode} {reservation.vehiclePlate}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                              {reservation.status}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${reservation.reservationCompletedFlag ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}
                            >
                              {reservationCompletionLabel(reservation.reservationCompletedFlag)}
                            </span>
                          </div>
                        </div>
                        {reservation.vehicleChangedAt && !reservation.vehicleChangeNotified && (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                            管理側で車両が変更されました。新しい車両: {reservation.vehicleCode} /{' '}
                            {reservation.vehiclePlate || '未設定'}
                          </p>
                        )}
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">貸出〜返却</dt>
                            <dd className="font-semibold text-gray-900">
                              {formatReservationDatetime(reservation.pickupAt)} → {formatReservationDatetime(reservation.returnAt)}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">ご予約情報</dt>
                            <dd className="font-semibold text-gray-900">
                              車両コード: {reservation.vehicleCode || '-'} / ナンバープレート: {reservation.vehiclePlate || '未設定'}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">決済金額</dt>
                            <dd className="font-semibold text-gray-900">{reservation.paymentAmount} 円</dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">決済日時</dt>
                            <dd className="font-semibold text-gray-900">
                              {reservation.paymentDate ? formatReservationDatetime(reservation.paymentDate) : '未登録'}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">完了日時（保管のみ）</dt>
                            <dd className="font-semibold text-gray-900">
                              {reservation.rentalCompletedAt ? formatReservationDatetime(reservation.rentalCompletedAt) : '未設定'}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={manualVideoUrl}
                            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            マニュアル動画を見る
                          </Link>
                          <Link
                            href={paymentInfoUrl}
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            決済情報を確認
                          </Link>
                          <Link
                            href={rentalContractUrl}
                            className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            貸渡契約書を見る
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">ログアウト</h2>
              <p className="mt-2 text-sm text-gray-600">
                ログアウトすると再度ログインするまでマイページを表示できません。
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                disabled={!user || loggingOut}
              >
                {loggingOut ? '処理中…' : 'ログアウトする'}
              </button>
            </section>
          </>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">連携リンク</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>
              <Link className="text-red-600 hover:underline" href="/pricing">
                料金表を見る
              </Link>
            </li>
            <li>
              <Link className="text-red-600 hover:underline" href="/help">
                ヘルプセンター
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}

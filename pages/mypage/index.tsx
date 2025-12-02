import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { RegistrationData } from '../../types/registration';
import { REQUIRED_REGISTRATION_FIELDS } from '../../types/registration';

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
                    <dt className="font-medium text-gray-600">名前</dt>
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
                <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                  準備中
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                  予約状況の表示機能を準備しています。公開まで今しばらくお待ちください。
                </p>
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

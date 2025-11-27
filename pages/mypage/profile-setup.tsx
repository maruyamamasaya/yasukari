import { FormEvent, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { NextPage } from 'next';

type UserAttributes = {
  phone_number?: string;
  'custom:handle'?: string;
  'custom:locale'?: string;
  name?: string;
  phone_number_verified?: string;
};

type AttributesResponse = { attributes?: UserAttributes; message?: string };

const REQUIRED_KEYS: (keyof UserAttributes)[] = ['phone_number', 'custom:handle', 'custom:locale', 'name'];

const ProfileSetupPage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attributes, setAttributes] = useState<UserAttributes>({});
  const fromLogin = useMemo(() => router.query.fromLogin === '1', [router.query.fromLogin]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAttributes = async () => {
      try {
        const [sessionRes, attrRes] = await Promise.all([
          fetch('/api/me', { credentials: 'include', signal: controller.signal }),
          fetch('/api/user/attributes', { credentials: 'include', signal: controller.signal }),
        ]);

        if (sessionRes.status === 401 || attrRes.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!attrRes.ok) {
          const data = (await attrRes.json().catch(() => ({}))) as AttributesResponse;
          throw new Error(data.message ?? 'ユーザー情報の取得に失敗しました。');
        }

        const data = (await attrRes.json()) as AttributesResponse;
        setAttributes(data.attributes ?? {});
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('情報の取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchAttributes();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (fromLogin && !loading) {
      const missing = REQUIRED_KEYS.filter((key) => !(attributes?.[key] ?? '').trim());
      if (missing.length === 0) {
        void router.replace('/mypage');
      }
    }
  }, [attributes, fromLogin, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      phone_number: formData.get('phone_number')?.toString() ?? '',
      name: formData.get('name')?.toString() ?? '',
      handle: formData.get('handle')?.toString() ?? '',
      locale: formData.get('locale')?.toString() ?? '',
      phone_number_verified: formData.get('phone_number_verified') === 'on',
    };

    try {
      const response = await fetch('/api/user/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as AttributesResponse;

      if (!response.ok) {
        throw new Error(data.message ?? '保存に失敗しました。');
      }

      setSuccess('基本情報を保存しました。');
      const nextAttributes: UserAttributes = {
        ...attributes,
        phone_number: payload.phone_number,
        name: payload.name,
        'custom:handle': payload.handle,
        'custom:locale': payload.locale,
        phone_number_verified: payload.phone_number_verified ? 'true' : attributes.phone_number_verified,
      };

      setAttributes(nextAttributes);

      const missing = REQUIRED_KEYS.filter((key) => !(nextAttributes[key] ?? '').trim());
      if (missing.length === 0) {
        await router.replace('/mypage');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '保存に失敗しました。';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const localeLabel = (value: string | undefined) => {
    if (!value) return '未設定';
    if (value.toLowerCase().startsWith('jp')) return '日本語圏';
    if (value.toLowerCase().startsWith('en')) return '英語圏';
    return value;
  };

  const missingKeys = REQUIRED_KEYS.filter((key) => !(attributes?.[key] ?? '').trim());

  return (
    <>
      <Head>
        <title>基本情報の登録</title>
      </Head>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10">
        <header className="space-y-2 text-sm text-gray-600">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="text-red-600 hover:underline">
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/mypage" className="text-red-600 hover:underline">
                  マイページ
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700">基本情報の登録</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-semibold text-gray-900">基本情報の登録</h1>
          <p className="text-sm text-gray-500">
            電話番号、ハンドルネーム、ロケーションと言語、表示名を設定してください。入力済みの項目は更新できます。
          </p>
        </header>

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">情報を読み込み中です…</p>
          </section>
        ) : (
          <>
            {missingKeys.length === 0 ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                すでに基本情報が登録されています。内容を変更する場合は下のフォームから更新できます。
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                未入力の項目があります。すべて入力して本登録を完了してください。
              </div>
            )}

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}
            {success ? (
              <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
              <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                    電話番号（+と国コードを含む）
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    defaultValue={attributes.phone_number ?? ''}
                    placeholder="例: +819012345678"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      name="phone_number_verified"
                      defaultChecked={attributes.phone_number_verified === 'true'}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span>この電話番号を確認済みとしてマークする</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                    ハンドルネーム（ユーザーID）
                  </label>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    defaultValue={attributes['custom:handle'] ?? ''}
                    placeholder="3〜30文字"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500">サイト内での識別に使用されます。</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    名前
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={attributes.name ?? ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                    ロケーション / 言語
                  </label>
                  <select
                    id="locale"
                    name="locale"
                    defaultValue={attributes['custom:locale'] ?? ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      選択してください
                    </option>
                    <option value="jp">日本語圏</option>
                    <option value="en">英語圏</option>
                  </select>
                  <p className="text-xs text-gray-500">選択したロケーションに応じてサイト表示を調整します。</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? '保存中…' : '保存してマイページへ'}
                  </button>
                  <Link
                    href="/mypage"
                    className="text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900"
                  >
                    キャンセルして戻る
                  </Link>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">現在の登録状況</h2>
              <dl className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <dt className="font-medium text-gray-600">電話番号</dt>
                  <dd className="mt-1 text-gray-900">{attributes.phone_number ?? '未設定'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">電話番号の確認</dt>
                  <dd className="mt-1 text-gray-900">
                    {attributes.phone_number_verified === 'true' ? '確認済み' : '未確認'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">ハンドルネーム</dt>
                  <dd className="mt-1 text-gray-900">{attributes['custom:handle'] ?? '未設定'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">ロケーション / 言語</dt>
                  <dd className="mt-1 text-gray-900">{localeLabel(attributes['custom:locale'])}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">名前</dt>
                  <dd className="mt-1 text-gray-900">{attributes.name ?? '未設定'}</dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default ProfileSetupPage;

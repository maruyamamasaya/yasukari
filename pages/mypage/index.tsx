import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';

import { AUTH_COOKIE_NAME, verifyAuthToken } from '../../lib/authToken';
import type { RegistrationStatus } from '../../lib/testUser';

type MyPageUser = {
  id: string;
  username?: string;
  email?: string;
  registrationStatus: RegistrationStatus;
};

interface MyPageProps {
  user: MyPageUser;
}

const registrationStatusLabels: Record<RegistrationStatus, string> = {
  full: '本登録済み',
  provisional: '仮登録',
};

export default function MyPage({ user }: MyPageProps) {
  const [error, setError] = useState('');
  const router = useRouter();

  const displayName = user.username ?? user.email ?? 'ユーザー';

  const handleLogout = async () => {
    setError('');
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      router.push('/login');
      return;
    }

    setError('ログアウトに失敗しました。時間をおいて再度お試しください。');
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
          <p className="text-sm text-gray-500">ログイン中のアカウント情報を確認できます。</p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">アカウント情報</h2>
          <dl className="mt-4 space-y-3 text-sm text-gray-700">
            <div>
              <dt className="font-medium text-gray-600">表示名</dt>
              <dd className="mt-1 text-base font-semibold text-gray-900">{displayName}</dd>
            </div>
            {user.username ? (
              <div>
                <dt className="font-medium text-gray-600">ユーザー名</dt>
                <dd className="mt-1 text-gray-800">{user.username}</dd>
              </div>
            ) : null}
            {user.email ? (
              <div>
                <dt className="font-medium text-gray-600">メールアドレス</dt>
                <dd className="mt-1 text-gray-800">{user.email}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-medium text-gray-600">登録ステータス</dt>
              <dd className="mt-1 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {registrationStatusLabels[user.registrationStatus]}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">ログアウト</h2>
          <p className="mt-2 text-sm text-gray-600">
            ログアウトすると再度ログインするまでマイページを表示できません。
          </p>
          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            ログアウトする
          </button>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MyPageProps> = async ({ req }) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = verifyAuthToken(token);

  if (!payload) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        id: payload.sub,
        username: payload.username ?? undefined,
        email: payload.email ?? undefined,
        registrationStatus: payload.registrationStatus,
      },
    },
  };
};

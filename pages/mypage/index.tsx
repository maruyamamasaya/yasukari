import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

type SessionUser = {
  id: string;
  email?: string;
  username?: string;
};

export default function MyPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const logoutHref = '/auth/logout';

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

  const displayName = user?.username ?? user?.email ?? 'ユーザー';

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

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">ログイン状態を確認しています…</p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">アカウント情報</h2>
              {error ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              ) : null}
              {user ? (
                <dl className="mt-4 space-y-3 text-sm text-gray-700">
                  <div>
                    <dt className="font-medium text-gray-600">表示名</dt>
                    <dd className="mt-1 text-base font-semibold text-gray-900">{displayName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">ユーザーID</dt>
                    <dd className="mt-1 text-gray-800">{user.id}</dd>
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
                </dl>
              ) : (
                <p className="mt-3 text-sm text-gray-700">ログイン情報を取得できませんでした。</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">ログアウト</h2>
              <p className="mt-2 text-sm text-gray-600">
                ログアウトすると再度ログインするまでマイページを表示できません。
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = logoutHref;
                }}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                disabled={!user}
              >
                ログアウトする
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

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('メールアドレスを入力してください。');
      return;
    }
    if (!password.trim()) {
      setError('パスワードを入力してください。');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        let message = 'ログインに失敗しました。内容をご確認ください。';
        try {
          const data = (await response.json()) as { message?: string };
          if (typeof data?.message === 'string' && data.message.trim().length > 0) {
            message = data.message;
          }
        } catch (jsonError) {
          void jsonError;
        }
        setError(message);
        return;
      }

      await router.push('/mypage');
    } catch (fetchError) {
      console.error(fetchError);
      setError('ネットワークエラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>ログイン</title>
      </Head>
      <div className="min-h-screen bg-white text-gray-900">
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="text-blue-600 hover:underline">
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-600">ログイン</li>
            </ol>
          </nav>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">マイページでレンタルをスムーズに管理</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                ご契約状況の確認や延長手続き、支払い情報の更新まで、マイページからまとめて行えます。
                会員ならではの限定キャンペーンもこちらでお知らせしています。
              </p>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                {[{
                  text: '最新のレンタル状況と履歴をいつでもチェック'
                }, {
                  text: 'オンラインで延長・オプション追加が完結'
                }, {
                  text: '会員限定クーポンや新着車両をいち早くご案内'
                }].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">はじめての方へ</p>
                <p className="mt-1 leading-relaxed">
                  メールアドレスだけで仮登録が行えます。まだ会員でない方は
                  <Link href="/signup" className="ml-1 font-semibold text-red-700 underline underline-offset-4">
                    新規登録ページ
                  </Link>
                  をご確認ください。
                </p>
              </div>
            </section>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 space-y-2 text-center">
                <h2 className="text-xl font-semibold text-gray-900">ログイン</h2>
                <p className="text-xs text-gray-500">ご登録のメールアドレスとパスワードを入力してください。</p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed bg-gray-50"
                  disabled
                >
                  Google でログイン
                </button>
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400">または</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="identifier">
                    ユーザー名またはメールアドレス
                  </label>
                  <input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="メールアドレスを入力"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="パスワードを入力"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'ログイン中…' : 'メールアドレスでログイン'}
                </button>
              </form>
              <div className="mt-8 rounded-xl bg-gray-50 p-4 text-left">
                <h3 className="text-sm font-semibold text-gray-900">Googleログイン（準備中）</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  現在、Googleアカウントによるログイン機能を構築中です。正式な連携が完了次第、Googleアカウントの選択画面からワンタップでログインできるようになります。
                </p>
                <ul className="mt-3 space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                    <span>Googleでの認証後に自動的にマイページへ遷移</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                    <span>メールアドレスとパスワードの入力は不要</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                    <span>正式リリースまで今しばらくお待ちください</span>
                  </li>
                </ul>
              </div>
              <p className="mt-6 text-center text-xs text-gray-500">
                アカウントをお持ちでない方は
                <Link href="/signup" className="ml-1 font-semibold text-red-600 underline underline-offset-2">
                  新規登録
                </Link>
                へ
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

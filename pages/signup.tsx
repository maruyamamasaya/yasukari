import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

type SignupState = 'idle' | 'loading' | 'success';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<SignupState>('idle');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('loading');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setState('success');
      setTimeout(() => {
        router.push('/mypage');
      }, 800);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.message || '会員登録に失敗しました');
    setState('idle');
  };

  return (
    <>
      <Head>
        <title>ライト会員登録 | yasukari</title>
        <meta
          name="description"
          content="ライトプランの会員登録ページ。最短1分で無料アカウントを作成し、ダッシュボードで予約状況を確認できます。"
        />
      </Head>
      <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen">
        <section className="bg-blue-600 text-white">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-200">Light Membership</p>
            <h1 className="mt-4 text-3xl font-semibold md:text-4xl">ライト会員登録</h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-100">
              予約管理や利用履歴の確認ができる「ライトプラン」のダッシュボードをご利用いただけます。登録後は自動的にログインされ、すぐに
              マイページを確認できます。
            </p>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-16 max-w-5xl px-6 pb-24">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/40">
              <h2 className="text-xl font-semibold text-gray-900">アカウント情報</h2>
              <p className="mt-2 text-sm text-gray-500">必要事項を入力してライト会員アカウントを作成してください。</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}
                {state === 'success' && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    登録が完了しました。マイページへ移動します。
                  </div>
                )}
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">ユーザー名</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="例: rider_yasu"
                    required
                    autoComplete="username"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">パスワード</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="6文字以上の半角英数字"
                    required
                    autoComplete="new-password"
                  />
                </label>
                <p className="text-xs text-gray-500">登録後はライトプランのマイページ「MYP-DASH」がすぐにご利用いただけます。</p>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  disabled={state === 'loading'}
                >
                  {state === 'loading' ? '登録処理中...' : 'ライト会員として登録する'}
                </button>
              </form>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-6">
                <h3 className="text-lg font-semibold text-blue-900">ライトプランの特長</h3>
                <ul className="mt-4 space-y-3 text-sm text-blue-900/80">
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    予約状況や過去の利用履歴を1画面で確認
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    メンテナンス予定やお知らせを自動で受信
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    スマートフォン最適化されたダッシュボード
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">登録の流れ</h3>
                <ol className="mt-4 space-y-4 text-sm text-gray-600">
                  <li>
                    <span className="font-semibold text-blue-600">1.</span> ユーザー名とパスワードを入力
                  </li>
                  <li>
                    <span className="font-semibold text-blue-600">2.</span> ライト会員として登録
                  </li>
                  <li>
                    <span className="font-semibold text-blue-600">3.</span> 自動ログインでマイページ「MYP-DASH」へ
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

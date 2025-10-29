import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const planHighlights = [
  'レンタル料金は都度支払い、入会費は無料',
  'マイページで予約・延長の履歴を一括管理',
  '困ったときはチャットサポートが24時間受付',
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    setIsLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      await router.push('/mypage');
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.message || '登録に失敗しました');
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>ライト会員登録 | yasukari</title>
        <meta name="description" content="ライト会員登録フォーム。登録後は自動的にマイページへログインします。" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold mb-3">
              L1 / ライト会員登録
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">月額無料で始めるライトプラン</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              クレジットカード情報の登録だけで、すぐにレンタル予約ができる yasukari のベーシック会員プランです。
              登録完了と同時にマイページへ自動ログインし、初回予約までスムーズに進めます。
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">基本情報の入力</h2>
              {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="sample@example.com"
                    required
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500"
                      minLength={8}
                      placeholder="8文字以上"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認用）</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500"
                      minLength={8}
                      placeholder="もう一度入力"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full justify-center py-3 text-base font-semibold disabled:opacity-60"
                >
                  {isLoading ? '登録処理中...' : 'ライト会員として登録する'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  ボタンを押すことで <a href="/terms" className="text-blue-600 underline">利用規約</a> と{' '}
                  <a href="/privacy" className="text-blue-600 underline">プライバシーポリシー</a> に同意したものとみなされます。
                </p>
              </form>
            </section>

            <aside className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ライトプランの特徴</h2>
                <ul className="mt-4 space-y-3">
                  {planHighlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-sm text-emerald-900">
                <h3 className="text-base font-semibold mb-2">登録後の流れ</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>登録ボタンを押すと自動的にログインします。</li>
                  <li>マイページでプロフィールと支払い情報を登録。</li>
                  <li>気になるバイクを選び、すぐに予約完了！</li>
                </ol>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-1">既にアカウントをお持ちですか？</p>
                <p>
                  <a href="/login" className="text-blue-600 underline">
                    ログインページに戻る
                  </a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

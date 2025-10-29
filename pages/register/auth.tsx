import { FormEvent, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { NextPage } from 'next';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse = {
  message?: string;
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) {
    return email;
  }
  if (localPart.length <= 2) {
    return `${localPart[0] ?? ''}***@${domain}`;
  }
  const head = localPart.slice(0, 2);
  return `${head}***@${domain}`;
};

const RegisterAuthPage: NextPage = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedback, setFeedback] = useState('');

  const email = useMemo(() => {
    const queryEmail = router.query.email;
    if (Array.isArray(queryEmail)) {
      return queryEmail[0];
    }
    return queryEmail ?? '';
  }, [router.query.email]);

  const normalizedEmail = useMemo(() => {
    if (!email) {
      return '';
    }
    try {
      return decodeURIComponent(email).trim();
    } catch (error) {
      console.error(error);
      return email.trim();
    }
  }, [email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedEmail) {
      setStatus('error');
      setFeedback('メールアドレス情報が見つかりません。最初から手続きをやり直してください。');
      return;
    }

    if (!code.trim()) {
      setStatus('error');
      setFeedback('認証コードを入力してください。');
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const res = await fetch('/api/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, code }),
      });

      const data: ApiResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setFeedback(data.message ?? '認証に失敗しました。時間を置いて再度お試しください。');
        return;
      }

      setStatus('success');
      setFeedback(data.message ?? '本登録が完了しました。');
      setCode('');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setFeedback('通信エラーが発生しました。ネットワーク環境をご確認のうえ、再度お試しください。');
    }
  };

  return (
    <>
      <Head>
        <title>認証コード入力 | 激安・便利なレンタルバイクのヤスカリ。</title>
        <meta
          name="description"
          content="仮登録されたメールアドレスに送信された認証コードを入力し、本登録を完了します。"
        />
      </Head>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/static/images/logo/250x50.png"
                alt="ヤスカリ"
                width={200}
                height={40}
                className="hidden md:block"
              />
              <div className="flex items-center gap-2 md:hidden">
                <img src="/static/images/logo/300x300.jpg" alt="ヤスカリ" width={44} height={44} className="rounded-full" />
                <span className="text-sm font-semibold text-gray-800">レンタルバイクのヤスカリ</span>
              </div>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              ログイン
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="text-blue-600 hover:underline">
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/signup" className="text-blue-600 hover:underline">
                  会員登録
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-600">認証コード入力</li>
            </ol>
          </nav>
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900">認証コードを入力してください</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              メールアドレスに本登録用の認証コードをお送りしました。メール本文に記載された6桁のコードを入力し、登録を完了してください。
            </p>
            {normalizedEmail ? (
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">メールアドレス</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{maskEmail(normalizedEmail)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  上記メールアドレスに認証コードを送りました。認証コードが届かない場合は
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    再度メールアドレスを入力
                  </Link>
                  してください。
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                メールアドレス情報が確認できませんでした。お手数ですが
                <Link href="/signup" className="ml-1 text-yellow-800 underline">
                  会員登録ページ
                </Link>
                からやり直してください。
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {feedback && (
                <div
                  className={
                    status === 'success'
                      ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
                      : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'
                  }
                >
                  {feedback}
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700" htmlFor="verification-code">
                認証コード
              </label>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="例: ABC123"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg tracking-[0.3em] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={status === 'loading'}
              />
              <p className="text-xs text-gray-500">半角英数字6桁で入力してください。</p>
              <button
                type="submit"
                className="w-full rounded-full bg-red-600 py-3 text-lg font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                disabled={status === 'loading' || !normalizedEmail}
              >
                {status === 'loading' ? '認証中…' : '認証して本登録を完了する'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              認証コードの有効期限はメール送信から24時間です。期限切れの場合は再度メールアドレスを入力してください。
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default RegisterAuthPage;

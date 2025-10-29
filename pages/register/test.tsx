import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { NextPage } from 'next';

const decodeParam = (param: string | string[] | undefined, fallback = ''): string => {
  if (!param) {
    return fallback;
  }
  const value = Array.isArray(param) ? param[0] : param;
  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.error(error);
    return value;
  }
};

const RegisterTestPage: NextPage = () => {
  const router = useRouter();

  const displayName = useMemo(() => {
    const rawName = decodeParam(router.query.name, 'テスト');
    return rawName.trim() || 'テスト';
  }, [router.query.name]);

  const displayEmail = useMemo(() => {
    const rawEmail = decodeParam(router.query.email, 'test@test.com');
    return rawEmail.trim() || 'test@test.com';
  }, [router.query.email]);

  return (
    <>
      <Head>
        <title>テスト会員登録 | 激安・便利なレンタルバイクのヤスカリ。</title>
        <meta
          name="description"
          content="テスト用アカウントの登録手続きが完了しました。次の開発ステップで本登録フローを実装するための仮ページです。"
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
              <li className="text-gray-600">テスト会員登録</li>
            </ol>
          </nav>

          <section className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 shadow-sm md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900">テスト用アカウントでログインしました</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              現在は開発用のテストフローを確認するための仮ページです。後日、本登録用の入力フォームをここに実装する予定です。
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">お名前</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{displayName}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">メールアドレス</p>
                <p className="mt-2 break-all text-lg font-semibold text-gray-900">{displayEmail}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                別のメールアドレスで登録を試す
              </Link>
              <Link
                href="/my"
                className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-red-700"
              >
                マイページに移動
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              テストフローに関するご要望があれば、担当者までお気軽にお知らせください。
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default RegisterTestPage;

import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactNode } from 'react';

import { findLightMemberById } from '../../lib/mockUserDb';

type ProfileCell = {
  label: string;
  value: ReactNode;
  highlight?: boolean;
};

type ProfileRow = {
  primary: ProfileCell;
  secondary?: ProfileCell;
};

interface MyPageProps {
  profile: {
    membershipNumber: string;
    fullName: string;
    email: string;
  };
  basicRows: ProfileRow[];
  detailRows: ProfileRow[];
  workRows: ProfileRow[];
  contactRows: ProfileRow[];
}

interface ProfileSectionProps {
  title: string;
  rows: ProfileRow[];
}

function ProfileSection({ title, rows }: ProfileSectionProps) {
  return (
    <section className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/40 backdrop-blur">
      <h3 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-4">{title}</h3>
      <div>
        {rows.map((row) => {
          const primaryValueClass = row.secondary ? 'md:col-span-1' : 'md:col-span-3';
          return (
            <div
              key={row.primary.label}
              className="grid gap-4 border-b border-slate-100 py-5 text-sm text-slate-700 last:border-b-0 md:grid-cols-4"
            >
              <div className="font-semibold text-slate-500 md:pr-4 md:text-right">{row.primary.label}</div>
              <div
                className={`text-base font-medium text-slate-900 ${primaryValueClass} ${
                  row.primary.highlight ? 'text-red-600' : ''
                }`}
              >
                {row.primary.value}
              </div>
              {row.secondary ? (
                <>
                  <div className="font-semibold text-slate-500 md:pr-4 md:text-right">{row.secondary.label}</div>
                  <div
                    className={`text-base font-medium text-slate-900 ${
                      row.secondary.highlight ? 'text-red-600' : ''
                    }`}
                  >
                    {row.secondary.value}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function MyPage({
  profile,
  basicRows,
  detailRows,
  workRows,
  contactRows,
}: MyPageProps) {
  return (
    <>
      <Head>
        <title>マイページ</title>
      </Head>
      <main className="w-full space-y-10 text-slate-800">
        <nav aria-label="breadcrumb" className="pt-4">
          <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <li>
              <a href="/" className="text-red-600 transition hover:text-red-700">
                ホーム
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/my" className="text-red-600 transition hover:text-red-700">
                マイページ
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">プロファイル</li>
          </ol>
        </nav>

        <section className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">会員番号</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{profile.membershipNumber}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">ログイン中の会員</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{profile.fullName}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-slate-200/40 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="/my"
              className="rounded-full border border-transparent bg-slate-100 px-4 py-2 text-slate-600 transition hover:border-slate-200 hover:bg-slate-200"
            >
              ご予約状況
            </a>
            <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700">プロファイル</span>
            <a
              href="/my/security"
              className="rounded-full border border-transparent bg-slate-100 px-4 py-2 text-slate-600 transition hover:border-slate-200 hover:bg-slate-200"
            >
              セキュリティ
            </a>
          </div>
          <div className="text-xs text-slate-500">
            会員情報の更新は現在オンラインフォームから行えます。
          </div>
        </div>

        <ProfileSection title="基本情報" rows={basicRows} />
        <ProfileSection title="詳細情報" rows={detailRows} />
        <ProfileSection title="勤務先情報" rows={workRows} />
        <ProfileSection title="その以外の連絡先情報" rows={contactRows} />

        <button
          type="button"
          className="w-full rounded-2xl bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
        >
          ログアウト
        </button>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MyPageProps> = async ({ req }) => {
  const authCookie = req.cookies?.auth;
  if (!authCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const member = findLightMemberById(authCookie);
  if (!member || (member.username !== 'adminuser' && member.email !== 'adminuser@example.com')) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const profile = {
    membershipNumber: 'cvugscr1qb717lh4va90',
    fullName: '丸山 将矢',
    email: 'maruyama_001@jimusuru.info',
  };

  const basicRows: ProfileRow[] = [
    {
      primary: { label: '会員番号', value: profile.membershipNumber },
    },
    {
      primary: { label: 'メールアドレス', value: profile.email },
    },
  ];

  const detailRows: ProfileRow[] = [
    {
      primary: { label: 'お名前 (姓)', value: '丸山', highlight: true },
      secondary: { label: 'お名前 (名)', value: '将矢', highlight: true },
    },
    {
      primary: { label: 'フリガナ (セイ)', value: 'マルヤマ', highlight: true },
      secondary: { label: 'フリガナ (メイ)', value: 'マサヤ', highlight: true },
    },
    {
      primary: { label: '性別', value: '男性' },
    },
    {
      primary: { label: '生年月日', value: '1994/06/01' },
    },
    {
      primary: { label: '郵便番号', value: '1000003', highlight: true },
    },
    {
      primary: { label: '住所 (市区町村まで)', value: '東京都千代田区一ツ橋（１丁目）', highlight: true },
    },
    {
      primary: { label: '番地等', value: 'hitotsubashi', highlight: true },
    },
    {
      primary: { label: '電話番号', value: '08017792001', highlight: true },
    },
    {
      primary: {
        label: '免許番号',
        value: (
          <div className="space-y-3">
            <div className="font-semibold">301234567890</div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
              免許証の写真を更新する場合はここからアップロードしてください。
            </div>
          </div>
        ),
        highlight: true,
      },
    },
  ];

  const workRows: ProfileRow[] = [
    {
      primary: { label: '勤務先名', value: 'JIMUSURU', highlight: true },
    },
    {
      primary: { label: '勤務先住所', value: '東京都千代田区一ツ橋（１丁目）', highlight: true },
    },
    {
      primary: { label: '勤務先電話番号', value: '08017792001', highlight: true },
    },
  ];

  const contactRows: ProfileRow[] = [
    {
      primary: { label: '連絡先氏名', value: 'JUMUSURU', highlight: true },
    },
    {
      primary: { label: '連絡先住所', value: '東京都千代田区一ツ橋（１丁目）', highlight: true },
    },
    {
      primary: { label: '連絡先電話番号', value: '08017792001', highlight: true },
    },
  ];

  return {
    props: {
      profile,
      basicRows,
      detailRows,
      workRows,
      contactRows,
    },
  };
};

import Head from 'next/head';
import type { GetServerSideProps } from 'next';

type UsageMetric = {
  label: string;
  value: string;
  subLabel: string;
};

type Reservation = {
  id: string;
  title: string;
  period: string;
  status: '利用予定' | '利用中' | '完了';
  detail: string;
};

type Notice = {
  title: string;
  description: string;
  date: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: '対応中' | '完了' | '新規';
  updatedAt: string;
};

type QuickLink = {
  label: string;
  href: string;
  description: string;
};

interface MyPageProps {
  user: {
    name: string;
    email: string;
    company: string;
    role: string;
    plan: string;
    nextBilling: string;
    lastLogin: string;
  };
  metrics: UsageMetric[];
  reservations: Reservation[];
  notices: Notice[];
  supportTickets: SupportTicket[];
  quickLinks: QuickLink[];
}

export default function MyPage({
  user,
  metrics,
  reservations,
  notices,
  supportTickets,
  quickLinks,
}: MyPageProps) {
  return (
    <>
      <Head>
        <title>マイページ</title>
      </Head>
      <main className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-10">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-sm uppercase tracking-wide text-blue-100">Welcome back</p>
            <h1 className="text-3xl font-semibold mt-1">{user.name} さんのダッシュボード</h1>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100">契約プラン</p>
                <p className="text-lg font-semibold">{user.plan}</p>
                <p className="text-blue-100 mt-2">次回請求日: {user.nextBilling}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100">アカウント</p>
                <p className="text-lg font-semibold">{user.company}</p>
                <p className="text-blue-100 mt-2">権限ロール: {user.role}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-100">最終ログイン</p>
                <p className="text-lg font-semibold">{user.lastLogin}</p>
                <p className="text-blue-100 mt-2">ログインメール: {user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-10">
          <section className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">利用状況サマリー</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{metric.subLabel}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">直近の予約状況</h2>
                <a href="/rental-status" className="text-sm text-blue-600 hover:underline">
                  すべて表示
                </a>
              </div>
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <article key={reservation.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{reservation.id}</p>
                        <h3 className="text-base font-semibold text-gray-900">{reservation.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{reservation.detail}</p>
                        <p className="text-sm text-gray-500 mt-2">期間: {reservation.period}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          reservation.status === '利用中'
                            ? 'bg-green-100 text-green-700'
                            : reservation.status === '利用予定'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">お知らせ</h2>
              <ul className="space-y-4">
                {notices.map((notice) => (
                  <li key={notice.title} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-xs text-gray-400">{notice.date}</p>
                    <p className="text-sm font-semibold text-gray-900">{notice.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notice.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">サポート対応状況</h2>
                <a href="/contact" className="text-sm text-blue-600 hover:underline">
                  サポートに問い合わせる
                </a>
              </div>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <article key={ticket.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{ticket.subject}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          ticket.status === '対応中'
                            ? 'bg-orange-100 text-orange-700'
                            : ticket.status === '新規'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">更新日: {ticket.updatedAt}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">クイックアクセス</h2>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href} className="group">
                    <a
                      href={link.href}
                      className="flex items-start justify-between rounded-lg border border-gray-100 p-4 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                          {link.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                      </div>
                      <span className="text-blue-400">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MyPageProps> = async ({ req }) => {
  const isLoggedIn = req.cookies?.auth === 'loggedin';

  if (!isLoggedIn) {
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
        name: '管理者ユーザー',
        email: 'adminuser@example.com',
        company: 'やすかりレンタル株式会社',
        role: 'アカウント管理者',
        plan: 'スタンダードプラン',
        nextBilling: '2024年4月30日',
        lastLogin: '2024年3月12日 09:42',
      },
      metrics: [
        { label: '今月のレンタル利用', value: '12件', subLabel: '先月比 +3件' },
        { label: '稼働中の車両', value: '5台', subLabel: '稼働率 83%' },
        { label: '保守予定', value: '2件', subLabel: '今週の点検スケジュール' },
        { label: '未読通知', value: '4件', subLabel: 'サポートからの最新情報' },
      ],
      reservations: [
        {
          id: '予約 #20240301',
          title: 'ビジネスプラン（プレミアム自転車）',
          period: '2024/03/15 - 2024/03/31',
          status: '利用予定',
          detail: '東京本社 / 担当: 営業部 A チーム',
        },
        {
          id: '予約 #20240221',
          title: 'イベント利用（電動キックボード）',
          period: '2024/03/10 - 2024/03/12',
          status: '利用中',
          detail: '渋谷プロモーションイベント用',
        },
        {
          id: '予約 #20240111',
          title: '長期レンタル（シティバイク）',
          period: '2023/12/01 - 2024/03/01',
          status: '完了',
          detail: '大阪支社 / 担当: 管理部',
        },
      ],
      notices: [
        {
          title: '3月度のメンテナンススケジュールを公開しました',
          description: 'ご利用予定車両の点検日時をご確認ください。変更が必要な場合は前日までにご連絡ください。',
          date: '2024.03.11',
        },
        {
          title: '請求書ダウンロード機能がアップデートされました',
          description: 'CSV 出力に対応しました。マイページ内の請求管理からご利用ください。',
          date: '2024.03.08',
        },
        {
          title: '新しい従業員向け利用ガイドを追加しました',
          description: '初めて利用する方向けの動画コンテンツをご用意しました。社内共有にご活用ください。',
          date: '2024.03.05',
        },
      ],
      supportTickets: [
        {
          id: 'SUP-1032',
          subject: '請求書の宛名変更について',
          status: '対応中',
          updatedAt: '2024年3月11日 16:40',
        },
        {
          id: 'SUP-1028',
          subject: '追加ヘルメットの在庫確認',
          status: '完了',
          updatedAt: '2024年3月9日 09:12',
        },
        {
          id: 'SUP-1017',
          subject: 'ログイン権限の追加申請',
          status: '新規',
          updatedAt: '2024年3月7日 18:05',
        },
      ],
      quickLinks: [
        { label: '請求・支払い設定', href: '/pricing', description: '請求履歴やお支払い方法の管理はこちら' },
        { label: 'マニュアルダウンロード', href: '/manual_for_system', description: 'システム操作マニュアルを確認できます' },
        { label: '従業員アカウント管理', href: '/signup', description: '新規ユーザーの招待や権限設定を行います' },
        { label: '利用状況レポート', href: '/monitor', description: '稼働状況と指標を確認して運用を最適化しましょう' },
      ],
    },
  };
};

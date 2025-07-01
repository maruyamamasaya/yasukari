import Head from 'next/head';
import Link from 'next/link';

export default function BeginnerGuidePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-sm leading-relaxed">
      <Head>
        <title>はじめてガイド - yasukari</title>
      </Head>

      <img
        src="https://yasukari.com/static/images/guide/barner.jpg"
        alt="はじめてガイドバナー"
        className="w-full h-48 object-cover mb-6"
      />

      <nav className="text-xs text-center text-gray-500 space-x-2">
        <span>ホーム</span>
        <span>&gt;</span>
        <span>ご利用案内</span>
        <span>&gt;</span>
        <span>ご予約</span>
        <span>&gt;</span>
        <span>ご来店</span>
        <span>&gt;</span>
        <span>ご利用</span>
        <span>&gt;</span>
        <span>ご返却</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center">はじめてガイド</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">01. ご予約について</h2>
        <p>各車両ページより、スケジュールを確認しご予約ください。※18歳未満のお客様はご利用出来ません。</p>
        <ul className="list-disc list-inside space-y-1">
          <li>予約可能時間：ご利用予定日90日前から前営業日17時まで</li>
          <li>お支払い方法：クレジットカード払い</li>
          <li>
            ご予約内容の変更や日程変更の際は、
            <Link href="/contact" className="text-red-600 underline ml-1">お問合せ</Link>
            からご連絡の上、再度ご予約ください。
          </li>
          <li>
            キャンセルは<Link href="/contact" className="text-red-600 underline ml-1">お問合せ</Link>よりご連絡ください。4日前まで無料、3日前〜当日はレンタル料金の50％を頂戴します。
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">02. ご来店</h2>
        <p>ご来店時は下記をお持ちください。オプションでヘルメットをお申込みでないお客様はヘルメットをお持ちください。</p>
        <ul className="list-disc list-inside space-y-1">
          <li>免許書</li>
          <li>ヘルメット</li>
        </ul>
        <p>ご予約日の10時から18時30分の間にお越しください。(手続きに時間がかかる為)</p>
        <p>ヤスカリはリバイクルK-JETが運営しております。ご来店の際はリバイクルK-JETのスタッフまでお声かけ下さい。</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">03. ご利用</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>契約者様以外の貸し出し、返却はお受けできませんので必ずご本人が時間内にご来店ください。</li>
          <li>ご契約者様以外の運転は不可です。(法人名でのお貸し出しの場合は可能ですのでご相談ください)</li>
          <li>駐車違反になった際は『放置車両確認標章』が貼られたら記載してある警察署に出頭して反則金をお支払い下さい。その後、必ず当店までお電話でご連絡いただき、バイク返却時に反則金の領収書をご提示ください。確認できない場合は駐車違反1件ごとに2万円お支払いしていただきます。</li>
        </ul>
        <h3 className="font-semibold">走行距離の目安</h3>
        <p>目安以上の距離を走行するためには整備が必要な場合があります。バイクを安全に乗るためには、オイル交換と整備が必要です。目安以上の距離を走行する場合、メンテナンスが必要な際にメンテナンスを怠り車両に故障や損害が発生した場合は、車両の時価額を請求いたします。</p>
        <table className="w-full border text-center text-xs">
          <thead>
            <tr>
              <th className="border p-1">クラス</th>
              <th className="border p-1">1日</th>
              <th className="border p-1">3日</th>
              <th className="border p-1">2週間</th>
              <th className="border p-1">1カ月</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border p-1 text-left">原付</th>
              <td className="border p-1">200km</td>
              <td className="border p-1">600km</td>
              <td className="border p-1">800km</td>
              <td className="border p-1">一度持ち込みで+800km</td>
            </tr>
            <tr>
              <th className="border p-1 text-left">125cc以下</th>
              <td className="border p-1">300km</td>
              <td className="border p-1">800km</td>
              <td className="border p-1">1000km</td>
              <td className="border p-1">一度持ち込みで+1000km</td>
            </tr>
            <tr>
              <th className="border p-1 text-left">126cc~</th>
              <td className="border p-1">500km</td>
              <td className="border p-1">1000km</td>
              <td className="border p-1">1500km</td>
              <td className="border p-1">-</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2">走行中の不具合については営業時間内に契約店舗へご連絡ください。営業時間外に走行不可能になった場合は、ロードサービスをご利用ください。</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">04. ご返却</h2>
        <p>ご返却日の10時から18時30分の間にお越しください。(手続きに時間がかかる為)</p>
        <p>返却時にガソリンが満タンでない場合は、当社規定の費用をいただきます。</p>
        <ul className="list-disc list-inside space-y-1">
          <li>原付 3000円</li>
          <li>原付二種・ジャイロキャノピー 5000円</li>
          <li>それ以上 5000円</li>
        </ul>
      </section>
    </div>
  );
}


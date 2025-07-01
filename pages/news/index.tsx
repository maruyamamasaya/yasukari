import Head from 'next/head'

export default function NewsPage() {
  const posts = [
    { title: '新サービス開始のお知らせ', date: '2025-07-01', excerpt: 'バイクレンタルの新プランをスタートしました。' },
    { title: '夏季休業について', date: '2025-07-15', excerpt: 'お盆期間中の営業スケジュールを掲載しています。' },
    { title: '店舗リニューアル', date: '2025-06-20', excerpt: '内装を一新し、より快適にご利用いただけるようになりました。' },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6 text-sm leading-relaxed">
      <Head>
        <title>新着情報 - yasukari</title>
      </Head>
      <h1 className="text-xl font-bold mb-4 text-center">新着情報</h1>
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div key={idx} className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-gray-500 text-xs mb-1">{post.date}</p>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

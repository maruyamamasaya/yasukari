import Head from 'next/head'

export default function CustomerBlogPage() {
  const posts = [
    { title: 'おすすめルート紹介', date: '2025-07-05', excerpt: '常連さんが選ぶツーリングコースを写真付きでご紹介。' },
    { title: '初めてのレンタル体験記', date: '2025-06-28', excerpt: '初心者のお客様によるバイクレンタルレポートです。' },
    { title: 'スタッフとの交流イベント', date: '2025-06-10', excerpt: '店舗主催イベントの様子をレポートします。' },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6 text-sm leading-relaxed">
      <Head>
        <title>店舗ブログ - yasukari</title>
      </Head>
      <h1 className="text-xl font-bold mb-4 text-center">店舗ブログ</h1>
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

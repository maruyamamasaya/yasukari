import Head from 'next/head'

const categories = [
  {
    name: '50cc Moped Scooter',
    prices: [
      { period: '24 hours', price: '5,970円' },
      { period: '2 days', price: '10,740円' },
      { period: '4 days', price: '11,970円' },
      { period: '1 week', price: '13,470円' },
      { period: '2 weeks', price: '22,470円' },
      { period: '1 month', price: '37,470円' },
      { period: 'Per additional day', price: '11,940円' },
    ],
  },
  {
    name: 'Gyro Canopy Moped',
    prices: [
      { period: '24 hours', price: '7,470円' },
      { period: '2 days', price: '12,420円' },
      { period: '4 days', price: '13,470円' },
      { period: '1 week', price: '15,720円' },
      { period: '2 weeks', price: '25,470円' },
      { period: '1 month', price: '44,970円' },
      { period: 'Per additional day', price: '14,940円' },
    ],
  },
  {
    name: 'Gyro Canopy Minicar',
    prices: [
      { period: '24 hours', price: '8,220円' },
      { period: '2 days', price: '12,720円' },
      { period: '4 days', price: '14,970円' },
      { period: '1 week', price: '15,720円' },
      { period: '2 weeks', price: '28,470円' },
      { period: '1 month', price: '45,720円' },
      { period: 'Per additional day', price: '16,440円' },
    ],
  },
  {
    name: 'Class 2 Scooter / Manual Moped',
    prices: [
      { period: '24 hours', price: '8,970円' },
      { period: '2 days', price: '13,800円' },
      { period: '4 days', price: '16,200円' },
      { period: '1 week', price: '19,200円' },
      { period: '2 weeks', price: '29,700円' },
      { period: '1 month', price: '44,700円' },
      { period: 'Per additional day', price: '17,940円' },
    ],
  },
  {
    name: 'Class 2 Manual',
    prices: [
      { period: '24 hours', price: '10,470円' },
      { period: '2 days', price: '13,800円' },
      { period: '4 days', price: '19,200円' },
      { period: '1 week', price: '23,700円' },
      { period: '2 weeks', price: '32,700円' },
      { period: '1 month', price: '50,700円' },
      { period: 'Per additional day', price: '20,940円' },
    ],
  },
  {
    name: '126–250cc',
    prices: [
      { period: '24 hours', price: '11,970円' },
      { period: '2 days', price: '16,470円' },
      { period: '4 days', price: '22,200円' },
      { period: '1 week', price: '29,700円' },
      { period: '2 weeks', price: '47,700円' },
      { period: '1 month', price: '59,700円' },
      { period: 'Per additional day', price: '28,440円' },
    ],
  },
  {
    name: '251–400cc',
    prices: [
      { period: '24 hours', price: '17,970円' },
      { period: '2 days', price: '20,970円' },
      { period: '4 days', price: '28,200円' },
      { period: '1 week', price: '35,700円' },
      { period: '2 weeks', price: '56,700円' },
      { period: '1 month', price: '82,200円' },
      { period: 'Per additional day', price: '38,940円' },
    ],
  },
  {
    name: 'Over 400cc',
    prices: [
      { period: '24 hours', price: '22,470円' },
      { period: '2 days', price: '25,470円' },
      { period: '4 days', price: '34,200円' },
      { period: '1 week', price: '41,700円' },
      { period: '2 weeks', price: '65,700円' },
      { period: '1 month', price: '86,700円' },
      { period: 'Per additional day', price: '44,940円' },
    ],
  },
]

export default function PricingPageEn() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head>
        <title>Models & Pricing - yasukari</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-center">Vehicle Types & Rates</h1>
      <p className="mb-6 text-sm text-gray-700">
        Photos of the listed bikes are examples. Actual rental vehicles may differ in color or model year.
      </p>
      {categories.map((c) => (
        <section key={c.name} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{c.name}</h2>
          <table className="w-full text-sm border-collapse border">
            <tbody>
              {c.prices.map((p) => (
                <tr key={p.period}>
                  <th className="w-32 p-2 border text-left bg-gray-50">{p.period}</th>
                  <td className="p-2 border">{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

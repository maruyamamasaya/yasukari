import Head from 'next/head'

const categories = [
  {
    name: '50cc Moped Scooter',
    prices: [
      { period: '24 hours', price: '3,980円' },
      { period: '2 days', price: '7,160円' },
      { period: '4 days', price: '7,980円' },
      { period: '1 week', price: '8,980円' },
      { period: '2 weeks', price: '14,980円' },
      { period: '1 month', price: '24,980円' },
      { period: 'Per additional day', price: '7,960円' },
    ],
  },
  {
    name: 'Gyro Canopy Moped',
    prices: [
      { period: '24 hours', price: '4,980円' },
      { period: '2 days', price: '8,280円' },
      { period: '4 days', price: '8,980円' },
      { period: '1 week', price: '10,480円' },
      { period: '2 weeks', price: '16,980円' },
      { period: '1 month', price: '29,980円' },
      { period: 'Per additional day', price: '9,960円' },
    ],
  },
  {
    name: 'Gyro Canopy Minicar',
    prices: [
      { period: '24 hours', price: '5,480円' },
      { period: '2 days', price: '8,480円' },
      { period: '4 days', price: '9,980円' },
      { period: '1 week', price: '10,480円' },
      { period: '2 weeks', price: '18,980円' },
      { period: '1 month', price: '30,480円' },
      { period: 'Per additional day', price: '10,960円' },
    ],
  },
  {
    name: 'Class 2 Scooter / Manual Moped',
    prices: [
      { period: '24 hours', price: '5,980円' },
      { period: '2 days', price: '9,200円' },
      { period: '4 days', price: '10,800円' },
      { period: '1 week', price: '12,800円' },
      { period: '2 weeks', price: '19,800円' },
      { period: '1 month', price: '29,800円' },
      { period: 'Per additional day', price: '11,960円' },
    ],
  },
  {
    name: 'Class 2 Manual',
    prices: [
      { period: '24 hours', price: '6,980円' },
      { period: '2 days', price: '9,200円' },
      { period: '4 days', price: '12,800円' },
      { period: '1 week', price: '15,800円' },
      { period: '2 weeks', price: '21,800円' },
      { period: '1 month', price: '33,800円' },
      { period: 'Per additional day', price: '13,960円' },
    ],
  },
  {
    name: '126–250cc',
    prices: [
      { period: '24 hours', price: '7,980円' },
      { period: '2 days', price: '10,980円' },
      { period: '4 days', price: '14,800円' },
      { period: '1 week', price: '19,800円' },
      { period: '2 weeks', price: '31,800円' },
      { period: '1 month', price: '39,800円' },
      { period: 'Per additional day', price: '18,960円' },
    ],
  },
  {
    name: '251–400cc',
    prices: [
      { period: '24 hours', price: '11,980円' },
      { period: '2 days', price: '13,980円' },
      { period: '4 days', price: '18,800円' },
      { period: '1 week', price: '23,800円' },
      { period: '2 weeks', price: '37,800円' },
      { period: '1 month', price: '54,800円' },
      { period: 'Per additional day', price: '25,960円' },
    ],
  },
  {
    name: 'Over 400cc',
    prices: [
      { period: '24 hours', price: '14,980円' },
      { period: '2 days', price: '16,980円' },
      { period: '4 days', price: '22,800円' },
      { period: '1 week', price: '27,800円' },
      { period: '2 weeks', price: '43,800円' },
      { period: '1 month', price: '57,800円' },
      { period: 'Per additional day', price: '29,960円' },
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

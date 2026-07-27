import Link from 'next/link';

type Detail = { label: string; value: string };

type Props = {
  title: string;
  lead: React.ReactNode;
  actionLabel: string;
  actionHref: string;
  details?: Detail[];
};

export default function ThanksCard({ title, lead, actionLabel, actionHref, details }: Props) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-[420px] rounded-[20px] bg-white px-7 py-11 text-center shadow-xl shadow-slate-900/10">
        <h1 className="mb-2 text-[22px] font-extrabold">{title}</h1>
        <p className="mb-6 text-sm leading-7 text-slate-500">{lead}</p>
        {details?.length ? (
          <dl className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 py-1">
                <dt className="text-slate-600">{label}</dt>
                <dd className="text-right font-extrabold text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Link href={actionHref} className="inline-block rounded-full bg-red-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:text-white">
          {actionLabel}
        </Link>
        <div className="mt-6 text-xs font-extrabold tracking-wide text-red-500">ヤスカリ｜東京の格安レンタルバイク</div>
      </section>
    </main>
  );
}

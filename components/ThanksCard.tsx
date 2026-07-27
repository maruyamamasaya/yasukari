import Link from 'next/link';
import styles from './ThanksCard.module.css';

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
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="thanks-title">
        <p className={styles.eyebrow}>THANK YOU</p>
        <h1 id="thanks-title" className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
        {details?.length ? (
          <dl className={styles.details}>
            {details.map(({ label, value }) => (
              <div key={label} className={styles.detailRow}>
                <dt className={styles.detailLabel}>{label}</dt>
                <dd className={styles.detailValue}>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Link href={actionHref} className={styles.action}>
          {actionLabel}
        </Link>
        <p className={styles.brand}>ヤスカリ｜東京の格安レンタルバイク</p>
      </section>
    </main>
  );
}

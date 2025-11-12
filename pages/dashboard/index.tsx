import Link from "next/link";
import AdminLayout from "../../components/dashboard/AdminLayout";
import landingStyles from "../../styles/AdminLanding.module.css";

const cards = [
  { href: "/dashboard/bike-classes", title: "バイククラス一覧" },
  { href: "/dashboard/bike-classes/new", title: "バイククラス登録" },
  { href: "/dashboard/bike-models", title: "車種一覧" },
  { href: "/dashboard/bike-models/new", title: "車種登録" },
  { href: "/dashboard/vehicles", title: "車両一覧" },
  { href: "/dashboard/vehicles/new", title: "車両登録" },
];

export default function DashboardIndexPage() {
  return (
    <AdminLayout title="ダッシュボード">
      <div className={landingStyles.grid}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={landingStyles.card}>
            <span className={landingStyles.cardTitle}>{card.title}</span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

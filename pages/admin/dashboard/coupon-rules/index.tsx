import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { CouponRule } from "../../../../lib/dashboard/types";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";

const formatPeriod = (start?: string, end?: string) => {
  if (!start && !end) {
    return "-";
  }

  if (!start || !end) {
    return `${start ?? ""} ${end ? `〜 ${end}` : ""}`.trim();
  }

  return `${start} 〜 ${end}`;
};

const formatDiscount = (coupon: CouponRule): string => {
  if (typeof coupon.discount_amount === "number") {
    return `¥${coupon.discount_amount.toLocaleString("ja-JP")}`;
  }

  if (typeof coupon.discount_percentage === "number") {
    return `${coupon.discount_percentage}%`;
  }

  return "-";
};

export default function CouponRuleListPage() {
  const [coupons, setCoupons] = useState<CouponRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/coupon-rules");
        if (!response.ok) {
          setError("クーポン一覧の取得に失敗しました。");
          return;
        }

        const items: CouponRule[] = await response.json();
        setCoupons(items);
        setError(null);
      } catch (loadError) {
        console.error("Failed to load coupons", loadError);
        setError("クーポン一覧の取得に失敗しました。");
      }
    };

    void loadCoupons();
  }, []);

  const sortedCoupons = useMemo(() => {
    return [...coupons].sort((a, b) => a.coupon_code.localeCompare(b.coupon_code));
  }, [coupons]);

  return (
    <>
      <Head>
        <title>クーポン一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="クーポン一覧"
        description="登録済みのクーポンルールを確認・編集できます。"
        actions={[
          { label: "＋ クーポン登録", href: "/admin/dashboard/coupon-rules/register" },
        ]}
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          <div className={tableStyles.wrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>クーポンタイトル</th>
                  <th>クーポンコード</th>
                  <th>適用期間</th>
                  <th>割引内容</th>
                  <th>対象</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                      登録済みのクーポンはありません。
                    </td>
                  </tr>
                ) : (
                  sortedCoupons.map((coupon) => (
                    <tr key={coupon.coupon_code}>
                      <td>{coupon.title}</td>
                      <td>{coupon.coupon_code}</td>
                      <td>{formatPeriod(coupon.start_date, coupon.end_date)}</td>
                      <td>{formatDiscount(coupon)}</td>
                      <td>
                        <div>
                          <div>
                            バイククラス: {coupon.target_bike_class_ids?.join(", ") || "指定なし"}
                          </div>
                          <div>
                            ユーザークラス: {coupon.target_user_class_ids?.join(", ") || "指定なし"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={tableStyles.actions}>
                          <Link
                            href={`/admin/dashboard/coupon-rules/register?couponCode=${coupon.coupon_code}`}
                            className={tableStyles.link}
                          >
                            編集
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

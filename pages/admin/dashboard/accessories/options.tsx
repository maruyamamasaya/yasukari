import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { Accessory, AccessoryPriceKey } from "../../../../lib/dashboard/types";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";

const priceLabels: Record<AccessoryPriceKey, string> = {
  "24h": "24時間料金",
  "2d": "2日間料金",
  "4d": "4日間料金",
  "1w": "1週間料金",
};

const PRICE_KEYS: AccessoryPriceKey[] = ["24h", "2d", "4d", "1w"];

const formatPrice = (value?: number): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toLocaleString("ja-JP")}`;
};

export default function AccessoryOptionsPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadAccessories = async () => {
      try {
        const response = await fetch("/api/accessories");
        if (!response.ok) {
          setError("用品一覧の取得に失敗しました。");
          return;
        }

        const data: Accessory[] = await response.json();
        setAccessories(data);
        setError(null);
      } catch (loadError) {
        console.error("Failed to load accessories", loadError);
        setError("用品一覧の取得に失敗しました。");
      }
    };

    void loadAccessories();
  }, []);

  const filteredAccessories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return accessories;
    }

    return accessories.filter((item) => {
      const idText = String(item.accessory_id);
      return item.name.toLowerCase().includes(keyword) || idText.includes(keyword);
    });
  }, [accessories, searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <Head>
        <title>オプション（用品） | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="オプション（用品）"
        description="用品の料金を確認できます。"
        actions={[
          { label: "用品一覧", href: "/admin/dashboard/accessories" },
          { label: "＋ 用品登録", href: "/admin/dashboard/accessories/register" },
        ]}
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          <div className={formStyles.card}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarGroup}>
                <input
                  type="search"
                  className={styles.tableSearchInput}
                  placeholder="用品名やIDで検索"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="用品を検索"
                />
              </div>
              <div className={styles.tableToolbarGroup}>
                <Link href="/admin/dashboard/accessories/register" className={styles.tableToolbarButton}>
                  用品を登録
                </Link>
              </div>
            </div>

            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用品名</th>
                    {PRICE_KEYS.map((key) => (
                      <th key={key}>{priceLabels[key]}</th>
                    ))}
                    <th>最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccessories.map((item) => (
                    <tr key={item.accessory_id}>
                      <td>{item.accessory_id}</td>
                      <td className={tableStyles.primaryText}>{item.name}</td>
                      {PRICE_KEYS.map((key) => (
                        <td key={key} className={tableStyles.numericCell}>
                          {formatPrice(item.prices?.[key])}
                        </td>
                      ))}
                      <td>
                        {new Date(item.updated_at).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                  {filteredAccessories.length === 0 && (
                    <tr>
                      <td colSpan={7} className={tableStyles.emptyCell}>
                        該当する用品がありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

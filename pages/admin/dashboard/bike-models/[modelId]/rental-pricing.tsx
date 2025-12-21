import Head from "next/head";
import { useRouter } from "next/router";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";
import styles from "../../../../../styles/Dashboard.module.css";
import { BikeModel } from "../../../../../lib/dashboard/types";
import { toNumber } from "../../../../../lib/dashboard/utils";

type VehicleRentalPrice = {
  vehicle_type_id: number;
  days: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  days: string;
  price: string;
};

export default function BikeModelRentalPricingPage() {
  const router = useRouter();
  const modelIdParam = router.query.modelId;
  const modelId = useMemo(() => {
    const modelIdValue = Array.isArray(modelIdParam) ? modelIdParam[0] : modelIdParam;
    return typeof modelIdValue === "string" ? toNumber(modelIdValue) : undefined;
  }, [modelIdParam]);

  const [model, setModel] = useState<BikeModel | null>(null);
  const [prices, setPrices] = useState<VehicleRentalPrice[]>([]);
  const [formState, setFormState] = useState<FormState>({ days: "", price: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || modelId == null) {
      return;
    }

    const loadModel = async () => {
      try {
        const response = await fetch("/api/bike-models");
        if (!response.ok) {
          setError("車種情報の取得に失敗しました。");
          return;
        }

        const models: BikeModel[] = await response.json();
        const found = models.find((item) => item.modelId === modelId) ?? null;
        if (!found) {
          setError("指定された車種が見つかりません。");
          return;
        }

        setModel(found);
      } catch (loadError) {
        console.error("Failed to load bike model", loadError);
        setError("車種情報の取得に失敗しました。");
      }
    };

    void loadModel();
  }, [modelId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || modelId == null) {
      return;
    }

    const loadPrices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/vehicle-rental-prices?vehicle_type_id=${modelId}`
        );

        if (!response.ok) {
          setError("料金情報の取得に失敗しました。");
          setPrices([]);
          return;
        }

        const items: VehicleRentalPrice[] = await response.json();
        setPrices(items);
      } catch (loadError) {
        console.error("Failed to load rental prices", loadError);
        setError("料金情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPrices();
  }, [modelId, router.isReady]);

  const sortedPrices = useMemo(
    () => [...prices].sort((a, b) => a.days - b.days),
    [prices]
  );

  const handleInputChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (modelId == null) {
      setError("車種IDを正しく指定してください。");
      return;
    }

    const parsedDays = Number(formState.days.replace(/,/g, "").trim());
    const parsedPrice = Number(formState.price.replace(/,/g, "").trim());

    if (!Number.isInteger(parsedDays) || parsedDays <= 0) {
      setError("日数は1以上の整数で入力してください。");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("料金は0以上の数値で入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/vehicle-rental-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type_id: modelId,
          days: parsedDays,
          price: parsedPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message ?? "料金の保存に失敗しました。");
        return;
      }

      const item: VehicleRentalPrice = await response.json();
      setPrices((prev) => {
        const others = prev.filter(
          (price) => !(price.vehicle_type_id === item.vehicle_type_id && price.days === item.days)
        );
        return [...others, item];
      });
      setFormState({ days: "", price: "" });
      setSuccess("料金を保存しました。");
    } catch (submitError) {
      console.error("Failed to save rental price", submitError);
      setError("料金の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (price: VehicleRentalPrice) => {
    if (isSubmitting) {
      return;
    }

    if (!window.confirm(`${price.days}日目の料金を削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vehicle-rental-prices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type_id: price.vehicle_type_id,
          days: price.days,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message ?? "料金の削除に失敗しました。");
        return;
      }

      setPrices((prev) => prev.filter((item) => item.days !== price.days));
      setSuccess("料金を削除しました。");
    } catch (deleteError) {
      console.error("Failed to delete rental price", deleteError);
      setError("料金の削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (modelId == null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>日毎料金設定 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title={model ? `${model.modelName}の日毎料金設定` : "日毎料金設定"}
        actions={[
          { label: "車種詳細へ戻る", href: `/admin/dashboard/bike-models/${modelId}` },
          { label: "車種一覧へ", href: "/admin/dashboard/bike-models" },
        ]}
      >
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>日毎の料金設定</h1>
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p className={formStyles.success}>{success}</p>}
          {model && (
            <div className={formStyles.card}>
              <div className={formStyles.body}>
                <h2 className={styles.sectionTitle}>車種情報</h2>
                <dl className={styles.definitionList}>
                  <div className={styles.definitionItem}>
                    <dt>車種ID</dt>
                    <dd>{model.modelId}</dd>
                  </div>
                  <div className={styles.definitionItem}>
                    <dt>車種名</dt>
                    <dd>{model.modelName}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div className={formStyles.card}>
            <div className={formStyles.body}>
              <h2 className={styles.sectionTitle}>料金を追加・更新</h2>
              <form onSubmit={handleSubmit} className={formStyles.form}>
                <div className={formStyles.fields}>
                  <div className={formStyles.fieldRow}>
                    <label className={formStyles.label} htmlFor="days">
                      日数
                    </label>
                    <div className={formStyles.inputGroup}>
                      <input
                        id="days"
                        type="number"
                        min={1}
                        value={formState.days}
                        onChange={handleInputChange("days")}
                        className={formStyles.input}
                        required
                      />
                      <span className={formStyles.inlineAddon}>日目</span>
                    </div>
                  </div>
                  <div className={formStyles.fieldRow}>
                    <label className={formStyles.label} htmlFor="price">
                      料金
                    </label>
                    <div className={formStyles.inputGroup}>
                      <input
                        id="price"
                        type="number"
                        min={0}
                        value={formState.price}
                        onChange={handleInputChange("price")}
                        className={formStyles.input}
                        required
                      />
                      <span className={formStyles.inlineAddon}>円</span>
                    </div>
                  </div>
                </div>
                <div className={formStyles.actions}>
                  <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
                    {isSubmitting ? "保存中..." : "料金を保存"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className={formStyles.card}>
            <div className={formStyles.body}>
              <h2 className={styles.sectionTitle}>設定済みの料金</h2>
              {isLoading && <p className={formStyles.hint}>読み込み中です…</p>}
              {!isLoading && sortedPrices.length === 0 && (
                <p className={formStyles.hint}>まだ料金が登録されていません。</p>
              )}
              {!isLoading && sortedPrices.length > 0 && (
                <div className={tableStyles.wrapper}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th scope="col">日数</th>
                        <th scope="col">料金</th>
                        <th scope="col">更新日</th>
                        <th scope="col" className={tableStyles.actions}>
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPrices.map((price) => (
                        <tr key={`${price.vehicle_type_id}-${price.days}`}>
                          <td>{price.days}日目</td>
                          <td>{price.price.toLocaleString()}円</td>
                          <td>{price.updatedAt ? new Date(price.updatedAt).toLocaleString() : "-"}</td>
                          <td className={tableStyles.actions}>
                            <button
                              type="button"
                              className={styles.tableToolbarButton}
                              onClick={() =>
                                setFormState({
                                  days: String(price.days),
                                  price: String(price.price),
                                })
                              }
                              disabled={isSubmitting}
                            >
                              編集
                            </button>
                            <button
                              type="button"
                              className={styles.tableToolbarButton}
                              onClick={() => void handleDelete(price)}
                              disabled={isSubmitting}
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

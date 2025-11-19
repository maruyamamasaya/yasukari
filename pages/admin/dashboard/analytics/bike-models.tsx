import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel, Vehicle } from "../../../../lib/dashboard/types";

type ClassShare = {
  classId: number;
  label: string;
  count: number;
  percentage: number;
  color: string;
};

const PIE_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
];

export default function BikeModelAnalyticsPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [classShareError, setClassShareError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [classResponse, modelResponse, vehicleResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
          fetch("/api/vehicles"),
        ]);

        if (!classResponse.ok || !modelResponse.ok || !vehicleResponse.ok) {
          setClassShareError("構成比データの取得に失敗しました。");
          return;
        }

        const [classData, modelData, vehicleData] = await Promise.all([
          classResponse.json(),
          modelResponse.json(),
          vehicleResponse.json(),
        ]);

        setBikeClasses(classData);
        setBikeModels(modelData);
        setVehicles(vehicleData);
        setClassShareError(null);
      } catch (error) {
        console.error("Failed to load bike class share", error);
        setClassShareError("構成比データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const modelClassMap = useMemo(
    () =>
      bikeModels.reduce<Record<number, number>>((acc, model) => {
        acc[model.modelId] = model.classId;
        return acc;
      }, {}),
    [bikeModels]
  );

  const classShares = useMemo<ClassShare[]>(() => {
    if (bikeClasses.length === 0 || vehicles.length === 0) {
      return [];
    }

    const counts = vehicles.reduce<Record<number, number>>((acc, vehicle) => {
      const classId = modelClassMap[vehicle.modelId];
      if (!classId) {
        return acc;
      }
      acc[classId] = (acc[classId] ?? 0) + 1;
      return acc;
    }, {});

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    if (total === 0) {
      return [];
    }

    return bikeClasses
      .map((bikeClass, index) => {
        const count = counts[bikeClass.classId] ?? 0;
        const percentage = (count / total) * 100;
        return {
          classId: bikeClass.classId,
          label: bikeClass.className,
          count,
          percentage,
          color: PIE_COLORS[index % PIE_COLORS.length],
        } satisfies ClassShare;
      })
      .filter((share) => share.count > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [bikeClasses, modelClassMap, vehicles]);

  return (
    <>
      <Head>
        <title>車種分析 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="車種分析"
        description="登録車種に関する分析ページです。今後の実装に備えたプレースホルダーです。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.dashboardStatsHeader}>
            <div>
              <p className={styles.dashboardSectionKicker}>Analytics preview</p>
              <h2 className={styles.dashboardSectionTitle}>車種分析のモック</h2>
              <p className={styles.dashboardSectionNote}>
                クラス構成比や料金分布、予約数の推移などをここに集約する予定です。グラフ領域はダミーとして配置しています。
              </p>
            </div>
          </div>

          <div className={styles.analyticsGrid}>
            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>クラス別</p>
                  <h3 className={styles.dashboardSectionTitle}>構成比（円グラフ）</h3>
                  <p className={styles.dashboardSectionNote}>
                    車両クラスごとの台数構成比を DynamoDB テーブルから取得した
                    実データで可視化します。
                  </p>
                </div>
              </header>
              <div className={styles.chartBody}>
                {loading ? (
                  <p className={styles.chartPlaceholderNote}>読み込み中です…</p>
                ) : classShareError ? (
                  <p className={styles.chartError}>{classShareError}</p>
                ) : classShares.length === 0 ? (
                  <p className={styles.chartEmptyState}>
                    表示できるクラス構成データがありません。
                  </p>
                ) : (
                  <div className={styles.chartContent}>
                    <div className={styles.pieChartWrapper}>
                      <svg viewBox="0 0 42 42" role="img" aria-label="車両クラス構成比">
                        {classShares.reduce<{ offset: number; segments: JSX.Element[] }>(
                          (state, share) => {
                            const segmentLength = (share.percentage / 100) * 100;
                            const segment = (
                              <circle
                                key={share.classId}
                                className={styles.pieSegment}
                                r="16"
                                cx="21"
                                cy="21"
                                stroke={share.color}
                                strokeWidth="10"
                                strokeDasharray={`${segmentLength} ${100 - segmentLength}`}
                                strokeDashoffset={25 - state.offset}
                                transform="rotate(-90 21 21)"
                              />
                            );

                            return {
                              offset: state.offset + segmentLength,
                              segments: [...state.segments, segment],
                            };
                          },
                          { offset: 0, segments: [] }
                        ).segments}
                        <circle
                          r="14"
                          cx="21"
                          cy="21"
                          fill="white"
                          className={styles.pieChartCenter}
                        />
                        <text x="21" y="21" textAnchor="middle" dominantBaseline="middle" className={styles.pieCenterLabel}>
                          {vehicles.length}
                        </text>
                      </svg>
                    </div>
                    <dl className={styles.pieLegend}>
                      {classShares.map((share) => (
                        <div key={share.classId} className={styles.pieLegendItem}>
                          <span
                            className={styles.legendSwatch}
                            style={{ backgroundColor: share.color }}
                            aria-hidden
                          />
                          <div className={styles.legendLabels}>
                            <dt>{share.label}</dt>
                            <dd>
                              {share.count}台・{share.percentage.toFixed(1)}%
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </article>

            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>料金</p>
                  <h3 className={styles.dashboardSectionTitle}>価格帯の分布</h3>
                  <p className={styles.dashboardSectionNote}>
                    ベース料金とオプション料金のレンジをヒストグラムで表示する想定です。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartPlaceholderLabel}>Bar Chart Placeholder</div>
                <p className={styles.chartPlaceholderNote}>車種別の料金帯がここに表示されます</p>
              </div>
            </article>
          </div>

          <div className={styles.analyticsGrid}>
            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>予約数</p>
                  <h3 className={styles.dashboardSectionTitle}>車種ごとの推移</h3>
                  <p className={styles.dashboardSectionNote}>
                    予約件数の時系列推移を折れ線グラフで予定しています。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartPlaceholderLabel}>Line Chart Placeholder</div>
                <p className={styles.chartPlaceholderNote}>予約推移グラフがここに入ります</p>
              </div>
            </article>

            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>料金ビュー</p>
                  <h3 className={styles.dashboardSectionTitle}>車種別料金カード</h3>
                  <p className={styles.dashboardSectionNote}>
                    料金テーブルのレイアウト案です。仮データで枠のみ配置しています。
                  </p>
                </div>
              </header>
              <div className={styles.placeholderList}>
                {["シティバイク", "マウンテンバイク", "Eバイク"].map((label) => (
                  <div key={label} className={styles.placeholderListItem}>
                    <div>
                      <div className={styles.placeholderLabel}>{label}</div>
                      <p className={styles.placeholderSubLabel}>料金詳細がここに入ります</p>
                    </div>
                    <div className={styles.placeholderBadge}>¥0,000</div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

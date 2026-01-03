import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { KeyboxLog } from "../../../lib/keyboxLogs";
import type { Member } from "../../../lib/members";
import styles from "../../../styles/Dashboard.module.css";
import tableStyles from "../../../styles/AdminTable.module.css";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
};

const statusBadge = (success: boolean) =>
  success
    ? `${tableStyles.badge} ${tableStyles.badgeOn}`
    : `${tableStyles.badge} ${tableStyles.badgeOff}`;

const toLocalInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const defaultStart = () => {
  const now = new Date();
  return toLocalInputValue(now);
};

const defaultEnd = () => {
  const end = new Date();
  end.setHours(end.getHours() + 2);
  return toLocalInputValue(end);
};

type ReissueResponse = {
  success: boolean;
  pinCode: string;
  pinId?: string;
  unitId: string;
  qrCode?: string;
  qrImageUrl?: string;
  windowStart: string;
  windowEnd: string;
  signUsed?: string;
  targetName: string;
  reservationId?: string;
  memberId?: string;
  message?: string;
};

export default function KeyboxLogsPage() {
  const [logs, setLogs] = useState<KeyboxLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [windowStart, setWindowStart] = useState(defaultStart);
  const [windowEnd, setWindowEnd] = useState(defaultEnd);
  const [pinCode, setPinCode] = useState("");
  const [targetName, setTargetName] = useState("再発行PIN");
  const [unitId, setUnitId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ReissueResponse | null>(null);

  const loadLogs = async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/keybox-logs", { signal });
    if (!response.ok) {
      throw new Error(`ログの取得に失敗しました (${response.status})`);
    }
    const data = (await response.json()) as {
      logs?: KeyboxLog[];
      fromFallback?: boolean;
      errorMessage?: string;
    };

    setLogs(data.logs ?? []);
    setFromFallback(Boolean(data.fromFallback));
    setServerMessage(data.errorMessage ?? null);
    setError(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchLogs = async () => {
      try {
        await loadLogs(controller.signal);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error ? fetchError.message : "ログの取得中にエラーが発生しました。";
          setError(message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLogs();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/admin/members", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`会員情報の取得に失敗しました (${response.status})`);
        }
        const data = (await response.json()) as { members?: Member[] };
        setMembers(data.members ?? []);
        setMembersError(null);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "会員情報の取得中にエラーが発生しました。";
          setMembersError(message);
        }
      }
    };

    void fetchMembers();
    return () => controller.abort();
  }, []);

  const latestStatus = useMemo(() => {
    if (logs.length === 0) return "N/A";
    return logs[0].success ? "成功" : "失敗";
  }, [logs]);

  const successRate = useMemo(() => {
    if (logs.length === 0) return "-";
    const successCount = logs.filter((log) => log.success).length;
    return `${successCount} / ${logs.length}`;
  }, [logs]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/keybox-reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          windowStart,
          windowEnd,
          pinCode: pinCode || undefined,
          targetName: targetName || undefined,
          unitId: unitId || undefined,
          storeName: storeName || undefined,
          memberId: memberId || undefined,
        }),
      });

      const data = (await response.json()) as ReissueResponse | { message?: string };
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || "再発行に失敗しました。");
      }

      setResult(data as ReissueResponse);
      await loadLogs();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "再発行に失敗しました。";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>KEYBOX実行ログ | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="KEYBOX実行ログ"
        description="無人店舗の鍵発行実行結果を確認できます。直近のPIN発行リクエストやレスポンスを一覧表示します。"
      >
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.breadcrumb}>無人店舗鍵の自動発行</p>
              <h2 className={styles.sectionTitle}>実行サマリー</h2>
              <p className={styles.sectionDescription}>
                予約完了時に三ノ輪店向けのPIN発行を実行します。発行結果や失敗理由をここで確認できます。
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h3 className={styles.sectionTitle}>再発行</h3>
                <p className={styles.sectionDescription}>
                  指定した日時とPINで再発行します。会員を選択すると、利用中予約に紐づけてマイページにも反映されます。
                </p>
              </div>
            </div>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              <div className={styles.formGridTwoCols}>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>有効開始</span>
                  <input
                    type="datetime-local"
                    required
                    value={windowStart}
                    onChange={(event) => setWindowStart(event.target.value)}
                    className={styles.input}
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>有効終了</span>
                  <input
                    type="datetime-local"
                    required
                    value={windowEnd}
                    onChange={(event) => setWindowEnd(event.target.value)}
                    className={styles.input}
                  />
                </label>
              </div>
              <div className={styles.formGridTwoCols}>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>PINコード (任意)</span>
                  <input
                    type="text"
                    placeholder="未入力の場合は自動生成"
                    value={pinCode}
                    onChange={(event) => setPinCode(event.target.value)}
                    className={styles.input}
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>ターゲット名 (任意)</span>
                  <input
                    type="text"
                    placeholder="再発行PIN"
                    value={targetName}
                    onChange={(event) => setTargetName(event.target.value)}
                    className={styles.input}
                  />
                </label>
              </div>
              <div className={styles.formGridTwoCols}>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>ユニットID (任意)</span>
                  <input
                    type="text"
                    placeholder="未入力の場合は自動生成"
                    value={unitId}
                    onChange={(event) => setUnitId(event.target.value)}
                    className={styles.input}
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.formLabel}>店舗名・備考 (任意)</span>
                  <input
                    type="text"
                    placeholder="三ノ輪店"
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    className={styles.input}
                  />
                </label>
              </div>
              <label className={styles.formField}>
                <span className={styles.formLabel}>ユーザー割り当て (任意)</span>
                <select
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                  className={styles.input}
                >
                  <option value="">未指定</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                {membersError ? (
                  <p className={styles.errorText}>会員一覧を読み込めませんでした: {membersError}</p>
                ) : null}
                <p className={styles.mutedText}>
                  会員を指定すると、利用中の予約にPIN・QRを反映します。店舗名は予約情報を優先します。
                </p>
              </label>

              {submitError ? <p className={styles.errorText}>{submitError}</p> : null}

              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                  {isSubmitting ? "再発行中..." : "再発行する"}
                </button>
              </div>
            </form>

            {result ? (
              <div className={styles.card}>
                <div className={styles.sectionHeaderRow}>
                  <div>
                    <h3 className={styles.sectionTitle}>再発行結果</h3>
                    <p className={styles.sectionDescription}>
                      再発行したPIN・QRと割り当て結果を確認できます。
                    </p>
                  </div>
                </div>
                <div className={tableStyles.wrapper}>
                  <div className={tableStyles.tableWrapper}>
                    <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                      <tbody>
                        <tr>
                          <th>ステータス</th>
                          <td>{result.success ? "成功" : "失敗"}</td>
                        </tr>
                        <tr>
                          <th>PIN</th>
                          <td>{result.pinCode}</td>
                        </tr>
                        <tr>
                          <th>pinId</th>
                          <td>{result.pinId || "-"}</td>
                        </tr>
                        <tr>
                          <th>ユニットID</th>
                          <td>{result.unitId}</td>
                        </tr>
                        <tr>
                          <th>署名方式</th>
                          <td>{result.signUsed || "-"}</td>
                        </tr>
                        <tr>
                          <th>有効時間</th>
                          <td>
                            {formatDateTime(result.windowStart)} 〜 {formatDateTime(result.windowEnd)}
                          </td>
                        </tr>
                        <tr>
                          <th>割り当て</th>
                          <td>{result.reservationId ? `予約ID: ${result.reservationId}` : "未割り当て"}</td>
                        </tr>
                        <tr>
                          <th>QR</th>
                          <td>
                            {result.qrImageUrl ? (
                              <img
                                src={result.qrImageUrl}
                                alt="再発行されたQRコード"
                                className="h-24 w-24 rounded border border-gray-200 object-contain"
                              />
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>最新の実行</p>
              <p className={styles.statValue}>{latestStatus}</p>
              <p className={styles.statHelper}>もっとも新しいログの結果</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>成功 / 全体</p>
              <p className={styles.statValue}>{successRate}</p>
              <p className={styles.statHelper}>表示中ログの成功件数</p>
            </div>
          </div>

          {fromFallback || serverMessage ? (
            <div className={styles.placeholderCard}>
              <p className="font-semibold text-yellow-800">ログの取得に問題が発生したためキャッシュを表示中です。</p>
              {serverMessage ? <p className="text-sm text-gray-700">{serverMessage}</p> : null}
            </div>
          ) : null}

          {isLoading ? (
            <div className={styles.placeholderCard}>
              <p>実行ログを読み込み中です…</p>
            </div>
          ) : error ? (
            <div className={styles.placeholderCard}>
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className={styles.placeholderCard}>
              <p>表示できるログがまだありません。</p>
            </div>
          ) : (
            <div className={tableStyles.wrapper}>
              <div className={tableStyles.tableWrapper}>
                <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                  <thead>
                    <tr>
                      <th>実行日時</th>
                      <th>予約ID / 店舗</th>
                      <th>PIN情報</th>
                      <th>有効時間</th>
                      <th>QR</th>
                      <th>ステータス</th>
                      <th>備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.logId}>
                        <td>{formatDateTime(log.createdAt)}</td>
                        <td>
                          {log.reservationId ? (
                            <Link href={`/admin/dashboard/reservations/${log.reservationId}`} className={tableStyles.link}>
                              {log.reservationId}
                            </Link>
                          ) : (
                            "-"
                          )}
                          <div className="text-xs text-gray-600">{log.storeName || "-"}</div>
                        </td>
                        <td>
                          <div className="text-sm font-semibold">PIN: {log.pinCode || "-"}</div>
                          <div className="text-xs text-gray-600">pinId: {log.pinId || "-"}</div>
                          <div className="text-xs text-gray-600">unit: {log.unitId || "-"}</div>
                        </td>
                        <td>
                          <div className="text-xs">{formatDateTime(log.windowStart)} 〜</div>
                          <div className="text-xs">{formatDateTime(log.windowEnd)}</div>
                          <div className="text-xs text-gray-600">署名方式: {log.signUsed || "-"}</div>
                        </td>
                        <td>
                          {log.qrImageUrl ? (
                            <img
                              src={log.qrImageUrl}
                              alt="keybox qr"
                              className="h-16 w-16 rounded border border-gray-200 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td>
                          <span className={statusBadge(log.success)}>{log.success ? "成功" : "失敗"}</span>
                        </td>
                        <td>
                          <div className="text-xs text-gray-800">{log.message || "-"}</div>
                          {log.responseBody ? (
                            <details className="mt-1 text-xs">
                              <summary className="cursor-pointer text-gray-600">レスポンス詳細</summary>
                              <pre className="whitespace-pre-wrap break-words bg-gray-50 p-2 text-gray-800">
                                {JSON.stringify(log.responseBody, null, 2)}
                              </pre>
                            </details>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}

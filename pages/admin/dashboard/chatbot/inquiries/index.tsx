import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import { ChatbotInquirySummary } from "../../../../../lib/chatbot/inquiries";
import styles from "../../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";

type InquiryStatus = "未対応" | "対応中" | "対応済み";

const statusClassName = (status: InquiryStatus): string => {
  if (status === "対応済み") {
    return `${tableStyles.badge} ${tableStyles.badgeOn}`;
  }

  if (status === "未対応") {
    return `${tableStyles.badge} ${tableStyles.badgeOff}`;
  }

  return tableStyles.badge;
};

export default function ChatbotInquiryListPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ChatbotInquirySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chatbot/inquiries");
        if (!response.ok) {
          throw new Error(`Failed to fetch inquiries: ${response.status}`);
        }

        const data = (await response.json()) as { inquiries?: ChatbotInquirySummary[] };
        setInquiries(data.inquiries ?? []);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "不明なエラーが発生しました";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInquiries();
  }, []);

  const formatDatetime = (value: string) =>
    new Date(value).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const deriveStatus = (inquiry: ChatbotInquirySummary): InquiryStatus => {
    if (inquiry.userMessageCount === 0) {
      return "未対応";
    }

    if (inquiry.messageCount > inquiry.userMessageCount) {
      return "対応済み";
    }

    return "対応中";
  };

  const filteredInquiries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return inquiries;
    }

    return inquiries.filter((inquiry) => {
      return (
        inquiry.sessionId.toLowerCase().includes(keyword) ||
        (inquiry.userId ?? "").toLowerCase().includes(keyword) ||
        inquiry.clientId.toLowerCase().includes(keyword) ||
        (inquiry.firstUserMessage ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [inquiries, searchTerm]);

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, sessionId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void router.push(`/admin/dashboard/chatbot/inquiries/${sessionId}`);
    }
  };

  return (
    <>
      <Head>
        <title>チャットボット問い合わせ一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="チャットボット問い合わせ一覧"
        description="チャットボット経由で届いたお問い合わせの内容と対応状況を確認できます。"
      >
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>チャットボット問い合わせ一覧</h2>
            <p className={styles.sectionDescription}>
              DynamoDB に保存された session_id / user_id / client_id をキーに会話履歴を参照し、問い合わせごとに返信できます。
            </p>
          </div>

          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>問い合わせを検索</h3>
              <p className={styles.sectionDescription}>
                session_id / user_id / client_id / 最初のメッセージを対象にフィルターできます。
              </p>
            </div>
            <input
              type="search"
              className={styles.tableSearchInput}
              placeholder="セッション ID や client_id を入力"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="チャットボット問い合わせを検索"
            />
          </div>

          {isLoading ? (
            <div className={styles.placeholderCard}>
              <p>問い合わせを読み込み中です…</p>
            </div>
          ) : error ? (
            <div className={styles.placeholderCard}>
              <p>問い合わせの取得に失敗しました。</p>
              <p className={styles.sectionDescription}>{error}</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className={styles.placeholderCard}>
              <p>チャットボットへの問い合わせがまだありません。</p>
              <p className={styles.sectionDescription}>
                DynamoDB の ChatSessions / ChatMessages テーブルからデータを直接読み込んで一覧表示します。
              </p>
            </div>
          ) : (
            <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
              <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                <thead>
                  <tr>
                    <th scope="col">顧客名</th>
                    <th scope="col">ログインしているユーザー名</th>
                    <th scope="col">受付日時</th>
                    <th scope="col">最終更新</th>
                    <th scope="col">ユーザー発言</th>
                    <th scope="col">最初のメッセージ</th>
                    <th scope="col">対応状況</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => {
                    const status = deriveStatus(inquiry);
                    return (
                      <tr
                        key={inquiry.sessionId}
                        className={tableStyles.clickableRow}
                        onClick={() => void router.push(`/admin/dashboard/chatbot/inquiries/${inquiry.sessionId}`)}
                        onKeyDown={(event) => handleRowKeyDown(event, inquiry.sessionId)}
                        tabIndex={0}
                        aria-label={`${inquiry.sessionId} の詳細を開く`}
                      >
                        <td className={tableStyles.monospace}>{inquiry.clientId}</td>
                        <td>{inquiry.userId ?? "未ログインユーザー"}</td>
                        <td>{formatDatetime(inquiry.createdAt)}</td>
                        <td>{formatDatetime(inquiry.lastActivityAt)}</td>
                        <td>{inquiry.userMessageCount} 件</td>
                        <td>{inquiry.firstUserMessage ?? "(メッセージなし)"}</td>
                        <td>
                          <span className={statusClassName(status)}>{status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}

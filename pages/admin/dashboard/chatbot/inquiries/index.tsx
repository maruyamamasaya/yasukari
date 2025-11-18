import { KeyboardEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { ChatbotInquiry, chatbotInquiries } from "../../../../lib/chatbot/inquiries";
import styles from "../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";

const statusClassName = (status: ChatbotInquiry["status"]): string => {
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

  const formatDatetime = (value: string) =>
    new Date(value).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

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

          <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th scope="col">セッションID</th>
                  <th scope="col">受付日時</th>
                  <th scope="col">トピック</th>
                  <th scope="col">要約</th>
                  <th scope="col">最終更新</th>
                  <th scope="col">対応状況</th>
                </tr>
              </thead>
              <tbody>
                {chatbotInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.sessionId}
                    className={tableStyles.clickableRow}
                    onClick={() => void router.push(`/admin/dashboard/chatbot/inquiries/${inquiry.sessionId}`)}
                    onKeyDown={(event) => handleRowKeyDown(event, inquiry.sessionId)}
                    tabIndex={0}
                    aria-label={`${inquiry.ticketId} の詳細を開く`}
                  >
                    <td className={tableStyles.monospace}>{inquiry.sessionId}</td>
                    <td>{formatDatetime(inquiry.createdAt)}</td>
                    <td>{inquiry.topic}</td>
                    <td>{inquiry.summary}</td>
                    <td>{formatDatetime(inquiry.lastActivityAt)}</td>
                    <td>
                      <span className={statusClassName(inquiry.status)}>{inquiry.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

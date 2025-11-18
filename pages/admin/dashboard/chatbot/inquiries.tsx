import Head from "next/head";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";

type ChatbotInquiry = {
  id: string;
  receivedAt: string;
  customerName: string;
  contact: string;
  topic: string;
  summary: string;
  status: "未対応" | "対応中" | "対応済み";
};

const inquiries: ChatbotInquiry[] = [
  {
    id: "CB-20240701-0001",
    receivedAt: "2025-07-01 10:32",
    customerName: "山田 太郎",
    contact: "taro.yamada@example.com",
    topic: "料金・プラン",
    summary: "休日割引はありますか？",
    status: "未対応",
  },
  {
    id: "CB-20240701-0002",
    receivedAt: "2025-07-01 11:18",
    customerName: "佐藤 花子",
    contact: "090-1234-5678",
    topic: "補償内容",
    summary: "事故時の自己負担額を知りたいです。",
    status: "対応中",
  },
  {
    id: "CB-20240630-0008",
    receivedAt: "2025-06-30 17:42",
    customerName: "John Smith",
    contact: "john.smith@example.com",
    topic: "予約変更",
    summary: "日時の変更はチャットから可能でしょうか？",
    status: "対応済み",
  },
];

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
            <h2 className={styles.sectionTitle}>最近の問い合わせ</h2>
            <p className={styles.sectionDescription}>
              現在はダミーデータを表示しています。実際の問い合わせデータ連携は今後の開発予定です。
            </p>
          </div>
          <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th scope="col">チケットID</th>
                  <th scope="col">受付日時</th>
                  <th scope="col">利用者</th>
                  <th scope="col">連絡先</th>
                  <th scope="col">トピック</th>
                  <th scope="col">要約</th>
                  <th scope="col">対応状況</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>{inquiry.id}</td>
                    <td>{inquiry.receivedAt}</td>
                    <td>{inquiry.customerName}</td>
                    <td>{inquiry.contact}</td>
                    <td>{inquiry.topic}</td>
                    <td>{inquiry.summary}</td>
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

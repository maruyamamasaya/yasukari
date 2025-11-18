import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import Head from "next/head";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";

type ChatMessage = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  userId: string | null;
  clientId: string;
  createdAt: string;
  messageIndex: number;
};

type ChatbotInquiry = {
  sessionId: string;
  ticketId: string;
  isLoggedIn: boolean;
  userId: string | null;
  clientId: string;
  topic: string;
  contact: string;
  summary: string;
  status: "未対応" | "対応中" | "対応済み";
  createdAt: string;
  lastActivityAt: string;
  messages: ChatMessage[];
};

const initialInquiries: ChatbotInquiry[] = [
  {
    sessionId: "session-20240701-0001",
    ticketId: "CB-20240701-0001",
    isLoggedIn: true,
    userId: "user-92301",
    clientId: "client-a1b2c3",
    topic: "料金・プラン",
    contact: "メール: taro.yamada@example.com",
    summary: "休日割引の適用条件を確認したいです。",
    status: "未対応",
    createdAt: "2025-07-01T10:32:00+09:00",
    lastActivityAt: "2025-07-01T10:33:15+09:00",
    messages: [
      {
        messageId: "msg-0001",
        role: "user",
        content: "休日割引はありますか？",
        userId: "user-92301",
        clientId: "client-a1b2c3",
        createdAt: "2025-07-01T10:32:00+09:00",
        messageIndex: 1,
      },
      {
        messageId: "msg-0002",
        role: "assistant",
        content: "はい、週末のご利用には休日割引が適用されます。条件をお調べしましょうか？",
        userId: "user-92301",
        clientId: "client-a1b2c3",
        createdAt: "2025-07-01T10:32:32+09:00",
        messageIndex: 2,
      },
      {
        messageId: "msg-0003",
        role: "user",
        content: "お願いします。予約変更時も使えますか？",
        userId: "user-92301",
        clientId: "client-a1b2c3",
        createdAt: "2025-07-01T10:33:15+09:00",
        messageIndex: 3,
      },
    ],
  },
  {
    sessionId: "session-20240701-0002",
    ticketId: "CB-20240701-0002",
    isLoggedIn: false,
    userId: null,
    clientId: "client-z9y8x7",
    topic: "補償内容",
    contact: "SMS: 090-1234-5678",
    summary: "事故時の自己負担額と申請手順を確認したいです。",
    status: "対応中",
    createdAt: "2025-07-01T11:18:00+09:00",
    lastActivityAt: "2025-07-01T11:25:43+09:00",
    messages: [
      {
        messageId: "msg-0101",
        role: "user",
        content: "事故時の自己負担額を教えてください。",
        userId: null,
        clientId: "client-z9y8x7",
        createdAt: "2025-07-01T11:18:00+09:00",
        messageIndex: 1,
      },
      {
        messageId: "msg-0102",
        role: "assistant",
        content: "プランごとの負担額は20,000円〜となります。詳しい補償表をお送りします。",
        userId: null,
        clientId: "client-z9y8x7",
        createdAt: "2025-07-01T11:18:30+09:00",
        messageIndex: 2,
      },
      {
        messageId: "msg-0103",
        role: "user",
        content: "申請手順も教えてください。ログインしていなくても大丈夫ですか？",
        userId: null,
        clientId: "client-z9y8x7",
        createdAt: "2025-07-01T11:25:43+09:00",
        messageIndex: 3,
      },
    ],
  },
  {
    sessionId: "session-20240630-0008",
    ticketId: "CB-20240630-0008",
    isLoggedIn: true,
    userId: "user-77012",
    clientId: "client-h4i5j6",
    topic: "予約変更",
    contact: "メール: john.smith@example.com",
    summary: "日時の変更はチャットから可能でしょうか？",
    status: "対応済み",
    createdAt: "2025-06-30T17:42:00+09:00",
    lastActivityAt: "2025-06-30T18:02:10+09:00",
    messages: [
      {
        messageId: "msg-0201",
        role: "user",
        content: "日時の変更はチャットから可能でしょうか？",
        userId: "user-77012",
        clientId: "client-h4i5j6",
        createdAt: "2025-06-30T17:42:00+09:00",
        messageIndex: 1,
      },
      {
        messageId: "msg-0202",
        role: "assistant",
        content: "はい、予約変更はチャットから承れます。希望日時を教えてください。",
        userId: "user-77012",
        clientId: "client-h4i5j6",
        createdAt: "2025-06-30T17:42:48+09:00",
        messageIndex: 2,
      },
      {
        messageId: "msg-0203",
        role: "user",
        content: "7/15の午前に変更したいです。",
        userId: "user-77012",
        clientId: "client-h4i5j6",
        createdAt: "2025-06-30T17:58:10+09:00",
        messageIndex: 3,
      },
      {
        messageId: "msg-0204",
        role: "assistant",
        content: "ご希望を承りました。変更完了後にメールでお知らせします。",
        userId: "user-77012",
        clientId: "client-h4i5j6",
        createdAt: "2025-06-30T18:02:10+09:00",
        messageIndex: 4,
      },
    ],
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
  const [chatInquiries, setChatInquiries] = useState<ChatbotInquiry[]>(initialInquiries);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialInquiries[0]?.sessionId ?? "");
  const [replyText, setReplyText] = useState<string>("");

  const selectedInquiry = useMemo(
    () => chatInquiries.find((inquiry) => inquiry.sessionId === selectedSessionId),
    [chatInquiries, selectedSessionId],
  );

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
      setSelectedSessionId(sessionId);
    }
  };

  const handleReplySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedInquiry || replyText.trim() === "") {
      return;
    }

    setChatInquiries((prev) =>
      prev.map((inquiry) => {
        if (inquiry.sessionId !== selectedInquiry.sessionId) {
          return inquiry;
        }

        const now = new Date().toISOString();
        const nextIndex = inquiry.messages.length + 1;
        const assistantMessage: ChatMessage = {
          messageId: `reply-${now}`,
          role: "assistant",
          content: replyText.trim(),
          userId: inquiry.userId,
          clientId: inquiry.clientId,
          createdAt: now,
          messageIndex: nextIndex,
        };

        return {
          ...inquiry,
          messages: [...inquiry.messages, assistantMessage],
          lastActivityAt: now,
          status: inquiry.status === "未対応" ? "対応中" : inquiry.status,
        };
      }),
    );

    setReplyText("");
  };

  const sortedMessages = useMemo(() => {
    if (!selectedInquiry) {
      return [];
    }

    return [...selectedInquiry.messages].sort((a, b) => a.messageIndex - b.messageIndex);
  }, [selectedInquiry]);

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

          <div className={styles.splitLayout}>
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
                  {chatInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.sessionId}
                      className={`${tableStyles.clickableRow} ${selectedSessionId === inquiry.sessionId ? tableStyles.selectedRow : ""}`}
                      onClick={() => setSelectedSessionId(inquiry.sessionId)}
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

            <div className={styles.detailStack}>
              {selectedInquiry ? (
                <>
                  <div className={styles.detailPanel}>
                    <div className={styles.detailHeader}>
                      <div>
                        <p className={styles.tagline}>Session: {selectedInquiry.sessionId}</p>
                        <h3 className={styles.detailTitle}>{selectedInquiry.topic}</h3>
                        <p className={styles.sectionDescription}>{selectedInquiry.summary}</p>
                      </div>
                      <span className={statusClassName(selectedInquiry.status)}>{selectedInquiry.status}</span>
                    </div>

                    <dl className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <dt>ログイン状態</dt>
                        <dd>{selectedInquiry.isLoggedIn ? "ログイン済み" : "未ログイン (client_id で紐付け)"}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>user_id</dt>
                        <dd className={styles.monospace}>{selectedInquiry.userId ?? "(null)"}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>client_id</dt>
                        <dd className={styles.monospace}>{selectedInquiry.clientId}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>チケットID</dt>
                        <dd className={styles.monospace}>{selectedInquiry.ticketId}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>作成日時</dt>
                        <dd>{formatDatetime(selectedInquiry.createdAt)}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>最終アクティビティ</dt>
                        <dd>{formatDatetime(selectedInquiry.lastActivityAt)}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>連絡先</dt>
                        <dd>{selectedInquiry.contact}</dd>
                      </div>
                      <div className={styles.detailItem}>
                        <dt>メッセージ数</dt>
                        <dd>{selectedInquiry.messages.length} 件</dd>
                      </div>
                    </dl>
                  </div>

                  <div className={styles.detailPanel}>
                    <div className={styles.detailHeader}>
                      <h3 className={styles.detailTitle}>会話履歴</h3>
                      <p className={styles.sectionDescription}>
                        DynamoDB の ChatMessages テーブルに保存されるメッセージ順に表示しています。
                      </p>
                    </div>

                    <ol className={styles.conversationList}>
                      {sortedMessages.map((message) => (
                        <li key={message.messageId} className={styles.conversationItem}>
                          <div className={styles.conversationMeta}>
                            <div className={styles.conversationMetaLeft}>
                              <span
                                className={`${tableStyles.badge} ${message.role === "assistant" ? tableStyles.badgeOn : tableStyles.badgeOff}`}
                              >
                                {message.role === "assistant" ? "ボット" : "ユーザー"}
                              </span>
                              <span className={styles.monospace}># {message.messageIndex}</span>
                            </div>
                            <div className={styles.conversationMetaRight}>
                              <span className={styles.monospace}>{message.userId ?? "(null)"}</span>
                              <span className={styles.monospace}>{message.clientId}</span>
                              <span>{formatDatetime(message.createdAt)}</span>
                            </div>
                          </div>
                          <p className={styles.conversationContent}>{message.content}</p>
                        </li>
                      ))}
                    </ol>

                    <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                      <label className={styles.replyLabel} htmlFor="chatbot-reply">
                        返信内容
                      </label>
                      <textarea
                        id="chatbot-reply"
                        className={styles.replyTextarea}
                        placeholder="ここに管理者からの返信を入力し、ChatMessages に assistant ロールとして保存します。"
                        rows={4}
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                      />
                      <div className={styles.replyActions}>
                        <button type="submit" className={`${styles.iconButton} ${styles.iconButtonAccent}`} disabled={!replyText.trim()}>
                          返信を追加
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className={styles.placeholderCard}>
                  <p>会話を選択すると、session_id ごとの履歴と返信フォームを表示します。</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}

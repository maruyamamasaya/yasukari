export type ChatMessage = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  userId: string | null;
  clientId: string;
  createdAt: string;
  messageIndex: number;
};

export type ChatbotInquiry = {
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

export const chatbotInquiries: ChatbotInquiry[] = [
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

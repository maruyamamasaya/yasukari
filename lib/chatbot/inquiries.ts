export type ChatMessage = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  userId: string | null;
  clientId: string;
  createdAt: string;
  messageIndex: number;
  history?: ChatHistoryEntry[];
};

export type ChatHistoryEntry = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  userId: string | null;
  clientId: string;
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

export type ChatbotInquirySummary = {
  sessionId: string;
  isLoggedIn: boolean;
  userId: string | null;
  clientId: string;
  createdAt: string;
  lastActivityAt: string;
  messageCount: number;
  userMessageCount: number;
  firstUserMessage?: string;
};

export type ChatbotInquiryDetail = ChatbotInquirySummary & {
  messages: ChatMessage[];
  history?: ChatHistoryEntry[];
};

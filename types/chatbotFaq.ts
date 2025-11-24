export type ChatbotFaqItem = {
  q: string;
  a: string;
};

export type ChatbotFaqCategory = {
  id: string;
  title: string;
  faqs: ChatbotFaqItem[];
};

export type ChatbotFaqData = {
  categories: ChatbotFaqCategory[];
  updatedAt?: string;
};

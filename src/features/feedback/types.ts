export type FeedbackTopic = "QUESTION" | "BUG" | "IDEA" | "COMPLAINT";
export type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export interface CreateFeedbackPayload {
  topic: FeedbackTopic;
  email: string;
  message: string;
  link?: string;
  screenshotUrl?: string;
}

export interface FeedbackResponse {
  id: string;
  topic: FeedbackTopic;
  email: string;
  message: string;
  link: string | null;
  screenshotUrl: string | null;
  userId: string | null;
  userName: string | null;
  userAvatarUrl: string | null;
  status: FeedbackStatus;
  moderatorNote: string | null;
  handledByName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FeedbackListResponse {
  items: FeedbackResponse[];
  statusCounts: Record<FeedbackStatus, number>;
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface UpdateFeedbackPayload {
  status?: FeedbackStatus;
  moderatorNote?: string;
}

export const FEEDBACK_TOPICS: {
  value: FeedbackTopic;
  label: string;
  placeholder: string;
}[] = [
  {
    value: "QUESTION",
    label: "Питання",
    placeholder: "Що саме незрозуміло? Наприклад: як продовжити термін читання",
  },
  {
    value: "BUG",
    label: "Щось не працює",
    placeholder: "Що ви робили, що очікували побачити і що сталося натомість",
  },
  {
    value: "IDEA",
    label: "Пропозиція",
    placeholder: "Що б ви додали чи змінили в сервісі?",
  },
  {
    value: "COMPLAINT",
    label: "Скарга",
    placeholder: "Опишіть, що сталося і хто учасник",
  },
];

export const FEEDBACK_TOPIC_LABELS: Record<FeedbackTopic, string> = {
  QUESTION: "Питання",
  BUG: "Проблема",
  IDEA: "Пропозиція",
  COMPLAINT: "Скарга",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: "Нові",
  IN_PROGRESS: "В роботі",
  RESOLVED: "Вирішені",
};

export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 2000;

export const SUPPORT_EMAIL: string | undefined =
  import.meta.env.VITE_SUPPORT_EMAIL || undefined;

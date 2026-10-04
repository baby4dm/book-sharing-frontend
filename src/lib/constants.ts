import type { ExchangeStatus } from "@/features/exchanges/types";
import type { ListingStatus } from "@/features/listings/types";
import {
  IconCheck,
  IconClock,
  IconBooks,
  IconArchive,
  IconAlertTriangle,
  IconBook,
  IconGavel,
  IconRotateClockwise,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export const AUTH_TOKEN_KEY = "authToken";
export const GENRES = [
  "Класика",
  "Наукова фантастика",
  "Фентезі",
  "Детектив",
  "Проза",
  "Пригоди",
  "Поезія",
  "Антиутопія",
  "Жахи",
] as const;
export const DELIVERY_METHODS = {
  PICKUP: "Особиста зустріч",
  MAIL: "Поштою",
};
export const STATUS_CONFIG: Record<
  ListingStatus,
  {
    label: string;
    buttonLabel: string;
    color: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  AVAILABLE: {
    label: "Доступна",
    buttonLabel: "Подати заявку",
    color: "text-success",
    icon: IconCheck,
  },
  RESERVED: {
    label: "Зарезервована",
    buttonLabel: "Уже зарезервована",
    color: "text-warning",
    icon: IconClock,
  },
  IN_EXCHANGE: {
    label: "У читанні",
    buttonLabel: "Зараз у читача",
    color: "text-info",
    icon: IconBooks,
  },
  ARCHIVED: {
    label: "Архівовано",
    buttonLabel: "Знято з публікації",
    color: "text-muted-foreground",
    icon: IconArchive,
  },
};
export const REGIONS = [
  "Вінницька область",
  "Волинська область",
  "Дніпропетровська область",
  "Донецька область",
  "Житомирська область",
  "Закарпатська область",
  "Запорізька область",
  "Івано-Франківська область",
  "Київська область",
  "Кіровоградська область",
  "Луганська область",
  "Львівська область",
  "Миколаївська область",
  "Одеська область",
  "Полтавська область",
  "Рівненська область",
  "Сумська область",
  "Тернопільська область",
  "Харківська область",
  "Херсонська область",
  "Хмельницька область",
  "Черкаська область",
  "Чернівецька область",
  "Чернігівська область",
  "Автономна Республіка Крим",
] as const;
export const EXCHANGE_STATUS_CONFIG: Record<
  ExchangeStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  HANDOVER_PENDING: {
    label: "Очікує передачі",
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: IconClock,
  },
  IN_READING: {
    label: "У читанні",
    color: "text-info",
    bgColor: "bg-info/10",
    icon: IconBook,
  },
  RETURN_PENDING: {
    label: "Очікує повернення",
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: IconRotateClockwise,
  },
  COMPLETED: {
    label: "Завершено",
    color: "text-success",
    bgColor: "bg-success/10",
    icon: IconCheck,
  },
  OVERDUE: {
    label: "Прострочено",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: IconAlertTriangle,
  },
  DISPUTED: {
    label: "Спір",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: IconGavel,
  },
};

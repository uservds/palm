// lib/mockProfile.ts

export type ReportType = "individual" | "couple" | "friendship" | "business" | "wedding-date";

export interface ArchivedReport {
  id: string;
  type: ReportType;
  title: string;
  archetype: string;
  createdAt: string; // ISO
  thumbnailColor: string; // временно вместо реального превью руки
  isPaid: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  isLeftHanded: boolean | null; // для будущей валидации руки (Приоритет 10)
}

export interface MockSubscription {
  status: "active" | "inactive" | "cancelled";
  plan: "monthly";
  price: 590;
  nextBillingDate: string | null;
  startedAt: string | null;
}

export const mockUser: MockUser = {
  id: "usr_mock_1",
  name: "Анна Светлова",
  email: "anna@example.com",
  createdAt: "2026-09-12T10:00:00Z",
  isLeftHanded: null,
};

export const mockSubscription: MockSubscription = {
  status: "inactive",
  plan: "monthly",
  price: 590,
  nextBillingDate: null,
  startedAt: null,
};

const reportTypeLabels: Record<ReportType, string> = {
  individual: "Индивидуальный разбор",
  couple: "Совместимость пары",
  friendship: "Совместимость дружбы",
  business: "Деловые партнёры",
  "wedding-date": "Дата свадьбы",
};

export function getReportTypeLabel(type: ReportType): string {
  return reportTypeLabels[type];
}

export const mockArchive: ArchivedReport[] = [
  {
    id: "rep_1",
    type: "individual",
    title: "Личный разбор ладони",
    archetype: "Провидец",
    createdAt: "2026-10-18T14:32:00Z",
    thumbnailColor: "#ECFEFF",
    isPaid: true,
  },
  {
    id: "rep_2",
    type: "couple",
    title: "Совместимость с партнёром",
    archetype: "Союз Огня и Воды",
    createdAt: "2026-10-05T09:15:00Z",
    thumbnailColor: "#FFF4F0",
    isPaid: true,
  },
  {
    id: "rep_3",
    type: "individual",
    title: "Личный разбор ладони",
    archetype: "Хранитель",
    createdAt: "2026-09-20T18:40:00Z",
    thumbnailColor: "#ECFEFF",
    isPaid: false,
  },
];
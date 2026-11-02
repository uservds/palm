const DEFAULT_API_URL = "http://localhost:3001";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL;

export type VisionLockedBlock = {
  title: string;
  [key: string]: unknown;
};

export type VisionImageQuality = {
  score: number;
  issues?: string[];
  user_hint?: string | null;
};

export type VisionMeta = {
  provider: string;
  model: string;
  processing_time_ms: number;
  hand?: string;
  confidence: number;
};

export type VisionSuccessResponse = {
  ok: true;
  archetype: string;
  metaphor?: string;
  insights: string[];
  locked_block_titles: string[];
  free_insights: string[];
  locked_blocks: VisionLockedBlock[];
  scientific_facts?: string[];
  progress_percent?: number;
  disclaimer?: string;
  cta?: string;
  image_quality?: VisionImageQuality;
  is_fallback: boolean;
  meta?: VisionMeta;
};

export type VisionErrorResponse = {
  ok: false;
  error: {
    code: string;
    user_message: string;
    details?: unknown;
  };
};

export type VisionResponse = VisionSuccessResponse | VisionErrorResponse;

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

/**
 * Uploads a palm photo to the backend and returns the parsed report.
 * Throws ApiError with a user-facing message on any failure.
 */
export async function analyzePalmImage(
  file: File
): Promise<VisionSuccessResponse> {
  const formData = new FormData();
  formData.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/vision`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова."
    );
  }

  let data: VisionResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Сервер вернул некорректный ответ. Попробуйте позже."
    );
  }

  if (!data.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.user_message || "Не удалось обработать фото. Попробуйте позже."
    );
  }

  return data;
}

// ============================================================
// Compatibility (couple) — /api/compatibility/couple
// ============================================================

export type CompatibilityArchetype = {
  name: string;
  energies: string[];
};

export type CompatibilityInsight = {
  section_id: string;
  title: string;
  text: string;
};

export type CompatibilityLockedBlock = {
  section_id: string;
  title: string;
  teaser: string;
};

export type CompatibilityImageQuality = VisionImageQuality;

export type CompatibilityMeta = {
  provider: string;
  model: string;
  processing_time_ms: number;
};

export type CompatibilitySuccessResponse = {
  ok: true;
  couple_archetype: CompatibilityArchetype;
  overall_score: number;
  free_insights: CompatibilityInsight[];
  locked_blocks: CompatibilityLockedBlock[];
  disclaimer?: string;
  cta?: string;
  image_quality: {
    a: CompatibilityImageQuality | null;
    b: CompatibilityImageQuality | null;
  };
  is_fallback: boolean;
  meta?: CompatibilityMeta;
};

// Форма ошибки у /api/compatibility/couple идентична /api/vision
// ({ ok: false, error: { code, user_message, details? } }), поэтому
// переиспользуем VisionErrorResponse, а не заводим дубль.
export type CompatibilityResponse = CompatibilitySuccessResponse | VisionErrorResponse;

/**
 * Загружает фото ладоней обоих партнёров и возвращает отчёт о совместимости.
 * Throws ApiError с пользовательским сообщением при любой ошибке —
 * тот же контракт, что у analyzePalmImage.
 */
export async function analyzeCoupleCompatibility(
  fileA: File,
  fileB: File,
  genderB: "male" | "female",
  genderA?: "male" | "female"
): Promise<CompatibilitySuccessResponse> {
  const formData = new FormData();
  formData.append("image_a", fileA);
  formData.append("image_b", fileB);
  formData.append("gender_b", genderB);
  if (genderA) {
    formData.append("gender_a", genderA);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/compatibility/couple`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова."
    );
  }

  let data: CompatibilityResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Сервер вернул некорректный ответ. Попробуйте позже."
    );
  }

  if (!data.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.user_message || "Не удалось рассчитать совместимость. Попробуйте позже."
    );
  }

  return data;
}

// ============================================================
// Compatibility (group: friendship / business) —
// /api/compatibility/friendship, /api/compatibility/business
// ============================================================

export type GroupArchetype = {
  title: string;
  description: string;
};

export type GroupCompatibilitySuccessResponse = {
  ok: true;
  group_archetype: GroupArchetype;
  overall_score: number;
  participant_count: number;
  free_insights: CompatibilityInsight[];
  locked_blocks: CompatibilityLockedBlock[];
  disclaimer?: string;
  cta?: string;
  image_quality: (CompatibilityImageQuality | null)[];
  is_fallback: boolean;
  meta?: CompatibilityMeta;
};

export type GroupCompatibilityResponse = GroupCompatibilitySuccessResponse | VisionErrorResponse;

async function analyzeGroupCompatibility(
  kind: "friendship" | "business",
  files: File[]
): Promise<GroupCompatibilitySuccessResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/compatibility/${kind}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова."
    );
  }

  let data: GroupCompatibilityResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Сервер вернул некорректный ответ. Попробуйте позже."
    );
  }

  if (!data.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.user_message || "Не удалось рассчитать совместимость. Попробуйте позже."
    );
  }

  return data;
}

export function analyzeFriendshipCompatibility(
  files: File[]
): Promise<GroupCompatibilitySuccessResponse> {
  return analyzeGroupCompatibility("friendship", files);
}

export function analyzeBusinessCompatibility(
  files: File[]
): Promise<GroupCompatibilitySuccessResponse> {
  return analyzeGroupCompatibility("business", files);
}
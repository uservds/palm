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

import { API_URL, ApiError } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = {
  ok: true;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type AuthErrorResponse = {
  ok: false;
  error: { code: string; user_message: string };
};

const ACCESS_TOKEN_KEY = "palmai_access_token";
const REFRESH_TOKEN_KEY = "palmai_refresh_token";

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова."
    );
  }

  let data: AuthResponse | AuthErrorResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("INVALID_RESPONSE", "Сервер вернул некорректный ответ.");
  }

  if (!data.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.user_message || "Не удалось выполнить запрос. Попробуйте позже."
    );
  }

  storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function registerUser(params: { email: string; password: string; name: string }) {
  return postAuth("/api/auth/register", params);
}

export async function loginUser(params: { email: string; password: string }) {
  return postAuth("/api/auth/login", params);
}

export async function logoutUser() {
  const tokens = getStoredTokens();
  clearTokens();
  if (!tokens) return;

  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
  } catch {
    // локальный выход всё равно засчитан, даже если сервер недоступен
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = await response.json();
  return data.ok ? data.user : null;
}

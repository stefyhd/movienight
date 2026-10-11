import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { API_URL } from "./api";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  country: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  country: string;
};

type Tokens = {
  access: string;
  refresh: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const isWeb = Platform.OS === "web";
const refreshKey = "movie-night.refresh";

let accessToken: string | null = null;
let refreshing: Promise<void> | null = null;

const expiredListeners = new Set<() => void>();

export function onSessionExpired(listener: () => void) {
  expiredListeners.add(listener);

  return () => {
    expiredListeners.delete(listener);
  };
}

async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const method = (options.method || "GET").toUpperCase();

  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (isWeb && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = await http<{ csrfToken: string }>("/api/auth/csrf/");
    headers.set("X-CSRFToken", csrf.csrfToken);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: isWeb ? "include" : "omit",
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object"
          ? Object.values(data).flat().map(String).join("\n")
          : `Eroare HTTP ${response.status}.`;

      throw new ApiError(response.status, message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new Error(
      "Nu am putut contacta API-ul. Verifică conexiunea și backendul.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshAccess(): Promise<void> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const refresh = await SecureStore.getItemAsync(refreshKey);

    if (!refresh) {
      throw new ApiError(401, "Intră în cont pentru a continua.");
    }

    const data = await http<{ access: string }>("/api/auth/jwt/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });

    accessToken = data.access;
  })();

  try {
    await refreshing;
  } finally {
    refreshing = null;
  }
}

function withAccess(options: RequestInit): RequestInit {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return { ...options, headers };
}

// Toate cererile private viitoare vor folosi această funcție.
export async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    if (isWeb) {
      return await http<T>(path, options);
    }

    if (!accessToken) await refreshAccess();

    try {
      return await http<T>(path, withAccess(options));
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }

    await refreshAccess();
    return await http<T>(path, withAccess(options));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      accessToken = null;

      if (!isWeb) {
        await SecureStore.deleteItemAsync(refreshKey);
      }

      expiredListeners.forEach((listener) => listener());
    }

    throw error;
  }
}

export function register(data: RegisterData): Promise<UserProfile> {
  return http<UserProfile>("/api/auth/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getProfile(): Promise<UserProfile> {
  return authenticatedRequest<UserProfile>("/api/auth/users/me/");
}

export async function login(
  username: string,
  password: string,
): Promise<UserProfile> {
  const options = {
    method: "POST",
    body: JSON.stringify({ username, password }),
  };

  if (isWeb) {
    await http<void>("/api/auth/web/login/", options);
  } else {
    const tokens = await http<Tokens>("/api/auth/jwt/create/", options);

    await SecureStore.setItemAsync(refreshKey, tokens.refresh);
    accessToken = tokens.access;
  }

  return getProfile();
}

export async function logout(): Promise<void> {
  if (isWeb) {
    await http<void>("/api/auth/web/logout/", { method: "POST" });
  } else {
    if (refreshing) {
      await refreshing.catch(() => undefined);
    }

    const refresh = await SecureStore.getItemAsync(refreshKey);

    if (refresh) {
      try {
        await http<void>("/api/auth/jwt/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh }),
        });
      } catch (error) {
        // Un refresh expirat sau deja invalidat nu mai trebuie revocat.
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
      }
    }

    await SecureStore.deleteItemAsync(refreshKey);
  }

  accessToken = null;
}
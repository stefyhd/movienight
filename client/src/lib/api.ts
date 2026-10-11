import { Platform } from "react-native";

const webHost =
  typeof window !== "undefined"
    ? window.location.hostname
    : "localhost";

const defaultUrl =
  Platform.OS === "web"
    ? `http://${webHost}:8000`
    : "http://10.0.2.2:8000";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

if (!__DEV__ && !configuredUrl) {
  throw new Error("EXPO_PUBLIC_API_URL trebuie configurat pentru producție.");
}

export const API_URL = (configuredUrl || defaultUrl).replace(/\/+$/, "");

type HealthResponse = {
  status: string;
  database: string;
};

export async function getHealth(
  signal: AbortSignal
): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health/`, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API-ul a răspuns cu HTTP ${response.status}.`);
  }

  const data: HealthResponse = await response.json();

  if (data?.status !== 'ok' || data?.database !== 'ok') {
    throw new Error('API-ul nu a confirmat conexiunea la baza de date.');
  }

  return data;
}
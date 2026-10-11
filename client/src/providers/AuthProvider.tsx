import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  getProfile,
  login,
  logout,
  onSessionExpired,
  type UserProfile,
} from "../lib/auth";

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  startupError: string;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState("");

  useEffect(() => {
    let active = true;

    getProfile()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch((error) => {
        if (!active) return;

        if (!(error instanceof ApiError) || error.status !== 401) {
          setStartupError(
            error instanceof Error ? error.message : "A apărut o eroare.",
          );
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onSessionExpired(() => setUser(null)), []);

  async function signIn(username: string, password: string) {
    setUser(await login(username, password));
    setStartupError("");
  }

  async function signOut() {
    await logout();
    setUser(null);
    setStartupError("");
  }

  async function reloadProfile() {
    setUser(await getProfile());
    setStartupError("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        startupError,
        signIn,
        signOut,
        reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth trebuie folosit în interiorul AuthProvider.");
  }

  return context;
}
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { register } from "../lib/auth";
import { useAuth } from "../providers/AuthProvider";

export default function HomeScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const {
    user,
    ready,
    startupError,
    signIn,
    signOut,
    reloadProfile: fetchProfile,
  } = useAuth();

  const creatingAccount = mode === "register";
  const displayedError = error || startupError;

  async function submit() {
    if (busy) return;

    setError("");

    if (!username.trim() || !password) {
      setError("Completează username-ul și parola.");
      return;
    }

    if (creatingAccount && (!email.trim() || !country.trim())) {
      setError("Completează emailul și codul țării, de exemplu RO.");
      return;
    }

    setBusy(true);

    try {
      if (creatingAccount) {
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          country: country.trim().toUpperCase(),
        });

        // Dacă loginul eșuează, contul este deja creat.
        setMode("login");
      }

      await signIn(username.trim(), password);
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "A apărut o eroare.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function reloadProfile() {
    if (!user || busy) return;

    setBusy(true);
    setError("");

    try {
      await fetchProfile();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "A apărut o eroare.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function leaveSession() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await signOut();
      setPassword("");
      setMode("login");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Logoutul nu a reușit.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.card}>
            <ActivityIndicator color="#a78bfa" />
            <Text style={styles.loadingText}>
              Restaurăm sesiunea…
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brand}>Movie Night</Text>

          {user ? (
            <>
              <Text style={styles.title}>
                Salut, {user.username}!
              </Text>

              <Text style={styles.label}>Profilul tău</Text>

              <Text style={styles.text}>
                Email: {user.email || "Nespecificat"}
              </Text>

              <Text style={styles.text}>
                Țară: {user.country || "Nespecificată"}
              </Text>

              <Pressable
                style={[
                  styles.button,
                  busy && styles.disabledButton,
                ]}
                disabled={busy}
                onPress={reloadProfile}
              >
                <Text style={styles.buttonText}>
                  Reîncarcă profilul
                </Text>
              </Pressable>

              <Pressable
                disabled={busy}
                onPress={leaveSession}
              >
                <Text style={styles.link}>
                  Ieși din sesiune
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {creatingAccount ? "Creează un cont" : "Intră în cont"}
              </Text>

              <Text style={styles.label}>Username</Text>

              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!busy}
                accessibilityLabel="Username"
              />

              {creatingAccount && (
                <>
                  <Text style={styles.label}>Email</Text>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!busy}
                    accessibilityLabel="Email"
                  />

                  <Text style={styles.label}>
                    Codul țării — exemplu: RO
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={country}
                    onChangeText={setCountry}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={2}
                    editable={!busy}
                    accessibilityLabel="Codul țării"
                  />
                </>
              )}

              <Text style={styles.label}>Parolă</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!busy}
                accessibilityLabel="Parolă"
              />

              <Pressable
                style={[
                  styles.button,
                  busy && styles.disabledButton,
                ]}
                disabled={busy}
                onPress={submit}
              >
                <Text style={styles.buttonText}>
                  {creatingAccount ? "Creează cont" : "Autentifică-te"}
                </Text>
              </Pressable>

              <Pressable
                disabled={busy}
                onPress={() => {
                  setMode(creatingAccount ? "login" : "register");
                  setPassword("");
                  setError("");
                }}
              >
                <Text style={styles.link}>
                  {creatingAccount
                    ? "Ai deja cont? Intră în cont"
                    : "Nu ai cont? Înregistrează-te"}
                </Text>
              </Pressable>
            </>
          )}

          {busy && (
            <ActivityIndicator color="#a78bfa" />
          )}

          {displayedError !== "" && (
            <Text style={styles.error}>
              {displayedError}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101018",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 12,
  },
  brand: {
    color: "#a78bfa",
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    color: "#c4c4d4",
    fontSize: 14,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
  },
  loadingText: {
    color: "#c4c4d4",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1e1e2c",
    color: "#ffffff",
    borderColor: "#39394d",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    color: "#c4b5fd",
    textAlign: "center",
    paddingVertical: 12,
  },
  error: {
    color: "#fca5a5",
    lineHeight: 22,
  },
});
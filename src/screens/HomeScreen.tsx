import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Button,
  Linking,
  AppState,
} from "react-native";
import AddTodo from "../components/addTodo/AddTodo";
import TodoItem from "../components/todoItem/TodoItem";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store/store";
import { persistTodos } from "../store/todosSlice";
import { Todo } from "../types";
import { styles } from "./HomeScreen.styles";
import * as IntentLauncher from "expo-intent-launcher";
import { isAuthAvailable } from "../services/auth";
import {
  isSessionAuthenticated,
  setSessionAuthenticated,
  addAuthListener,
  ensureSessionAuth,
} from "../services/session";

/** Persist for this app process (prevents re-prompt after remounts) */
export default function HomeScreen() {
  const todos = useAppSelector((s: RootState) => s.todos.todos);
  const dispatch = useAppDispatch();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(
    isSessionAuthenticated()
  );
  const [needsSetup, setNeedsSetup] = useState(false); // show button when user skipped / no lock
  // track when we opened the system Settings so we can avoid immediate auth prompt on return
  const openedSettingsRef = useRef(false);

  useEffect(() => {
    // subscribe to session auth changes
    const off = addAuthListener((v) => setAuthenticated(v));
    return () => off();
  }, []);

  // On mount: check whether device has biometric or PIN setup. If not, prompt user to go to settings and hide todo UI.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const avail = await isAuthAvailable();
        if (!mounted) return;
        setNeedsSetup(!avail);
      } catch {
        if (!mounted) return;
        setNeedsSetup(true);
      }
    })();

    const sub = AppState.addEventListener("change", async (next) => {
      if (next === "active") {
        // if already authenticated no work needed
        if (isSessionAuthenticated()) return;

        // If we just returned from Settings, only re-check whether the device has enrollment
        // and update the UI (do NOT prompt for auth immediately).
        if (openedSettingsRef.current) {
          openedSettingsRef.current = false;
          try {
            const avail = await isAuthAvailable();
            setNeedsSetup(!avail);
          } catch {
            setNeedsSetup(true);
          }
          return;
        }

        try {
          // Try to authenticate the user immediately when they return
          const ok = await ensureSessionAuth("Unlock to access your todos");
          if (ok) {
            setNeedsSetup(false);
            return;
          }

          // If authentication failed or was cancelled, check whether device truly lacks auth
          const avail = await isAuthAvailable();
          // only show the "go to settings" CTA when the device does not have auth enrolled
          setNeedsSetup(!avail);
        } catch {
          // on error, conservatively show the settings CTA
          setNeedsSetup(true);
        }
      }
    });

    return () => {
      mounted = false;
      try {
        sub.remove();
      } catch {
        // ignore
      }
    };
  }, []);

  // persist when todos change (and after loaded)
  useEffect(() => {
    dispatch(persistTodos(todos));
  }, [todos, dispatch]);

  const goToSettings = async () => {
    try {
      // Only navigate to settings if device does not have auth enrolled.
      // This prevents opening Settings unnecessarily and triggering auth popups.
      const avail = await isAuthAvailable();
      if (avail) {
        // If device auth is already present, prompt the user to authenticate
        // (do not navigate to Settings). This allows unlocking instead of opening Settings.
        const ok = await ensureSessionAuth("Unlock to access your todos");
        if (ok) {
          setNeedsSetup(false);
          return;
        }

        // If authentication failed or was cancelled, re-check enrollment and show settings CTA if needed
        const stillAvail = await isAuthAvailable();
        setNeedsSetup(!stillAvail);
        return;
      }

      // mark we are opening settings so the AppState handler avoids immediate auth
      openedSettingsRef.current = true;

      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.SECURITY_SETTINGS
        );
      } else {
        await Linking.openSettings();
      }
    } catch (err) {
      console.warn("Failed to open settings", err);
      // last resort
      Linking.openSettings().catch(() => {});
    }
  };

  // NEW: Logout / Lock app
  const lockApp = () => {
    setSessionAuthenticated(false);
    // don't auto-prompt; let user choose "Unlock now"
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
    >
      <View style={styles.container}>
        {needsSetup ? (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Text style={{ textAlign: "center", marginBottom: 12 }}>
              Please set device authentication to use the app fully:
            </Text>
            <Button title="GO TO SETTINGS" onPress={goToSettings} />
          </View>
        ) : (
          <>
            {/* Top row: Lock/Unlock controls */}
            <View
              style={[
                { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
                styles.topControls,
              ]}
            >
              {authenticated ? (
                <Button title="Lock app (Logout)" onPress={lockApp} />
              ) : (
                <Button
                  title="Unlock now"
                  onPress={async () => {
                    const ok = await ensureSessionAuth(
                      "Unlock to access your todos"
                    );
                    if (!ok) {
                      const avail = await isAuthAvailable();
                      setNeedsSetup(!avail);
                    }
                  }}
                />
              )}
            </View>

            <FlatList
              data={todos}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps={"handled"}
              contentContainerStyle={{ gap: 10, paddingBottom: 90 }}
              renderItem={({ item }) => (
                <TodoItem todo={item} onEdit={() => setEditingTodo(item)} />
              )}
              ListEmptyComponent={() => (
                <Text style={styles.empty}>No todos yet</Text>
              )}
            />

            <AddTodo
              editingTodo={editingTodo}
              clearEditing={() => setEditingTodo(null)}
              authenticated={authenticated}
              onAuthenticated={() => {
                setSessionAuthenticated(true);
              }}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

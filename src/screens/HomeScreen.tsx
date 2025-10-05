import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Button,
  Linking,
} from "react-native";
import AddTodo from "../components/addTodo/AddTodo";
import TodoItem from "../components/todoItem/TodoItem";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store/store";
import { persistTodos } from "../store/todosSlice";
import { Todo } from "../types";
import { styles } from "./HomeScreen.styles";
import * as IntentLauncher from "expo-intent-launcher";
import { isBiometricAvailable } from "../services/auth";
import {
  isSessionAuthenticated,
  setSessionAuthenticated,
  addAuthListener,
  removeAuthListener,
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

  useEffect(() => {
    // subscribe to session auth changes
    const off = addAuthListener((v) => setAuthenticated(v));
    return () => off();
  }, []);

  // persist when todos change (and after loaded) - debounce not necessary for small app
  useEffect(() => {
    dispatch(persistTodos(todos));
  }, [todos, dispatch]);

  const goToSettings = async () => {
    try {
      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.SECURITY_SETTINGS
        );
      } else {
        await Linking.openSettings();
      }
    } catch (err) {
      console.warn("Failed to open settings", err);
      Linking.openSettings().catch(() => {});
    }
  };

  // NEW: Logout / Lock app
  const lockApp = () => {
    setSessionAuthenticated(false);
    // don't auto-prompt; let user choose "Unlock now"
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <View style={styles.container}>
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
                // proactively prompt device auth so user can unlock without performing an op
                const ok = await ensureSessionAuth(
                  "Unlock to access your todos"
                );
                if (!ok) {
                  // show setup when biometric unavailable
                  const avail = await isBiometricAvailable();
                  setNeedsSetup(!avail);
                }
              }}
            />
          )}
        </View>

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10 }}
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

        {/* Show only when user didn't unlock or no lock set */}
        {!authenticated && needsSetup && (
          <View style={{ marginTop: 20 }}>
            <Text>Please set device authentication to use the app fully:</Text>
            <Button title="Go to Settings" onPress={goToSettings} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

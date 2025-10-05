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
import { useTodoState } from "../context/TodoContext";
import { Todo } from "../types";
import { styles } from "./HomeScreen.styles";
import * as LocalAuthentication from "expo-local-authentication";
import * as IntentLauncher from "expo-intent-launcher";

/** Persist for this app process (prevents re-prompt after remounts) */
let SESSION_PROMPTED = false;
let SESSION_AUTHENTICATED = false;

export default function HomeScreen() {
  const { todos } = useTodoState();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(
    SESSION_AUTHENTICATED
  );
  const [needsSetup, setNeedsSetup] = useState(false); // show button when user skipped / no lock

  const runInitialAuthOnce = async () => {
    if (SESSION_PROMPTED) {
      setAuthenticated(SESSION_AUTHENTICATED);
      return;
    }
    SESSION_PROMPTED = true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock to access your todos",
        fallbackLabel: "Enter PIN/Password",
        cancelLabel: "Cancel",
        disableDeviceFallback: false as any,
      });

      if (result.success) {
        SESSION_AUTHENTICATED = true;
        setAuthenticated(true);
        setNeedsSetup(false);
      } else {
        SESSION_AUTHENTICATED = false;
        setAuthenticated(false);
        setNeedsSetup(
          result.error === "not_enrolled" || result.error === "not_available"
        );
      }
    } catch (e) {
      console.warn("Authentication failed", e);
      SESSION_AUTHENTICATED = false;
      setAuthenticated(false);
      setNeedsSetup(true);
    }
  };

  useEffect(() => {
    runInitialAuthOnce();
  }, []);

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
    SESSION_PROMPTED = false; // allow prompting again
    SESSION_AUTHENTICATED = false; // reset session auth
    setAuthenticated(false);
    // don't auto-prompt; let user choose "Unlock now"
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <View style={styles.container}>
        {/* Top row: Lock/Unlock controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 12,
            marginBottom: 8,
          }}
        >
          {authenticated ? (
            <Button title="Lock app (Logout)" onPress={lockApp} />
          ) : (
            <Button title="Unlock now" onPress={runInitialAuthOnce} />
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

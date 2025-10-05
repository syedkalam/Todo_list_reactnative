import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Button,
  AppState,
  Linking,
} from "react-native";
import AddTodo from "../components/addTodo/AddTodo";
import TodoItem from "../components/todoItem/TodoItem";
import { useTodoState } from "../context/TodoContext";
import { Todo } from "../types";
import { styles } from "./HomeScreen.styles";
import * as LocalAuthentication from "expo-local-authentication";
import * as IntentLauncher from "expo-intent-launcher";

// ----------------------
// EMULATOR TEST CONFIG
// ----------------------
const EMULATOR_OVERRIDE = true; // set true for emulator testing

export default function HomeScreen() {
  const { todos } = useTodoState();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deviceSecured, setDeviceSecured] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ----------------------------
  // Check enrollment
  // ----------------------------
  const checkEnrollment = async (): Promise<boolean> => {
    if (EMULATOR_OVERRIDE && deviceSecured === null) {
      // First time launch on emulator → show Go to Settings UI
      return false;
    }
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setDeviceSecured(enrolled);
      console.log("Enrollment check:", enrolled);
      return enrolled;
    } catch (err) {
      console.warn("Enrollment check failed:", err);
      setDeviceSecured(false);
      return false;
    }
  };

  // ----------------------------
  // Authenticate user
  // ----------------------------
  const authenticate = async (): Promise<boolean> => {
    if (EMULATOR_OVERRIDE) {
      setAuthenticated(true);
      return true;
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock to access your todos",
        fallbackLabel: "Use PIN/Password",
        cancelLabel: "Cancel",
      });
      setAuthenticated(result.success);
      console.log("Authentication result:", result);
      return result.success;
    } catch (err) {
      console.warn("Authentication failed:", err);
      setAuthenticated(false);
      return false;
    }
  };

  // ----------------------------
  // Combined checkAuth
  // ----------------------------
  const checkAuth = async () => {
    setCheckingAuth(true);
    const enrolled = await checkEnrollment();
    if (enrolled) {
      await authenticate();
    } else {
      setAuthenticated(false);
    }
    setCheckingAuth(false);
  };

  // ----------------------------
  // AppState listener + polling for emulator
  // ----------------------------
  useEffect(() => {
    checkAuth();

    const subscription = AppState.addEventListener("change", (state) => {
      console.log("AppState changed:", state);
      if (state === "active") {
        checkAuth();
      }
    });

    let interval: NodeJS.Timeout | null = null;

    // Poll for enrollment every 1 sec in emulator mode
    if (EMULATOR_OVERRIDE) {
      interval = setInterval(async () => {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        console.log("Polling enrollment:", enrolled);
        if (enrolled) {
          setDeviceSecured(true);
          authenticate();
          if (interval) clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      subscription.remove();
      if (interval) clearInterval(interval);
    };
  }, []);

  // ----------------------------
  // Open settings
  // ----------------------------
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
      console.warn("Failed to open settings:", err);
      Linking.openSettings().catch(() => {});
    }
  };

  // ----------------------------
  // Loading state
  // ----------------------------
  // if (checkingAuth || deviceSecured === null || authenticated === null) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" />
  //       <Text>Checking device security...</Text>
  //     </View>
  //   );
  // }

  // ----------------------------
  // Device not secured
  // ----------------------------
  if (deviceSecured === false) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ marginBottom: 10 }}>
          Device authentication is not set. Open Settings → Security → Screen
          lock / Fingerprint
        </Text>
        <Button title="Open Settings" onPress={goToSettings} />
      </View>
    );
  }

  // ----------------------------
  // Device secured but not authenticated
  // ----------------------------
  if (deviceSecured && !authenticated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ marginBottom: 10 }}>
          Please authenticate to continue
        </Text>
        <Button title="Authenticate" onPress={authenticate} />
      </View>
    );
  }

  // ----------------------------
  // Authenticated → show Todo list
  // ----------------------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem todo={item} onEdit={() => setEditingTodo(item)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No todos yet</Text>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <AddTodo
          editingTodo={editingTodo}
          clearEditing={() => setEditingTodo(null)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

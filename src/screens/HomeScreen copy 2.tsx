import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Button,
  Linking,
  AppState,
} from "react-native";
import AddTodo from "../components/addTodo/AddTodo";
import TodoItem from "../components/todoItem/TodoItem";
import { useTodoState } from "../context/TodoContext";
import { isBiometricAvailable } from "../services/auth";
import { Todo } from "../types";
import { styles } from "./HomeScreen.styles";
import * as LocalAuthentication from "expo-local-authentication";
import * as IntentLauncher from "expo-intent-launcher";

export default function HomeScreen() {
  const { todos, loaded } = useTodoState();


  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deviceSecured, setDeviceSecured] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState(false);


  const checkAuth = async () => {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setDeviceSecured(enrolled);

      if (enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock to access your todos",
          fallbackLabel: "Enter PIN/Password",
          cancelLabel: "Cancel",
        });
        setAuthenticated(result.success);
      } else {
        setAuthenticated(false);
      }
    } catch (err) {
      console.warn("Authentication failed", err);
      setAuthenticated(false);
    }
  };
console.log("authenticated", authenticated)
  useEffect(() => {
    checkAuth();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkAuth();
      }
    });

    return () => subscription.remove();
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        {/* {biometricAvailable === false && (
          <View style={styles.warning}>
            <Text style={{ color: "#fff" }}>
              Biometric/device authentication is not set up on this device.
              Add/Edit/Delete operations will be blocked.
            </Text>
          </View>
        )} */}

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
        />

  
        {deviceSecured === false && (
          <View style={{ marginTop: 20 }}>
            <Text>Please set device authentication to use the app fully:</Text>
            <Button title="Go to Settings" onPress={goToSettings} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

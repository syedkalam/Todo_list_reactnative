import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
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
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(
    null
  );
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deviceSecured, setDeviceSecured] = useState<boolean | null>(null);

  // const checkDeviceSecurity = async () => {
  //   const enrolled = await LocalAuthentication.isEnrolledAsync();
  //   setDeviceSecured(enrolled);

  //   if (__DEV__) {
  //     setBiometricAvailable(true);
  //   } else {
  //     const ok = await isBiometricAvailable();
  //     setBiometricAvailable(ok);
  //   }
  // };

  const checkDeviceSecurity = async () => {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setDeviceSecured(enrolled);

      if (__DEV__) {
        setBiometricAvailable(true);
      } else {
        const ok = await isBiometricAvailable();
        setBiometricAvailable(ok);
        console.log("inside fn");
      }
    } catch (err) {
      console.warn("Error checking device security", err);
      setDeviceSecured(false);
      setBiometricAvailable(false);
    }
  };

  //

  const forceRefresh = async () => {
    // Wait a bit so OS can update enrollment
    await new Promise((res) => setTimeout(res, 500));
    await checkDeviceSecurity();
  };

  useEffect(() => {
    checkDeviceSecurity();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        forceRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  if (deviceSecured === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Checking device security...</Text>
      </View>
    );
  }

  if (deviceSecured === false) {
    return <SecurityRequiredScreen onSecurityUpdated={checkDeviceSecurity} />;
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS: moves smoothly, Android: height resize
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // adjust if you have headers/navbars
    >
      <View style={styles.container}>
        {biometricAvailable === false && (
          <View style={styles.warning}>
            <Text style={{ color: "#fff" }}>
              Biometric/device authentication is not set up on this device.
              Add/Edit/Delete operations will be blocked.
            </Text>
          </View>
        )}

        {/* <AddTodo /> */}
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
      </View>
    </KeyboardAvoidingView>
  );
}

const SecurityRequiredScreen = ({
  onSecurityUpdated,
}: {
  onSecurityUpdated: () => void;
}) => {
  // const goToSettings = () => {
  //   // console.log("first")
  //   if (Platform.OS === "android") {
  //     IntentLauncher.startActivityAsync(
  //       // IntentLauncher.ActivityAction.SECURITY_SETTINGS
  //       IntentLauncher.ActivityAction.FINGERPRINT_SETTINGS
  //     );
  //   } else {
  //     Linking.openSettings(); // iOS general settings
  //     Linking.openSettings().catch(() => {});
  //   }
  // };

  const goToSettings = async () => {
    try {
      if (Platform.OS === "android") {
        // more reliable: open general Security settings
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
    <View style={[styles.container, { justifyContent: "flex-end" }]}>
      <Text>Set Authentication to Proceed1</Text>
      <Button title="Go to Settings" onPress={goToSettings}></Button>

      <Button
        title="I’ve set it up"
        // onPress={onSecurityUpdated} // triggers a manual re-check
        onPress={async () => {
          // wait a bit so OS updates enrollment
          await new Promise((res) => setTimeout(res, 500));
          await onSecurityUpdated(); // now re-check device security
        }}
      />
    </View>
  );
};

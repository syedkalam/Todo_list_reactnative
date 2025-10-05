import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { useAppDispatch } from "../../store/hooks";
import { add, update } from "../../store/todosSlice";
import { Todo } from "../../types";
import { ensureSessionAuth } from "../../services/session";
import { styles } from "./AddTodo.styles";

export default function AddTodo({
  editingTodo,
  clearEditing,
  authenticated,
  onAuthenticated,
}: {
  editingTodo: Todo | null;
  clearEditing: () => void;
  authenticated: boolean;
  onAuthenticated?: () => void;
}) {
  const [text, setText] = useState(editingTodo?.title ?? "");
  const dispatch = useAppDispatch();

  useEffect(() => {
    setText(editingTodo?.title ?? "");
  }, [editingTodo]);

  const onSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Field required", "please enter something");
      return;
    }

    if (!authenticated) {
      const ok = await ensureSessionAuth("Unlock to add todo");
      if (!ok) {
        Alert.alert("Not authenticated", "Authentication failed or cancelled");
        return;
      }
      // notify parent that session is authenticated
      try {
        onAuthenticated && onAuthenticated();
      } catch (e) {}
    }

    if (editingTodo) {
      dispatch(update({ id: editingTodo.id, title: trimmed }));
      clearEditing();
    } else {
      dispatch(add({ title: trimmed }));
    }

    // persist current list - best-effort; store will be picked up by selector in parent
    // Note: we don't have todos here without selector, caller (HomeScreen) triggers reload/persist as needed.
    setText("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <TextInput
          placeholder={editingTodo ? "Edit todo..." : "Add a todo..."}
          value={text}
          onChangeText={setText}
          style={styles.input}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
        />
      </View>

      <Pressable style={styles.addButton} onPress={onSubmit}>
        <Text style={styles.addButtonText}>{editingTodo ? "OK" : "ADD"}</Text>
      </Pressable>
    </View>
  );
}

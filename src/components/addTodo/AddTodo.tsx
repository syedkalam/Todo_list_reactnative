import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useTodoDispatch } from "../../context/TodoContext";
import { Todo } from "../../types";
import { styles } from "./AddTodo.styles";

export default function AddTodo({
  editingTodo,
  clearEditing,
  authenticated,
}: {
  editingTodo: Todo | null;
  clearEditing: () => void;
  authenticated: boolean;
}) {
  const [text, setText] = useState(editingTodo?.title ?? "");
  const dispatch = useTodoDispatch();

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
      Alert.alert(
        "Not authenticated",
        "Please unlock the app before adding/updating todos."
      );
      return;
    }

    if (editingTodo) {
      dispatch({
        type: "UPDATE",
        payload: { id: editingTodo.id, title: trimmed },
      });
      clearEditing();
    } else {
      dispatch({ type: "ADD", payload: { title: trimmed } });
    }

    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={editingTodo ? "Edit todo..." : "Add a todo..."}
        value={text}
        onChangeText={setText}
        style={styles.input}
        onSubmitEditing={onSubmit}
      />
      <Button title={editingTodo ? "Update" : "Add"} onPress={onSubmit} />
      {editingTodo && <Button title="Cancel" onPress={clearEditing} />}
    </View>
  );
}

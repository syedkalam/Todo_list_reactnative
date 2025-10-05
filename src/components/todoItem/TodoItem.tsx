import React from "react";
import { Text, TouchableOpacity, Button } from "react-native";
import { Todo } from "../../types";
import { useTodoDispatch } from "../../context/TodoContext";
import { requireAuth } from "../../services/auth";
import { styles } from "./TodoItem.styles";

export default function TodoItem({
  todo,
  onEdit,
}: {
  todo: Todo;
  onEdit: () => void;
}) {
  const dispatch = useTodoDispatch();

  const onDelete = async () => {
    const ok = await requireAuth("Authenticate to delete TODO");
    if (!ok) return;
    dispatch({ type: "DELETE", payload: { id: todo.id } });
  };

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onEdit}>
        <Text style={[styles.title]}>{todo.title}</Text>
        <Button title="Delete" onPress={onDelete} />
      </TouchableOpacity>
    </>
  );
}

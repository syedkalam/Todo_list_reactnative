import React from "react";
import { Text, TouchableOpacity, Pressable, View } from "react-native";
import { Todo } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import { remove } from "../../store/todosSlice";
import { ensureSessionAuth } from "../../services/session";
import { styles } from "./TodoItem.styles";

export default function TodoItem({
  todo,
  onEdit,
}: {
  todo: Todo;
  onEdit: () => void;
}) {
  const dispatch = useAppDispatch();

  const onDelete = async () => {
    // ensure user authenticates once before performing delete
    const ok = await ensureSessionAuth("Authenticate to delete TODO");
    if (!ok) return;
    dispatch(remove({ id: todo.id }));
  };

  return (
    <View style={{ marginVertical: 6 }}>
      <TouchableOpacity style={styles.row} onPress={onEdit} activeOpacity={0.8}>
        <View style={styles.left}>
          <View style={styles.bullet} />
          <Text style={[styles.title]}>{todo.title}</Text>
        </View>

        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={styles.removeText}>REMOVE</Text>
        </Pressable>
      </TouchableOpacity>
    </View>
  );
}

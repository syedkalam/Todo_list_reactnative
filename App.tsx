import "react-native-get-random-values";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { useAppDispatch } from "./src/store/hooks";
import HomeScreen from "./src/screens/HomeScreen";
import { store } from "./src/store/store";
import { loadTodos } from "./src/store/todosSlice";

function Bootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadTodos());
  }, [dispatch]);
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
});

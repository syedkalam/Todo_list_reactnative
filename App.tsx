import "react-native-get-random-values";
import { StyleSheet, View } from "react-native";
import { TodoProvider } from "./src/context/TodoContext";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  return (
    <TodoProvider>
      <View style={styles.container}>
        <HomeScreen />
      </View>
    </TodoProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
});

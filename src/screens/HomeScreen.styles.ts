import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 32, backgroundColor: "#fff" },
  center: {  justifyContent: "center", alignItems: "center" },
  warning: {
    backgroundColor: "#cc0000",
    padding: 8,
    margin: 8,
    borderRadius: 6,
  },
  empty: { textAlign: "center", marginTop: 32, color: "#666" },
});

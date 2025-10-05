import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 38, backgroundColor: '#f2f4f7', paddingHorizontal: 16 },
  topControls: { marginTop: 12, marginBottom: 10 },
  center: {  justifyContent: "center", alignItems: "center" },
  warning: {
    backgroundColor: "#cc0000",
    padding: 8,
    margin: 8,
    borderRadius: 6,
  },
  empty: { textAlign: "center", marginTop: 32, color: "#666" },
  heading: { fontSize: 22, fontWeight: '900', color: '#0b63d6', marginBottom: 12 }
});

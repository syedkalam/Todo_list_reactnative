import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    // subtle shadow / elevation
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  bullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0b63d6',
  },

  title: { fontSize: 16, fontWeight: '700', color: '#222' },

  removeText: { color: '#7a7a7a', fontWeight: '700' },
});

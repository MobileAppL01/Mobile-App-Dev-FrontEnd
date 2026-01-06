import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  // --- HEADER ---
  blueHeader: {
    backgroundColor: "#3B9AFF",
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: { color: "white", fontSize: 12, fontWeight: "600" },
  
  // --- BODY ---
  body: { flex: 1, paddingHorizontal: 15 },

  // --- TITLE & LOCATION SELECTOR ---
  titleContainer: { alignItems: "center", marginTop: 10, marginBottom: 15 },
  welcomeText: { fontSize: 14, color: "#555" },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'transparent', // Giữ chỗ để layout không nhảy
  },
  courtTitle: { fontSize: 22, fontWeight: "bold", marginTop: 5, color: '#333' },

  // --- FILTER BAR ---
  filterBar: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  datePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  
  // --- DATE PICKER DROPDOWN (IOS Specific) ---
  // Container bọc DatePicker trên iOS để tạo hiệu ứng dropdown
  iosDatePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // --- CARD STYLES ---
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 10, width: 20, textAlign: 'center' },
  cardTextBold: { fontSize: 15, fontWeight: "bold", color: '#333' },
  cardText: { fontSize: 14, color: "#555" },
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { color: "white", fontSize: 11, fontWeight: "bold" },

  // --- FOOTER ---
  footer: {
    position: "absolute",
    bottom: 0,
    width: width,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding bottom cho iPhone tai thỏ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  footerTitle: { fontSize: 16, fontWeight: "500", color: '#555' },
  footerAmount: { fontSize: 20, fontWeight: "bold", color: '#3B9AFF' },
  footerDate: { fontSize: 13, color: "#888", fontWeight: "600" },
  footerIncrease: { fontSize: 13, color: "#2ecc71", fontWeight: "bold" },

  // --- MODAL SELECT LOCATION ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalItemSelected: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0
  },
  modalItemText: { fontSize: 16, marginLeft: 10, color: '#333' },
  modalItemTextSelected: { color: '#3B9AFF', fontWeight: 'bold' },
  
  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', marginTop: 10 },
  
  // Loading State
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' }
});
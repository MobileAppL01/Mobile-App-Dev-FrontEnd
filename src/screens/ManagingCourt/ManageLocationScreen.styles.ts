import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");
export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1 },
  iconBtn: { marginLeft: 10 },

  clusterImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#eee",
  },
  clusterContent: { flex: 1, justifyContent: "center" },
  clusterTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  clusterAddress: { fontSize: 13, color: "#666", marginBottom: 8 },
  clusterInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoTagText: { color: "#3B9AFF", fontSize: 11, fontWeight: "700" },

  // Modal
  modalKeyboardContainer: { flex: 1, justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },

  // Buttons
  saveBtn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  // Style cho nút xóa
  deleteBtn: {
    backgroundColor: "#FF4757",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
 // Sửa lại clusterCard: Bỏ marginBottom để Swipeable xử lý layout tốt hơn
  clusterCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    // marginBottom: 15, // <--- XÓA DÒNG NÀY (Chuyển sang containerStyle của Swipeable)
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // Shadow vẫn giữ cũng được
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },

  // Style cho nút Xóa khi vuốt (Màu đỏ nằm bên phải)
  deleteAction: {
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12, // Bo góc cho đẹp khớp với card
    marginLeft: 10,   // Tạo khoảng cách với card chính
    marginBottom: 15  // Khớp với margin của item
  },

  // Style cho nút Dấu cộng (Promo) trên card
  promoIconBtn: {
      padding: 5,
      justifyContent: 'center',
      alignItems: 'center'
  },

  // Style mới cho nút thùng rác trên card
  trashIconBtn: {
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#FFEBEE', // Bỏ comment nếu muốn có nền đỏ nhạt
    borderRadius: 8,
  },

  deleteActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },

  // Add promotion button
  addPromoBtn: {
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Discount type buttons
  discountTypeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FAFAFA",
  },
  discountTypeSelected: {
    backgroundColor: "#3B9AFF",
    borderColor: "#3B9AFF",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  unselectedText: {
    color: "#666",
  },
});
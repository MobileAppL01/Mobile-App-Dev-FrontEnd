import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // =================================================
  // 1. GLOBAL LAYOUT
  // =================================================
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // =================================================
  // 2. SEARCH BAR
  // =================================================
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

  // =================================================
  // 3. LOCATION CARD (CONTAINER & MAIN)
  // =================================================
  // Container bao ngoài để đổ bóng (Shadow) cho cả cụm (Card + Dropdown)
  cardContainerShadow: {
    backgroundColor: "#fff",
    borderRadius: 16, // Bo góc tròn hơn
    marginHorizontal: 2, // Để bóng đổ không bị cắt
    marginBottom: 15,
    // Shadow style
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // Để bo góc nội dung bên trong
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },

  // Phần Card chính (Header của item)
  mainCard: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: '#fff',
    zIndex: 10,
  },

  clusterImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eee",
  },

  clusterContent: {
    flex: 1,
    justifyContent: "space-between",
    height: 75,
  },

  clusterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  clusterAddress: {
    fontSize: 13,
    color: "#666",
  },

  clusterInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  infoTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  infoTagText: { color: "#3B9AFF", fontSize: 11, fontWeight: "700" },
  timeText: { fontSize: 12, color: "#888", fontWeight: "500" },

  rightActionColumn: {
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 5,
  },

  // =================================================
  // 4. DROPDOWN & PROMOTION ITEMS
  // =================================================
  dropdownContainer: {
    backgroundColor: "#FAFAFA", // Màu nền hơi xám nhẹ để phân biệt
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 5,
  },

  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    // Border nhẹ cho từng dòng promo
    borderWidth: 1,
    borderColor: "#eee",
  },

  promoLeftBorder: {
    width: 4,
    height: 30,
    backgroundColor: "#FF9F43", // Màu cam nổi bật
    borderRadius: 2,
    marginRight: 12,
  },

  promoCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
  },

  promoDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  promoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    padding: 15,
    fontSize: 12,
  },

  // =================================================
  // 5. SWIPE ACTIONS (DELETE BUTTON)
  // =================================================
  deleteAction: {
    backgroundColor: "#FF4757",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 16,
    marginLeft: 10,
  },
  deleteActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },

  // =================================================
  // 6. MODALS & FORMS
  // =================================================
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

  // =================================================
  // 7. BUTTONS & ICONS
  // =================================================
  saveBtn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

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

  // Nút Dấu cộng (Promo) trên card
  promoIconBtn: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Nút Thùng rác nhỏ trên card (nếu dùng)
  trashIconBtn: {
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Nút Add Promo to (nếu dùng riêng)
  addPromoBtn: {
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Các nút chọn loại giảm giá (%, $) trong modal
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
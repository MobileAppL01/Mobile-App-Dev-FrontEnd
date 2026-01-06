import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // --- GLOBAL CONTAINER ---
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Màu nền xám nhẹ hiện đại hơn
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  // --- HEADER & SUBHEADER ---
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop: 10,
    // Bỏ border bottom cứng, thay bằng shadow nhẹ hoặc để trơn
    backgroundColor: "#F5F7FA",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subHeaderSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  // --- SEARCH BAR ---
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#fff",
    // Shadow nhẹ cho ô search
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  iconBtn: {
    marginLeft: 12,
  },

  // --- SWIPE ACTION (NÚT XÓA) ---
  deleteAction: {
    backgroundColor: "#FF4757",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  // --- COURT ITEM CARD (LAYOUT MỚI) ---
  cardContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "white",
    height: 170, // Chiều cao cố định để layout ổn định
    // Shadow card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden", // Để bo góc cho ảnh
  },
  cardInner: {
    flexDirection: "row",
    height: "100%",
  },

  // Cột trái: Hình ảnh
  imageContainer: {
    width: 120, // Khoảng 35% chiều rộng
    height: "100%",
    position: "relative",
  },
  courtImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlayIcons: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Cột phải: Nội dung
  contentContainer: {
    flex: 1,
    padding: 10,
    paddingLeft: 12,
    justifyContent: "space-between", // Phân bố đều header, banner và slots
  },

  // Dòng 1: Tên + Toggle
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  courtName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // Dòng 2: Banner Booking (Màu xanh dương)
  currentBookingBanner: {
    backgroundColor: "#0091FF",
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
    maxWidth: "95%",
  },
  currentBookingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
  },

  // Dòng 3: Slots Grid (Lưới giờ)
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  slotItem: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
  },
  slotText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },

  // Footer icon (3 chấm)
  footerRow: {
    position: "absolute",
    bottom: 4,
    right: 4,
    padding: 4,
  },

  // --- MODAL STYLES (GIỮ NGUYÊN) ---
  modalKeyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
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
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  saveBtn: {
    backgroundColor: "#3B9AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    shadowColor: "#3B9AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
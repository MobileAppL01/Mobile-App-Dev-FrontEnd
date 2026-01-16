
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBanner: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  topBannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
    marginTop: 10,
    fontWeight: '400',
  },
  titleContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#3B9AFF',
    marginTop: 8,
    width: '100%',
  },
  searchContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 10
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: (width - 48) / 2,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardDisabled: {
    opacity: 0.9,
    backgroundColor: '#EEEEEE'
  },
  maintenanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  maintenanceText: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  imageContainer: {
    position: 'relative',
    height: 100,
    width: '100%',
  },
  courtImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayIcons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
  },
  courtName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  courtAddress: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    height: 30,
  },
  courtTime: {
    fontSize: 10,
    color: '#333',
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  activePage: {
    borderColor: '#333',
    borderWidth: 1.5,
  },
  activePageText: {
    fontWeight: 'bold',
    color: '#333',
  },
  pageText: {
    fontSize: 14,
    color: '#333',
  },
  dotsContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalBackBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },

  filterSection: { marginBottom: 25 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },

  locationContainer: {
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  placeholderDropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd'
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500'
  },

  // Price Input Styles
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceInputLabel: {
    color: '#999',
    marginRight: 8,
    fontSize: 14
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  priceDash: {
    width: 10,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 10
  },

  // Keywords
  keywordsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  keywordChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D6E4FF'
  },
  keywordText: { color: '#3B9AFF', fontSize: 13, fontWeight: '500' },
  keywordChipActive: {
    backgroundColor: '#3B9AFF',
    borderColor: '#3B9AFF'
  },
  keywordTextActive: {
    color: '#fff'
  },

  // Footer
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff'
  },
  applyButton: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#3B9AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  applyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
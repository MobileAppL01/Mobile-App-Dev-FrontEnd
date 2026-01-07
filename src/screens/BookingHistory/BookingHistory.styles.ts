import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // --- Styles cho Header ---
    headerContainer: {
        backgroundColor: '#42A5F5',
        paddingTop: 50, // Padding cho tai thỏ
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },

    // --- Styles cho Tab Switcher ---
    tabContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#333',
        width: '90%',
        padding: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: '#64B5F6',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },

    // --- Styles cho Card ---
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 5,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    addressName: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // --- Styles cho phần Body của Card ---
    cardBody: {
        paddingLeft: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIconWidth: {
        width: 30,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },

    // --- Empty State ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});

export default styles;
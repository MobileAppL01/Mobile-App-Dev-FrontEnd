import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray background
    },
    // --- Styles cho Header ---
    headerContainer: {
        backgroundColor: 'white',
        paddingTop: 50, // Safe Area padding roughly (or use SafeAreaView in component)
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        // Removing rounded corners for a standard app header feel
    },
    headerTitle: {
        color: '#111827', // Dark text
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: '#6B7280', // Gray text
        fontSize: 14,
    },

    // --- Styles cho Tab Switcher ---
    tabContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6', // Lighter gray for tab bg
        borderRadius: 25,
        borderWidth: 0, // No border
        width: '90%',
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#3B82F6', // Brand Blue
        fontWeight: 'bold',
    },

    // --- Styles cho Card ---
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF', // Light blue bg
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    addressName: {
        fontSize: 13,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },

    // --- Styles cho phần Body của Card ---
    cardBody: {
        paddingLeft: 0, // removed indent
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIconWidth: {
        width: 24,
        alignItems: 'center',
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },

    // --- Empty State ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 8
    }
});

export default styles;
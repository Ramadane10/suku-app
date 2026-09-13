import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { useTheme } from '../src/hooks/useTheme';
import { supabase } from '../src/lib/supabase';

// Les notifications seront chargées depuis Supabase mdr
const NOTIFICATION_ICONS: any = {
    order: 'package-variant-closed', // material-community ou simple ionicon
    promo: 'pricetag-outline',
    system: 'information-circle-outline',
    default: 'notifications-outline'
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { getCartCount } = useCart();
    const { user } = useAuth();
    const { markAllAsRead } = useNotifications();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setNotifications(data);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) {
                console.error('Error marking as read:', error);
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await markAllAsRead();
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = Math.max(0, now.getTime() - past.getTime());
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes < 1) return "À l'instant";
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `Il y a ${diffInDays}j`;

        return past.toLocaleDateString('fr-FR');
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'order': return 'receipt-outline';
            case 'promo': return 'pricetag-outline';
            default: return 'notifications-outline';
        }
    };

    const handleNotificationPress = async (item: any) => {
        await markAsRead(item.id);
        // Navigation contextuelle selon le type
        if (item.type === 'order') {
            let targetOrderId = null;
            if (item.data) {
                try {
                    const parsed = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                    targetOrderId = parsed?.orderId || parsed?.order_id;
                } catch (e) {
                    console.error('Error parsing notification data:', e);
                }
            }

            if (!targetOrderId && item.order_id) {
                targetOrderId = item.order_id;
            }

            if (targetOrderId) {
                router.push({ pathname: '/orders', params: { orderId: targetOrderId } });
            } else {
                // Fallback: ouvrir la commande la plus récente
                router.push({ pathname: '/orders', params: { orderId: 'latest' } });
            }
        } else if (item.type === 'promo') {
            router.push('/boutique');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.is_read ? colors.surface : colors.primary + '10', borderBottomColor: colors.border }
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.light }]}>
                <Ionicons name={getIconName(item.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.created_at)}</Text>
                </View>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Header
                    title="Notifications"
                    showMenu={false}
                    showBack={true}
                    onBackPress={() => router.back()}
                    showNotifications={false}
                    cartCount={getCartCount()}
                />
                <View style={styles.centerContainer}>
                    <Ionicons name="notifications-outline" size={80} color={colors.grey} />
                    <Text style={[styles.title, { color: colors.text, marginTop: 16, textAlign: 'center' }]}>
                        Connexion requise
                    </Text>
                    <Text style={[styles.message, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginHorizontal: 32 }]}>
                        Connectez-vous pour consulter vos notifications et alertes de commandes.
                    </Text>
                    <TouchableOpacity
                        style={[styles.guestBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                        onPress={() => router.push('/login')}
                    >
                        <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.guestBtnText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const unreadCountLocal = notifications.filter(n => !n.is_read).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Notifications"
                showMenu={false}
                showBack={true}
                onBackPress={() => router.back()}
                showNotifications={false}
                cartCount={getCartCount()}
            />
            {unreadCountLocal > 0 && (
                <View style={[styles.unreadBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <Text style={[styles.unreadBarText, { color: colors.textSecondary }]}>
                        {unreadCountLocal} non lue{unreadCountLocal > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.markAllText, { color: colors.primary }]}>
                            Tout marquer comme lu
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {loading && notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.grey} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Aucune notification pour le moment
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: 16,
    },
    time: {
        fontFamily: fonts.regular,
        fontSize: 12,
    },
    message: {
        fontFamily: fonts.regular,
        fontSize: 14,
        lineHeight: 20,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontFamily: fonts.medium,
        fontSize: 16,
        marginTop: 16,
    },
    guestBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 14,
        width: '100%',
        maxWidth: 280,
    },
    guestBtnText: {
        fontFamily: fonts.bold,
        fontSize: 16,
        color: '#FFFFFF',
    },
    unreadBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    unreadBarText: {
        fontFamily: fonts.medium,
        fontSize: 13,
    },
    markAllText: {
        fontFamily: fonts.bold,
        fontSize: 13,
    },
});

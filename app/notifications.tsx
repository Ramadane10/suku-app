import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
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

            if (data) setNotifications(data);
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
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (!error) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const formatTime = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return 'À l\'instant';
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `Il y a ${diffInDays}j`;
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'order': return 'bicycle-outline';
            case 'promo': return 'pricetag-outline';
            default: return 'notifications-outline';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.is_read ? colors.surface : colors.primary + '10', borderBottomColor: colors.border }
            ]}
            onPress={() => markAsRead(item.id)}
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
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
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
});

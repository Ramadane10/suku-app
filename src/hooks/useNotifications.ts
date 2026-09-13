import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserSettings } from './useUserSettings';

// Le handler sera configuré dynamiquement si possible

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { user } = useAuth();
  const { settings } = useUserSettings();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      try {
        if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
          const Notifications = require('expo-notifications');
          Notifications.setBadgeCountAsync(0).catch(() => {});
        }
      } catch (e) {}
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadCount(count);
          try {
            if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
              const Notifications = require('expo-notifications');
              Notifications.setBadgeCountAsync(count).catch(() => {});
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error fetching unread notification count:', err);
      }
    };

    fetchUnreadCount();

    const subscription = supabase
      .channel('notifications_unread_count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      setUnreadCount(0);
      try {
        if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
          const Notifications = require('expo-notifications');
          Notifications.setBadgeCountAsync(0).catch(() => {});
        }
      } catch (e) {}

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    // Ne pas charger les notifications dans Expo Go pour éviter les erreurs SDK 53+
    // On vérifie de manière très stricte pour éviter tout require() accidentel
    if (Constants.appOwnership === 'expo') {
      console.log('Notifications bypass: Running in Expo Go');
      return;
    }

    try {
      const Notifications = require('expo-notifications');

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          if (user && token) {
            savePushToken(user.id, token);
          }
        }
      });

      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('Notification response:', response);
      });
    } catch (e) {
      console.error('Failed to load expo-notifications:', e);
    }

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, [user]);

  const savePushToken = async (userId: string, token: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);
      if (error) console.error('Error saving push token:', error);
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    if (Constants.appOwnership === 'expo') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: data || {}, sound: true },
        trigger: null,
      });
    } catch (e) {
      console.error('Error sending local notification:', e);
    }
  };

  const scheduleNotification = async (title: string, body: string, seconds: number, data?: any) => {
    if (Constants.appOwnership === 'expo') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: data || {}, sound: true },
        trigger: { seconds },
      });
    } catch (e) {
      console.error('Error scheduling notification:', e);
    }
  };

  const shouldSendNotification = (type: string) => {
    if (!settings) return false;
    return (settings as any)[type];
  };

  const createNotification = async (title: string, message: string, type: string = 'system', data?: any) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('notifications').insert([{
        user_id: user.id, title, message, type, data: data || {}, is_read: false,
      }]);
      if (error) console.error('Error saving notification to DB:', error);
    } catch (err) {
      console.error('Error saving notification to DB:', err);
    }
  };

  return {
    expoPushToken,
    notification,
    unreadCount,
    sendLocalNotification,
    scheduleNotification,
    shouldSendNotification,
    createNotification,
    markAllAsRead,
  };
}

async function registerForPushNotificationsAsync() {
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenData.data;
    return token;
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    return null;
  }
}

export default useNotifications;


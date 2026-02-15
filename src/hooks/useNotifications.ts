import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserSettings } from './useUserSettings';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { user } = useAuth();
  const { settings } = useUserSettings();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Enregistrer le token dans Supabase pour l'utilisateur connecté
        if (user && token) {
          savePushToken(user.id, token);
        }
      }
    });

    // Écouter les notifications reçues pendant que l'app est au premier plan
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Écouter les interactions avec les notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Vous pouvez naviguer vers une page spécifique ici
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  // Enregistrer le token push dans Supabase
  const savePushToken = async (userId: string, token: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  };

  // Envoyer une notification locale
  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Envoyer immédiatement
    });
  };

  // Envoyer une notification programmée
  const scheduleNotification = async (
    title: string,
    body: string,
    seconds: number,
    data?: any
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        seconds,
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  // Vérifier si les notifications sont activées pour un type donné
  const shouldSendNotification = (type: 'order_updates' | 'new_arrivals' | 'promotions' | 'sales_alerts') => {
    if (!settings) return false;
    
    switch (type) {
      case 'order_updates':
        return settings.order_updates;
      case 'new_arrivals':
        return settings.new_arrivals;
      case 'promotions':
        return settings.promotions;
      case 'sales_alerts':
        return settings.sales_alerts;
      default:
        return false;
    }
  };

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    scheduleNotification,
    shouldSendNotification,
  };
}

async function registerForPushNotificationsAsync() {
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
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }
  
  // Récupérer le Project ID depuis Constants ou utiliser une valeur par défaut
  const projectId = 
    Constants.expoConfig?.extra?.eas?.projectId || 
    Constants.expoConfig?.extra?.projectId ||
    'your-project-id'; // Valeur par défaut si non trouvée
  
  // Si le Project ID n'est pas configuré, on peut quand même obtenir un token
  // mais les notifications push depuis un serveur ne fonctionneront pas
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId !== 'your-project-id' ? projectId : undefined,
    });
    token = tokenData.data;
    console.log('Expo Push Token:', token);
    return token;
  } catch (error: any) {
    // Si l'erreur est liée au Project ID, on log mais on continue
    if (error.message?.includes('projectId') || projectId === 'your-project-id') {
      console.warn('Project ID Expo non configuré. Les notifications LOCALES fonctionneront, mais pas les notifications PUSH depuis un serveur.');
      console.warn('Pour activer les notifications push, configurez votre Project ID dans app.json ou via EAS.');
      return null; // Pas de token sans Project ID valide
    }
    console.error('Error getting push token:', error);
    return null;
  }
}


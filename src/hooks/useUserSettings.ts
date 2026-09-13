import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface UserSettings {
  user_id: string;
  order_updates: boolean;
  face_id_enabled?: boolean;
  new_arrivals?: boolean;
  promotions?: boolean;
  sales_alerts?: boolean;
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id'> = {
  order_updates: true,
  face_id_enabled: false,
  new_arrivals: true,
  promotions: false,
  sales_alerts: true,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.warn('Erreur lecture user_settings, utilisation des valeurs par défaut:', fetchError.message);
        setSettings({ user_id: user.id, ...DEFAULT_SETTINGS });
        return;
      }

      if (data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          order_updates: data.order_updates ?? true,
        });
      } else {
        // Initialiser avec les paramètres par défaut en base
        const { data: created } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...DEFAULT_SETTINGS,
          }, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        setSettings(created || { user_id: user.id, ...DEFAULT_SETTINGS });
      }
    } catch (err: any) {
      console.error('Error fetching user settings:', err);
      setSettings({ user_id: user.id, ...DEFAULT_SETTINGS });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour modifier vos paramètres.');
    }

    try {
      setLoading(true);
      setError(null);

      // Filtrer uniquement les colonnes valides de user_settings (jamais id ou updated_at)
      const validColumns = ['order_updates', 'face_id_enabled', 'new_arrivals', 'promotions', 'sales_alerts'];
      const payload: any = { user_id: user.id };
      for (const col of validColumns) {
        if (col in updates) {
          payload[col] = (updates as any)[col];
        }
      }

      const { data, error: upsertError } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      if (upsertError) {
        console.error('Upsert user_settings error:', upsertError);
        throw upsertError;
      }

      const nextSettings = data || {
        ...(settings || { user_id: user.id, ...DEFAULT_SETTINGS }),
        ...payload,
      };

      setSettings(nextSettings);
      return nextSettings;
    } catch (err: any) {
      console.error('Error updating user settings:', err);
      setError(err.message);
      throw new Error(`Échec de la mise à jour des paramètres: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, settings]);

  const updateSetting = useCallback(async (key: keyof UserSettings, value: any) => {
    return updateSettings({ [key]: value } as Partial<UserSettings>);
  }, [updateSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateSetting,
  };
}



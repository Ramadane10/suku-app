import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface UserSettings {
  id: string;
  user_id: string;
  face_id_enabled: boolean;
  order_updates: boolean;
  new_arrivals: boolean;
  promotions: boolean;
  sales_alerts: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS = {
  face_id_enabled: false,
  order_updates: true,
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

      // Récupérer les paramètres existants
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw fetchError;
      }

      if (data) {
        setSettings(data);
      } else {
        // Créer les paramètres par défaut si aucun n'existe
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert([{
            user_id: user.id,
            ...DEFAULT_SETTINGS,
          }])
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (err: any) {
      console.error('Error fetching user settings:', err);
      setError(err.message);
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

      // Vérifier si les paramètres existent
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;

      if (existing) {
        // Mettre à jour les paramètres existants
        const { data, error: updateError } = await supabase
          .from('user_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Créer les paramètres s'ils n'existent pas
        const { data, error: createError } = await supabase
          .from('user_settings')
          .insert([{
            user_id: user.id,
            ...DEFAULT_SETTINGS,
            ...updates,
          }])
          .select()
          .single();

        if (createError) throw createError;
        result = data;
      }

      setSettings(result);
      return result;
    } catch (err: any) {
      console.error('Error updating user settings:', err);
      setError(err.message);
      throw new Error(`Échec de la mise à jour des paramètres: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

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


import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger le profil
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // Si le profil n'existe pas, le créer
        if (fetchError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
              phone: user.user_metadata?.phone || null,
            }])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (profileData: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour mettre à jour votre profil.');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour aussi les métadonnées de l'utilisateur
      if (profileData.full_name || profileData.phone) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            full_name: profileData.full_name || profile?.full_name,
            phone: profileData.phone || profile?.phone,
          },
        });

        if (metadataError) {
          console.warn('Error updating user metadata:', metadataError);
        }
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw new Error(`Erreur lors de la mise à jour du profil: ${err.message}`);
    }
  }, [user, profile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
}


import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Address {
  id: string;
  user_id: string;
  address_line: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les adresses de l'utilisateur
  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAddresses(data || []);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Créer une nouvelle adresse
  const createAddress = useCallback(async (addressData: {
    address_line: string;
    city: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
  }) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour créer une adresse.');
    }

    try {
      // Si cette adresse est définie comme défaut, retirer le défaut des autres
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error: createError } = await supabase
        .from('addresses')
        .insert([{
          user_id: user.id,
          ...addressData,
          is_default: addressData.is_default || false,
        }])
        .select()
        .single();

      if (createError) throw createError;

      await fetchAddresses();
      return data;
    } catch (err: any) {
      console.error('Error creating address:', err);
      throw new Error(`Erreur lors de la création de l'adresse: ${err.message}`);
    }
  }, [user, fetchAddresses]);

  // Mettre à jour une adresse
  const updateAddress = useCallback(async (addressId: string, addressData: {
    address_line?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    is_default?: boolean;
  }) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour mettre à jour une adresse.');
    }

    try {
      // Si cette adresse est définie comme défaut, retirer le défaut des autres
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)
          .neq('id', addressId);
      }

      const { data, error: updateError } = await supabase
        .from('addresses')
        .update({
          ...addressData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchAddresses();
      return data;
    } catch (err: any) {
      console.error('Error updating address:', err);
      throw new Error(`Erreur lors de la mise à jour de l'adresse: ${err.message}`);
    }
  }, [user, fetchAddresses]);

  // Supprimer une adresse
  const deleteAddress = useCallback(async (addressId: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer une adresse.');
    }

    try {
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await fetchAddresses();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      throw new Error(`Erreur lors de la suppression de l'adresse: ${err.message}`);
    }
  }, [user, fetchAddresses]);

  // Définir une adresse par défaut
  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour définir une adresse par défaut.');
    }

    try {
      // Retirer le défaut de toutes les adresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Définir cette adresse comme défaut
      const { data, error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchAddresses();
      return data;
    } catch (err: any) {
      console.error('Error setting default address:', err);
      throw new Error(`Erreur lors de la définition de l'adresse par défaut: ${err.message}`);
    }
  }, [user, fetchAddresses]);

  // Obtenir l'adresse par défaut
  const getDefaultAddress = useCallback(() => {
    return addresses.find(addr => addr.is_default) || addresses[0] || null;
  }, [addresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
}


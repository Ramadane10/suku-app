import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address?: {
    address_line: string;
    city: string;
    postal_code: string;
    country: string;
  };
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
  };
}

export interface OrderItem {
  id: string;
  product_name: string;
  unit_price: number;
  quantity_kg: number;
  total_price: number;
  product_id: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer les commandes avec les adresses et items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          updated_at,
          shipping_address:addresses(
            address_line,
            city,
            postal_code,
            country
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Pour chaque commande, récupérer les items
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
          }

          // Récupérer le paiement
          const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('method, status')
            .eq('order_id', order.id)
            .single();

          if (paymentError && paymentError.code !== 'PGRST116') {
            console.error('Error fetching payment:', paymentError);
          }

          // Gérer le cas où shipping_address est retourné comme un tableau
          const shippingAddr = Array.isArray(order.shipping_address)
            ? order.shipping_address[0]
            : order.shipping_address;

          return {
            ...order,
            shipping_address: shippingAddr,
            items: items || [],
            payment: payment || undefined,
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (params: {
    cartItems: any[];
    shippingAddress: {
      id?: string;
      address_line: string;
      city: string;
      postal_code: string;
      country: string;
    };
    paymentMethod: string;
    totalAmount: number;
  }) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      // 1. Créer ou récupérer l'adresse de livraison
      let addressId = params.shippingAddress.id;

      if (!addressId) {
        // Vérifier si une adresse identique existe déjà pour cet utilisateur
        const { data: existingAddresses, error: checkError } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .eq('address_line', params.shippingAddress.address_line)
          .eq('city', params.shippingAddress.city)
          .eq('postal_code', params.shippingAddress.postal_code)
          .limit(1);

        if (existingAddresses && existingAddresses.length > 0) {
          addressId = existingAddresses[0].id;
          console.log('Using existing address found in DB:', addressId);
        } else {
          // Créer une nouvelle adresse si non trouvée
          const { data: newAddress, error: addressError } = await supabase
            .from('addresses')
            .insert([{
              user_id: user.id,
              address_line: params.shippingAddress.address_line,
              city: params.shippingAddress.city,
              postal_code: params.shippingAddress.postal_code,
              country: params.shippingAddress.country,
              is_default: false,
            }])
            .select('id')
            .limit(1);

          if (addressError || !newAddress || newAddress.length === 0) {
            throw new Error(`Erreur lors de la création de l'adresse: ${addressError?.message || 'Inconnue'}`);
          }
          addressId = newAddress[0].id;
          console.log('Created new address in DB:', addressId);
        }
      }

      // 2. Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          total_amount: params.totalAmount,
          shipping_address_id: addressId,
        }])
        .select('id')
        .limit(1);

      const orderData = (order && order.length > 0) ? order[0] : null;

      if (orderError || !orderData) {
        throw new Error(`Erreur lors de la création de la commande: ${orderError?.message || 'Inconnue'}`);
      }

      // 3. Créer les items de commande
      const orderItems = params.cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.name,
        unit_price: item.pricePerKilo,
        quantity_kg: item.quantity,
        total_price: parseFloat(item.totalPrice),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(`Erreur lors de la création des items: ${itemsError.message}`);
      }

      // 4. Créer l'enregistrement de paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: orderData.id,
          method: params.paymentMethod,
          status: 'pending',
          amount: params.totalAmount,
        }]);

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Ne pas faire échouer la commande si le paiement échoue
      }

      // 5. Mettre à jour le statut de la commande et du paiement
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
        })
        .eq('id', orderData.id);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }

      // Mettre à jour le statut du paiement
      await supabase
        .from('payments')
        .update({ status: 'paid' })
        .eq('order_id', orderData.id);

      // Recharger les commandes
      await fetchOrders();

      return orderData;
    } catch (err: any) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      const { data: updateResult, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .limit(1);

      const data = (updateResult && updateResult.length > 0) ? updateResult[0] : null;

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${updateError.message}`);
      }

      // Recharger les commandes
      await fetchOrders();
      return data;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      throw new Error(`Failed to update order status: ${err.message}`);
    }
  };

  // Mettre à jour le statut de paiement
  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      // Mettre à jour le paiement
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({ status: paymentStatus })
        .eq('order_id', orderId);

      if (paymentUpdateError) {
        throw new Error(`Erreur lors de la mise à jour du paiement: ${paymentUpdateError.message}`);
      }

      // Mettre à jour le statut de paiement de la commande
      const { data: updateResult, error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .limit(1);

      const data = (updateResult && updateResult.length > 0) ? updateResult[0] : null;

      if (orderUpdateError) {
        throw new Error(`Erreur lors de la mise à jour de la commande: ${orderUpdateError.message}`);
      }

      // Recharger les commandes
      await fetchOrders();
      return data;
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      throw new Error(`Failed to update payment status: ${err.message}`);
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
  };
}


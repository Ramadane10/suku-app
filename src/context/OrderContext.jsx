import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    fullName: '',
    phone: '',
    id: '',
  });
  const [payment, setPayment] = useState('');
  // Produit pour achat direct (sans passer par le panier)
  const [directPurchase, setDirectPurchase] = useState(null);

  const saveShipping = (data) => setShipping({ ...shipping, ...data });
  const savePayment = (method) => setPayment(method);
  const setDirectPurchaseProduct = (product) => setDirectPurchase(product);
  const clearDirectPurchase = () => setDirectPurchase(null);
  const clearOrder = () => {
    setShipping({ id: '', address: '', city: '', postalCode: '', country: '', fullName: '', phone: '' });
    setPayment('');
    setDirectPurchase(null);
  };

  return (
    <OrderContext.Provider value={{
      shipping,
      payment,
      directPurchase,
      saveShipping,
      savePayment,
      setDirectPurchaseProduct,
      clearDirectPurchase,
      clearOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
}; 
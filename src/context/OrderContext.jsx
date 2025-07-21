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
  });
  const [payment, setPayment] = useState('');

  const saveShipping = (data) => setShipping(data);
  const savePayment = (method) => setPayment(method);
  const clearOrder = () => {
    setShipping({ address: '', city: '', postalCode: '', country: '' });
    setPayment('');
  };

  return (
    <OrderContext.Provider value={{ shipping, payment, saveShipping, savePayment, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
}; 
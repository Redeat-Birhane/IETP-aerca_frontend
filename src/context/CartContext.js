import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items when app loads
  useEffect(() => {
    fetch("https://ietp-aerca-backend.onrender.com/users/view/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCartItems(data.cart_items || []))
      .catch(() => setCartItems([]));
  }, []);

  const addItem = (item) => {
    setCartItems((prev) => [...prev, item]);
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, addItem, removeItem, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

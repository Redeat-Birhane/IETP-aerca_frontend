import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items when app loads
  useEffect(() => {
    fetch(`${API_BASE}/users/view/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCartItems(data.cart_items || []))
      .catch(() => setCartItems([]));
  }, []);

  const addItem = (item) => {
    setCartItems((prev) => [...prev, item]);
  };

  const removeItem = async (cart_item_id) => {
    try {
      const res = await fetch(`${API_BASE}/users/remove/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      // Remove from frontend only after backend confirms deletion
      setCartItems((prev) => prev.filter((item) => item.id !== cart_item_id));
    } catch (err) {
      alert(err.message || "Failed to remove item. Please try again.");
    }
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

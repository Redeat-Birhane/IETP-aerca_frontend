import React, { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/view/`, {
        credentials: "include",
      });
      const data = await res.json();
      setCartItems(data.cart_items || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // REMOVE item (server authoritative)
  const removeItem = async (cart_item_id) => {
    try {
      const res = await fetch(`${API_BASE}/users/remove/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Remove failed");

      // Re-sync cart from backend
      fetchCart();
    } catch (err) {
      alert(err.message || "Failed to remove item");
    }
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        removeItem,
        totalItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

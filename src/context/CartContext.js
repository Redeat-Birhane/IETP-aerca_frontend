import React, { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items from backend
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

  // Add item to cart (optimistic UI)
  const addItem = async (item_id, quantity = 1) => {
    try {
      const res = await fetch(`${API_BASE}/users/add/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Add to cart failed");

     
      if (data.cart_item) {
        setCartItems((prev) => [...prev, data.cart_item]);
      } else {
  
        fetchCart();
      }
    } catch (err) {
      alert(err.message || "Failed to add item to cart");
    }
  };

  // Remove item from cart (optimistic UI)
  const removeItem = async (cart_item_id) => {
    const prevCart = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.id !== cart_item_id));

    try {
      const res = await fetch(`${API_BASE}/users/remove/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Remove failed");
    } catch (err) {
      // rollback UI if remove fails
      setCartItems(prevCart);
      alert(err.message || "Failed to remove item");
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addItem,
        removeItem,
        totalItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

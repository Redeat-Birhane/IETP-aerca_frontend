import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [pendingRemovals, setPendingRemovals] = useState(new Set());

  // Fetch cart items when app loads
  useEffect(() => {
    fetch(`${API_BASE}/users/view/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCartItems(data.cart_items || []))
      .catch(() => setCartItems([]));
  }, []);

const addItem = async (item) => {
  // Optimistically add to UI
  setCartItems((prev) => [...prev, item]);

  try {
    const res = await fetch(`${API_BASE}/users/add/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id, quantity: item.quantity }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add item");

    // Optionally, sync quantity returned from backend
    setCartItems((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, quantity: data.quantity } : c
      )
    );
  } catch (err) {
    // Rollback if add fails
    setCartItems((prev) => prev.filter((c) => c.id !== item.id));
    alert(err.message || "Failed to add item. Please try again.");
  }
};


  const removeItem = async (cart_item_id) => {
    // Prevent duplicate removals
    if (pendingRemovals.has(cart_item_id)) return;

    setPendingRemovals((prev) => new Set(prev).add(cart_item_id));

    let removedItem = null;
    setCartItems((prev) => {
      const newCart = prev.filter((item) => {
        if (item.id === cart_item_id) removedItem = item;
        return item.id !== cart_item_id;
      });
      return newCart;
    });

    try {
      const res = await fetch(`${API_BASE}/users/remove/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove item");
    } catch (err) {
      // Restore only the removed item if request fails
      if (removedItem) {
        setCartItems((prev) => [...prev, removedItem]);
      }
      alert(err.message || "Failed to remove item. Please try again.");
    } finally {
      setPendingRemovals((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cart_item_id);
        return newSet;
      });
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

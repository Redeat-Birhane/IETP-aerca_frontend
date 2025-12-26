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
    // Debug logging start
    console.log("🔍 === REMOVE ITEM DEBUG START ===");
    console.log("📦 Current cart items:", cartItems);
    console.log("🎯 Item ID to remove:", cart_item_id);
    console.log("🔢 Type of ID:", typeof cart_item_id);
    console.log("🌐 API_BASE:", API_BASE);
    
    const fullUrl = `${API_BASE}/users/remove/`;
    console.log("📍 Full URL being called:", fullUrl);
    
    // Find the item being removed
    const itemBeingRemoved = cartItems.find(item => item.id === cart_item_id);
    console.log("📝 Item details being removed:", itemBeingRemoved);
    // Debug logging end

    // Optimistic UI: remove item immediately
    const previousItems = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.id !== cart_item_id));

    try {
      const res = await fetch(`${API_BASE}/users/remove/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id }),
      });

      // Debug logging for response
      console.log("📥 Response received!");
      console.log("✅ Response URL:", res.url);
      console.log("🔢 Response status:", res.status);
      console.log("📋 Response status text:", res.statusText);
      
      const data = await res.json();
      console.log("📊 Response data:", data);

      if (!res.ok) {
        // Restore previous state if backend fails
        setCartItems(previousItems);
        throw new Error(data.message || "Failed to remove item");
      }
      
      console.log("🎉 Success! Item removed from backend");
    } catch (err) {
      console.error("💥 Error in removeItem:", err);
      // Restore previous state on network or other errors
      setCartItems(previousItems);
      alert(err.message || "Failed to remove item. Please try again.");
    }
    
    console.log("🔍 === REMOVE ITEM DEBUG END ===");
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
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [pendingRemovals, setPendingRemovals] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart items when app loads
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/view/`, { 
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to fetch cart");
      
      const data = await res.json();
      // Ensure we have a proper array and normalize IDs
      const items = Array.isArray(data.cart_items) ? data.cart_items : [];
      setCartItems(items.map(item => ({
        ...item,
        // Normalize the ID - use cart_item_id as the primary ID for removal
        id: item.cart_item_id || item.id
      })));
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (item) => {
    // For optimistic UI, add item immediately
    // The ID will be temporary until we sync with server
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const newItem = {
      ...item,
      id: tempId, // Temporary ID for optimistic UI
      cart_item_id: tempId // Also set as cart_item_id for consistency
    };
    
    setCartItems((prev) => [...prev, newItem]);
    
    // Sync with server in background
    syncAddItemToServer(newItem).catch(console.error);
  };

  const syncAddItemToServer = async (item) => {
    try {
      const res = await fetch(`${API_BASE}/users/add-to-cart/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          product_id: item.product_id,
          quantity: item.quantity || 1 
        }),
      });
      
      if (res.ok) {
        // Refresh cart to get proper server IDs
        await fetchCartItems();
      }
    } catch (err) {
      console.error("Failed to sync with server:", err);
    }
  };

  const removeItem = async (cart_item_id) => {
    // Prevent duplicate removals
    if (pendingRemovals.has(cart_item_id)) return;

    setPendingRemovals((prev) => new Set(prev).add(cart_item_id));

    let removedItem = null;
    setCartItems((prev) => {
      const newCart = prev.filter((item) => {
        // Check both id and cart_item_id for matching
        const itemId = item.cart_item_id || item.id;
        if (itemId === cart_item_id) removedItem = item;
        return itemId !== cart_item_id;
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
      
      if (!res.ok) {
        // If item not found on server but we removed it locally, that's okay
        if (res.status === 404 || data.message?.includes("not found")) {
          console.log("Item already removed on server");
          return;
        }
        throw new Error(data.message || "Failed to remove item");
      }
      
      // If successful and we removed a temporary item, refresh to get clean state
      if (cart_item_id.startsWith('temp-')) {
        await fetchCartItems();
      }
      
    } catch (err) {
      console.error("Remove error:", err);
      
      // Only restore if it's not a "not found" error
      if (removedItem && !err.message?.includes("not found")) {
        setCartItems((prev) => {
          // Check if item already exists to avoid duplicates
          const exists = prev.some(item => {
            const itemId = item.cart_item_id || item.id;
            return itemId === cart_item_id;
          });
          
          if (!exists) {
            return [...prev, removedItem];
          }
          return prev;
        });
        alert(err.message || "Failed to remove item. Please try again.");
      }
    } finally {
      setPendingRemovals((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cart_item_id);
        return newSet;
      });
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{ 
        cartItems, 
        setCartItems, 
        addItem, 
        removeItem, 
        totalItems,
        pendingRemovals,
        isLoading,
        refreshCart: fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
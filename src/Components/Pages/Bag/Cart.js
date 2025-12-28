import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import "./Cart.css";

const API_BASE = process.env.REACT_APP_API_BASE;

function Cart() {
  const { cartItems, setCartItems, removeItem} = useContext(CartContext);
  const [expandedId, setExpandedId] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async (e, itemId) => {
    e.preventDefault();
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) return navigate("/Signin");

    if (!receipt) return alert("Please select a receipt file");

    const form = new FormData();
    form.append("receipt", receipt);
    if (deliveryLocation) form.append("delivery_location", deliveryLocation);

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/users/checkout/`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Cart checked out successfully");
        setCartItems((prev) => prev.filter((c) => c.id !== itemId));
      } else alert(data.message || "Checkout failed");
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-loading">Your cart is empty 🛒</div>
        <button className="btn-go-store" onClick={() => navigate("/items")}>
          Go to Store
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Cart Items</h1>
      <p className="cart-subtitle">
        Connect with professionals who manage and verify tax payment records.
      </p>

      <div className="cart-grid">
        {cartItems.map((c) => (
          <div
            className={`cart-item-card ${expandedId === c.id ? "expanded" : ""}`}
            key={c.id}
            onClick={() =>
              setExpandedId(expandedId === c.id ? null : c.id)
            }
          >
            {/* FULL WIDTH TOP PHOTO */}
            <div className="cart-photo-container">
              {c.photo ? (
                <img
                  src={`${API_BASE}${c.photo}`}
                  alt={c.name}
                  className="item-card-image"
                  onError={(e) => {
                    // Apply the same style from Items.js
                    e.target.onerror = null;
                    e.target.src = "/fallback.png";
                  }}
                />
              ) : (
                // For items without photo, use the same style as Items.js
                <div className="cart-photo-fallback-rect">
                  NO IMAGE
                </div>
              )}
            </div>

            <div className="cart-content-wrapper">
              <div className="cart-item-header-info">
                <h2>{c.name}</h2>
                <p className="cart-price-text">Price: ${c.price}</p>
              </div>

              <div className="cart-item-body-content">
                <div className="info-row">
                  <span className="info-label">Quantity:</span>
                  <span className="info-value">{c.quantity}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">Pending Checkout</span>
                </div>

                {c.location && (
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{c.location}</span>
                  </div>
                )}

                {c.size && (
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span className="info-value">{c.size}</span>
                  </div>
                )}

                {c.enhancement && (
                  <div className="info-row">
                    <span className="info-label">Enhancement:</span>
                    <span className="info-value">{c.enhancement}</span>
                  </div>
                )}
              </div>

              {expandedId === c.id ? (
                <div
                  className="cart-expanded-area"
                  onClick={(e) => e.stopPropagation()}
                >
                  <form
                    className="checkout-form"
                    onSubmit={(e) => handleCheckout(e, c.id)}
                  >
                    <label>
                      Receipt (required):
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setReceipt(e.target.files[0])}
                      />
                    </label>

                    <label>
                      Delivery location (optional):
                      <input
                        type="text"
                        placeholder="Enter address..."
                        value={deliveryLocation}
                        onChange={(e) =>
                          setDeliveryLocation(e.target.value)
                        }
                      />
                    </label>

                    <div className="cart-actions-row">
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={submitting}
                      >
                        {submitting ? "..." : "Checkout"}
                      </button>
                     <button
                      type="button"
                      className="btn-remove"
                      onClick={(e) => {
                        e.stopPropagation();  
                        removeItem(c.id);
                      }}
                    >
                      Remove
                    </button>

                    </div>
                  </form>
                </div>
              ) : (
                <div className="cart-tap-prompt">
                  <span>📎 Add paid receipt & checkout</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cart;
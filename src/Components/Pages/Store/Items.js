import React, { useEffect, useState } from "react";
import "./Items.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/users/items/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setItems(data.store_items || []))
      .catch(() => setError("Failed to synchronize inventory"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (itemId) => {
    try {
      const res = await fetch(`${API_BASE}/users/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ item_id: itemId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Unit added to deployment");
      } else {
        alert(data.message || "Failed to add unit");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) return <div className="item-container">✨ Loading System Data...</div>;
  if (error) return <div className="item-container error-text">{error}</div>;

  return (
    <div className="item-container">
      <h1 className="item-title">Technical Inventory</h1>
      
      <p className="item-subtitle">High-performance hardware optimized for mission-critical fieldwork.</p>

      {/* Stats Section Styled like Law Controls */}
      <div className="item-stats-wrapper">
        <div className="item-stat-pill">🔄 Rapid Sync</div>
        <div className="item-stat-pill">⚒️ Field-Ready</div>
        <div className="item-stat-pill">⏱️ Time Efficient</div>
      </div>

      <div className="item-grid">
        {items.length === 0 ? (
          <p className="no-results">No technical assets found.</p>
        ) : (
          items.map((it) => (
            <div className="item-card" key={it.id}>
              <div className="item-card-header">
                {it.photo ? (
                  <img
                    src={`${API_BASE}${it.photo}`}
                    alt={it.name}
                    className="item-card-image"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "/fallback.png";
                    }}
                  />
                ) : (
                  <div className="item-no-photo">NO IMAGE</div>
                )}
              </div>
              
              <div className="item-card-body">
                <div className="item-info-top">
                  <h2>{it.name}</h2>
                  <span className="item-price-tag">${it.price}</span>
                </div>
                
                <p className="item-summary">{it.description}</p>
                
                <div className="item-card-footer">
                  <span className="item-category-tag">📍 {it.location}</span>
                  <button className="item-action-btn" onClick={() => addToCart(it.id)}>
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
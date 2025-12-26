import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Items.css";
import { CartContext } from "../../../context/CartContext";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Items() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useContext(CartContext); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sizeFilter, setSizeFilter] = useState(""); // Added
  const [enhancementFilter, setEnhancementFilter] = useState(""); // Added

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/Signin", { state: { from: location.pathname } });
      return;
    }
    fetchItems();
  }, [navigate, location]);

  useEffect(() => {
    fetchItems();
  }, [sizeFilter, enhancementFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/users/items/?`;
      if (sizeFilter) url += `size=${encodeURIComponent(sizeFilter)}&`;
      if (enhancementFilter) url += `enhancement=${encodeURIComponent(enhancementFilter)}`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");

      setItems(data.items || []);
      setError("");
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async (item) => {
    try {
      const res = await fetch(`${API_BASE}/users/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ item_id: item.id, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok) {
        addItem({ id: item.id, quantity: 1, name: item.name, price: item.price, photo: item.photo });
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

      {/* Filter Panel */}
      <div className="item-filter-panel">
        <div className="item-filter-field">
          <label htmlFor="size-filter">Filter by Size:</label>
          <input
            id="size-filter"
            type="text"
            placeholder="e.g., Small, Medium, Large"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="item-filter-input"
          />
        </div>
        <div className="item-filter-field">
          <label htmlFor="enhancement-filter">Filter by Enhancement:</label>
          <input
            id="enhancement-filter"
            type="text"
            placeholder="e.g., Enhanced, Standard"
            value={enhancementFilter}
            onChange={(e) => setEnhancementFilter(e.target.value)}
            className="item-filter-input"
          />
        </div>
      </div>

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
                  <span className="item-category-tag">📏 {it.size}</span>
                  <span className="item-category-tag">✨ {it.enhancement}</span>
                  <button className="item-action-btn" onClick={() => addToCartHandler(it)}>
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

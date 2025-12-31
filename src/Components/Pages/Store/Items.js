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

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users/search/?category=store`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data.results || []);
    } catch (err) {
      setError("Failed to synchronize inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/Signin", { state: { from: location.pathname } });
      return;
    }
    fetchItems();
  }, [navigate, location]);

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
        addItem({
          id: item.id,
          quantity: 1,
          name: item.name,
          price: item.price,
          photo: item.photo,
        });
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
      <p className="item-subtitle">
        High-performance hardware optimized for mission-critical fieldwork.
      </p>

      <div className="item-stats-wrapper">
        <div className="item-stat-pill">🔄 Rapid Sync</div>
        <div className="item-stat-pill">⚒️ Field-Ready</div>
        <div className="item-stat-pill">⏱️ Time Efficient</div>
      </div>

      {/* New Button Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          className="item-action-btn" 
          style={{ maxWidth: '300px' }}
          onClick={() => navigate("/instructions")}
        >
          Material Usage Instructions
        </button>
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
                <h2 className="item-name">{it.name}</h2>
                <p className="item-description">{it.description}</p>

                <p className="item-detail"><strong>Location:</strong> {it.location}</p>
                <p className="item-detail"><strong>Size:</strong> {it.size}</p>
                <p className="item-detail"><strong>Enhancement:</strong> {it.enhancement}</p>
                <p className="item-price-tag"><strong>Price:</strong> ${it.price}</p>

                <button
                  className="item-action-btn"
                  onClick={() => addToCartHandler(it)}
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
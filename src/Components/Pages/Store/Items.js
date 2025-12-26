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

  // New state for filters
  const [sizeFilter, setSizeFilter] = useState("");
  const [enhancementFilter, setEnhancementFilter] = useState("");
  
  const fetchItems = async () => {
    setLoading(true); // Reset loading when starting fetch
    setError("");
    
    try {
      // Build query parameters for filters
      const params = new URLSearchParams();
      if (sizeFilter) params.append('size', sizeFilter);
      if (enhancementFilter) params.append('enhancement', enhancementFilter);
      
      const queryString = params.toString();
      const url = queryString 
        ? `${API_BASE}/users/items/?${queryString}`
        : `${API_BASE}/users/items/`;
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("You are not authenticated. Please log in.");
          navigate("/Signin", { state: { from: location.pathname } });
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch items: ${res.status}`);
      }

      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false); // Always set loading to false
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

  // Update items when filters change (with debounce to prevent too many requests)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) fetchItems();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [sizeFilter, enhancementFilter]);

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
          location: item.location,
          size: item.size,
          enhancement: item.enhancement
        });
        alert(data.message || "Unit added to deployment");
      } else {
        alert(data.message || "Failed to add unit");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Add a loading spinner with timeout warning
  if (loading) {
    return (
      <div className="item-container">
        <div className="loading-spinner">✨ Loading System Data...</div>
        <div className="loading-subtext">
          This is taking longer than expected. Please check your connection.
        </div>
      </div>
    );
  }
  
  if (error) return <div className="item-container error-text">{error}</div>;

  return (
    <div className="item-container">
      <h1 className="item-title">Technical Inventory</h1>
      <p className="item-subtitle">High-performance hardware optimized for mission-critical fieldwork.</p>

      {/* Filter Panel */}
      <div className="item-filter-panel">
        <input
          type="text"
          placeholder="Filter by Size"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="item-filter-input"
        />
        <input
          type="text"
          placeholder="Filter by Enhancement"
          value={enhancementFilter}
          onChange={(e) => setEnhancementFilter(e.target.value)}
          className="item-filter-input"
        />
        <button 
          onClick={() => {
            setSizeFilter("");
            setEnhancementFilter("");
          }}
          className="item-filter-clear"
        >
          Clear Filters
        </button>
      </div>

      <div className="item-stats-wrapper">
        <div className="item-stat-pill">🔄 Rapid Sync</div>
        <div className="item-stat-pill">⚒️ Field-Ready</div>
        <div className="item-stat-pill">⏱️ Time Efficient</div>
      </div>

      <div className="item-grid">
        {items.length === 0 ? (
          <p className="no-results">
            No technical assets found. {sizeFilter || enhancementFilter ? "Try different filters." : ""}
          </p>
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
                  {/* Location with label */}
                  <div className="item-tag-with-label">
                    <span className="item-tag-label">Location:</span>
                    <span className="item-category-tag">📍 {it.location || "N/A"}</span>
                  </div>
                  
                  {/* Size with label */}
                  <div className="item-tag-with-label">
                    <span className="item-tag-label">Size:</span>
                    <span className="item-category-tag">📏 {it.size || "N/A"}</span>
                  </div>
                  
                  {/* Enhancement with label */}
                  <div className="item-tag-with-label">
                    <span className="item-tag-label">Enhancement:</span>
                    <span className="item-category-tag">✨ {it.enhancement || "N/A"}</span>
                  </div>
                  
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
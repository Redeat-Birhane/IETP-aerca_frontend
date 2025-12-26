import React, { useEffect, useState, useContext, useRef } from "react";
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
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // New state for filters
  const [sizeFilter, setSizeFilter] = useState("");
  const [enhancementFilter, setEnhancementFilter] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use refs to track API calls
  const fetchInProgress = useRef(false);
  const loadingTimer = useRef(null);
  const timeoutWarningTimer = useRef(null);

  const fetchItems = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setLoading(true);
    setError("");
    
    // Start timeout warning after 3 seconds
    timeoutWarningTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 3000);
    
    try {
      // Build query parameters for filters
      const params = new URLSearchParams();
      if (sizeFilter) params.append('size', sizeFilter);
      if (enhancementFilter) params.append('enhancement', enhancementFilter);
      
      const queryString = params.toString();
      const url = queryString 
        ? `${API_BASE}/users/items/?${queryString}`
        : `${API_BASE}/users/items/`;
      
      console.log("Fetching items from:", url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("You are not authenticated. Please log in.");
          navigate("/Signin", { state: { from: location.pathname } });
          return;
        }
        throw new Error(`Failed to fetch items: ${res.status}`);
      }

      const data = await res.json();
      console.log("Items fetched successfully:", data.length);
      setItems(data);
      setShowTimeoutWarning(false);
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to fetch items. Please try again.");
      }
      
      // Keep the timeout warning visible for timeout errors
      if (err.name !== 'AbortError') {
        setShowTimeoutWarning(false);
      }
    } finally {
      clearTimeout(timeoutWarningTimer.current);
      setLoading(false);
      fetchInProgress.current = false;
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    // Clear any existing timers on unmount
    return () => {
      clearTimeout(loadingTimer.current);
      clearTimeout(timeoutWarningTimer.current);
      fetchInProgress.current = false;
    };
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/Signin", { state: { from: location.pathname } });
      return;
    }
    
    // Clear any existing timer
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }
    
    loadingTimer.current = setTimeout(() => {
      fetchItems();
    }, 100);
    
  }, [navigate, location]);

  // Update items when filters change (with debounce to prevent too many requests)
  useEffect(() => {
    if (isInitialLoad) return; // Don't fetch on initial mount
    
    // Clear any existing timer
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }
    
    // Debounce filter changes
    loadingTimer.current = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
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

  // Add retry function
  const retryFetch = () => {
    setError("");
    fetchItems();
  };

  // Loading state with better UX
  if (loading && items.length === 0) {
    return (
      <div className="item-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner">✨ Loading System Data...</div>
          <div className="spinner-animation"></div>
          {showTimeoutWarning && (
            <div className="timeout-warning">
              ⚠️ This is taking longer than expected. 
              <br />
              <button onClick={retryFetch} className="retry-button">
                Click here to retry
              </button>
              <div className="timeout-tips">
                Tips: 
                <ul>
                  <li>Check your internet connection</li>
                  <li>Verify the API endpoint is accessible</li>
                  <li>Try refreshing the page</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Error state with retry option
  if (error && items.length === 0) {
    return (
      <div className="item-container error-container">
        <div className="error-text">⚠️ {error}</div>
        <button onClick={retryFetch} className="retry-button">
          Retry Loading Items
        </button>
        <div className="error-tips">
          <p>If the issue persists:</p>
          <ol>
            <li>Check if you're logged in</li>
            <li>Verify your internet connection</li>
            <li>Contact support if the problem continues</li>
          </ol>
        </div>
      </div>
    );
  }

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

      {/* Show loading indicator for filter changes */}
      {loading && items.length > 0 && (
        <div className="filter-loading-indicator">
          🔄 Updating results...
        </div>
      )}

      <div className="item-stats-wrapper">
        <div className="item-stat-pill">🔄 Rapid Sync</div>
        <div className="item-stat-pill">⚒️ Field-Ready</div>
        <div className="item-stat-pill">⏱️ Time Efficient</div>
      </div>

      <div className="item-grid">
        {items.length === 0 ? (
          <div className="no-results-container">
            <p className="no-results">
              No technical assets found. {sizeFilter || enhancementFilter ? "Try different filters." : ""}
            </p>
            <button onClick={retryFetch} className="retry-button">
              Refresh Items
            </button>
          </div>
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
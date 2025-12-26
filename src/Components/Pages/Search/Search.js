import React, { useState, useEffect } from "react";
import "./Search.css";

const API_BASE = process.env.REACT_APP_API_BASE;

const CATEGORY_ENDPOINTS = {
  instructors: "/users/instructors/",
  tax_workers: "/users/tax_workers/",
  transitors: "/users/transitors/",
  store: "/users/items/",
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function Search() {
  const [category, setCategory] = useState("instructors");
  const [filter, setFilter] = useState(""); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState({});
  const [openBox, setOpenBox] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);

  const userEmail = localStorage.getItem("userEmail");
  const STORAGE_KEY = userEmail ? `transitorRequests_${userEmail}` : null;

  // Load user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile/`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setPurchasedCourses(data.purchased_courses || []);
          
          // Initialize connection requests from profile data
          const initialConnections = {};
          (data.sent_requests || []).forEach((req) => {
            if (req.connected) {
              initialConnections[req.transitor_email] = "connected";
            } else if (req.status === "pending") {
              initialConnections[req.transitor_email] = "pending";
            }
          });
          
          // Load persisted state
          if (STORAGE_KEY) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const storedData = JSON.parse(stored);
              setConnectionRequests({...initialConnections, ...storedData});
            } else {
              setConnectionRequests(initialConnections);
            }
          } else {
            setConnectionRequests(initialConnections);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfileData();
  }, [STORAGE_KEY]);

  // Persist connection requests
  const persistConnections = (data) => {
    setConnectionRequests(data);
    if (STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  // Fetch filter options
  useEffect(() => {
    setFilter("");
    setResults([]);
    setOptions([]);

    const fetchOptions = async () => {
      try {
        const endpoint = CATEGORY_ENDPOINTS[category];
        if (!endpoint) return;

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch options");

        const data = await res.json();

        if (category === "store") {
          // Price ranges for store items
          const ranges = [
            { label: "0 - 100", value: 100.0 },
            { label: "100 - 500", value: 500.0 },
            { label: "500 - 1000", value: 1000.0 },
          ];
          setOptions(ranges);
          return;
        }

        // Job titles for other categories
        const list =
          data.instructors ||
          data.tax_workers ||
          data.transitors ||
          [];

        const uniqueTitles = [
          ...new Set(list.map((u) => u.job_title).filter(Boolean)),
        ];

        const mapped = uniqueTitles.map((title, index) => ({
          label: title,
          value: title, 
        }));

        setOptions(mapped);
      } catch (err) {
        console.error("Option fetch error:", err);
        setOptions([]);
      }
    };

    fetchOptions();
  }, [category]);

  // Add item to cart functionality (for store items)
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
        alert(data.message || "Item added to cart");
      } else {
        alert(data.message || "Failed to add item");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Buy course functionality (for instructors)
  const handleBuyCourse = (instructorEmail) => {
    const alreadyPurchased = purchasedCourses.find(
      (c) => c.instructor_email === instructorEmail
    );
    if (alreadyPurchased) return alert("You already purchased this course.");

    const confirmPayment = window.confirm(
      "To purchase this course, please pay the fixed price of $50 and upload your receipt."
    );

    if (!confirmPayment) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("instructor_email", instructorEmail);
      formData.append("receipt", file);

      try {
        const res = await fetch(`${API_BASE}/users/buy_course/`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message);

        alert("Course purchased successfully!");
        setPurchasedCourses([
          ...purchasedCourses,
          { instructor_email: instructorEmail },
        ]);
      } catch (err) {
        alert(err.message || "Failed to purchase course");
      }
    };
    input.click();
  };

  // Connect with transitor functionality
  const handleSendRequest = (transitorEmail, transitorId) => {
    const currentStatus = connectionRequests[transitorId];
    if (currentStatus === "pending") return alert("Request already sent.");
    if (currentStatus === "connected") return alert("Already connected.");

    const confirmPayment = window.confirm(
      "To connect with a transitor, you must pay $50 and upload the receipt."
    );

    if (!confirmPayment) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("transitor_email", transitorEmail);
      formData.append("receipt", file);

      try {
        const res = await fetch(`${API_BASE}/users/send_transitor_request/`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message);

        const updated = { ...connectionRequests, [transitorId]: "pending" };
        persistConnections(updated);
        alert("Request sent successfully.");
      } catch (err) {
        alert(err.message || "Failed to send request");
      }
    };
    input.click();
  };

  // Tax worker message box functionality
  const handleOpenBox = (email) => {
    setOpenBox(email);
    setMessageText("");
    setFile(null);
  };

  const handleSubmit = async (workerEmail) => {
    if (!file) {
      alert("Please upload your receipt first.");
      return;
    }
    if (!messageText.trim()) {
      alert("Please type a message.");
      return;
    }

    const formData = new FormData();
    formData.append("tax_worker_email", workerEmail);
    formData.append("receipt", file);
    formData.append("question", messageText);

    const csrfToken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_BASE}/users/ask/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error submitting request");

      alert(data.message);
      setOpenBox(null);
      setFile(null);
      setMessageText("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSearch = async () => {
    if (filter === "") {
      alert("Please select a role or price range.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/users/search/?category=${category}&query=${encodeURIComponent(
        filter
      )}`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch results");

      setResults(data.results || []);
    } catch (err) {
      alert(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Get button configuration for transitors
  const getButtonConfig = (transitorId) => {
    const status = connectionRequests[transitorId];
    switch (status) {
      case "connected":
        return { text: "Connected", disabled: true, className: "connected-btn" };
      case "pending":
        return { text: "Pending...", disabled: true, className: "pending-btn" };
      default:
        return { text: "Connect", disabled: false, className: "connect-btn" };
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Global Search</h1>
      <p className="search-subtitle">
        Find professionals and services across the network.
      </p>

      <div className="search-box-wrapper">
        <div className="search-controls">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="instructors">Instructors</option>
            <option value="tax_workers">Tax Workers</option>
            <option value="transitors">Transitors</option>
            <option value="store">Store Items</option>
          </select>

          <select
            value={filter}
            onChange={(e) =>
              category === "store"
                ? setFilter(Number(e.target.value))
                : setFilter(e.target.value)
            }
          >
            <option value="">
              {category === "store" ? "Select Price Range" : "Select Role"}
            </option>

            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      <div className="results-grid">
        {results.map((item, idx) => {
          const displayName = item.username || item.name || "?";
          const firstLetter = displayName.charAt(0).toUpperCase();
          const isPurchased = category === "instructors" && 
            purchasedCourses.some(c => c.instructor_email === item.email);

          return (
            <div className="result-card" key={idx}>
              <div className="result-header">
                {item.photo ? (
                  <img
                    src={`${API_BASE}${item.photo}`}
                    alt={displayName}
                    className="result-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                
                {!item.photo && (
                  <div className="result-photo-letter">
                    {firstLetter}
                  </div>
                )}
                <div className="result-photo-fallback" style={{ display: "none" }}>
                  {firstLetter}
                </div>

                <div className="result-header-info">
                  <h3>{displayName}</h3>
                  <p className="result-sub-text">
                    {item.job_title || item.location || "Verified Member"}
                  </p>
                  {item.rating && (
                    <div className="rating">
                      {"★".repeat(Math.round(item.rating))}
                      {"☆".repeat(5 - Math.round(item.rating))}
                    </div>
                  )}
                </div>
              </div>

              <div className="result-body">
                {category === "store" ? (
                  <>
                    <div className="info-row">
                      <span className="label">Price:</span>
                      <span className="val price-text">${item.price}</span>
                    </div>
                    <p className="desc-text">{item.description}</p>
                    
                    <div className="result-actions">
                      <button 
                        className="item-action-btn"
                        onClick={() => addToCartHandler(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </>
                ) : category === "instructors" ? (
                  <>
                    {item.course_title && (
                      <div className="info-row">
                        <span className="label">Course:</span>
                        <span className="val">{item.course_title}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="label">Price:</span>
                      <span className="val">$50.00</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Experience:</span>
                      <span className="val">
                        {item.years_of_experience || 0} yrs
                      </span>
                    </div>
                    
                    <div className="result-actions">
                      <button
                        className={`buy-btn ${isPurchased ? "purchased-btn" : ""}`}
                        disabled={isPurchased}
                        onClick={() => handleBuyCourse(item.email)}
                      >
                        {isPurchased ? "Purchased" : "Buy Course - $50"}
                      </button>
                    </div>
                  </>
                ) : category === "transitors" ? (
                  <>
                    <div className="info-row">
                      <span className="label">Job Title:</span>
                      <span className="val">{item.job_title || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Organization:</span>
                      <span className="val">{item.organization_name || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Experience:</span>
                      <span className="val">{item.years_of_experience || 0} yrs</span>
                    </div>
                    
                    <div className="result-actions">
                      {(() => {
                        const transitorId = item.email;
                        const btn = getButtonConfig(transitorId);
                        return (
                          <button
                            className={`btn-action ${btn.className}`}
                            disabled={btn.disabled}
                            onClick={() => handleSendRequest(item.email, transitorId)}
                          >
                            {btn.text}
                          </button>
                        );
                      })()}
                    </div>
                  </>
                ) : category === "tax_workers" ? (
                  <>
                    <div className="info-row">
                      <span className="label">Job Title:</span>
                      <span className="val">{item.job_title || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Organization:</span>
                      <span className="val">{item.organization_name || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Experience:</span>
                      <span className="val">{item.years_of_experience || 0} yrs</span>
                    </div>
                    {item.fee && (
                      <div className="info-row">
                        <span className="label">Fee:</span>
                        <span className="val">${item.fee}</span>
                      </div>
                    )}
                    
                    <div className="result-actions">
                      {openBox === item.email ? (
                        <div className="taxworker-ask-box">
                          <input
                            type="file"
                            accept="*/*"
                            onChange={(e) => setFile(e.target.files[0])}
                          />
                          <textarea
                            placeholder="Type your message here..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                          />
                          <button className="btn submit-btn" onClick={() => handleSubmit(item.email)}>
                            Submit
                          </button>
                          <button className="btn cancel-btn" onClick={() => setOpenBox(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="taxworker-receipt-box" onClick={() => handleOpenBox(item.email)}>
                          📎 Add your paid receipt & send a message to this worker
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {results.length === 0 && !loading && (
        <p className="no-results">No results found for this selection.</p>
      )}
    </div>
  );
}
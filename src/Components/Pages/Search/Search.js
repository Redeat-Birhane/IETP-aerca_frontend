import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Fetch profile and initialize state
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile/`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          navigate("/Signin", { state: { from: location.pathname } });
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setPurchasedCourses(data.purchased_courses || []);

        // Initialize transitor connection requests
        const initialConnections = {};
        (data.sent_requests || []).forEach((req) => {
          if (req.connected) initialConnections[req.transitor_email] = "connected";
          else if (req.status === "pending") initialConnections[req.transitor_email] = "pending";
        });

        if (STORAGE_KEY) {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const storedData = JSON.parse(stored);
            setConnectionRequests({ ...initialConnections, ...storedData });
          } else setConnectionRequests(initialConnections);
        } else setConnectionRequests(initialConnections);
      } catch (err) {
        console.error(err);
        navigate("/Signin", { state: { from: location.pathname } });
      }
    };
    fetchProfile();
  }, [navigate, location.pathname, STORAGE_KEY]);

  const persistConnections = (data) => {
    setConnectionRequests(data);
    if (STORAGE_KEY) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // Fetch filter options
  useEffect(() => {
    setFilter("");
    setOptions([]);
    setResults([]);

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
          const ranges = [
            { label: "0 - 100", value: 100 },
            { label: "100 - 500", value: 500 },
            { label: "500 - 1000", value: 1000 },
          ];
          setOptions(ranges);
          return;
        }

        const list = data[category] || [];
        const uniqueTitles = [...new Set(list.map((u) => u.job_title).filter(Boolean))];
        const mapped = uniqueTitles.map((title) => ({ label: title, value: title }));
        setOptions(mapped);
      } catch (err) {
        console.error(err);
        setOptions([]);
      }
    };

    fetchOptions();
  }, [category]);

  // Search handler
  const handleSearch = async () => {
    if (!filter) {
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

  // Handle buy course
  const handleBuyCourse = (instructorEmail) => {
    const alreadyPurchased = purchasedCourses.find((c) => c.instructor_email === instructorEmail);
    if (alreadyPurchased) return alert("You already purchased this course.");

    const confirmPayment = window.confirm(
      "To purchase this course, please pay $50 and upload your receipt."
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
        setPurchasedCourses([...purchasedCourses, { instructor_email: instructorEmail }]);
      } catch (err) {
        alert(err.message || "Failed to purchase course");
      }
    };
    input.click();
  };

  // Handle transitor connection
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
        persistConnections({ ...connectionRequests, [transitorId]: "pending" });
        alert("Request sent successfully.");
      } catch (err) {
        alert(err.message || "Failed to send request");
      }
    };
    input.click();
  };

  // Tax worker message handling
  const handleOpenBox = (email) => {
    setOpenBox(email);
    setMessageText("");
    setFile(null);
  };

  const handleSubmit = async (workerEmail) => {
    if (!file) return alert("Please upload your receipt first.");
    if (!messageText.trim()) return alert("Please type a message.");

    const formData = new FormData();
    formData.append("tax_worker_email", workerEmail);
    formData.append("receipt", file);
    formData.append("question", messageText);

    const csrfToken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_BASE}/users/ask/`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken },
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
      <p className="search-subtitle">Find professionals and services across the network.</p>

      <div className="search-controls">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="instructors">Instructors</option>
          <option value="tax_workers">Tax Workers</option>
          <option value="transitors">Transitors</option>
          <option value="store">Store Items</option>
        </select>

        <select
          value={filter}
          onChange={(e) => (category === "store" ? setFilter(Number(e.target.value)) : setFilter(e.target.value))}
        >
          <option value="">{category === "store" ? "Select Price Range" : "Select Role"}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button className="search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      <div className="results-grid">
        {results.map((item) => {
          const displayName = item.username || item.name || "?";
          const firstLetter = displayName.charAt(0).toUpperCase();
          const isPurchased = category === "instructors" && purchasedCourses.some(c => c.instructor_email === item.email);

          if (category === "store") {
            return (
              <div className="result-card" key={item.id}>
                <img src={item.photo ? `${API_BASE}${item.photo}` : "/fallback.png"} alt={displayName} />
                <h3>{displayName}</h3>
                <p>{item.description}</p>
                <p>Price: ${item.price}</p>
                <button onClick={() => alert("Add to cart")}>Add to Cart</button>
              </div>
            );
          }

          if (category === "instructors") {
            return (
              <div className="course-card" key={item.email}>
                <div className="course-header">
                  {item.photo ? <img src={`${API_BASE}${item.photo}`} alt={displayName} /> : <div className="fallback">{firstLetter}</div>}
                  <div>
                    <h2>{displayName}</h2>
                    <p>{item.email}</p>
                    <div className="rating">
                      {"★".repeat(item.rating || 0)}
                      {"☆".repeat(5 - (item.rating || 0))}
                    </div>
                  </div>
                </div>
                <div className="course-body-content">
                  <div>Course: {item.course_title || "Professional Training"}</div>
                  <div>Price: $50</div>
                  <div>Experience: {item.years_of_experience || 0} yrs</div>
                </div>
                <button
                  disabled={isPurchased}
                  onClick={() => handleBuyCourse(item.email)}
                >
                  {isPurchased ? "Purchased" : "Buy Course - $50"}
                </button>
              </div>
            );
          }

          if (category === "transitors") {
            const btn = getButtonConfig(item.email);
            return (
              <div className="transitor-card" key={item.email}>
                <div className="transitor-header">
                  {item.photo ? <img src={`${API_BASE}${item.photo}`} alt={displayName} /> : <div className="fallback">{firstLetter}</div>}
                  <div>
                    <h2>{displayName}</h2>
                    <p>{item.email}</p>
                    <div className="rating">
                      {"★".repeat(item.rating || 0)}
                      {"☆".repeat(5 - (item.rating || 0))}
                    </div>
                  </div>
                </div>
                <div>Job Title: {item.job_title || "N/A"}</div>
                <div>Organization: {item.organization_name || "N/A"}</div>
                <button
                  className={btn.className}
                  disabled={btn.disabled}
                  onClick={() => handleSendRequest(item.email, item.email)}
                >
                  {btn.text}
                </button>
              </div>
            );
          }

          if (category === "tax_workers") {
            return (
              <div className="taxworker-card" key={item.email}>
                <div className="taxworker-header">
                  {item.photo ? <img src={`${API_BASE}${item.photo}`} alt={displayName} /> : <div className="fallback">{firstLetter}</div>}
                  <div>
                    <h2>{displayName}</h2>
                    <p>{item.email}</p>
                    <div className="rating">
                      {"★".repeat(item.rating || 0)}
                      {"☆".repeat(5 - (item.rating || 0))}
                    </div>
                  </div>
                </div>
                <div>Job Title: {item.job_title || "N/A"}</div>
                <div>Organization: {item.organization_name || "N/A"}</div>
                <div>Experience: {item.years_of_experience || 0} yrs</div>
                {openBox === item.email ? (
                  <div className="taxworker-ask-box">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                    <button onClick={() => handleSubmit(item.email)}>Submit</button>
                    <button onClick={() => setOpenBox(null)}>Cancel</button>
                  </div>
                ) : (
                  <div onClick={() => handleOpenBox(item.email)}>
                    📎 Add your paid receipt & send a message to this worker
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {results.length === 0 && !loading && <p>No results found for this selection.</p>}
    </div>
  );
}

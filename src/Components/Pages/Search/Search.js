import React, { useState, useEffect } from "react";
import "./Search.css";

const API_BASE = process.env.REACT_APP_API_BASE;

const CATEGORY_ENDPOINTS = {
  instructors: "/users/instructors/",
  tax_workers: "/users/tax_workers/",
  transitors: "/users/transitors/",
  store: "/users/items/",
};

export default function Search() {
  const [category, setCategory] = useState("instructors");
  const [filter, setFilter] = useState(""); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  
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
          
          const ranges = [
            { label: "0 - 100", value: 100.0 },
            { label: "100 - 500", value: 500.0 },
            { label: "500 - 1000", value: 1000.0 },
          ];
          setOptions(ranges);
          return;
        }

        
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

          return (
            <div className="result-card" key={idx}>
              <div className="result-header">
                <div className="result-photo-letter">{firstLetter}</div>

                <div className="result-header-info">
                  <h3>{displayName}</h3>
                  <p className="result-sub-text">
                    {item.job_title || item.location || "Verified Member"}
                  </p>
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
                  </>
                ) : (
                  <>
                    {item.course_title && (
                      <div className="info-row">
                        <span className="label">Course:</span>
                        <span className="val">{item.course_title}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="label">Experience:</span>
                      <span className="val">
                        {item.years_of_experience || 0} yrs
                      </span>
                    </div>
                    {item.rating && (
                      <div className="info-row">
                        <span className="label">Rating:</span>
                        <span className="val stars">
                          {"★".repeat(Math.round(item.rating))}
                        </span>
                      </div>
                    )}
                  </>
                )}
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

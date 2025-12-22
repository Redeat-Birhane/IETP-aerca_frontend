import React, { useEffect, useState } from "react";
import "./Law.css";

const API_BASE = "https://ietp-aerca-backend.onrender.com";

export default function LawPage() {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [newUpdatesOnly, setNewUpdatesOnly] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users/laws/`)
      .then((res) => res.json())
      .then((data) => {
        setLaws(data.laws || []);
      })
      .catch(() => setError("Failed to load laws"))
      .finally(() => setLoading(false));
  }, []);

  const filteredLaws = laws.filter((law) => {
    const matchesYear = yearFilter === "All" || law.year.toString() === yearFilter;
    let matchesNew = true;

    if (newUpdatesOnly) {
      const lawDate = new Date(law.created_at);
      const now = new Date();
      const diffDays = (now - lawDate) / (1000 * 60 * 60 * 24);
      matchesNew = diffDays <= 30; // last 30 days
    }

    return matchesYear && matchesNew;
  });

  // Get unique years from laws
  const years = Array.from(new Set(laws.map((law) => law.year))).sort((a, b) => b - a);

  if (loading) return <div className="law-container">Loading laws…</div>;
  if (error) return <div className="law-container">{error}</div>;

  return (
    <div className="law-container">
      <h1 className="law-title">Trading Laws & Authorities</h1>

      <div className="law-controls">
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="All">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={newUpdatesOnly}
            onChange={(e) => setNewUpdatesOnly(e.target.checked)}
          />
          New Updates (last 30 days)
        </label>
      </div>

      <div className="law-grid">
        {filteredLaws.length === 0 ? (
          <p className="no-results">No laws found matching your criteria.</p>
        ) : (
          filteredLaws.map((law) => (
            <div className="law-card" key={law.id}>
              <div className="law-card-header">
                <h2>{law.name}</h2>
                <span className="law-date">{new Date(law.created_at).toLocaleDateString()}</span>
              </div>
              <p className="law-summary">{law.description}</p>
              <span className="law-category">Created at: {law.year}</span> {/* Added label */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Center.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Center() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/Signin");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/view_support/`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load tickets");

        const data = await res.json();
        setTickets(data.tickets || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/Signin");
      }
    };

    fetchTickets();
  }, [isAuthenticated, navigate]);

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in both subject and message.");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/ask_support/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      alert(data.message);

      setTickets((prev) => [
        {
          id: data.ticket_id,
          subject,
          message,
          status: data.status || "Pending",
          answer: null,
          created_at: new Date().toISOString(),
          answered_at: null,
        },
        ...prev,
      ]);

      setSubject("");
      setMessage("");
      setIsFormOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "50px" }}>Loading support center...</p>;

  return (
    <div className="center-container">
      <h1 className="center-title">Support Center</h1>
      <p className="center-subtitle">Need help? Submit a ticket and our team will get back to you shortly.</p>

      <button className="ticket-toggle-btn" onClick={() => setIsFormOpen(!isFormOpen)}>
        {isFormOpen ? "✖ Close Form" : "＋ Create New Ticket"}
      </button>

      {isFormOpen && (
        <div className="ticket-form-container">
          <h3>New Support Request</h3>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Describe your issue in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="btn-submit"
            onClick={handleSubmitTicket}
            disabled={submitLoading}
          >
            {submitLoading ? "Sending..." : "Submit Ticket"}
          </button>
        </div>
      )}

      <div className="tickets-grid">
        {tickets.length === 0 && <p className="no-tickets">No tickets submitted yet.</p>}
        
        {tickets.map((t) => (
          <div className="ticket-card" key={t.id}>
            <div className="ticket-header">
              <div className="status-avatar">
                {t.status === "Answered" ? "✓" : "!"}
              </div>
              <div className="ticket-meta">
                <h3>{t.subject}</h3>
                <p className="ticket-date-text">
                  ID: #{t.id.toString().slice(-5)} • {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="ticket-body-content">
              <p className="ticket-message">"{t.message}"</p>
              
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
              </div>

              {t.answer && (
                <div className="support-answer-box">
                  <span className="answer-label">Official Response:</span>
                  <p className="answer-text">{t.answer}</p>
                  {t.answered_at && <small>Replied on {new Date(t.answered_at).toLocaleDateString()}</small>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
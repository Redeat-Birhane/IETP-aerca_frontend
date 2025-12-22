import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Transitors.css";

const API_BASE = "https://ietp-aerca-backend.onrender.com";

export default function TransitorPage() {
  const navigate = useNavigate();
  const [transitors, setTransitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState({});

  const userEmail = localStorage.getItem("userEmail");
  const STORAGE_KEY = userEmail ? `transitorRequests_${userEmail}` : null;

  // Load persisted connection state
  useEffect(() => {
    if (!STORAGE_KEY) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConnectionRequests(JSON.parse(stored));
    }
  }, [STORAGE_KEY]);

  const persistConnections = (data) => {
    setConnectionRequests(data);
    if (STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  useEffect(() => {
    const fetchTransitors = async () => {
      try {
        const resTransitors = await fetch(`${API_BASE}/users/transitors/`, {
          method: "GET",
          credentials: "include",
        });

        if (resTransitors.status === 401 || resTransitors.status === 403) {
          navigate("/Signin");
          return;
        }

        const transitorData = await resTransitors.json();
        let filteredTransitors = (transitorData.transitors || []).filter(
          (t) => t.email !== userEmail
        );

        const resProfile = await fetch(`${API_BASE}/users/profile/`, {
          method: "GET",
          credentials: "include",
        });

        if (resProfile.status === 401 || resProfile.status === 403) {
          navigate("/Signin");
          return;
        }

        const profileData = await resProfile.json();

        const initialConnections = {};
        (profileData.sent_requests || []).forEach((req) => {
          if (req.connected) {
            initialConnections[req.transitor_email] = "connected";
          } else if (req.status === "pending") {
            initialConnections[req.transitor_email] = "pending";
          }
        });

        setConnectionRequests(initialConnections);
        setTransitors(filteredTransitors);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transitors or profile:", err);
        navigate("/Signin");
      }
    };

    fetchTransitors();
  }, [navigate, userEmail]);

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

  if (loading) return <p style={{ textAlign: "center", padding: "50px" }}>Loading transitors...</p>;

  return (
    <div className="transitor-container">
      <h1 className="transitor-title">Available Transitors</h1>
      <p className="transitor-subtitle">Connect with expert facilitators specialized in managing, verifying, and accelerating your payment workflows.</p>

      <div className="transitor-grid">
        {transitors.map((t) => {
          const transitorId = t.email;
          const btn = getButtonConfig(transitorId);

          return (
            <div className="transitor-card" key={transitorId}>
              <div className="transitor-header">
                {t.photo ? (
                  <img
                    src={`${API_BASE}${t.photo}`}
                    alt={t.username}
                    className="transitor-photo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {!t.photo && (
                  <div className="transitor-photo-fallback">
                    {t.username ? t.username.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="transitor-photo-fallback" style={{ display: 'none' }}>
                  {t.username ? t.username.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="transitor-header-info">
                  <h2>{t.username || "Transitor"}</h2>
                  <p className="transitor-email-text">{t.email}</p>
                  <div className="rating">
                    {"★".repeat(t.rating || 0)}
                    {"☆".repeat(5 - (t.rating || 0))}
                  </div>
                </div>
              </div>

              <div className="transitor-body-content">
                <div className="info-row">
                  <span className="info-label">Job Title:</span>
                  <span className="info-value">{t.job_title || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Organization:</span>
                  <span className="info-value">{t.organization_name || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Rating Score:</span>
                  <span className="info-value">{t.rating || 0} / 5</span>
                </div>
              </div>

              <div className="transitor-actions">
                <button
                  className={`btn-action ${btn.className}`}
                  disabled={btn.disabled}
                  onClick={() => handleSendRequest(t.email, transitorId)}
                >
                  {btn.text}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
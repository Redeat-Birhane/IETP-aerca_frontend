import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Taxworkers.css";

const API_BASE = process.env.REACT_APP_API_BASE;

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

export default function TaxWorkers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBox, setOpenBox] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
  const fetchProfileAndWorkers = async () => {
    try {
      const profileRes = await fetch(`${API_BASE}/users/profile/`, {
        method: "GET",
        credentials: "include",
      });

      if (profileRes.status === 403 || profileRes.status === 401) {
        navigate("/Signin");
        return;
      }
      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      const profileData = await profileRes.json();
      const currentUserRole = profileData.role; 
      const res = await fetch(`${API_BASE}/users/tax_workers/`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 403 || res.status === 401) {
        navigate("/Signin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch tax workers");

      const data = await res.json();

      const mappedWorkers = (data.tax_workers || [])
        .filter((w) => w.role !== currentUserRole) 
        .map((w) => ({
          username: w.username,
          email: w.email,
          job_title: w.job_title,
          organization_name: w.organization_name,
          work_email: w.work_email,
          phone_number: w.phone_number,
          location: w.location,
          photo: w.photo,
          clients_served: w.clients_served,
          rating: w.rating,
          years_of_experience: w.years_of_experience,
          fee: w.fee,
        }));

      setWorkers(mappedWorkers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tax workers:", err);
      navigate("/Signin");
    }
  };

  fetchProfileAndWorkers();
}, [navigate]);


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

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading tax workers...
      </p>
    );
  }

  return (
    <div className="taxworkers-container">
      <h1 className="taxworkers-title">Tax Payment System Workers</h1>
      <p className="taxworkers-subtitle">
        Connect with professionals who manage and verify tax payment records.
      </p>

      <div className="taxworkers-grid">
        {workers.map((worker) => (
          <div className="taxworker-card" key={worker.email}>
            <div className="taxworker-header">
              {worker.photo ? (
                <img
                  src={`${API_BASE}${worker.photo}`}
                  alt={worker.username}
                  className="taxworker-photo"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              {!worker.photo && (
                <div className="taxworker-photo-fallback">
                  {worker.username ? worker.username.charAt(0).toUpperCase() : "?"}
                </div>
              )}

              <div className="taxworker-photo-fallback" style={{ display: "none" }}>
                {worker.username ? worker.username.charAt(0).toUpperCase() : "?"}
              </div>

              <div className="taxworker-info">
                <h2>{worker.username}</h2>
                <p className="worker-email">{worker.email}</p>
                <div className="rating">
                  {"★".repeat(worker.rating || 0)}
                  {"☆".repeat(5 - (worker.rating || 0))}
                </div>
              </div>
            </div>

            <div className="taxworker-body-content">
              <div className="info-row">
                <span className="info-label">Job Title:</span>
                <span className="info-value">{worker.job_title || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Organization:</span>
                <span className="info-value">{worker.organization_name || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Work Email:</span>
                <span className="info-value">{worker.work_email || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{worker.phone_number || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Location:</span>
                <span className="info-value">{worker.location || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Clients Served:</span>
                <span className="info-value">{worker.clients_served || 0}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Experience:</span>
                <span className="info-value">{worker.years_of_experience || 0} yrs</span>
              </div>
              {worker.fee && (
                <div className="info-row worker-fee-row">
                  <span className="info-label">Fee:</span>
                  <span className="info-value">${worker.fee}</span>
                </div>
              )}
            </div>

            {openBox === worker.email ? (
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
                <button className="btn submit-btn" onClick={() => handleSubmit(worker.email)}>
                  Submit
                </button>
                <button className="btn cancel-btn" onClick={() => setOpenBox(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="taxworker-receipt-box" onClick={() => handleOpenBox(worker.email)}>
                📎 Add your paid receipt & send a message to this worker
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

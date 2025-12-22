import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./overview.css";

import First from "./Images-Geez/10215.png";
import Second from "./Images-Geez/10103.png";
import Third from "./Images-Geez/10104.png";
import Fourth from "./Images-Geez/10195.jpg";

const API_BASE = process.env.REACT_APP_API_BASE;
const FIXED_PRICE = 123;

export default function Overview() {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Check authentication on page load
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/Signin");
    }
  }, [navigate]);

  const handleBuy = async () => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) return navigate("/Signin");

    if (!receipt) return alert("Please upload a receipt to proceed with the purchase");

    const form = new FormData();
    form.append("receipt", receipt);
    form.append("ai_product_id", "1"); // Constant ID for Geez AI

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/users/buy_ai_access/`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (res.status === 201) {
        alert("Geez AI access purchased successfully!");
      } else {
        alert(data.message || "Purchase failed");
      }
    } catch (err) {
      alert("Network error while purchasing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overview">
      {/* 🟣 Top Navigation Bar */}
      <div className="overview-wrapper">
        <div className="overview-inner-wrapper">
          <h2 className="overview-title">GeezPod</h2>
          <div className="overview-teck">
            <Link to="/Overview">
              <p>Overview</p>
            </Link>

            <Link to="/Teckspec">
              <p>Tech-Specs</p>
            </Link>
          </div>
          <div className="overview-button">
            <div className="overview-payment-info">
              <p className="payment-text">Pay ${FIXED_PRICE} and upload the receipt to buy</p>
              <div className="payment-controls">
                <button
                  className="overview-butp"
                  onClick={handleBuy}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Buy"}
                </button>
                <div className="receipt-upload">
                  <span className="upload-text">Upload receipt:</span>
                  <input
                    type="file"
                    id="receipt-input"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceipt(e.target.files[0])}
                    className="receipt-input"
                  />
                  <label htmlFor="receipt-input" className="custom-file-button">
                    Choose File
                  </label>
                  {receipt && (
                    <span className="file-name">{receipt.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟣 Pod Image */}
      <div className="overview-podimg">
        <img src={First} alt="GeezPod device" />

        {/* 🟣 General Information Section */}
        <div className="overview-general">
          <img className="img1" src={Second} alt="Geez AI concept" />
          <h2>💡 General Idea About Geez AI</h2>
          <p>
            Geez AI is a smart, voice-activated digital assistant designed to
            modernize communication between citizens, government workers, and
            business owners. It allows users to access real-time tax updates,
            trade regulations, and customs information directly through simple
            voice commands — making information fast, accurate, and hands-free.
            <br />
            <br />
            Powered by AI, web integration, and IoT technology, Geez AI connects
            to the Advanced Ethiopian Revenues and Customs Authority (AERCA)
            system, automatically updating data from the central database and
            displaying it on connected devices such as computers or Arduino
            screens.
          </p>
          <p>
            Geez AI isn't just a voice assistant — it's a bridge between
            technology and governance, helping organizations and users move
            toward a smarter, more connected future.
          </p>
          <img className="img2" src={Third} alt="Geez AI use" />
        </div>

        {/* 🟣 Voice Command Features */}
        <div className="overview-part2">
          <h2>
            Get everyday tasks done <br /> using only your voice.
          </h2>
          <h2>
            Just say "Geez" or "Hey Geez" <br /> to start your request.
          </h2>
          <h2>
            Protected by the strongest privacy of any intelligent assistant.
          </h2>
        </div>
      </div>

      {/* 🟣 Advantages Section */}
      <div className="overview-part3">
        <img src={Fourth} alt="Team collaboration" />
        <div className="overview-Adva">
          <h2>🤝 Advantages of Geez AI for Group Working</h2>
          <ul>
            <li>Improves Collaboration</li>
            <li>Enhances Communication</li>
            <li>Encourages Multidisciplinary Learning</li>
            <li>Increases Productivity</li>
            <li>Builds Team Innovation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
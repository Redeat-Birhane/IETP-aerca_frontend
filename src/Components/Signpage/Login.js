import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./login.css";

const API_BASE = process.env.REACT_APP_API_BASE;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid email or password.");
        if (res.status === 404) throw new Error("Login endpoint not found.");
        throw new Error("Server error during login.");
      }

      const result = await res.json();

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", result.role);
      localStorage.setItem("userEmail", formData.email);

      if (!localStorage.getItem("firstLogin")) {
        localStorage.setItem("firstLogin", "true");
      }

      alert(`✅ Welcome back! You are logged in as: ${result.role}`);

      // 🔴 ONLY CHANGE IS HERE
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      if (err.message.includes("Failed to fetch")) {
        alert(
          "❌ Cannot connect to the server.\nPlease check your internet connection or try again later."
        );
      } else {
        alert("⚠️ " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your AERCA account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
          <p className="login-help">
            Need help?{" "}
            <button
              type="button"
              className="login-help-btn"
              onClick={() => navigate("/Center")}
            >
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

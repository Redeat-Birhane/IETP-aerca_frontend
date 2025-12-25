import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./signup.css";

const API_BASE = process.env.REACT_APP_API_BASE;

// 🔹 Get CSRF Token helper
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

const Signup = () => {
  const [role, setRole] = useState("normal");
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
    photo: null,
    transitor_license: null,
    job_title: "",
    business_card: null,
    company_id_card: null,
    tin_vat_number: "",
    certificate: null,
    years_of_experience: "",
    course_title: "",
    organization_name: "",
    work_email: "",
    phone_number: "",
    location: "",
    role: "normal",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors(null); 

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    const csrfToken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_BASE}/users/signup/`, {
        method: "POST",
        body: data,
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const result = await res.json(); 

      if (!res.ok) {
        setErrors(result);
        return;
      }

      alert("Signup successful! Role: " + result.role);

      
      setFormData({
        username: "",
        email: "",
        password1: "",
        password2: "",
        photo: null,
        transitor_license: null,
        job_title: "",
        business_card: null,
        company_id_card: null,
        tin_vat_number: "",
        certificate: null,
        years_of_experience: "",
        course_title: "",
        organization_name: "",
        work_email: "",
        phone_number: "",
        location: "",
        role: "normal",
      });

      setRole("normal");
      setErrors(null);

    } catch (err) {
      setErrors({ network: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="signup-form"
      >
        
        {errors && (
          <div className="signup-error-box">
            {Object.entries(errors).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong>{" "}
                {Array.isArray(value) ? value.join(", ") : value}
              </p>
            ))}
          </div>
        )}

        {/* ===== Role Section ===== */}
        <div className="signup-role-wrapper">
          <div className="signup-role-select">
            <label className="signup-role-label">Select Role:</label>
            <select
              className="signup-role-dropdown"
              name="role"
              value={role}
              onChange={handleRoleChange}
              required
            >
              <option value="normal">Normal User</option>
              <option value="transitor">Transitor</option>
              <option value="tax_worker">Tax Worker</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          
          {role === "transitor" && (
            <div className="signup-role-fields">
              <label>Upload Your Transitor License</label>
              <input type="file" name="transitor_license" onChange={handleChange} required />
              <input type="text" name="job_title" placeholder="Job Title" onChange={handleChange} required />
              <input type="file" name="business_card" onChange={handleChange} required />
              <input type="file" name="company_id_card" onChange={handleChange} />
              <input type="text" name="tin_vat_number" placeholder="TIN/VAT Number" onChange={handleChange} required />
            </div>
          )}

          {role === "instructor" && (
            <div className="signup-role-fields">
              <input type="text" name="job_title" placeholder="Job Title" onChange={handleChange} required />
              <input type="file" name="certificate" onChange={handleChange} required />
              <input type="number" name="years_of_experience" placeholder="Years of Experience" onChange={handleChange} required />
              <input type="text" name="course_title" placeholder="Course Title" onChange={handleChange} required />
            </div>
          )}

          {role === "tax_worker" && (
            <div className="signup-role-fields">
              <input type="text" name="job_title" placeholder="Job Title" onChange={handleChange} required />
              <input type="text" name="organization_name" placeholder="Organization Name" onChange={handleChange} required />
              <input type="email" name="work_email" placeholder="Work Email" onChange={handleChange} required />
              <input type="file" name="company_id_card" onChange={handleChange} required />
              <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} />
              <input type="number" name="years_of_experience" placeholder="Years of Experience" onChange={handleChange} required />
              <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
            </div>
          )}
        </div>

        {/* ===== Photo ===== */}
        <div className="signup-photo-upload">
          <label>Your Photo:</label>
          <input type="file" name="photo" onChange={handleChange} />
        </div>

        {/* ===== User Info ===== */}
        <div className="signup-wrapper">
          <input type="text" name="username" placeholder="Full Name" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password1" placeholder="Password" value={formData.password1} onChange={handleChange} required />
          <input type="password" name="password2" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} required />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>

          <p>
            If you have an account <Link to="/Signin">Signin</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;

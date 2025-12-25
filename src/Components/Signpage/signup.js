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
  const [formData, setFormData] = useState({
    role: "normal",
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
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({ ...formData, role: e.target.value });
  };
const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
     setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    const csrfToken = getCookie("csrftoken");

    try {
      const res = await fetch(
        `${API_BASE}/users/signup/`,
        {
          method: "POST",
          body: data,
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );
 const result = await res.json();
      if (!res.ok) {
        const err = await res.json();
        alert("Signup failed: " + JSON.stringify(result));
        setIsSubmitting(false); 
    return;
      }

      
      alert("Signup successful! Role: " + result.role);
      setIsSubmitting(false);
    } catch (err) {
      alert("Network error: " + err.message);
      console.error(err);
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

          {/* Role-specific fields */}
          {role === "transitor" && (
            <div className="signup-role-fields">
              <label className="transitor_license">
                UUpload Your Transitor License <span className="required">*</span>
              </label>
              <input
                className="signup-input-file"
                type="file"
                name="transitor_license"
                onChange={handleChange}
                required
              />
               <label>
      Job Title <span className="required">*</span>
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="job_title"
                placeholder="Job Title"
                onChange={handleChange}
                required
              />

              <small className="field-info">Max 50 characters recommended</small>
              <label className="business_card">Upload Your Business Card<span className="required">*</span>
              </label>
              <input
                className="signup-input-file"
                type="file"
                name="business_card"
                onChange={handleChange}
                required
              />

              <label className="company_id_card">
                Upload Your Company Id Card
              </label>
              <input
                className="signup-input-file"
                type="file"
                name="company_id_card"
                onChange={handleChange}
              />
               <label>
      TIN/VAT Number <span className="required">*</span>
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="tin_vat_number"
                placeholder="TIN/VAT Number"
                onChange={handleChange}
                required
              />
              <small className="field-info">Max 50 characters recommended</small>
            </div>
          )}

          {role === "instructor" && (
            <div className="signup-role-fields">
                <label>
      Job Title <span className="required">*</span>
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="job_title"
                placeholder="Job Title"
                onChange={handleChange}
                required
              />
<small className="field-info">Max 50 characters recommended</small>
<label>
      Upload Your Certificate <span className="required">*</span>
    </label>
              <label className="certificate">Upload Your Certificate </label>
              <input
                className="signup-input-file"
                type="file"
                name="certificate"
                onChange={handleChange}
                required
              />
              <label>
      Years of Experience <span className="required">*</span>
    </label>
              <input
                className="signup-input-number"
                type="number"
                name="years_of_experience"
                placeholder="Years of Experience"
                onChange={handleChange}
                required
              />
              <small className="field-info">Max 50 characters recommended</small>
              <label>
      Course Title <span className="required">*</span>
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="course_title"
                placeholder="Course Title"
                onChange={handleChange}
                required
              />
              <small className="field-info">Max 50 characters recommended</small>
            </div>
          )}

          {role === "tax_worker" && (
            <div className="signup-role-fields">
              <input
                className="signup-input-text"
                type="text"
                name="job_title"
                placeholder="Job Title"
                onChange={handleChange}
                required
              />
              <small className="field-info">Max 50 characters recommended</small>
              <input
                className="signup-input-text"
                type="text"
                name="organization_name"
                placeholder="Organization Name"
                onChange={handleChange}
                required
              />
              <small className="field-info">Max 50 characters recommended</small>
              <input
                className="signup-input-email"
                type="email"
                name="work_email"
                placeholder="Work Email"
                onChange={handleChange}
                required
              />
               <small className="field-info">Max 50 characters recommended</small><label className="company_id_card">
                Upload Your Company Id Card<span className="required">*</span>
              </label>
              <input
                className="signup-input-file"
                type="file"
                name="company_id_card"
                onChange={handleChange}
                required
              />
              <label>
      Phone Number
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                onChange={handleChange}
              />
               <small className="field-info">Only digits, max 15 characters</small>
                 <label>
      Years of Experience <span className="required">*</span>
    </label>
              <input
                className="signup-input-number"
                type="number"
                name="years_of_experience"
                placeholder="Years of Experience"
                onChange={handleChange}
                required
              />
              <small className="field-info">Enter a realistic number</small>
               <label>
      Location <span className="required">*</span>
    </label>
              <input
                className="signup-input-text"
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
               <small className="field-info">Max 50 characters recommended</small>
            </div>
          )}
        </div>

        {/* ===== Photo Upload ===== */}
        <div className="signup-photo-upload">
          <label className="signup-photo-label">Your Photo:</label>
          <input
            className="signup-input-file"
            type="file"
            name="photo"
            onChange={handleChange}
          />
        </div>

        {/* ===== User Info Fields ===== */}
        <div className="signup-wrapper">
          <small className="field-info">Don't use space</small>
          <input
            className="signup-name"
            type="text"
            name="username"
            placeholder="FullName"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            className="signup-email"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="signup-pass"
            type="password"
            name="password1"
            placeholder="Password"
            value={formData.password1}
            onChange={handleChange}
            required
          />
          <input
            className="signup-pass"
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            required
          />

          <div className="signup-button-container">
            <button className="signup-button" type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Signing up..." : "Sign Up"}
</button>

          </div>
          <br />
          <div className="signnn">
            <p>
              If you have Account <Link to="/Signin">Signin</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;

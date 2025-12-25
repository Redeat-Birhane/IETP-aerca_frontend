import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Courses.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Courses() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [userRole, setUserRole] = useState(null);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile/`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setPurchasedCourses(data.purchased_courses || []);
        setUserRole(data.role);
      } catch (err) {
        console.error(err);
        navigate("/Signin");
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!userRole) return; // wait until userRole is set

    const fetchInstructors = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/instructors/`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch instructors");
        const data = await res.json();

        let filtered = data.instructors;

        // Filter out current user if they are an instructor
        if (userRole === "instructor") {
          filtered = filtered.filter((i) => i.email !== userEmail);
        }

        setInstructors(filtered);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/Signin");
      }
    };

    fetchInstructors();
  }, [userRole, navigate, userEmail]);

  const handleBuyCourse = (instructorEmail) => {
    const alreadyPurchased = purchasedCourses.find(
      (c) => c.instructor_email === instructorEmail
    );
    if (alreadyPurchased) return alert("You already purchased this course.");

    const confirmPayment = window.confirm(
      "To purchase this course, please pay the fixed price of $50 and upload your receipt."
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
        setPurchasedCourses([
          ...purchasedCourses,
          { instructor_email: instructorEmail },
        ]);
      } catch (err) {
        alert(err.message || "Failed to purchase course");
      }
    };
    input.click();
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "50px" }}>Loading courses...</p>
    );

  return (
    <div className="courses-container">
      <h1 className="courses-title">Available Courses</h1>
      <p className="courses-subtitle">
        Elevate your skills for a fixed price of <b>$50</b> per course. Gain expert mentorship and professional training.
      </p>

      <div className="courses-grid">
        {instructors.map((inst) => {
          const purchased = purchasedCourses.some(
            (c) => c.instructor_email === inst.email
          );

          return (
            <div className="course-card" key={inst.email}>
              <div className="course-header">
                {inst.photo ? (
                  <img
                    src={`${API_BASE}${inst.photo}`}
                    alt={inst.username}
                    className="course-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {!inst.photo && (
                  <div className="course-photo-fallback">
                    {inst.username ? inst.username.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="course-photo-fallback" style={{ display: "none" }}>
                  {inst.username ? inst.username.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="course-header-info">
                  <h2>{inst.username}</h2>
                  <p className="course-email-text">{inst.email}</p>
                  <div className="rating">
                    {"★".repeat(inst.rating || 0)}
                    {"☆".repeat(5 - (inst.rating || 0))}
                  </div>
                </div>
              </div>

              <div className="course-body-content">
                <div className="info-row">
                  <span className="info-label">Course:</span>
                  <span className="info-value">{inst.course_title || "Professional Training"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value">$50.00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Experience:</span>
                  <span className="info-value">{inst.years_of_experience || 0} yrs</span>
                </div>
              </div>

              <div className="course-actions">
                <button
                  className={`btn-buy ${purchased ? "purchased-btn" : "buy-btn"}`}
                  disabled={purchased}
                  onClick={() => handleBuyCourse(inst.email)}
                >
                  {purchased ? "Purchased" : "Buy Course - $50"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

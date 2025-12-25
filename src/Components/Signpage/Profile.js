import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

const API_BASE = process.env.REACT_APP_API_BASE;

// =====================
// StarRating Components
// =====================
const StarRating = ({ rating, onRatingChange, onSubmit, onCancel }) => {
  return (
    <div style={{ marginTop: 8, padding: 8, background: "#f7fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: star <= rating ? "#fbbf24" : "#d1d5db"
            }}
          >
            ★
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onSubmit}
          disabled={rating === 0}
          className="action-btn"
          style={{ padding: "4px 8px", fontSize: "12px" }}
        >
          Submit Rating
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "4px 8px", fontSize: "12px", background: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// =====================
// Helper functions for rating persistence
// =====================
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
};

const loadRatedUsers = (userEmail, type) => {
  try {
    const key = `rated${type}_${userEmail.toLowerCase()}`;
    const stored = getCookie(key);
    console.log(`Loading rated users for ${type} with key ${key}:`, stored ? JSON.parse(stored) : 'none');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (err) {
    console.error('Error loading rated users from cookies:', err);
    return new Set();
  }
};

const saveRatedUsers = (userEmail, type, ratedSet) => {
  try {
    const key = `rated${type}_${userEmail.toLowerCase()}`;
    const value = JSON.stringify([...ratedSet]);
    setCookie(key, value);
    console.log(`Saved rated users for ${type} with key ${key}:`, value);
  } catch (err) {
    console.error('Error saving rated users to cookies:', err);
  }
};

const StatCard = ({ title, value, children, cardType, showRatingFor }) => {
  const shouldExpand = showRatingFor && showRatingFor.type === cardType;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (shouldExpand) setExpanded(true);
  }, [shouldExpand]);

  const handleClick = () => {
    if (!shouldExpand) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className="stat-item"
      onClick={handleClick}
      style={{ cursor: shouldExpand ? "default" : "pointer" }}
    >
      <div className="stat-number">{value}</div>
      <div className="stat-label">{title}</div>
      {expanded && <div className="activity-list">{children}</div>}
    </div>
  );
};

// =====================
// TaxWorkerProfile Component
// =====================
const TaxWorkerProfile = ({ data }) => {
  console.log("Rendering TaxWorkerProfile with data:", data);
  console.log("User email:", data.email);
  const [questions, setQuestions] = useState(data.received_questions || []);
  const [openFormIndex, setOpenFormIndex] = useState(null);
  const [answerInputs, setAnswerInputs] = useState({});
  const [ratedInstructors, setRatedInstructors] = useState(() => loadRatedUsers(data.email, 'Instructors'));
  const [ratedTransitors, setRatedTransitors] = useState(() => loadRatedUsers(data.email, 'Transitors'));
  const [showRatingFor, setShowRatingFor] = useState(null); // {type: 'instructor'|'transitor', email: string}
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    setQuestions(data.received_questions || []);
  }, [data.received_questions]);

  const questionsAsked = questions?.length || 0;
  const answeredQuestions = questions?.filter((q) => q.status === "answered")
    .length;
  const purchasedItems = data.purchased_items?.length || 0;
  const aiPurchases = data.ai_purchases?.length || 0;
  const sentRequests = data.sent_requests?.length || 0;
  const sentQuestions = data.sent_questions?.length || 0;
  const purchasedCourses = data.purchased_courses?.length || 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="profile-stats">
        <StatCard title="Questions Received" value={questionsAsked}>
          {questions.map((q, i) => (
            <div key={i} className="activity-item">
              <div className="activity-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="activity-title">{q.question}</span>
                  <small style={{ color: "#4a5568" }}>
                    Asked by: Normal User - {q.asker_email}
                  </small>
                </div>

                <span
                  className={`activity-status ${
                    q.status === "answered" ? "answered" : "pending"
                  }`}
                >
                  {q.status}
                </span>
              </div>

              {q.answer && (
                <div className="activity-answer">
                  <strong>Answer:</strong> {q.answer}
                </div>
              )}

              {q.status !== "answered" && (
                <div style={{ marginTop: 10 }}>
                  {openFormIndex === i ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea
                        rows={3}
                        value={answerInputs[i] || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          setAnswerInputs((s) => ({ ...s, [i]: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Write your answer here..."
                        style={{ padding: 8, borderRadius: 6, border: "1px solid #e2e8f0" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const text = (answerInputs[i] || "").trim();
                            if (!text) return alert("Please enter an answer.");
                            if (!q.asker_email) return alert("Askers email missing.");

                            try {
                              const res = await fetch(
                                `${API_BASE}/users/answer/`,
                                {
                                  method: "POST",
                                  credentials: "include",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    asker_email: q.asker_email,
                                    answer: text,
                                  }),
                                }
                              );

                              if (!res.ok) {
                                const errText = await res.text();
                                throw new Error(errText || "Failed to submit answer");
                              }

                              const json = await res.json();

                              setQuestions((prev) => {
                                const copy = [...prev];
                                copy[i] = {
                                  ...copy[i],
                                  answer: json.question?.answer || text,
                                  status: json.question?.status || "answered",
                                };
                                return copy;
                              });

                              setOpenFormIndex(null);
                              alert(json.message || "Answer submitted");
                            } catch (err) {
                              console.error("Answer submit error:", err);
                              alert("Error submitting answer: " + err.message);
                            }
                          }}
                          className="action-btn"
                          style={{ padding: "8px 12px" }}
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFormIndex(null);
                          }}
                          className="action-btn"
                          style={{ padding: "8px 12px", background: "#f56565", color: "white" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFormIndex(i);
                      }}
                      className="action-btn"
                      style={{ padding: "8px 12px" }}
                    >
                      Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </StatCard>

        <StatCard title="Answered Questions" value={answeredQuestions}>
          {data.received_questions
            .filter((q) => q.status === "answered")
            .map((q, i) => (
              <div key={i} className="activity-item">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="activity-title">{q.question}</span>
                  <small style={{ color: "#4a5568" }}>
                    Asked by: Normal User - {q.asker_email}
                  </small>
                </div>
                <div className="activity-answer">
                  <strong>Answer:</strong> {q.answer}
                </div>
              </div>
            ))}
        </StatCard>

        <StatCard title="Purchased Items" value={purchasedItems}>
          {data.purchased_items.map((item, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Item: {item.item_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Description: {item.description}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Price: ${item.price} | Quantity: {item.quantity}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Purchased At: {new Date(item.purchased_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="AI Purchases" value={aiPurchases}>
          {data.ai_purchases.map((ai, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">AI Product: {ai.ai_product_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Price: ${ai.price}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Requests" value={sentRequests} cardType="transitor" showRatingFor={showRatingFor}>
          {data.sent_requests?.map((request, i) => (
            <div key={i} className="activity-item">
              <div className="activity-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="activity-title">To: {request.transitor_email}</span>
                  <small style={{ color: "#4a5568" }}>
                    Status: {request.status} | Connected: {request.connected ? "Yes" : "No"}
                  </small>
                  {request.connected && !ratedTransitors.has(request.transitor_email) && showRatingFor?.type === 'transitor' && showRatingFor.email === request.transitor_email && (
                    <StarRating
                      rating={selectedRating}
                      onRatingChange={setSelectedRating}
                      onSubmit={async () => {
                        if (selectedRating === 0) return;
                        try {
                          const res = await fetch(`${API_BASE}/users/rate_transitor/`, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              transitor_email: request.transitor_email,
                              rating: selectedRating
                            })
                          });
                          if (!res.ok) throw new Error("Failed to rate transitor");
                          const responseData = await res.json();
                          alert(responseData.message);
                          setRatedTransitors(prev => {
                            const newSet = new Set([...prev, request.transitor_email]);
                            saveRatedUsers(data.email, 'Transitors', newSet);
                            return newSet;
                          });
                          setShowRatingFor(null);
                          setSelectedRating(0);
                        } catch (err) {
                          alert("Error: " + err.message);
                        }
                      }}
                      onCancel={() => {
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      }}
                    />
                  )}
                  {request.connected && !ratedTransitors.has(request.transitor_email) && !(showRatingFor?.type === 'transitor' && showRatingFor.email === request.transitor_email) && (
                    <button
                      onClick={() => setShowRatingFor({ type: 'transitor', email: request.transitor_email })}
                      className="action-btn"
                      style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                    >
                      Rate Transitor
                    </button>
                  )}
                  {request.connected && ratedTransitors.has(request.transitor_email) && (
                    <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Purchased Courses" value={purchasedCourses} cardType="instructor" showRatingFor={showRatingFor}>
          {data.purchased_courses?.map((course, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Course Title: {course.course_title}</span>
                <small style={{ color: "#4a5568" }}>
                  Instructor: {course.instructor_email}
                </small>
        
                {!ratedInstructors.has(course.instructor_email) && showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email && (
                  <StarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    onSubmit={async () => {
                      if (selectedRating === 0) return;
                      try {
                        const res = await fetch(`${API_BASE}/users/rate_instructor/`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            instructor_email: course.instructor_email,
                            rating: selectedRating
                          })
                        });
                        if (!res.ok) throw new Error("Failed to rate instructor");
                        const responseData = await res.json();
                        alert(responseData.message);
                        setRatedInstructors(prev => {
                          const newSet = new Set([...prev, course.instructor_email]);
                          saveRatedUsers(data.email, 'Instructors', newSet);
                          return newSet;
                        });
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                    onCancel={() => {
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    }}
                  />
                )}
                {!ratedInstructors.has(course.instructor_email) && !(showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email) && (
                  <button
                    onClick={() => setShowRatingFor({ type: 'instructor', email: course.instructor_email })}
                    className="action-btn"
                    style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                  >
                    Rate Instructor
                  </button>
                )}
                {ratedInstructors.has(course.instructor_email) && (
                  <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                )}
              </div>
            </div>
          ))}
        </StatCard>
      </div>

      {/* Professional Info */}
      <div className="role-section">
        <h3>Professional Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Username</span>
            <span className="detail-value">{data.username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Personal Email</span>
            <span className="detail-value">{data.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Job Title</span>
            <span className="detail-value">{data.job_title}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Work Email</span>
            <span className="detail-value">{data.work_email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{data.phone_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Organization</span>
            <span className="detail-value">{data.organization_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Clients Served</span>
            <span className="detail-value">{data.clients_served}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rating</span>
            <span className="detail-value rating-value">
              {Number(data.rating).toFixed(2)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Earnings</span>
            <span className="detail-value earnings-value">
              ${Number(data.earning).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// =====================
// InstructorProfile Component
// =====================
const InstructorProfile = ({ data }) => {
  console.log("Rendering InstructorProfile with data:", data);

  const [ratedInstructors, setRatedInstructors] = useState(() => loadRatedUsers(data.email, 'Instructors'));
  const [showRatingFor, setShowRatingFor] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const coursesCreated = data.courses?.length || 0;
  const purchasedCourses = data.purchased_courses?.length || 0;
  const aiPurchases = data.ai_purchases?.length || 0;
  const purchasedItems = data.purchased_items?.length || 0;
  const sentQuestions = data.sent_questions?.length || 0;

  return (
    <>
      <div className="profile-stats">
        <StatCard title="Courses Created" value={coursesCreated}>
          {data.courses?.map((course, i) => (
            <div key={i} className="activity-item">
              <span>{course.title}</span>
              {course.material && <span>Material: {course.material}</span>}
            </div>
          ))}
          {data.course_material && (
            <div className="activity-item">
              <span>Course Material: {data.course_material}</span>
            </div>
          )}
        </StatCard>

        <StatCard title="Rating" value={Number(data.rating).toFixed(2)} />
        <StatCard title="Earnings" value={`$${Number(data.earning || 0).toFixed(2)}`} />

        <StatCard title="Purchased Courses" value={purchasedCourses} cardType="instructor" showRatingFor={showRatingFor}>
          {data.purchased_courses?.map((course, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Course Title: {course.course_title}</span>
                <small style={{ color: "#4a5568" }}>
                  Instructor: {course.instructor_email}
                </small>
              
                {!ratedInstructors.has(course.instructor_email) && showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email && (
                  <StarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    onSubmit={async () => {
                      if (selectedRating === 0) return;
                      try {
                        const res = await fetch(`${API_BASE}/users/rate_instructor/`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            instructor_email: course.instructor_email,
                            rating: selectedRating
                          })
                        });
                        if (!res.ok) throw new Error("Failed to rate instructor");
                        const responseData = await res.json();
                        alert(responseData.message);
                        setRatedInstructors(prev => {
                          const newSet = new Set([...prev, course.instructor_email]);
                          saveRatedUsers(data.email, 'Instructors', newSet);
                          return newSet;
                        });
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                    onCancel={() => {
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    }}
                  />
                )}
                {!ratedInstructors.has(course.instructor_email) && !(showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email) && (
                  <button
                    onClick={() => setShowRatingFor({ type: 'instructor', email: course.instructor_email })}
                    className="action-btn"
                    style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                  >
                    Rate Instructor
                  </button>
                )}
                {ratedInstructors.has(course.instructor_email) && (
                  <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                )}
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="AI Purchases" value={aiPurchases}>
          {data.ai_purchases?.map((ai, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">AI Product: {ai.ai_product_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Price: ${ai.price}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Purchased Items" value={purchasedItems}>
          {data.purchased_items?.map((item, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Item: {item.item_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Description: {item.description}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Price: ${item.price} | Quantity: {item.quantity}
                </small>
               
                <small style={{ color: "#4a5568" }}>
                  Purchased At: {new Date(item.purchased_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Sent Questions" value={sentQuestions}>
          {data.sent_questions?.map((q, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Question: {q.question}</span>
                <small style={{ color: "#4a5568" }}>
                  Receiver: {q.receiver_email}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Status: {q.status}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Created At: {new Date(q.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>
      </div>

      <div className="role-section">
        <h3>Professional Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Job Title</span>
            <span className="detail-value">{data.job_title}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Experience</span>
            <span className="detail-value">{data.years_of_experience} years</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Course</span>
            <span className="detail-value">{data.course_title}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rating</span>
            <span className="detail-value rating-value">{data.rating}</span>
          </div>
        </div>
      </div>
    </>
  );
};

// =====================
// TransitorProfile Component
// =====================
const TransitorProfile = ({ data }) => {
  console.log("Rendering TransitorProfile with data:", data);

  const [ratedInstructors, setRatedInstructors] = useState(() => loadRatedUsers(data.email, 'Instructors'));
  const [ratedTransitors, setRatedTransitors] = useState(() => loadRatedUsers(data.email, 'Transitors'));
  const [showRatingFor, setShowRatingFor] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleTransitorAction = async (request, action) => {
    try {
      const res = await fetch(`${API_BASE}/users/respond_to_transitor_request/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: request.user_email,
          action: action
        })
      });

      if (!res.ok) throw new Error("Failed to respond to request");

      const responseData = await res.json();
      alert(responseData.message);

      request.status = responseData.request.status;
      request.connected = action === "accept";
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const clientsServed = data.clients?.length || 0;
  const receivedRequests = data.received_requests?.length || 0;
  const sentRequests = data.sent_requests?.length || 0;
  const purchasedCourses = data.purchased_courses?.length || 0;
  const aiPurchases = data.ai_purchases?.length || 0;
  const purchasedItems = data.purchased_items?.length || 0;
  const sentQuestions = data.sent_questions?.length || 0;

  return (
    <>
      <div className="profile-stats">
        <StatCard title="Received Requests" value={receivedRequests}>
          {data.received_requests?.map((r, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">From: {r.user_email}</span>
                <small style={{ color: "#4a5568" }}>
                  Status: {r.status} | Connected: {r.connected ? "Yes" : "No"}
                </small>
                
                {r.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      className="action-btn"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTransitorAction(r, "accept");
                      }}
                    >
                      Accept Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Sent Requests" value={sentRequests} cardType="transitor" showRatingFor={showRatingFor}>
          {data.sent_requests?.map((request, i) => (
            <div key={i} className="activity-item">
              <div className="activity-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="activity-title">To: {request.transitor_email}</span>
                  <small style={{ color: "#4a5568" }}>
                    Status: {request.status} | Connected: {request.connected ? "Yes" : "No"}
                  </small>
                  {request.connected && !ratedTransitors.has(request.transitor_email) && showRatingFor?.type === 'transitor' && showRatingFor.email === request.transitor_email && (
                    <StarRating
                      rating={selectedRating}
                      onRatingChange={setSelectedRating}
                      onSubmit={async () => {
                        if (selectedRating === 0) return;
                        try {
                          const res = await fetch(`${API_BASE}/users/rate_transitor/`, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              transitor_email: request.transitor_email,
                              rating: selectedRating
                            })
                          });
                          if (!res.ok) throw new Error("Failed to rate transitor");
                          const responseData = await res.json();
                          alert(responseData.message);
                          setRatedTransitors(prev => {
                            const newSet = new Set([...prev, request.transitor_email]);
                            saveRatedUsers(data.email, 'Transitors', newSet);
                            return newSet;
                          });
                          setShowRatingFor(null);
                          setSelectedRating(0);
                        } catch (err) {
                          alert("Error: " + err.message);
                        }
                      }}
                      onCancel={() => {
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      }}
                    />
                  )}
                  {request.connected && !ratedTransitors.has(request.transitor_email) && !(showRatingFor?.type === 'transitor' && showRatingFor.email === request.transitor_email) && (
                    <button
                      onClick={() => setShowRatingFor({ type: 'transitor', email: request.transitor_email })}
                      className="action-btn"
                      style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                    >
                      Rate Transitor
                    </button>
                  )}
                  {request.connected && ratedTransitors.has(request.transitor_email) && (
                    <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Rating" value={Number(data.rating).toFixed(2)} />
        <StatCard title="Earnings" value={`$${Number(data.earning).toFixed(2)}`} />

        <StatCard title="Purchased Courses" value={purchasedCourses} cardType="instructor" showRatingFor={showRatingFor}>
          {data.purchased_courses?.map((course, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Course Title: {course.course_title}</span>
                <small style={{ color: "#4a5568" }}>
                  Instructor: {course.instructor_email}
                </small>
      
                {!ratedInstructors.has(course.instructor_email) && showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email && (
                  <StarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    onSubmit={async () => {
                      if (selectedRating === 0) return;
                      try {
                        const res = await fetch(`${API_BASE}/users/rate_instructor/`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            instructor_email: course.instructor_email,
                            rating: selectedRating
                          })
                        });
                        if (!res.ok) throw new Error("Failed to rate instructor");
                        const responseData = await res.json();
                        alert(responseData.message);
                        setRatedInstructors(prev => {
                          const newSet = new Set([...prev, course.instructor_email]);
                          saveRatedUsers(data.email, 'Instructors', newSet);
                          return newSet;
                        });
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                    onCancel={() => {
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    }}
                  />
                )}
                {!ratedInstructors.has(course.instructor_email) && !(showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email) && (
                  <button
                    onClick={() => setShowRatingFor({ type: 'instructor', email: course.instructor_email })}
                    className="action-btn"
                    style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                  >
                    Rate Instructor
                  </button>
                )}
                {ratedInstructors.has(course.instructor_email) && (
                  <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                )}
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="AI Purchases" value={aiPurchases}>
          {data.ai_purchases?.map((ai, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">AI Product: {ai.ai_product_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Price: ${ai.price}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Purchased Items" value={purchasedItems}>
          {data.purchased_items?.map((item, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Item: {item.item_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Description: {item.description}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Price: ${item.price} | Quantity: {item.quantity}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Purchased At: {new Date(item.purchased_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Sent Questions" value={sentQuestions}>
          {data.sent_questions?.map((q, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Question: {q.question}</span>
                <small style={{ color: "#4a5568" }}>
                  Receiver: {q.receiver_email}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Status: {q.status}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Created At: {new Date(q.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>
      </div>

      <div className="role-section">
        <h3>Business Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Job Title</span>
            <span className="detail-value">{data.job_title}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">TIN / VAT</span>
            <span className="detail-value">{data.tin_vat_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rating</span>
            <span className="detail-value rating-value">{data.rating}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Earnings</span>
            <span className="detail-value earnings-value">${data.earning}</span>
          </div>
        </div>
      </div>
    </>
  );
};

// =====================
// NormalUserProfile Component
// =====================
const NormalUserProfile = ({ data, userData, setUserData }) => {
  console.log("Rendering NormalUserProfile with data:", data);

  const [ratedTaxWorkers, setRatedTaxWorkers] = useState(() => loadRatedUsers(data.email, 'TaxWorkers'));
  const [ratedTransitors, setRatedTransitors] = useState(() => loadRatedUsers(data.email, 'Transitors'));
  const [ratedInstructors, setRatedInstructors] = useState(() => loadRatedUsers(data.email, 'Instructors'));
  const [showRatingFor, setShowRatingFor] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const questionsAsked = data.sent_questions?.length || 0;
  const answeredQuestions = data.sent_questions?.filter(
    (q) => q.status === "answered"
  ).length;
  const sentRequests = data.sent_requests?.length || 0;
  const purchasedCourses = data.purchased_courses?.length || 0;
  const purchasedItems = data.purchased_items?.length || 0;
  const aiPurchases = data.ai_purchases?.length || 0;

  return (
    <>
      <div className="profile-stats">
        <StatCard title="Questions Asked" value={questionsAsked}>
          {data.sent_questions?.map((q, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Question: {q.question}</span>
                <small style={{ color: "#4a5568" }}>
                  Receiver: {q.receiver_email}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Status: {q.status}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Created At: {new Date(q.created_at).toLocaleDateString()}
                </small>
                {q.answer && (
                  <div className="activity-answer">
                    <strong>Answer:</strong> {q.answer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Requests" value={sentRequests} cardType="transitor" showRatingFor={showRatingFor}>
          {data.sent_requests?.map((r, i) => (
            <div key={i} className="activity-item">
              <span>To: {r.transitor_email}</span>|
              <span>Status: {r.status}</span> |
              <span>Connected: {r.connected ? "Yes" : "No"}</span>

              {r.connected && !ratedTransitors.has(r.transitor_email) && showRatingFor?.type === 'transitor' && showRatingFor.email === r.transitor_email && (
                <StarRating
                  rating={selectedRating}
                  onRatingChange={setSelectedRating}
                  onSubmit={async () => {
                    if (selectedRating === 0) return;
                    try {
                      const res = await fetch(`${API_BASE}/users/rate_transitor/`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          transitor_email: r.transitor_email,
                          rating: selectedRating
                        })
                      });
                      if (!res.ok) throw new Error("Failed to rate transitor");
                      const responseData = await res.json();
                      alert(responseData.message);
                      setRatedTransitors(prev => {
                        const newSet = new Set([...prev, r.transitor_email]);
                        saveRatedUsers(data.email, 'Transitors', newSet);
                        return newSet;
                      });
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    } catch (err) {
                      alert("Error: " + err.message);
                    }
                  }}
                  onCancel={() => {
                    setShowRatingFor(null);
                    setSelectedRating(0);
                  }}
                />
              )}
              {r.connected && !ratedTransitors.has(r.transitor_email) && !(showRatingFor?.type === 'transitor' && showRatingFor.email === r.transitor_email) && (
                <button
                  onClick={() => setShowRatingFor({ type: 'transitor', email: r.transitor_email })}
                  className="action-btn"
                  style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                >
                  Rate Transitor
                </button>
              )}
              {r.connected && ratedTransitors.has(r.transitor_email) && (
                <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
              )}
            </div>
          ))}
        </StatCard>

        <StatCard title="Answered Questions" value={answeredQuestions} cardType="taxworker" showRatingFor={showRatingFor}>
          {data.sent_questions
            ?.filter((q) => q.status === "answered")
            .map((q, i) => (
              <div key={i} className="activity-item">
                <span>{q.question}</span>
                <div className="activity-answer">
                  <strong>Answer:</strong> {q.answer}
                </div>
                <small style={{ color: "#4a5568" }}>
                  Answered by: Tax Worker - {q.receiver_email}
                </small>
                {!ratedTaxWorkers.has(q.receiver_email) && showRatingFor?.type === 'taxworker' && showRatingFor.email === q.receiver_email && (
                  <StarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    onSubmit={async () => {
                      if (selectedRating === 0) return;
                      try {
                        const res = await fetch(`${API_BASE}/users/rate_tax_worker/`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            tax_worker_email: q.receiver_email,
                            rating: selectedRating
                          })
                        });
                        if (!res.ok) throw new Error("Failed to rate tax worker");
                        const responseData = await res.json();
                        alert(responseData.message);
                        setRatedTaxWorkers(prev => {
                          const newSet = new Set([...prev, q.receiver_email]);
                          saveRatedUsers(data.email, 'TaxWorkers', newSet);
                          return newSet;
                        });
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                    onCancel={() => {
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    }}
                  />
                )}
                {!ratedTaxWorkers.has(q.receiver_email) && !(showRatingFor?.type === 'taxworker' && showRatingFor.email === q.receiver_email) && (
                  <button
                    onClick={() => setShowRatingFor({ type: 'taxworker', email: q.receiver_email })}
                    className="action-btn"
                    style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                  >
                    Rate Tax Worker
                  </button>
                )}
                {ratedTaxWorkers.has(q.receiver_email) && (
                  <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                )}
              </div>
            ))}
        </StatCard>


        <StatCard title="Purchased Courses" value={purchasedCourses} cardType="instructor" showRatingFor={showRatingFor}>
          {data.purchased_courses?.map((course, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Course Title: {course.course_title}</span>
                <small style={{ color: "#4a5568" }}>
                  Instructor: {course.instructor_email}
                </small>
                
                {!ratedInstructors.has(course.instructor_email) && showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email && (
                  <StarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    onSubmit={async () => {
                      if (selectedRating === 0) return;
                      try {
                        const res = await fetch(`${API_BASE}/users/rate_instructor/`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            instructor_email: course.instructor_email,
                            rating: selectedRating
                          })
                        });
                        if (!res.ok) throw new Error("Failed to rate instructor");
                        const responseData = await res.json();
                        alert(responseData.message);
                        setRatedInstructors(prev => {
                          const newSet = new Set([...prev, course.instructor_email]);
                          saveRatedUsers(data.email, 'Instructors', newSet);
                          return newSet;
                        });
                        setShowRatingFor(null);
                        setSelectedRating(0);
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                    onCancel={() => {
                      setShowRatingFor(null);
                      setSelectedRating(0);
                    }}
                  />
                )}
                {!ratedInstructors.has(course.instructor_email) && !(showRatingFor?.type === 'instructor' && showRatingFor.email === course.instructor_email) && (
                  <button
                    onClick={() => setShowRatingFor({ type: 'instructor', email: course.instructor_email })}
                    className="action-btn"
                    style={{ padding: "4px 8px", fontSize: "12px", marginTop: 4 }}
                  >
                    Rate Instructor
                  </button>
                )}
                {ratedInstructors.has(course.instructor_email) && (
                  <small style={{ color: "#4a5568", marginTop: 4 }}>Already rated</small>
                )}
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="Purchased Items" value={purchasedItems}>
          {data.purchased_items?.map((item, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">Item: {item.item_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Description: {item.description}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Price: ${item.price} | Quantity: {item.quantity}
                </small>
                <small style={{ color: "#4a5568" }}>
                  Purchased At: {new Date(item.purchased_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </StatCard>

        <StatCard title="AI Purchases" value={aiPurchases}>
          {data.ai_purchases?.map((ai, i) => (
            <div key={i} className="activity-item">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="activity-title">AI Product: {ai.ai_product_name}</span>
                <small style={{ color: "#4a5568" }}>
                  Price: ${ai.price}
                </small>
              </div>
            </div>
          ))}
        </StatCard>
      </div>

      <div className="role-section">
        <h3>Personal Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{data.full_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{data.email}</span>
          </div>
        </div>
      </div>
    </>
  );
};

// =====================
// Main Profile Component
// =====================
const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    console.log("Fetching user profile...");
    try {
      const response = await fetch(
        `${API_BASE}/users/profile/`,
        { credentials: "include" }
      );

      console.log("Profile fetch response:", response);

      if (response.status === 401) {
        console.warn("User not authenticated, redirecting to login.");
        return navigate("/login");
      }

      const data = await response.json();
      console.log("Profile data received:", data);
      setUserData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      navigate("/login");
    } finally {
      setLoading(false);
      console.log("Profile fetch completed.");
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      const res = await fetch(
        `${API_BASE}/users/logout/`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      console.log("Logout response:", res);

      if (!res.ok) throw new Error("Logout failed.");

      localStorage.clear();
      setUserData(null);
      alert("You have been logged out successfully.");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Error logging out: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!userData) return null;

  console.log("Rendering profile page for user:", userData.username);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="welcome-banner">
          <h1>Welcome back, {userData.username}!</h1>
          
          <p>
            <h3>Refund Policy:</h3>
The paid amount will be refunded to the payer if the request is not accepted or if the submitted questions are not answered within three (3) days. In such cases, the amount will be deducted from the individual who accepted the request or received the question.</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {userData.photo ? (
                <img src={userData.photo} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {userData.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2>{userData.username}</h2>
            <p>{userData.email}</p>
            <button onClick={handleLogout} className="logout-btn" style={{ marginTop: "10px" }}>
              Logout
            </button>
          </div>

          <div className="profile-main">
            {userData.role === "tax_worker" && (
              <TaxWorkerProfile data={userData} />
            )}
            {userData.role === "instructor" && (
              <InstructorProfile data={userData} />
            )}
            {userData.role === "transitor" && (
              <TransitorProfile data={userData} />
            )}
            {userData.role === "normal" && (
              <NormalUserProfile 
                data={userData} 
                userData={userData} 
                setUserData={setUserData} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
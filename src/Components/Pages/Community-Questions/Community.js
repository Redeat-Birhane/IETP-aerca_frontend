import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Community.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Community() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askBoxOpen, setAskBoxOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [answerBoxes, setAnswerBoxes] = useState({});
  const [answers, setAnswers] = useState({});

  const username = localStorage.getItem("username");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Redirect to signin if not authenticated, with return path
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/Signin", { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/view_community_questions/`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load questions");

        const data = await res.json();
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/Signin", { state: { from: location.pathname } });
      }
    };

    fetchQuestions();
  }, [isAuthenticated, navigate, location]);

  const handleAskQuestion = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      alert("Please fill in both title and body.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/ask_community_question/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      alert(data.message);
      setQuestions((prev) => [
        {
          id: data.question_id,
          title: newTitle,
          body: newBody,
          asked_by: username,
          answers: [],
        },
        ...prev,
      ]);

      setAskBoxOpen(false);
      setNewTitle("");
      setNewBody("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    const answerBody = answers[questionId]?.trim();
    if (!answerBody) return alert("Please type an answer.");

    try {
      const res = await fetch(`${API_BASE}/users/answer_community_question/${questionId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: answerBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      alert(data.message);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: [...q.answers, { body: answerBody, answered_by: username }] }
            : q
        )
      );
      setAnswerBoxes((prev) => ({ ...prev, [questionId]: false }));
      setAnswers((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "50px" }}>Loading community questions...</p>;

  return (
    <div className="community-container">
      <h1 className="community-title">Community Hub</h1>
      <p className="community-subtitle">Share knowledge, ask questions, and connect with other members.</p>

      <button className="ask-toggle-btn" onClick={() => setAskBoxOpen(!askBoxOpen)}>
        {askBoxOpen ? "✖ Close" : "＋ Ask a Question"}
      </button>

      {askBoxOpen && (
        <div className="ask-box-container">
          <input
            type="text"
            placeholder="What is your question title?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Provide more details here..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
          <div className="ask-box-actions">
            <button className="btn-submit" onClick={handleAskQuestion}>Post Question</button>
          </div>
        </div>
      )}

      <div className="questions-grid">
        {questions.map((q) => (
          <div className="question-card" key={q.id}>
            <div className="question-header">
              <div className="user-avatar-fallback">
                {q.asked_by ? q.asked_by.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="question-meta">
                <h3>{q.title}</h3>
                <p className="asked-by-text">Asked by {q.asked_by}</p>
              </div>
            </div>

            <div className="question-body-content">
              <p className="question-text">{q.body}</p>
              
              {q.answers.length > 0 && (
                <div className="answers-section">
                  <span className="answers-label">Recent Answers:</span>
                  {q.answers.map((a, idx) => (
                    <div key={idx} className="answer-item">
                      <p>"{a.body}"</p>
                      <small>— {a.answered_by}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="question-actions">
              {answerBoxes[q.id] ? (
                <div className="answer-input-area">
                  <textarea
                    placeholder="Write your answer..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                  <div className="action-btns">
                    <button className="btn-submit-small" onClick={() => handleAnswerQuestion(q.id)}>Submit</button>
                    <button className="btn-cancel-small" onClick={() => setAnswerBoxes((prev) => ({ ...prev, [q.id]: false }))}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn-answer-trigger" onClick={() => setAnswerBoxes((prev) => ({ ...prev, [q.id]: true }))}>
                  💬 Answer this Question
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import "./section2.css";

export default function section2() {
  return (
    <>
      <div className="Online-courses">
        <h3>Online Courses</h3>
        <p>The best trading course ever in Ethiopia.</p>
        <br />
        <div className="button2">
          <button className="but3">
            <Link className="no-underline2" to="/Coursespage">
              LearnMore
            </Link>
          </button>
          <button className="but4">
            <Link className="no-underline2" to="/Courses">
              Buy
            </Link>
          </button>
        </div>
      </div>
      <br />
    </>
  );
}

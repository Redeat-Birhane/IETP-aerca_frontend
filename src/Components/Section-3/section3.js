import React from 'react'
import { Link } from "react-router-dom";
import "./section3.css";
export default function section3() {
  return (
    <>
      <div className="Tax-workers">
        <h1>Tax Workers </h1>
        <p>Save Your Time & Energy</p>
        <br />
        <div className="button3">
          <button className="but5">
            <Link className="no-underline3" to="/Taxconnect">
              Learn more
            </Link>
          </button>

          <button className="but6">
            <Link className="no-underline3" to="/Taxconnect">
              Connect
            </Link>
          </button>
        </div>
      </div>
      <br />
    </>
  );
}

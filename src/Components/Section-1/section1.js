import React from 'react'
import { Link } from "react-router-dom";
import "./section1.css"

export default function section1() {
  return (
    <>
      <div class="Geez-AI">
        <h1>Geez AI</h1>
        <h7>All Out Pro</h7>
        <div class="button">
          <button class="but1">
            {/* <a>Learn more</a> */}
            <Link className="no-underline" to="/Overview">
              Learn more
            </Link>
          </button>
          <button class="but2">
            <Link className="no-underline" to="/overview">
              Buy
            </Link>
            {/* <a>Buy</a> */}
          </button>
        </div>
      </div>
      <br />
    </>
  );
}

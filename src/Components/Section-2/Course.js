import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Course.css";

export default function Course() {
  return (
    <div className="coursePage">
      <header className="introSection">
        <h1>Learn Online Trading</h1>
        <p>
          Online trading allows you to buy and sell financial assets like
          stocks, forex, and cryptocurrencies using internet platforms.
          Understanding how trading works helps you make smarter investment
          decisions and manage risk effectively.
        </p>

        <h2>How to Start Learning:</h2>
        <ul>
          <li>✔ Learn the basics of how markets work and what moves prices.</li>
          <li>
            ✔ Understand trading tools like charts, indicators, and trends.
          </li>
          <li>
            ✔ Practice using a demo trading account before using real money.
          </li>
          <li>✔ Choose a trading course to build your skills step by step.</li>
        </ul>
      </header>

      <section className="courseSection">
        <h2>Recommended Online Trading Courses</h2>

        <div className="courseList">
          <div className="courseCard">
            <h3>Beginner’s Guide to Forex Trading</h3>
            <p>
              Learn the basics of Forex markets, currency pairs, risk
              management, and trading psychology.
            </p>
            <Link to="/Signin">
              <p>Buy</p>
            </Link>
          </div>

          <div className="courseCard">
            <h3>Crypto Trading Fundamentals</h3>
            <p>
              Understand cryptocurrency markets, technical analysis, and
              strategies for crypto trading.
            </p>
            <Link to="/Signin">
              <p>Buy</p>
            </Link>
          </div>

          <div className="courseCard">
            <h3>Stock Market Trading for Beginners</h3>
            <p>
              Get introduced to stock trading, chart patterns, and key
              indicators for stock analysis.
            </p>
            <Link to="/Signin">
              <p>Buy</p>
            </Link>
          </div>

          <div className="courseCard">
            <h3> Import & Export for Beginners</h3>
            <p>
              Get introduced to import & Export, chart patterns, and key
              indicators for Market analysis.
            </p>
            <Link to="/Signin">
              <p>Buy</p>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}

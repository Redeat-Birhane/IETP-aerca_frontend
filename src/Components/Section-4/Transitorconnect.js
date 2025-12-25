import React from "react";
import { Link } from "react-router-dom";
import "./Transitorconnect.css";

export default function Transitorconnect() {
  return (
    <div className="transitorPage">
      <header className="transitorIntro">
        <h1>Expert Transitors at Your Service</h1>
        <p>
          Transitors are professional consultants who assist importers and
          traders in calculating and managing taxes and customs duties on
          imported products. They play a vital role in ensuring your goods
          comply with Ethiopian trade regulations while helping you avoid
          unnecessary costs and delays.
        </p>

        <p>
          With the help of our verified transitors, you can make international
          trade smoother, faster, and more reliable. From cost estimation to
          documentation and customs clearance, our transitors handle the complex
          parts—so you can focus on growing your business.
        </p>

        <h2>Why Work With Our Transitors?</h2>
        <ul>
          <li>✔ Accurate tax and duty calculations for imported goods.</li>
          <li>✔ Compliance with Ethiopian customs and trade regulations.</li>
          <li>✔ Reduced risk of shipment delays and penalties.</li>
          <li>✔ Smooth customs clearance and expert cost guidance.</li>
        </ul>
      </header>

      <section className="transitorConnectSection">
        <h2>Connect With a Transitor</h2>
        <p>
          Get professional customs and tax assistance today! Click below to
          connect with a verified transitor and make your import process simple
          and worry-free.
        </p>
        <Link to="/Signin" className="connectButton">
          Connect Now
        </Link>
      </section>
    </div>
  );
}

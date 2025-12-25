import React from "react";
import { Link } from "react-router-dom";
import "./Tax.css";

export default function Tax() {
  return (
    <div className="taxPage">
      <header className="taxIntro">
        <h1>Tax Assistance Made Easy</h1>
        <p>
          This platform helps taxpayers connect directly with professional tax
          workers to minimize wasted time, energy, and money. Our goal is to
          make tax filing, payments, and consultations simpler and faster for
          everyone.
        </p>
        <p>
          Whether you’re filing personal taxes, business taxes, or seeking
          advice on deductions, our tax workers are ready to guide you step by
          step. Avoid errors, save time, and get expert help at your fingertips.
        </p>

        <h2>Benefits of Using Our Tax Platform:</h2>
        <ul>
          <li>✔ Fast and direct connection to experienced tax workers.</li>
          <li>✔ Minimize errors and avoid unnecessary penalties.</li>
          <li>✔ Save money and energy by doing things efficiently.</li>
          <li>✔ Access professional advice anytime, anywhere.</li>
        </ul>
      </header>

      <section className="taxConnectSection">
        <h2>Connect With a Tax Worker</h2>
        <p>
          Ready to get expert tax assistance? Click the button below to reach
          our verified tax workers who can help you complete your filing
          efficiently.
        </p>
        <Link to="/Signin" className="connectButton">
          Connect Now
        </Link>
      </section>
    </div>
  );
}

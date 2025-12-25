import React from "react";
import { Link } from "react-router-dom";
import "./Lawpost.css";

export default function Lawpost() {
  return (
    <div className="lawpostPage">
      <header className="lawpostIntro">
        <h1>Legal Updates & Official Announcements</h1>
        <p>
          This page provides the latest legal updates, tax regulations, and
          official announcements from the Ethiopian Revenues and Customs
          Authority (ERCA). It helps users stay informed about new laws, policy
          changes, and administrative directives that guide trade and taxation
          processes.
        </p>

        <p>
          Stay updated with trusted and verified information directly from
          official sources. Our goal is to make legal and tax information
          accessible, clear, and timely for everyone involved in trade and
          taxation.
        </p>
      </header>

      <section className="lawpostSection">
        <h2>Stay Informed, Stay Compliant</h2>
        <p>
          Get access to the latest verified updates from the Ethiopian Revenues
          and Customs Authority — empowering businesses and citizens to make
          informed decisions.
        </p>
        <Link to="/Signin" className="watchButton">
          Watch Now
        </Link>
      </section>
    </div>
  );
}

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import Geez from "./images/assis.png";
import search from "./images/search.svg";
import cartIcon from "./images/cart.svg";
import { CartContext } from "../../context/CartContext";

export default function Header() {
  const { totalItems } = useContext(CartContext); // get total items from context
  const navigate = useNavigate(); // for navigation

  return (
    <div className="wrapper">
      <ul className="list-wrapper">
        {/* Logo */}
        <li>
          <Link to="/">
            <img className="Geezimg" src={Geez} alt="Aerca Logo" />
          </Link>
        </li>

        {/* Store */}
        <li>
          <a href="#">Store</a>
          <div className="store_dropdown">
            <div className="wrap1">
              <div className="column_one">
                <Link to="/Items">
                  <p>Items</p>
                </Link>
              </div>
            </div>
            <br />
            <div className="Discrip1">
              <p>
                Here you will find full finished product with different sizes,
                prices, and modifications that you can buy, integrate with the
                website, and get updates easily.
              </p>
            </div>
          </div>
        </li>

        {/* Geez Assistant */}
        <li>
          <a href="#">Geez Assistant</a>
          <div className="mac_dropdown">
            <div className="mac_one">
              <Link to="/Overview">
                <p>Geez Assistant</p>
              </Link>
            </div>
            <br />
            <div className="Discrip2">
              <p>
                Geez Assistant is an intelligent voice-activated system designed
                to make government services smarter, faster, and more
                accessible. Built as part of the AERCA platform, it connects
                with the Ethiopian Revenues and Customs Authority’s online
                database to deliver real-time updates about tax regulations,
                customs information, and trade policies — all through simple
                voice commands or one-click access.
              </p>
            </div>
          </div>
        </li>

        {/* Transitors */}
        <li>
          <Link to="/Transitors">Transitors</Link>
          <div className="ipad_dropdown">
            <div className="ipad_one">
              <Link to="/Transitors">
                <p>Transitors</p>
              </Link>
            </div>
            <br />
            <div className="Discrip3">
              <p>
                Transitors are expert consultants who help importers and traders
                calculate and manage the amount of tax and customs duties on
                imported products. They play a vital role in ensuring that goods
                comply with Ethiopian trade regulations, providing accurate cost
                assessments and smooth customs clearance.
              </p>
            </div>
          </div>
        </li>

        {/* Tax Workers */}
        <li>
          <a href="#">Tax Workers</a>
          <div className="iphone_dropdown">
            <div className="iphone_one">
              <Link to="/Taxworkers">
                <p>Tax Payment System Workers</p>
              </Link>
            </div>
            <br />
            <div className="Discrip4">
              <p>
                These are the dedicated professionals who manage, process, and
                verify tax payments within the AERCA system. They ensure that
                taxpayers’ information is accurate, transactions are secure, and
                all updates are synchronized between the central database and
                local offices. Supporting transparent, efficient, and reliable
                tax operations for everyone.
              </p>
            </div>
          </div>
        </li>

        {/* Law & Authority */}
        <li>
          <a href="#">Law & Authority</a>
          <div className="Watch_dropdown">
            <div className="Watch_one">
              <Link to="/Law">
                <p>Law & Authority</p>
              </Link>
            </div>
            <br />
            <div className="Discrip5">
              <p>
                This page provides the latest legal updates, tax regulations,
                and official announcements from the Ethiopian Revenues and
                Customs Authority. It helps users stay informed about new laws,
                policy changes, and administrative directives that guide trade
                and taxation processes. Stay updated with trusted and verified
                information from official sources.
              </p>
            </div>
          </div>
        </li>

        {/* Trading Courses */}
        <li>
          <a href="#">Trading Courses</a>
          <div className="Vision_dropdown">
            <div className="Vision_one">
              <Link to="/Courses">
                <p>Trading Courses</p>
              </Link>
            </div>
            <br />
            <div className="Discrip6">
              <p>
                Learn the fundamentals of import, export, taxation, and customs
                management through interactive training materials. These courses
                are designed to help students, entrepreneurs, and government
                workers build the knowledge and skills needed to succeed in
                Ethiopia’s growing trade sector. Empowering learners with
                practical skills for smarter and more efficient trading.
              </p>
            </div>
          </div>
        </li>

        {/* Support */}
        <li>
          <a href="#">Support</a>
          <div className="Support_dropdown">
            <div className="Support_one">
              <Link to="/Community">
                <p>Community</p>
              </Link>
              <Link to="/Center">
                <p>Contact Center</p>
              </Link>
            </div>
          </div>
        </li>

        {/* Search */}
        <li style={{ position: "relative" }}>
          <a onClick={() => navigate("/Search")}>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </a>
          <div className="Vision_dropdown">
            <div className="Vision_one">
              <Link to="/Search">
                <p>Search</p>
              </Link>
            </div>
            <br />
            <div className="Discrip6">
              <p>
                Quick search
              </p>
            </div>
          </div>
        </li>

        {/* Cart with Counter */}
        <li style={{ position: "relative" }}>
          <a onClick={() => navigate("/Cart")}>
            <img src={cartIcon} alt="Cart" style={{ width: "30px" }} />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </a>
          <div className="Vision_dropdown">
            <div className="Vision_one">
              <Link to="/Cart">
                <p>Cart</p>
              </Link>
            </div>
            <br />
            <div className="Discrip6">
              <p>
                Your cart contains {totalItems} item
                {totalItems !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </li>

        {/* Signup*/}
        <li className="has-dropdown">
          <Link to="/Signup">
            <p>Signup</p>
          </Link>
        </li>

        {/* Signin */}
        <li className="has-dropdown">
          <Link to="/Signin">
            <p>Signin</p>
          </Link>
        </li>

        {/* Profile */}
        <li className="has-dropdown">
          <Link to="/Profile">
            <p>Profile</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}


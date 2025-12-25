import React from 'react'
import { Link } from "react-router-dom";
import "./section4.css";


export default function section4() {
  return (
    <>
      <div className="sec4-wrapper">
        <div className="Transitor">
          <h3>Transitor</h3>
          <p>
            Easly Know the tax of products. <br />
            Minimize your burden and business failure.
          </p>
          <div className="button5">
            <button className="but10">
              <Link className="no-underline4" to="/Transistorconnect">
                Learn more
              </Link>
            </button>
            <button className="but11">
              <Link className="no-underline4" to="/Transitors">
                Connect
              </Link>
            </button>
          </div>
        </div>
        <div className="Law">
          <h3>Law & Authority</h3>
          <p>Update timely and Accuratly.</p>
          <div className="button55">
            <button className="but101">
              <Link className="no-underline4" to="/Lawpost">
                Learn more
              </Link>
            </button>
            <button className="but111">
              
              <Link className="no-underline4" to="/Law">
                Watch
              </Link>
            </button>
          </div>
        </div>
      </div>
      <br />
    </>
  );
}

import React from 'react'
import "./teckspec.css"

import Teckimg from "./Images-Geez/10078.jpg"
import Teckimg2 from "./Images-Geez/10087.png"
import Teckimg3 from "./Images-Geez/12.png"

export default function teckspec() {
  return (
    <>
      <div className="Description">
        <h2>System Overview</h2>
        <p>The AERCA device is a voice-activated, Arduino-based IoT <br /> terminal designed to fetch and display real-time updates <br /> from a central Ethiopian tax and customs database. <br /> It communicates with a smartphone via Bluetooth and <br /> presents information on both a local LCD and a connected PC.</p>

        <div className="teckimg">
            <img src= {Teckimg} />

        </div>

    </div>
    <br />
    <br />
    <div className="Description2">
        <div className="teckimg2">
            <img src={Teckimg2} />

        </div>
        <div className="techdisc">
        <h2>Physical Design Considerations</h2>
        <ul>
            <li>Compact and portable (Arduino + LCD + Bluetooth in a small enclosure)</li>
            <li>Clear LCD visibility</li>
            <li>LED indicators on top/front for status</li>
        </ul>
        </div>

    </div>
    <br />
    <br />
    <div className="one">
        <h2>Size & Weight</h2>
        <img  className="width1"  src={Teckimg3} />
        <div className="one1">
        <h4>Weight</h4><p>0.76 pound(345 grams)</p>
        </div>
         <br />
        <br />
    </div>
    <br />
    <br />
    <br />
      <div className="part22">
        <h2>Get everyday tasks done <br /> using only your voice.</h2>
        <h2>Just say "Geez" or "Hey Geez" <br /> to start your request </h2>
        <h2>Protected by the strongest privacy of any intelligent assistant</h2>
    </div>
    </>
  )
}

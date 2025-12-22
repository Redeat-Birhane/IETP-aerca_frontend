import React from 'react'
import "./section5.css"
import Img1 from "./images-5/11.jpg"
import Img2 from "./images-5/12.jpg"
import Img3 from "./images-5/13.webp"
import Img4 from "./images-5/9.jpg"
import Img5 from "./images-5/2.jpg"
import Img6 from "./images-5/110.jpg"
import Img7 from "./images-5/17.webp"
import Img8 from "./images-5/18.jpg"
import Img9 from "./images-5/19.jpg"
import Img10 from "./images-5/110.jpg"

export default function section5() {
  return (
    <>
      <div class="sec5-wrapper">
        <div class="image-wrapper">
          <img src={Img1} />
          <img src={Img2} />
          <img src={Img3} />
          <img src={Img4} />
          <img src={Img5} />
          <img src={Img6} />
          <img src={Img7} />
          <img src={Img8} />
          <img src={Img9} />
          <img src={Img10} />
        </div>
      </div>

      <div class="slider-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </>
  );
}

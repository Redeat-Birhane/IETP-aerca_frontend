import React from 'react'
import "./section6.css"
import Fitnessimg from "./images-6/12.jpg"
import podimg from "./images-6/11.jpg"
import Teckimg from "./images-6/14.jpg"
import Dreamimg from "./images-6/15.jpg"
import Musicimg  from "./images-6/13.png"
import Fancyimg from "./images-6/16.jpg"



export default function section6() {
  return (
    <>
      <div class="sec6-wrapper">
        <div class="inner-wrapper">
          <div class="card-fitness">
            <div class="overlay1"></div>
            <button class="watch-btn1">
              <a href="https://www.youtube.com/watch?v=dh-EC1tVNRs">
                Watch now
              </a>
            </button>
            <img class="fitness-img" src={Fitnessimg} />
            <div class="card-content1">
              <p class="title1">Strong and Calm Combos for Busy Days</p>
              <p class="subtitle1"> Fitness+</p>
            </div>
          </div>

          <div class="card-podcast">
            <div class="card-content2">
              <img class="pod-img" src={podimg} />
              <p class="title2">
                Meri Podcast
                <br />
                Interview
              </p>
              <p class="subtitle2">Music</p>
            </div>
            <div class="overlay2"></div>
            <button class="watch-btn2">
              
              <a href="https://www.youtube.com/results?search_query=meri+podcast">
                Listen now
              </a>
            </button>
          </div>

          <div class="card-teck">
            <img class="teck-img" src={Teckimg} />
            <button class="watch-btn3">
              <a href="https://www.youtube.com/watch?v=flY9daaR9Do">Play now</a>
            </button>
            <div class="overlay3"></div>
            <div class="card-content3">
              <p class="title3">Advanced Tech</p>
              <p class="subtitle3">Future</p>
            </div>
          </div>

          <div class="card-dream">
            <img class="Dream-img" src={Dreamimg} />
            <button class=" watch-btn4 ">
              <a href="https://www.youtube.com/watch?v=pBxSTCocHns">
                Watch now{" "}
              </a>
            </button>
            <div class="overlay4 "></div>
            <div class="card-content4 ">
              <p class="title4 ">Build Your Future</p>
              <p class="subtitle4 ">Dream</p>
            </div>
          </div>

          <div class="card-music ">
            <div class="card-content5 ">
              <img class="Music-img " src={Musicimg} />
              <p class="title5">A-List Pop</p>
              <p class="subtitle5">Music</p>
            </div>
            <div class="overlay5"></div>
            <button class="watch-btn5">
              {" "}
              <a href="https://www.youtube.com/watch?v=LVbUNRwpXzw&list=RDLVbUNRwpXzw&start_radio=1">
                Listen now
              </a>
            </button>
          </div>

          <div class="card-fancy">
            <img class="fancy-img" src={Fancyimg} />
            <div class="card-content6">
              <p class="title6">Life Style</p>
              <p class="subtitle6">Fancy</p>
            </div>
            <div class="overlay6"></div>
            <button class="watch-btn6">
              {" "}
              <a href="https://www.youtube.com/watch?v=Ad9fF-vbEZw">
                Play now
              </a>
            </button>
          </div>
        </div>
      </div>
      <br />
    </>
  );
}

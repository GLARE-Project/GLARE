import React, { useEffect } from 'react';
import { Rehowl, Play } from 'rehowl'

import { useHistory } from "react-router-dom";
import screenfull from "screenfull";
import './home.scss';


function setUpDeviceMotion() {
  // To make sure the device supports DeviceMotionEvent and can request it
  // Must check for Sarafi
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    // iOS 13+
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response !== "granted") {
          // permission not granted
          alert("Motion access is required to view this site, Please delete your website cache in Settings -> Safari and reload.");
        }
      })
      .catch(console.warn);
  }
}

function setFullScreen() {

  if (screenfull.isEnabled) {
    screenfull.request();
  }

  scrollToTop();
  scrollToBottom();
}

function setOrientation() {
  if (typeof window.screen.orientation !== "undefined") {
    var locOrientation = window.screen.lockOrientation || window.ScreenOrientation || window.screen.msLockOrientation || window.screen.orientation.lock || null;
    if (locOrientation === window.ScreenOrientation) {
      console.log("Firefox detected - lack of orientation support");
    } else if (locOrientation.call(window.screen.orientation, 'landscape')) {
    } else {
      console.warn("There was a problem in locking the orientation");
    }
  } else {
    console.warn("Screen Orientation not supported");
    // if mobile we can use CSS to rotate or a splash screen to let the user to know
    document.querySelector("html").classList.add("ios-cant-orient");
  }
}

function scrollToTop() {
  window.scrollTo(0, 0);
  window.scrollTo(0, 1);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function Home() {

  let history = useHistory();

  function handleClick() {
    setFullScreen();
    setUpDeviceMotion();
    history.push("intro");
  }

  useEffect(() => {
      setOrientation();
      document.body.classList.add("homepage");
      return () =>  document.body.classList.remove("homepage");
  }, []);

  return (
    <React.Fragment>
      <Rehowl src={process.env.PUBLIC_URL + '/audio/intro/Introduction.m4a'}>{
        ({ howl }) => <Play howl={howl} />
      }</Rehowl>
      <div className="homepage">
        <div id="buttona" >
          <button onClick={handleClick} type="button">BEGIN TOUR</button>
        </div>
        <div id="introTxt">An Augmented May 4<sup>th</sup> Experience</div>
      </div>
    </React.Fragment>
  );
}

export default Home;


import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useHowl, Play } from 'rehowl';
import { useHistory } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMapMarkerAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { Context } from "./../../index";
import "./intro.scss";

library.add(faBars, faMapMarkerAlt, faEye);

function Intro() {
    let history = useHistory();
    const [stepNum, SetStepNum] = useState(0);
    const IntroCount = parseInt(localStorage.getItem("introCount"));
    const { onCampus, setOnCampus } = useContext(Context);
    const [StepData, setStepData] = useState([]);
    const audioPrefix = onCampus ? "_inSitu" : "_remote";
    const { howl } = useHowl({ src: process.env.PUBLIC_URL + '/audio/intro/' + (stepNum + 1) + audioPrefix + '.m4a', html5: true })


    const handleFinish = useCallback(() => {
        localStorage.setItem("introCount", StepData.length);
        history.replace("/map");
    }, [StepData.length, history]);

    const checkCamera = useCallback(() => {
        // check to see if the devices are undefine
        if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        exact: "environment" // the front camera, if prefered
                    }
                }
                // if constains don't pass for camera and is production - it isn't on campus
            }).catch(err => {
                if (process.env.NODE_ENV !== 'production') setOnCampus(false);
            });
        } else {
            if (process.env.NODE_ENV !== 'production') setOnCampus(false);
        }
    }, [setOnCampus]);

    const checkPos = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(() => setOnCampus(true), () => setOnCampus(false),
                {
                    enableHighAccuracy: true,
                    timeout: Infinity,
                    maximumAge: 0
                });
        } else {
            setOnCampus(false);
        }
    }, [setOnCampus]);


    const handleBack = () => {
        if (stepNum > 0) {
            var count = stepNum - 1;
            SetStepNum(count);
            localStorage.setItem("introCount", count);
        } else {
            history.push("/");
        }
    };

    const handleNext = () => {
        var count = stepNum + 1;
        if (StepData.length - 1 > stepNum) {
            SetStepNum(count);
            localStorage.setItem("introCount", count);
        } else {
            // finished 
            handleFinish();
        }

    };

    const addIcons = (text) => {
        const pattern = /(\[icon\])/g;
        const splitText = text.split(pattern);
        const matches = text.match(pattern);

        return splitText.reduce((arr, element) => {
            if (!element) return arr;

            if (matches.includes(element)) {
                return [...arr, StepData[stepNum].icon];
            }

            return [...arr, element];
        });
    };

    useEffect(() => {
        document.body.classList.add("IntroPage");
        document.body.style.setProperty('--intro-background',
            "url(" + process.env.PUBLIC_URL + "/../../images/intro/Background_Tile.png)"
        );
        checkPos();
        checkCamera();
        setStepData(onCampus ? StepsMobile : Steps360)
        // incase a user leaves and wants to come back
        if (IntroCount > 0 && StepData.length > 0) {
            // make sure they aren't finished
            if (IntroCount >= StepData.length)
                handleFinish();
            else
                SetStepNum(IntroCount);
        }
        return () => document.body.classList.remove("IntroPage");
    }, [StepData, onCampus, IntroCount, checkCamera, checkPos, handleFinish]);

    if (StepData.length > 0 && StepData.length > stepNum)
        return (
            <div className="intro">
                <Play howl={howl} />
                <h1 className="title">Step {stepNum + 1}</h1>
                {StepData.length - 1 > stepNum && (<p className="skipBtn" onClick={handleFinish}>skip</p>)}
                <div className="content">
                    <img className="icons" alt="icon" src={process.env.PUBLIC_URL + "/images/intro/" + StepData[stepNum].image} />
                    <p className="description">{addIcons(StepData[stepNum].description)}</p>
                </div>
                <button onClick={handleBack} className="btn-back">Back</button>
                <button onClick={handleNext} className="btn-next">{StepData.length - 1 > stepNum ? "Next" : "Begin Tour"}</button>
            </div>
        );
    else
        return (<React.Fragment>Loading...</React.Fragment>)
}

const StepsMobile = [
    {
        description: "Turn the volume up on your device.",
        image: "Step1.png"
    },
    {
        description: "Use the map to navigate to each hotspot. If the map does not come up automatically, you can get there by clicking the [icon] icon.",
        icon: <FontAwesomeIcon color={"white"} icon={faMapMarkerAlt} />,
        image: "Step2.png"
    },
    {
        description: "After arriving at the hotspot locate the foot-guide on the ground and point your camera in the direction indicated.",
        image: "Step3.png"
    },
    {
        description: "After pointing your camera in  the instructed direction, click on the [icon] icon to generate augmented images on the screen, and listen for the audio clip.",
        icon: <FontAwesomeIcon color={"white"} icon={faEye} />,
        image: "Step4.png"
    },
    {
        description: "After each hotspot you can find more information unique to that location by clicking on the [icon] icon and viewing each menu item.",
        icon: <FontAwesomeIcon color={"white"} icon={faBars} />,
        image: "Step5.png"
    }
];

const Steps360 = [
    StepsMobile[0],
    {
        description: "Click on each hotspot [icon] on the map to access augmented reality images and information about the site.",
        icon: <FontAwesomeIcon color={"white"} icon={faMapMarkerAlt} />,
        image: "Step2-remote.png"
    },
    {
        description: "Each hotspot shows an historical image, displayed on a 360 image from today. You can use your mouse to look around the picture. Use the various icons to access additional information or to return to the map.",
        image: "Step3-remote.png"
    }
];


const HelpElement = ({ description, icon, index }) => {
    const pattern = /(\[icon\])/g;
    const matchText = description.match(pattern);

    return (<li key={index} >
        {description.split(pattern)
            .reduce((accumulator, currentValue) => {
                // if no icon return the text
                if (!icon) return accumulator;

                // if current frament is the [icon]
                if (matchText.includes(currentValue))
                    // convert to a JS Element
                    return [<>{accumulator}{icon}</>];
                else
                    // if not [icon just add the text]
                    return [...accumulator, currentValue];
            }
            )}
    </li>);
}

export const ProcessedSteps = () => {
    const { onCampus } = useContext(Context);
    const StepData = onCampus ? StepsMobile : Steps360;
    return StepData.map((step, index) => {
        return (
            <HelpElement {...step} index={index} key={index} />
        )
    });
}

export default Intro;
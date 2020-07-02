import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from "react-router-dom";
import BackButton from '../../components/BackButton';
import AudioPlayer from "./../../components/AutoPlayer";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./main.scss"
import { Context } from "./../../index";

library.add(faTimes);

const Main = React.memo(function Main(props) {
    let query = new URLSearchParams(useLocation().search);
    let name = query.get("name");
    let type = query.get("type");
    const [faded, setFaded] = useState(false);
    const { markerData } = useContext(Context);


    // set local to component so if we set the inverval
    // and leave, we can clear it
    let fadeEffect;

    const StorageData = markerData.filter(marker => marker.name === name);

    function fadeOutEffect(time) {
        const fadeTarget = document.querySelector("#textCtn");
        const rateOfFade = 200;
        fadeEffect = setInterval(() => {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0) {
                fadeTarget.style.opacity -= rateOfFade / time;
            } else {
                setFaded(true);
                clearInterval(fadeEffect);
            }
        }, rateOfFade);
    }

    const handleFade = (time) => {
        fadeOutEffect(time * 1.3);
    }


    useEffect(() => {
        // remove the image from loading in from the homepages
        document.body.classList.add("scrollable-body");

        return () => {
            clearInterval(fadeEffect);
            document.body.attributes.removeNamedItem("style");
            document.body.classList.remove("scrollable-body");
        }       
    }, []); // ignore rerun from fade state update

    return(
        <React.Fragment>
            {StorageData.main_pages.map((main, index) => {
                if (type === main.title) {
                    document.body.style.backgroundImage = 'url(' + process.env.PUBLIC_URL + main.background_image + ')';
                    return(
                        <main key={index}>
                            <FontAwesomeIcon 
                                className={[
                                    "overlay-icon", "closeBtn",
                                    faded ? "hidden" : "visible"
                                ].join(' ')}
                                icon={faTimes}
                                onClick={() => {fadeOutEffect(200)}}
                            />
                            <div className={faded ? "hidden" : "visible"} id="textCtn">
                                <h1 id="title">{ main.title }</h1>
                                <p id="text">{ main.description }</p>
                            </div>
                            <AudioPlayer source={process.env.PUBLIC_URL + main.descriptive_audio} cb={time => handleFade(time)}/>
                            <BackButton history={props.history}/>
                        </main>
                    );
                }
                return null;
            })}
        
        </React.Fragment>
    );

});

export default Main;

import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from "react-router-dom";
import BackButton from '../../components/BackButton';
import AudioPlayer from "./../../components/AutoPlayer";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Frame, useAnimation } from 'framer'
import "./main.scss"
import { Context } from "./../../index";

library.add(faTimes);

const Main = ({ history }) => {
    const query = new URLSearchParams(useLocation().search);
    const name = query.get("name");
    const type = query.get("type");

    const [content, setContent] = useState([]);


    const [audioTime, setAudioTime] = useState(0);
    const [isFaded, setFaded] = useState(false);

    const { markerData, tourBasePath } = useContext(Context);

    const controls = useAnimation();

    const FADE_MULTIPLIER = 1.3; // 130% to make content readable before it is completely gone

    // TODO: figure how to do onRestart for audio and to set opacity back to inital

    const handleFade = (time) => {
        controls.start({
            opacity: 0,
            transition: { duration: time / 1000 }, // make everything in terms of a milliseconds
        }).then(() => setFaded(true))
    }

    const startFade = () => {
        handleFade(audioTime * FADE_MULTIPLIER);
    }

    const stopFade = () => {
        controls.stop();
    }

    useEffect(() => {
        // remove the image from loading in from the homepages
        document.body.classList.add("scrollable-body");
        return () => {
            document.body.attributes.removeNamedItem("style");
            document.body.classList.remove("scrollable-body");
        }
    }, []); // ignore rerun from fade state update

    useEffect(() => { // to set the content 
        const { main_pages } = markerData.filter(marker => marker.name === name).pop() || { main_pages: [] };
        if (JSON.stringify(main_pages) !== JSON.stringify(content)) setContent(main_pages);
    }, [content, markerData, name]);

    return (
        <React.Fragment>
            {content.map((main, index) => {
                if (type === main.title) {
                    document.body.style.backgroundImage = 'url(' + tourBasePath + main.background_image + ')';
                    return (
                        <main key={index}>
                            <FontAwesomeIcon
                                className={[
                                    "overlay-icon", "closeBtn",
                                    isFaded ? "hidden" : "visible"
                                ].join(' ')}
                                icon={faTimes}
                                onClick={() => {
                                    handleFade(200);
                                }}
                            />
                            <Frame
                                position={"relative"}
                                animate={controls}
                                className={[
                                    "textCtn",
                                    isFaded ? "hidden" : "visible"
                                ].join(' ')}
                                initial={{
                                    opacity: 1,
                                    width: 'calc(100% - 16em)'
                                }}
                                exit={{ opacity: 0 }}
                            >
                                <h1 id="title">{main.title}</h1>
                                <p id="text">{main.description}</p>
                            </Frame>
                            <AudioPlayer 
                                source={tourBasePath + main.descriptive_audio} 
                                onLoad={time => setAudioTime(time)} onPause={stopFade} onPlaying={startFade} 
                            />
                            <BackButton history={history} />
                        </main>
                    );
                }
                return null;
            })}

        </React.Fragment>
    );

};

export default Main;

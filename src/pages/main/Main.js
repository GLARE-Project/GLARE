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

    const [faded, setFaded] = useState(false);

    const { markerData } = useContext(Context);

    const controls = useAnimation();

    const FADE_MULTIPLIER = 1.3; // 130% to make content readable before it is completely gone

    const handleFade = (time) => {
        controls.start({
            opacity: 0,
            transition: { duration: (time * FADE_MULTIPLIER) / 1000 }, // make everything in terms of a milliseconds
        }).then(() => setFaded(true));
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
                    document.body.style.backgroundImage = 'url(' + process.env.PUBLIC_URL + main.background_image + ')';
                    return (
                        <main key={index}>
                            <FontAwesomeIcon
                                className={[
                                    "overlay-icon", "closeBtn",
                                    faded ? "hidden" : "visible"
                                ].join(' ')}
                                icon={faTimes}
                                onClick={() => {
                                    handleFade( 200 / FADE_MULTIPLIER);
                                }}
                            />
                            <Frame
                                position={"relative"}
                                animate={controls} 
                                className="textCtn"
                                initial={{
                                    opacity: 1,
                                    width: 'calc(100% - 16em)' 
                                }}
                            >
                                <h1 id="title">{main.title}</h1>
                                <p id="text">{main.description}</p>
                            </Frame>
                            <AudioPlayer source={process.env.PUBLIC_URL + main.descriptive_audio} onLoad={time => handleFade(time)} onPause={controls.stop} />
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

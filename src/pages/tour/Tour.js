import React, { useEffect, useState, useContext, Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import { Ellipsis } from 'react-spinners-css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { Html } from 'drei'
import AudioPlayer from "./../../components/AutoPlayer";
import MenuOverlay from "../../components/Menu/MenuOverlay";
import { Context } from "./../../index";
import { AnimateCamera } from "./AnimateCamera"
import CubeMapVR from "./CubeMapVR";
import SphereMapAR from "./SphereMapAR";
import './tours.css';

library.add(faMapMarkerAlt, faEye);

const Fallback = () => (
    <Html>
        <Ellipsis className="spinner" color="#fff" />
    </Html>
);

const Tour = ({ history }) => {
    const query = new URLSearchParams(useLocation().search);
    const INITAL_STATE = { name: "", start_audio: "" };

    const { onCampus, markerData } = useContext(Context);
    const [StorageData, setStoredData] = useState(INITAL_STATE);
    const { name, start_audio } = StorageData;

    const [isRotating, setIsRoating] = useState(false);

    function scrollToTop() {
        window.scrollTo(0, 0);
        window.scrollTo(0, 1);
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    useEffect(() => {
        const markerName = query.get("name");
        const data = markerData.filter(marker => marker.name === markerName).pop();
        // if data hasn't loaded yet, it'll be undefined. So ignore it then and wait for it to load
        if (typeof data !== 'undefined') {
            // we make sure there exists INITAL_STATE if they don't exist in the data
            const mutatedData = { ...INITAL_STATE, ...data };
            if (JSON.stringify(StorageData) !== JSON.stringify(mutatedData)) setStoredData(mutatedData)
        }
        // used to get rid of the bar in safari
        scrollToTop();
        scrollToBottom();
    }, [markerData, query, StorageData, INITAL_STATE]);

    return (
        <div id="container" style={{ overflow: "hidden" }}>
            <MenuOverlay history={history} data={StorageData}>

                {onCampus && (<video autoPlay={true} muted="" playsInline="" id="videoElement" />)}

                <Canvas id="canvas" camera={{ position: [0, 0, 1], fov: 45 }}>
                    <Suspense fallback={<Fallback />}>
                        {onCampus ?
                            <SphereMapAR data={StorageData} /> :
                            <CubeMapVR data={StorageData} />
                        }
                        <AnimateCamera isRotating={isRotating} setIsRoating={setIsRoating} />
                    </Suspense>
                </Canvas>

                <div onSelect={e => e.preventDefault()} id="title-ctn" >
                    {name}
                </div>

                <div id="fixed-footer">
                    <AudioPlayer name={name} source={start_audio} />
                </div>

                <div className="overlay-ctn-show">
                    <FontAwesomeIcon
                        className="overlay-icon"
                        icon={faEye}
                        onClick={() => setIsRoating(true)}
                    />
                </div>
                <div className="overlay-ctn-map">
                    <FontAwesomeIcon
                        className="overlay-icon"
                        icon={faMapMarkerAlt}
                        onClick={() => history.replace("/map")}
                    />
                </div>
            </MenuOverlay>
        </div>
    );
};


export default Tour;



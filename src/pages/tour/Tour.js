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

    const { onCampus, markerData } = useContext(Context);
    const [StorageData, setStoredData] = useState(null);

    function scrollToTop() {
        window.scrollTo(0, 0);
        window.scrollTo(0, 1);
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    function focusCamera() {

    }

    useEffect(() => {
        const name = query.get("name");
        const data = markerData.filter(marker => marker.name === name).pop();
        setStoredData(data);
        // used to get rid of the bar in safari
        scrollToTop();
        scrollToBottom();
    }, [markerData, query]);

    if (StorageData != null)
        return (
            <div id="container" style={{ overflow: "hidden" }}>
                <MenuOverlay history={history} data={StorageData}>

                    {onCampus && (<video autoPlay={true} muted="" playsInline="" id="videoElement" />)}

                    <Canvas id="canvas" camera={{ position: [0, 0, 1], fov: 45 }}>
                        <Suspense fallback={<Fallback />}>
                            {onCampus ? <SphereMapAR data={StorageData} /> : <CubeMapVR data={StorageData} />}
                        </Suspense>
                    </Canvas>

                    <div onSelect={e => e.preventDefault()} id="title-ctn" >
                        {StorageData.name}
                    </div>

                    <div id="fixed-footer">
                        <AudioPlayer name={StorageData.name} source={StorageData.start_audio} />
                    </div>

                    <div className="overlay-ctn-show">
                        <FontAwesomeIcon
                            className="overlay-icon"
                            icon={faEye}
                            onClick={focusCamera}
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
    else return null
};


export default Tour;



import React, { useEffect, useState, useContext, Suspense, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { Ellipsis } from 'react-spinners-css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEye, faChevronRight, faChevronLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { Html, useProgress } from 'drei'
import AudioPlayer from "./../../components/AutoPlayer";
import MenuOverlay from "../../components/Menu/MenuOverlay";
import { Context } from "./../../index";
import { AnimateCamera } from "./AnimateCamera"
import { CubeMapVR, SphereMapAR } from '@chrisdesigns/glare-viewer'
import { getBaseHotspots, tooCloseHotspotList } from "./../../utils/gpsManager";
import './tours.css';

library.add(faMapMarkerAlt, faEye, faChevronRight, faChevronLeft, faBell);
    
const Loader = () => {
    const { active } = useProgress();
    if (active) {
        return (
            <Html center>
                <Ellipsis className="spinner" color="#fff" />
            </Html>
        )
    } else return null
};

const Tour = ({ history}) => {
    
    const query = new URLSearchParams(useLocation().search);
    const INITIAL_STATE = { name: "", start_audio: "" };

    const { onCampus, markerData, tourBasePath } = useContext(Context);
    const [StorageData, setStoredData] = useState(INITIAL_STATE);
    const { name, start_audio } = StorageData;

    const [isRotating, setIsRoating] = useState(false);

    const videoRef = useRef();

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
            // we make sure there exists INITIAL_STATE if they don't exist in the data
            const mutatedData = { ...INITIAL_STATE, ...data };
            if (JSON.stringify(StorageData) !== JSON.stringify(mutatedData)) setStoredData(mutatedData)
        }
        // used to get rid of the bar in safari
        scrollToTop();
        scrollToBottom();
    }, [markerData, query, StorageData, INITIAL_STATE]);

    return (
        <div id="container" style={{ overflow: "hidden" }}>
            <MenuOverlay data={StorageData}>

                {onCampus && (<video ref={videoRef} autoPlay={true} muted playsInline id="videoElement" />)}

                <Canvas id="canvas" camera={{ position: [0, 0, 1], fov: 45 }}>
                    <Suspense fallback={<Loader />}>
                        {onCampus ?
                            <SphereMapAR data={StorageData} video={videoRef} tourBasePath={tourBasePath} /> :
                            <CubeMapVR data={StorageData} tourBasePath={tourBasePath} />
                        }
                        <AnimateCamera isRotating={isRotating} setIsRoating={setIsRoating} />
                    </Suspense>
                </Canvas>

                <HotspotController baseName={query.get("name")} handleData={setStoredData} data={StorageData} markerData={markerData} onCampus={onCampus}/>

                <div id="fixed-footer">
                    <AudioPlayer name={name} source={tourBasePath + start_audio} />
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

const HotspotController = ({ baseName, data, handleData, markerData, onCampus }) => {

    const [hostspotIndex, setHostspotIndex] = useState(0);

    //TODO: Sound add a system in markers.json to pick what is a "basestation"
    // it can find the points that are too close and let you pick one to be the base

    // the hotspots that act as the starting node
    const baseHotspots = getBaseHotspots(markerData);

    const baseHotspot = baseHotspots.filter(marker => marker.name === baseName).pop();

    const locationQueue = tooCloseHotspotList(baseHotspot, markerData, onCampus);

    const CAN_USE_QUEUE = ( locationQueue.length > 0 && hostspotIndex !== 0);
    
    const HAS_RIGHT_DATA = hostspotIndex < locationQueue.length;
    const HAS_LEFT_DATA = hostspotIndex > 0;
    const { name } = CAN_USE_QUEUE ? locationQueue[hostspotIndex - 1] : data;

    const handleLocation = direction => {
        if(direction === "next" &&  HAS_RIGHT_DATA) {
            setHostspotIndex(currentIndex => {
                const nextIndex = currentIndex + 1;
                handleData( locationQueue[currentIndex] );
                return nextIndex;
            });
        } else if (direction === "back" && HAS_LEFT_DATA) {
            setHostspotIndex(currentIndex => {
                const previousIndex = currentIndex - 1;
                handleData( CAN_USE_QUEUE ? locationQueue[previousIndex] : data);
                return previousIndex;
            });
            
        }
    }
    
    return (
        <div className="hotspotControls">
            {locationQueue.length > 0 && HAS_LEFT_DATA && (<div className="control-left">
                <FontAwesomeIcon
                    className="overlay-icon"
                    icon={faChevronLeft}
                    onClick={() => {handleLocation("back")}}
                />
            </div>)}
            <div onSelect={e => e.preventDefault()} id="title-ctn" >
                { name }
            </div>
            {locationQueue.length > 0 && HAS_RIGHT_DATA && (<div className="control-right">
                <FontAwesomeIcon
                    className="overlay-icon"
                    icon={faChevronRight}
                    onClick={() => {handleLocation("next")}}
                />
            </div>)}
        </div>
    )
};

export default Tour;



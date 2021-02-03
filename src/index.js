import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, useLocation } from "react-router-dom"
import * as serviceWorker from './utils/serviceWorker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTitle } from 'react-use';

export const Context = React.createContext();


function Provider({ children }) {
    // controls if VR or AR is being provided
    const [onCampus, setOnCampus] = useState(false);
    // controls the modal for the menu of the tour page
    // it is here so that /tour -> /library -> /tour will result in the menu being open still
    const [modelOpen, toggleModel] = useState(false);

    // multi-tour functionality, if the tour is passed in use it
    // otherwise, it should default to the first tour or /markers.json
    const location = useLocation();
    const [currentTour, setTour] = useState(null);

    // the marker.json data serialized into state
    const [markerData, setData] = useState([]);
    const [currentMarker, setCurrentMarker] = useState(null);

    const { project_name } = JSON.parse(localStorage.getItem("markerData")) || { project_name: "" };
    useTitle(project_name);


    const fetchMarkerData = useCallback(
        async (tourName) => {
            const tourBasePath = tourName === null ? "" : tourName;

            // make sure no path traveral exists
            const alphanumeric = /^[a-zA-Z0-9]+$/;
            if (tourBasePath === "" || alphanumeric.test(tourBasePath)) {
                await fetch(process.env.PUBLIC_URL + tourBasePath + "/markers.json")
                    .then(res => res.json())
                    .then(res => {
                        if (res.hasOwnProperty("hotspots")) {

                            // update the broswer's tour path whenever it changes
                            if (JSON.stringify(tourName) !== JSON.stringify(localStorage.getItem("tourBasePath")) )
                                localStorage.setItem("tourBasePath", JSON.stringify(tourName));

                            // only set the data if it isn't equal to the current version
                            if (JSON.stringify(res["hotspots"]) !== JSON.stringify(markerData))
                                setData(res["hotspots"]);

                            // state data might need set again, but localstorage usually propigates fine
                            if (localStorage.getItem("markerData") !== JSON.stringify(res)) {
                                localStorage.setItem("markerData", JSON.stringify(res));
                                // reload so that the localstorage can be used
                                window.location.reload();
                            }

                        }
                    })
                    .catch(err => console.error("[Error]: " + err));
            } else {
                console.error("[Error]: Path traveral attempted, could not get marker data");
                // TODO: redirect to the default path of /markers.json file if this occurs
            }
        },
        [markerData],
    );

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tourName = query.get("tour");

        // if a new tour parameter passed in then set it and grab its data
        if (currentTour !== tourName && location.pathname === "/") setTour(tourName);


        // this is used to keep the markerdata persistent
        // if on the homepage, look for the tour parameter to fetch the appropriate data
        if (location.pathname === "/") {            
            fetchMarkerData(tourName);
        // if all else fails, get data is there are none
        // this is so if the person reloads the page, it will pull the marker data from localstorage
        } else if (markerData.length === 0 && localStorage.getItem("markerData") !== null) {
            const previousPath = JSON.parse(localStorage.getItem("tourBasePath"));
            // the path so that other parts of the app can use it
            setTour(previousPath);
            // then get the data needed
            fetchMarkerData(previousPath);
        }

    }, [location, currentTour, markerData, fetchMarkerData]);

    return (
        <Context.Provider value={{
            onCampus,
            setOnCampus: val => { if (val !== onCampus) setOnCampus(val) },
            modelOpen,
            toggleModel: val => toggleModel(val),
            markerData,
            currentMarker,
            setCurrentMarker: val => setCurrentMarker(val),
            // can be used so the content will be pulled from the same folder
            tourBasePath: currentTour === null ? "" : (currentTour + "/")
        }}
        >
            {children}
            <ToastContainer />
        </Context.Provider>
    );
}

ReactDOM.render(
    <BrowserRouter basename={window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'))}>
        <Provider>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('root'));

serviceWorker.register();
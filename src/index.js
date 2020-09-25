import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom"
import * as serviceWorker from './utils/serviceWorker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTitle } from 'react-use';
import { CookiesProvider } from "react-cookie";



export const Context = React.createContext();


function Provider({ children }) {
    const [onCampus, setOnCampus] = useState(false);
    const [modelOpen, toggleModel] = useState(false);

    const [markerData, setData] = useState([]);

    const { project_name } = JSON.parse(localStorage.getItem("markerData")) || { project_name: "" };
    useTitle(project_name);

    useEffect(() => {
        const fetchMarkerData = async () => {
            await fetch(process.env.PUBLIC_URL + "/markers.json")
                .then(res => res.json())
                .then(res => {
                    if (res.hasOwnProperty("hotspots")) {
                        setData(res["hotspots"]);
                        // state data might need set again, but localstorage usually propigates fine
                        if (localStorage.getItem("markerData") !== JSON.stringify(res)) {
                            localStorage.setItem("markerData", JSON.stringify(res));
                            // reload so that the localstorage can be used
                            window.location.reload(false);
                        }

                    }
                })
                .catch(err => console.error("[Error]: " + err));
        };
        fetchMarkerData();
    }, []);

    return (
        <Context.Provider value={{
            onCampus,
            setOnCampus: val => setOnCampus(val),
            modelOpen,
            toggleModel: val => toggleModel(val),
            markerData
        }}
        >
            {children}
            <ToastContainer />
        </Context.Provider>
    );
}

ReactDOM.render(
    <CookiesProvider>
    <Provider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
    </CookiesProvider>
    ,
    document.getElementById('root'));

serviceWorker.register();
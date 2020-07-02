import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom"
import * as serviceWorker from './utils/serviceWorker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Context = React.createContext();


function Provider({ children }) {
    const [onCampus, setOnCampus] = useState(false);
    const [modelOpen, toggleModel] = useState(false);

    const [markerData, setData] = useState([]);

    useEffect(() => {
      const fetchMarkerData = async () => {
          await fetch(process.env.PUBLIC_URL + "/markers.json")
          .then(res => res.json() )
          .then(res => {
              if(res.hasOwnProperty("hotspots")) {
                setData(res["hotspots"]);
                localStorage.setItem("markerData", JSON.stringify(res));
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
            { children }
            <ToastContainer />
        </Context.Provider>
    );
}

ReactDOM.render(
    <Provider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
, 
document.getElementById('root'));

serviceWorker.register();
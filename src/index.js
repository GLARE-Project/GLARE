import React, { useState } from 'react';
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
    return (
        <Context.Provider value={{
            onCampus,
            setOnCampus: val => setOnCampus(val),
            modelOpen,
            toggleModel: val => toggleModel(val)
        }}
        >
            { children }
            <ToastContainer />
        </Context.Provider>
    );
}

ReactDOM.render(
    <Provider>
        <BrowserRouter basename={process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : "/"}>
            <App />
        </BrowserRouter>
    </Provider>
, 
document.getElementById('root'));

serviceWorker.register();
import React, { useEffect, useContext } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {ProcessedSteps} from './../intro/Intro';
import './help.scss'
import { Context } from '../../index';

library.add(faTimes);

function Help({ history }) {

    const { onCampus, setOnCampus } = useContext(Context);

    useEffect(() => {
        document.body.classList.add("help-body");

        return () => {
            document.body.classList.remove("help-body");
        }       
    }, []);
    return (
        <React.Fragment>
            <h1 className="title">Help</h1>
            <h2 className="subtitle">How to Use the Augmented Reality Tour</h2>
            <ol className="rules" type="1">
                <ProcessedSteps />
            </ol>
            {process.env.NODE_ENV !== 'production' && <>
                <label className="debug">
                Emulate On-Campus Experience:
                <input
                    name="isOnCampus"
                    type="checkbox"
                    checked={onCampus}
                    onChange={()=> setOnCampus(isOnCampus => !isOnCampus)}
                />
                </label>
            </>}
            <FontAwesomeIcon 
                className={["overlay-icon", "closeBtn"].join(' ')}
                icon={faTimes}
                onClick={() => history.goBack()}
            />
        </React.Fragment>
    );
}

export default Help;
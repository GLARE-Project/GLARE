import React, { useContext } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { Context } from "./../index";

library.add(faUndoAlt);

function BackButton({history}) {
    const {toggleModel} = useContext(Context);
    const handleBack = () => {
        if (history.location.pathname !== "/map")
            toggleModel(true);
        history.goBack();
    };
    return(
        <div id="overlaybuttonback">
            <FontAwesomeIcon className={"overlay-icon"}
                alt="back-arrow"
                color={"white"}
                icon={faUndoAlt}
                onClick={handleBack}
                style={styles.backBtn}
            />
        </div>
    );
}

const styles = {
    backBtn: {
        position: "fixed",
        left: ".25em",
        bottom: ".25em",
        zIndex: 10
    }
}
export default BackButton;

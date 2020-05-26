import React, { useContext } from 'react';
import Modal from 'react-modal';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import './Menu.scss';
import { Context } from "./../../index";

Modal.setAppElement('#root');
library.add(faBars, faTimes);


function MenuOverlay({children, history, data}){
    const {modelOpen, toggleModel} = useContext(Context);
    return (
        <React.Fragment>
            <Modal
            isOpen={modelOpen}
            contentLabel="Menu Content"
            className="Modal"
            overlayClassName="Overlay"
            closeTimeoutMS={250}
            aria-expanded={modelOpen}
            >
            <div className="menu-content">
                <p className="menu-title">Menu</p>
                <div className="menu-ctn">
                    <MenuComponent
                    history={history}
                    name={data.name}
                    pages={data.main_pages}/>
                    <div className="media-menu">
                        <a 
                        //href={"/XR/media?name=" + data.name}
                        className="menu-item"
                        onClick={() => history.push("/media?name=" + data.name)}>
                            Library
                        </a>
                        <a
                        //href="#help"
                        className="menu-item-last" 
                        onClick={() => history.push("/help")}>
                            Help
                        </a>
                    </div>
                </div>
            </div>
            <div style={styles.closeBtn}>
                    <FontAwesomeIcon 
                        className={["overlay-icon", "closeBtn"].join(' ')}
                        icon={faTimes}
                        onClick={() => toggleModel(false)}
                    />
                </div>
            </Modal>
            <div id="overlay-content">
                <div style={styles.overlayBtn}>
                    <FontAwesomeIcon 
                        className="overlay-icon"
                        icon={faBars}
                        onClick={() => toggleModel(!modelOpen)}
                    />
                </div>
                {children}
            </div>
        </React.Fragment>
    );
}


const MenuComponent = React.memo(function MenuComponent({name, pages, history}) {
    const { toggleModel } = useContext(Context);
    const handleClick = (title) => {
        toggleModel(false);
        history.push("/main?name=" + name + "&type=" + title);
    };
    return (
        <div className="navigation-menu">
            {pages.map((media, index) => {
                return (
                    <a 
                        //href={"/XR/main?name=" + name + "&type=" + media.title}
                        onClick={() => handleClick(media.title)} 
                        className={pages.length === index + 1 ? "menu-item-last" : "menu-item"}
                        key={index}
                    >
                        { media.title }
                    </a>
                );
            })}
        </div>
    );
});

const styles = {
    overlayBtn: {
        position: "fixed",
        left: ".5em",
        top: ".5em",
        zIndex: 10
    },
    closeBtn: {
        position: "fixed",
        top: ".5em",
        right: ".5em"
    }
};

export default MenuOverlay;
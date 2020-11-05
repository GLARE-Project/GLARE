import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faBell } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from 'react-router-dom';
import { Frame, Stack } from 'framer'
import { useCookie } from "react-use";
import './Menu.scss';
import { Context } from "./../../index";
//import { ReactComponent as ReactLogo } from './book.svg';

Modal.setAppElement('#root');
library.add(faBars, faTimes, faBell);


function MenuOverlay({ children, data }) {
    const [visitedLibrary, setCookie] = useCookie("VisitedLibrary");
    function setVisited() {
        setCookie(true);
    }

    const { modelOpen, toggleModel } = useContext(Context);


    const { media_pages, main_pages, name } = data;

    const HAS_LIBRARY_ITEMS = typeof (media_pages) !== 'undefined' && media_pages.length > 0;

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
                            name={name}
                            pages={main_pages} />
                        <div className={["media-menu", HAS_LIBRARY_ITEMS ? "library-full" : "library-empty"].join(' ')}>
                            {HAS_LIBRARY_ITEMS && <NavLink
                                to={`${process.env.PUBLIC_URL}/media?name=${name}`}
                                className="menu-item"
                                onClick={() => { setVisited(); }}>
                                Library
                        </NavLink>
                            }
                            <NavLink
                                to={`${process.env.PUBLIC_URL}/help`}
                                className="menu-item-last">
                                Help
                        </NavLink>
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

            {HAS_LIBRARY_ITEMS && <NotificationSystem visitedLibrary={visitedLibrary} />}

        </React.Fragment>
    );
}


//const LibraryAlert = ({ visitedLibrary }) => {
    //const [isToggled, setState] = useState(false);

    //const toggleLibrary = () => {setState(!isToggled);}

    //return (
       // <>
            //{!visitedLibrary &&
               // <Frame
                   // position={"relative"}
                    //style={styles.overlayBtnLib}
                    //initial={{ opacity: 0 }}
                    //animate={{ opacity: 1, fill: '#000000' }}
                    //transition={{ delay: 1.5 }}
                    //onTap={toggleLibrary}
                    //className={"libraryOverlay"}
                //>
                    //<ReactLogo className="svgicon" />
                    //<div className="dialog" style={{ display: isToggled ? 'block' : 'none' }} >
                        //<h1>Check out the Library!</h1>
                        //<p>The library offers more information about each hotspot, including additional photos,<br />
                        //audio, videos and content. The library can be found under the menu bar above. Enjoy<br />
                        //the rest of the rich history of the May 4th Augmented Reality Experience.</p>
                    //</div>
                //</Frame>
           // }
        //</>
    //)
//}
const NotificationSystem = ({ visitedLibrary }) => {
    const [istoggled, setState] =useState(false);
    const toggleHotspot =() => {
        setState( state => !state);
    }
    const [flash, setAnimation] = React.useState(0)
    return (
        <>
        {!visitedLibrary &&
            <Stack> 
                <Frame 
                    width={"100px"} height={"100px"} top={15} right={-15} position={"fixed"} style={styles.overlayBtnAlert} 
                    onTapStart={toggleHotspot} className={"HotspotOverlay"} onClick={() => setAnimation(1)} onAnimationEnd={() => setAnimation(0)}
                    flash={flash}
                >
                <FontAwesomeIcon
                    className="overlay-ctn-notification"
                    icon={faBell}
                />
                <Frame 
                    style={styles.overlayBtnAlert1} top={15} right={90} width={"350px"}
                >
                    <div className="hotspotdialog" style={{ display: istoggled ? 'block' : 'none' }} >
                        <h3>Check out the other Hotspot Locations!</h3>
                        <p>Make sure to check out the other hotspot locations in order to gain the full experience, along with their rich library content found under the menu bar.</p>
                        <hr></hr>
                        <h3>Check out the Library!</h3>
                        <p>including photos, audio, and content regarding each of the hotspot. The library option can be found under the Menu bar on the upper left hand corner of the screen.</p>
                    </div>
                </Frame>
                </Frame>
            </Stack>
        }
        </>
   );
};

const MenuComponent = React.memo(function MenuComponent({ name, pages=[] }) {
    const { toggleModel } = useContext(Context);
    const handleClick = () => {
        toggleModel(false);
    };
    return (
        <div className="navigation-menu">
            {pages.map((media, index) => {
                return (
                    <NavLink
                        to={`${process.env.PUBLIC_URL}/main?name=${name}&type=${media.title}`}
                        onClick={() => handleClick()}
                        className={pages.length === index + 1 ? "menu-item-last" : "menu-item"}
                        key={index}
                    >
                        { media.title}
                    </NavLink>
                );
            })}
        </div>
    );
});

const styles = {
    overlayBtnAlert: {
        position: "fixed",
        backgroundColor: "none",
        zIndex: 11,
    },
   overlayBtnAlert1: {
    position: "fixed",
    backgroundColor: "none",
    zIndex: 10,
    },
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
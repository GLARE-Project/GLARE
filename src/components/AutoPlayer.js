import React, { useContext } from 'react';
import { Context } from "./../index";

const AutoPlayer = React.memo(function AutoPlayer({source, name, cb}) {
    const {modelOpen} = useContext(Context);

    // mark audio finished an no-longer autoplay
    const onEnd = () => {
        localStorage.setItem(name + "-audio", 1);
    };

    const getAudioTime = () => {
        return Math.floor(document.querySelector("#audio-player").duration * 1000);
    };

    const autoPlay = (parseInt(localStorage.getItem(name + "-audio")) !== 1 && !modelOpen);

    return(
        <audio id="audio-player"
            controls="controls"
            autoPlay={autoPlay}
            onEnded={name ? onEnd : () => {}}
            onLoadedMetadata={cb ? ()=> cb(getAudioTime()) : () => {}}
        >
            <source id="mp3_src" type="audio/mp3" src={source}/>
            Your browser does not support the audio element.
        </audio>
    );
});

export default AutoPlayer;

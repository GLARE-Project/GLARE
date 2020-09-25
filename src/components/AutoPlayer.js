import React, { useContext, useRef } from 'react';
import { Context } from "./../index";

const AutoPlayer = React.memo(function AutoPlayer({ source, name, onLoad, onPause, onPlaying }) {

    const controls = useRef(null);
    const { modelOpen } = useContext(Context);

    // mark audio finished an no-longer autoplay
    const onEnd = () => {
        localStorage.setItem(name + "-audio", 1);
    };

    const getAudioTime = () => {
        return Math.floor(document.querySelector("#audio-player").duration * 1000);
    };

    const autoPlay = (parseInt(localStorage.getItem(name + "-audio")) !== 1 && !modelOpen);

    return (
        <audio id="audio-player"
            controls={true}
            autoPlay={autoPlay}
            ref={controls}
            onEnded={name ? onEnd : () => { }}
            onLoadedMetadata={onLoad ? () => onLoad(getAudioTime()) : () => { }}
            onPause={onPause ? () => { if (!controls.current.ended) onPause(); } : () => { }} // paused event can be triggered when onEnd, so ignore
            onPlaying={onPlaying ? () => onPlaying() : () => { }}
        >
            <source id="mp3_src" type="audio/mp3" src={source} />
            Your browser does not support the audio element.
        </audio>
    );
});

export default AutoPlayer;

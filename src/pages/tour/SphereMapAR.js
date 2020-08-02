import React, { useEffect } from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader, BackSide } from 'three';
import { DeviceOrientationControls } from 'drei'

function handleVideo() {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    // this gets the camera 
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: {
                exact: "environment" // the front camera, if prefered
            }
        }
    }).then(stream => {
        if (stream) {
            const video = document.querySelector("#videoElement");

            // Older browsers may not have srcObject
            if ("srcObject" in video) {
                video.srcObject = stream;
            } else {
                // Avoid using this in new browsers, as it is going away.
                video.src = window.URL.createObjectURL(stream);
            }

            // play the video stream
            video.onloadedmetadata = function (e) {
                video.play();
            };

        } else {
            console.warn("Missing auto stream");
        }

    })
        .catch(function (err) {
            console.warn(err);
        });
}

const SphereMapAR = React.memo(({ data }) => {
    const { AR_overlay } = data;

    const texture = useLoader(TextureLoader, AR_overlay);

    useEffect(() => {
        handleVideo();
    }, [])

    return (
        <>
            <group dispose={null}>
                <mesh>
                    {/* only show the backside of texture and rotate it to the front
                      *         this is like setting the scale [-1, 1, 1]        */}
                    <sphereGeometry attach="geometry" args={[20, 20, 20, (Math.PI / 2)]} />
                    <meshBasicMaterial attach="material" map={texture} side={BackSide} />
                </mesh>
            </group>
            <DeviceOrientationControls />
        </>
    );
});

export default SphereMapAR;
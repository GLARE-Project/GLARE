import React, { useEffect, useState, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
import { Ellipsis } from 'react-spinners-css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import AudioPlayer from "./../../components/AutoPlayer";
import MenuOverlay from "../../components/Menu/MenuOverlay";
import { Context } from "./../../index";
import renderFace from "./../../utils/imageConvert";
import './tours.css';

library.add(faMapMarkerAlt, faEye);


const Tour = React.memo(function Tour({history}) {
    let query = new URLSearchParams(useLocation().search);
    let name = query.get("name");

    const { onCampus } = useContext(Context);
    const [status, setStatus] = useState("waiting");

    // event so that if the user resizes, it will adjust
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        if (typeof camera != 'undefined' && typeof renderer != 'undefined') {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.fov = fov;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /* Used for debugging postion of overlay */
    var dragging = false;
    window.removeEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.removeEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mousedown", onMouseDown, false);
    window.removeEventListener("mouseup", onMouseUp, false);
    window.addEventListener("mouseup", onMouseUp, false);

    function onMouseDown(event){
            dragging = true;
    }
    function onMouseUp (event){
        if (typeof OverlayMaterial != 'undefined') {
            dragging = false;
            OverlayMaterial.opacity = 1;
            console.log("Overlay moved to x: " +  OverlaySprite.position.x + " and y: "  + OverlaySprite.position.y);
        }
    }
      
    function onMouseMove(event) {
        if (typeof camera != 'undefined' && typeof renderer != 'undefined' && typeof OverlaySprite != 'undefined') {
            var mouse = new THREE.Vector2();
            mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects([OverlaySprite]);

            if (intersects.length === 0 || !dragging) return;

            OverlayMaterial.opacity = .5;
            if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
                OverlaySprite.position.copy(intersects[0].point);
        }
    }
    /* End of debugging code block */

    
    // input the image equirectangular data
    // return a texture for each face as a collective material
    function processFace(imgData) {
        const faces = [
            'px', 'nx',
            'py', 'ny',
            'pz', 'nz'
        ];
        // for each face
        return faces.map(faceName => {
            // get that face using sample
            const [faceData, faceWidth, faceHeight] = renderFace(imgData, faceName);
            // Create a texture based on the data
            const texture = new THREE.DataTexture( faceData.data, faceWidth, faceHeight, THREE.RGBAFormat );
            texture.needsUpdate = true;
            // return a mesh for that face
            return new THREE.MeshBasicMaterial( { map: texture } );
        });
    }

    const StorageData = JSON.parse(localStorage.getItem(name));
    // data was never set go to maps to set
    if (StorageData == null) history.push("/map");

    var overlayImage;

    var camera, scene, renderer, controls, mesh, OverlaySprite, OverlayMaterial;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var fov = onCampus ? 30 : 45;
    async function init() {
        var webglEl = document.getElementById('sphere');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000);
        camera.position.z = 1;

        var geometry, material;

        if (onCampus) {
            geometry = new THREE.SphereGeometry(100, 20, 20, (Math.PI + 1.65));
            material = new THREE.MeshBasicMaterial({
                map : new THREE.TextureLoader().load(overlayImage, setStatus("loaded")),
                side: THREE.DoubleSide
            });
            
        } else {
            geometry = new THREE.BoxGeometry(20, 20, 20);

            // wait for the equirectangular to load in
            material = await new Promise((resolve, reject) =>
                new THREE.ImageLoader().load( process.env.PUBLIC_URL + overlayImage, image => {
                    const {width:imageWidth, height:imageHeight} = image;
                    const canvas = document.createElement( 'canvas' );
                    canvas.width = imageWidth;
                    canvas.height = imageHeight;
                    
                    const context = canvas.getContext( '2d' );
                    context.drawImage( image, 0, 0);

                    const imageData = context.getImageData( 0, 0, imageWidth, imageHeight );
                    // return the mesh for each face's given texture
                    resolve(processFace(imageData))
                }, {}, err => reject("Image failed to load :"  + err))
            ).then(mats =>{
                setStatus("loaded");
                return mats;
            });

        }

        mesh = new THREE.Mesh( geometry, material );

        if (onCampus)
			mesh.geometry.scale( -1, 1, 1 );
        else
            mesh.geometry.scale( 1, 1, - 1 );

        scene.add(mesh);

        // build the floor to cover-up black outlines in 360 images
        if (!onCampus) {
            // size should be effected by zoom?
            var OverlayGeometry = new THREE.PlaneGeometry(StorageData.overlay_size, StorageData.overlay_size);
            OverlayMaterial = new THREE.MeshBasicMaterial( {
                map: new THREE.TextureLoader().load(process.env.PUBLIC_URL + StorageData.VR_overylay),
                transparent: true,
                side : THREE.FrontSide
            } );

            OverlaySprite = new THREE.Mesh( OverlayGeometry, OverlayMaterial );

            // set to the north position and max distance - 1
            OverlaySprite.position.set(StorageData.overlay_offset_x, StorageData.overlay_offset_y, -9);
            scene.add(OverlaySprite);
        }

        renderer = new THREE.WebGLRenderer({ alpha: onCampus });
        // make magenta transparent
        renderer.setClearColor(0xFF00FF, 0);
        // fixes issues with zoom being pixelated
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        webglEl.appendChild(renderer.domElement);
        
        if (onCampus) {
            // phone controls to simulate AR 
            handleVideo();
            controls = new DeviceOrientationControls(camera, true);
            controls.connect();
        } else {
            // browser controls w/ mouse
            controls = new OrbitControls(camera);
            // zoom limits
            controls.minDistance = 1;
            controls.maxDistance = 3;
            controls.panSpeed = .5;
            // can't move out of cube
            controls.enablePan = false;
            // prevents moving choppiness
            controls.enableDamping = true;
        }
    }

    function setUp() {
        if (StorageData != null) {
            overlayImage = onCampus ? StorageData.AR_overlay : StorageData.panorama_image;
        }
        // used to get rid of the bar in safari
        scrollToTop();
        scrollToBottom();
    }
    
    function calibrateNorth() {
        cleanUP_Blink();
        init();
        animate();
    }
    // live video start
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
            })
            .then(function (stream) {

                if (stream) {
                    var video = document.querySelector("#videoElement");

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
    
    function animate() {
        if (typeof renderer !== 'undefined' && typeof controls !== 'undefined') {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
    }
    
    function scrollToTop() {
        window.scrollTo(0, 0);
        window.scrollTo(0, 1);
    }
    
    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }
    

    // keeps the oldest canvas on top and removes any newer
    function cleanUP() {
        var sphere = document.getElementById('sphere');
        // it will cause a blink if all removed before new generated
        // should remove once new child is produced
        while (sphere.children.length > 1) {
            sphere.removeChild(sphere.lastChild);
        }
    }

    // this is the same as cleanup but will cause a blind due to removing the top canvas and waiting to rerender
    function cleanUP_Blink() {
        var sphere = document.getElementById('sphere');
        while (sphere.firstChild) {
            sphere.removeChild(sphere.firstChild);
        }
    }
    useEffect(() => {
        setUp();
        init();
        animate();
        return () => cleanUP();
    }, [onCampus, StorageData]);

  if(StorageData != null)
  return (
    <div id="container" className={status} style={{overflow: "hidden"}}>
        <MenuOverlay history={history} data={StorageData}>
            <Ellipsis className="spinner" color="#fff" />
            {onCampus && (<video autoPlay={true} muted="" playsInline="" id="videoElement"/>)}
            
            <div id="sphere"></div>
    
            <div onSelect={e => e.preventDefault()} id="title-ctn" >
                {StorageData.name} 
            </div>
            
            <div id = "fixed-footer">
                <AudioPlayer name={StorageData.name}  source={StorageData.start_audio} />
            </div>

            <div className="overlay-ctn-show">
                <FontAwesomeIcon 
                    className="overlay-icon"
                    icon={faEye}
                    onClick={calibrateNorth}
                />
            </div>
            <div className="overlay-ctn-map">
                <FontAwesomeIcon 
                    className="overlay-icon"
                    icon={faMapMarkerAlt}
                    onClick={() => history.replace("/map")}
                />
            </div>
        </MenuOverlay>
    </div>
  );
});


export default Tour;



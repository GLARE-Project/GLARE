import React, { useLayoutEffect, useState, useContext } from 'react';
import { Map as LeafletMap, TileLayer, Marker, CircleMarker } from "react-leaflet";
import L from "leaflet";
import jsonMarkers from "./../../text_files/markers.json";
import BackButton from '../../components/BackButton';
import {onPositionUpdate, isOnCampus} from "./../../utils/gpsManager";
import { Context } from "./../../index";
import './map.css';

function Map(props) {
  const [markers, setMarkers] = useState([]);
  const [currentPos, setCurrentPos] = useState([]);
  const [GeoError, setError] = useState(null);
  const {onCampus, setOnCampus} = useContext(Context);

  const initalRegion = {
    lat: 41.150121,
    lng: -81.345059,
    zoom: 18
  };
  const position = [initalRegion.lat, initalRegion.lng];

  // if the camera fails, we know they aren't able to run the AR
  // so we set them off campus, even though they might be there
  function checkCamera() {
    // check to see if the devices are undefine
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: {
                    exact: "environment" // the front camera, if prefered
                }
            }
          }).catch(err => setOnCampus(false));
    } else {
        setOnCampus(false);
    }
  }

  // create current postion point
  function success(pos) {
    onPositionUpdate(pos, props.history);
    setOnCampus(isOnCampus(pos));
    checkCamera();
    setError(null);
    setCurrentPos([pos.coords.latitude, pos.coords.longitude]);

  }

  function error(err) {
    setCurrentPos([]);
    // gps failed, so we just go to off-campus
    setOnCampus(false);
    setError('Error: The Geolocation service failed.');
    console.warn(err);
  }

  useLayoutEffect(() => {
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error,
          {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
          });
      } else {
        // Browser doesn't support Geolocation
        setError('Error: Your browser doesn\'t support geolocation.');
      }
      setMarkers(jsonMarkers['hotspots']);
  }, [onCampus]);

  return (
    <React.Fragment>
      <link rel="stylesheet" href="//unpkg.com/leaflet@1.6.0/dist/leaflet.css" />
      <BackButton history={props.history}/>
      <LeafletMap center={position} zoom={initalRegion.zoom} onCampus={onCampus} currentPos={currentPos}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {markers.map(marker => {
        // store for later use
        localStorage.setItem(marker.name, JSON.stringify(marker));
        return (
            <Marker
              icon={ PointIcon(marker.position.toString()) }
              position={[marker.latitude, marker.longitude]}
              title={marker.name}
              zIndexOffset={-1}
              key={marker.position}
              onClick={() => props.history.push('/tour?name=' + marker.name )}
            />
        );
      })}
      {currentPos.length > 0 && onCampus === true && (
          <CircleMarker
            title={"Current Location"}
            className={"userLocation"}
            zIndexOffset={1000}
            fillOpacity={1}
            color={"#2C8ECE"}
            fillColor={"white"}
            radius={7}
            center={currentPos}
          />
        )}
      </LeafletMap>
    </React.Fragment>
  );
}

const PointIcon = (id) => {
  return new L.Icon({
  // see more at https://developers.google.com/chart/image/docs/gallery/dynamic_icons#plain_pin
  iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=.6|0|add8e6|16|b|' + id,
  iconSize: [23, 41]
  });
} 

export default Map;
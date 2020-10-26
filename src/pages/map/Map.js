import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { Map as LeafletMap, TileLayer, Marker, CircleMarker, FeatureGroup } from "react-leaflet";
import L from "leaflet";
import BackButton from '../../components/BackButton';
import { onPositionUpdate, isOnCampus } from "./../../utils/gpsManager";
import { Context } from "./../../index";
import './map.css';

function Map(props) {
  const [currentPos, setCurrentPos] = useState([]);
  const [GeoError, setError] = useState(null);
  const { onCampus, setOnCampus, markerData, currentMarker, setCurrentMarker } = useContext(Context);

  const mapRef = useRef({ current: null });

  const initalRegion = {
    lat: 41.150121,
    lng: -81.345059,
    zoom: 18
  };
  const position = [initalRegion.lat, initalRegion.lng];

  // if the camera fails, we know they aren't able to run the AR
  // so we set them off campus, even though they might be there
  const checkCamera = useCallback(() => {
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
  }, [setOnCampus]);

  //set the error value and log it to console
  const setAndLogError = useCallback(err => {
    // don't repeat errors
    if (GeoError !== err) {
      console.warn(err);
      setError(err);
    }
  }, [GeoError]);

  // create current postion point
  const success = useCallback(pos => {
    onPositionUpdate(pos, props.history, markerData, currentMarker, setCurrentMarker);
    setOnCampus(isOnCampus(pos, markerData));
    checkCamera();
    // reset the error value as it worked
    setError(null);
    setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
  }, [setOnCampus, props.history, checkCamera, markerData, currentMarker, setCurrentMarker]);

  const error = useCallback(err => {
    setCurrentPos([]);
    // gps failed, so we just go to off-campus
    setOnCampus(false);
    setAndLogError('Error: The Geolocation service failed.');
  }, [setOnCampus, setAndLogError]);

  useEffect(() => {
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
      setAndLogError('Error: Your browser doesn\'t support geolocation.');
    }
  }, [success, error, setAndLogError, onCampus]);

  const adjustMap = ({ target }) => {
    const { current } = mapRef;
    if (current.hasOwnProperty("leafletElement")) {
      const map = current.leafletElement;
      map.fitBounds(target.getBounds())
    }
  };


  return (
    <React.Fragment>
      <link rel="stylesheet" href="//unpkg.com/leaflet@1.6.0/dist/leaflet.css" />
      <BackButton history={props.history} />
      <LeafletMap center={position} zoom={initalRegion.zoom} currentPos={currentPos} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {markerData.length > 0 && <FeatureGroup onAdd={ e => {adjustMap(e)}}>
          {markerData.map(marker => {
            return (
              <Marker
                icon={PointIcon(marker.position.toString())}
                position={[marker.latitude, marker.longitude]}
                title={marker.name}
                zIndexOffset={-1}
                key={marker.position}
                onClick={() => props.history.push('/tour?name=' + marker.name)}
              />
            );
          })}
        </FeatureGroup>}
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
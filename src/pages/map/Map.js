import React, { useLayoutEffect, useState, useContext, useCallback } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import BackButton from '../../components/BackButton';
import { onPositionUpdate, isOnCampus, getBaseHotspots, tooCloseHotspotList } from "./../../utils/gpsManager";
import { Context } from "./../../index";
import './map.css';

function Map(props) {
  const [currentPos, setCurrentPos] = useState([]);
  const [GeoError, setError] = useState(null);
  const { onCampus, setOnCampus, markerData } = useContext(Context);

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
        video: process.env.NODE_ENV === 'production' ?
          {
            facingMode: {
              exact: "environment" // the front camera, if prefered
            }
          } : {}
      }).catch(err => {
        setOnCampus(false);
      });
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
    if (markerData.length > 0) onPositionUpdate(pos, props.history, markerData);
    setOnCampus(isOnCampus(pos, markerData));
    checkCamera();
    // reset the error value as it worked
    setError(null);
    setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
  }, [setOnCampus, props.history, checkCamera, markerData]);

  const error = useCallback(err => {
    setCurrentPos([]);
    // gps failed, so we just go to off-campus
    setOnCampus(false);
    setAndLogError('Error: The Geolocation service failed.');
  }, [setOnCampus, setAndLogError]);


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
      setAndLogError('Error: Your browser doesn\'t support geolocation.');
    }
  }, [success, error, setAndLogError, onCampus]);


  return (
    <React.Fragment>
      <link rel="stylesheet" href="//unpkg.com/leaflet@1.6.0/dist/leaflet.css" />
      <BackButton history={props.history} />
      <LeafletMap center={position} zoom={initalRegion.zoom} currentPos={currentPos} >
        <TileLayer
          maxNativeZoom={19}
          maxZoom={23}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <MarkerHotspots markerData={markerData} restrictedMarkersonCampus={onCampus} history={props.history} />
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


const MarkerHotspots = ({ markerData, onCampus, history }) => {

  const map = useMap();

  const adjustMap = useCallback(({ target }) => {
    const bounds = target.getBounds();
    map.fitBounds(bounds);
    map.options.center = bounds.getCenter();
    map.options.maxBounds = bounds;
    map.options.minZoom = map.getZoom();
  }, [map]);

  const restrictedMarkers = onCampus ? getBaseHotspots(markerData) : markerData;

  return (
    <>
      {markerData.length > 0 && <MarkerClusterGroup
        showCoverageOnHover={false}
        // if half of markersize (23 / 2) away then it is overlapping
        maxClusterRadius={12}
        eventHandlers={{
          add: e => { adjustMap(e) }
        }}
      >
        {restrictedMarkers.map(hotspot => {
          const { position: key, latitude, longitude, name, pin_color } = hotspot;
          const tooCloseHotspots = tooCloseHotspotList(hotspot, markerData, onCampus);
          const IS_GROUPED_HOTSPOT = tooCloseHotspots.length > 0;
          return (
            <Marker
              eventHandlers={{
                click: () => {
                  history.push(`/tour?name=${encodeURIComponent(name)}`)
                }
              }}
              key={key}
              zIndexOffset={-1}
              title={name}
              position={[latitude, longitude]}
              icon={PointIcon(key.toString(), IS_GROUPED_HOTSPOT, pin_color)}
            />
          );
        })}
      </MarkerClusterGroup>}
    </>
  )
};

// TODO: This should formated the same naming as GEOJSON
const PointIcon = (id, IS_GROUPED_HOTSPOT = false, pinColor = undefined) => {
  // if a color is set use it otherwise determine the default color
  const color = pinColor ? pinColor : (IS_GROUPED_HOTSPOT ? "00af91" : "add8e6");
  return new L.Icon({
    // see more at https://developers.google.com/chart/image/docs/gallery/dynamic_icons#plain_pin
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_spin&chld=.6|0|${color}|16|b|${id}`,
    iconSize: [23, 41]
  });
}

export default Map;
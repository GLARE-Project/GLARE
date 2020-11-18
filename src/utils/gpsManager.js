import React from 'react';
import { toast } from "react-toastify";


// configuarable values 
const HOTSPOT_RADIUS = 0.0076; // 0.0075 miles == 40 feet

const CAMPUS_RADIUS = 0.1087359848; // 0.1087 miles == 82 feet + 150 meter accuracy

const AlertLocation = ({ markerName, history  }) => {
	return (
		<div>
			<p style={styles.toastCtn}>
				It appears that you're at the { markerName }.
				<button 
					onClick={() => history.push(`/tour?name=${encodeURIComponent(markerName)}`)}
					style={styles.toastBtn}
				>
					View Hotspot
				</button>
			</p>
		</div>
	);
}


const AlertGoBack = ({ markerName, history  }) => {
	return (
		<div>
			<p style={styles.toastCtn}>
				It appears that you've left the { markerName }.
				<button 
					onClick={() => history.replace("/map")}
					style={styles.toastBtn}
				>
					Go to Map
				</button>
			</p>
		</div>
	);
}

const styles = {
    toastCtn: {
		display: "flex",
		fontSize: "1.1em",
		fontWeight: "bold"
	},
	toastBtn: {
		backgroundColor: "white",
    	fontWeight: "bold"
	}
}

// when the user moves postions
export function onPositionUpdate( position, history, markerData, currentMarker, setCurrentMarker ) {
    // and fine the next closest points
	checkForCloseMarker( position.coords, history, markerData, currentMarker, setCurrentMarker );
}

// checks to see if near a hotspot
function checkForCloseMarker( position, history, markerData, currentMarker, setCurrentMarker ) {
	var markerObj = markerData.map( marker => {		
        var dist = distance( position.latitude, position.longitude, marker.latitude, marker.longitude );
		// build an object of marker and its distance
		return {...marker,  dist};
	});

	// only keep markers in the distance
	var markersInDistance = markerObj.filter(marker => {return marker.dist < HOTSPOT_RADIUS})
	// the  we sort it to find the lowest value
	.sort(function (a, b) {
		return a.dist - b.dist
	});

	var closestMarker = markersInDistance.length === 0 ? null :  markersInDistance[0].name;

	// if previous marker isn't closestMarker, set it
	if ( currentMarker !== closestMarker ) {
		// remove all previous toasts
		toast.dismiss();
		// and if a marker is near, we create an alert
		// and makes sure they are the map page, as others result in history goBack issues
		if (closestMarker !== null && history.location.pathname === "/map") {
			// create a new one
			toast(<AlertLocation markerName={closestMarker} history={history}/>, {
				autoClose: false,
				type: toast.TYPE.INFO,
				draggablePercent: 50
			});
		// otherwise if the user now left the area and isn't on the map page
		} else if(closestMarker === null && history.location.pathname === "/tour") {
			toast(<AlertGoBack markerName={currentMarker} history={history}/>, {
				autoClose: false,
				type: toast.TYPE.INFO,
				draggablePercent: 50
			});
		}
		setCurrentMarker( closestMarker );
	}
}


// https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 === lat2) && (lon1 === lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		return dist;
	}
}

// checks for the closest marker on campus
// if the closest marker exceeds the campus radius
// then the user is not on campus
export function isOnCampus( position, markerData ) {
	const distList = markerData.map( marker => {		
		return distance( position.coords.latitude, position.coords.longitude, marker.latitude, marker.longitude );
	});
	return  Math.min(...distList) <= CAMPUS_RADIUS;
}

export default {onPositionUpdate, isOnCampus};
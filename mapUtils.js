(function () {
	var mc = window.mapController = window.mapController || {};
	var sb = window.sideBar = window.sideBar || {};

    var serverURL = "http://52.34.170.97:5000/";

	var defaultMarkerColor = "#4286F4";
	var selectedMarkerColor = "#48f442";

	var map;
	var markers = [];
	
	var countryCodes = {};

	var selectCenter = null;
	var selectCircle = null;
	var selectRadius = 0;

	mc.selectedMarkers = [];
    mc.selectedPopulationSum = 0;
	mc.countryFilter = "none";

    mc.initMap = function initMap() {
		// set up the map
		map = new L.Map('leafletMap', {
			preferCanvas : true
		});

		// create the tile layer with correct attribution
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data � <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 12, attribution: osmAttrib});		

		// start the map in South-East England
		map.setView(new L.LatLng(51.3, 0.7),9);
		map.addLayer(osm);
		
		map.on('click', function(e) {
			if (selectCenter === null) {
				// First click determines centerpoint
				setNewSelectionCenter(e);
			}
			else {
				// Second click determines radius
				setNewSelectionRadius(e);
			}
		});
		
		map.on('moveend', function() { 
			populateMapMarkers();
		});
		
        populateMapMarkers();

		return map;
	}
	
	mc.countryFilterChanged = function countryFilterChanged(newCode) {
		mc.selectedPopulationSum = 0;
		var filteredCityMarkers = [];

		for (var i = 0; i < mc.selectedMarkers.length; i++) {
			var marker = mc.selectedMarkers[i]; 
			if (newCode === "none" || newCode === marker.data["country code"]) {
				if (marker.options.color !== selectedMarkerColor) {
					marker.options.color = selectedMarkerColor;
					marker.redraw();
				}
				filteredCityMarkers.push(marker);
				mc.selectedPopulationSum += marker.data.population;
			}
			else if(newCode !== marker.data["country code"] && marker.options.color === selectedMarkerColor) {
				marker.options.color = defaultMarkerColor;
				marker.redraw();
			}
		}
        // Sort filtered cities by population
        filteredCityMarkers.sort(cityPopCompare);

		sb.updateTotalPopulationDisplay(mc.selectedPopulationSum);
		sb.updateCitySelectionDisplay(filteredCityMarkers);
	}

	function cityPopCompare(a,b) {
            if (a.data.population < b.data.population) {
				return 1;
			} 
			else if (a.data.population > b.data.population) {
				return -1;
			}
			return 0;
        }

	function setNewSelectionCenter(clickEvent) {
		if (selectCircle) {
			map.removeLayer(selectCircle);
			selectCircle = null;
		}
		
		resetSelectedMarkers();

		// Establish centerpoint of selection with first click
		var options = {
			color : "#ff2600",
			radius : 4,
			weight : 4
		};

		selectCenter = L.circleMarker(clickEvent.latlng, options).addTo(map);
		
		selectCenter.bindTooltip("Click elsewhere on map to define radius");
	}

	function setNewSelectionRadius(clickEvent) {
		selectRadius = getDistance(selectCenter._latlng, clickEvent.latlng);
	
		selectCircle = L.circle([selectCenter._latlng.lat, selectCenter._latlng.lng], {
			color: 'green',
			fillColor: 'green',
			fillOpacity: 0.1,
			radius: (selectRadius * 1000)
		}).addTo(map);

		updateSelection(selectCenter._latlng, selectRadius);

		map.removeLayer(selectCenter);
		selectCenter = null;
	}

	// Query server for cities which will fit in current mapView, then populate the map
	function populateMapMarkers() {
		var mapBoundNorthEast = map.getBounds().getNorthEast();
		var mapDistance = mapBoundNorthEast.distanceTo(map.getCenter())/1000;
		var centerPoint = map.getCenter();
		
		var payload = {
			lat : centerPoint.lat,
			lng : centerPoint.lng,
			radius : mapDistance
		};
		
		$.ajax ({
			url: serverURL + "getcities",
			type: "POST",
			data: JSON.stringify(payload),
			contentType: "application/json",
			success: function(response){
				response = JSON.parse(response);
				clearAllMarkers();
				for (var i = 0; i < response.length; i++) {
					createMarkerFromCityData(JSON.parse(response[i]));
				}
				sb.setCountryFilters(countryCodes, mc.countryFilter);
				if (selectCircle) {
					updateSelection(selectCircle._latlng, selectRadius);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				console.log("Status: " + textStatus); 
				console.log("Error: " + errorThrown); 
			}
		});
	}
    
	// Determine which city markers fall within the selection, and set a sorted list and population total
    function updateSelection(newLatLng, newRadius){
		mc.selectedPopulationSum = 0;
		var filteredCityMarkers = [];

        for (var i = 0; i < markers.length; i++) {
			var distance = getDistance(newLatLng, markers[i]._latlng);
			if (distance < newRadius) {
				if (mc.countryFilter === "none" || mc.countryFilter === markers[i].data["country code"]) {
					markers[i].options.color = selectedMarkerColor;
					markers[i].redraw();
					filteredCityMarkers.push(markers[i]);
					mc.selectedPopulationSum += markers[i].data.population;
			}
				mc.selectedMarkers.push(markers[i]);
			}
		}
        // Sort filtered cities by population
        filteredCityMarkers.sort(cityPopCompare);

		sb.updateTotalPopulationDisplay(mc.selectedPopulationSum);
		sb.updateCitySelectionDisplay(filteredCityMarkers);
	}

	// reset all markers on the map back to deselected
	function resetSelectedMarkers() {
		for (var i = 0; i < mc.selectedMarkers.length; i++) {
		 	mc.selectedMarkers[i].options.color = defaultMarkerColor;
			mc.selectedMarkers[i].redraw();	
		}
		// cleanup
		mc.selectedMarkers = [];
        mc.selectedPopulationSum = 0
	}
	
	function getDistance(latLon1, latLon2) {
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((latLon2.lat - latLon1.lat) * p)/2 + 
			  c(latLon1.lat * p) * c(latLon2.lat * p) * 
			  (1 - c((latLon2.lng - latLon1.lng) * p))/2;

		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	}
	
	// Remove all markers from map
	function clearAllMarkers() {
		for (var i = 0; i < markers.length; i++) {
			map.removeLayer(markers[i]);
		}
		// cleanup
		countryCodes = {};
		markers = [];
		mc.selectedMarkers = [];
        mc.selectedPopulationSum = 0;
	}
	
	function createMarkerFromCityData(city) {
		countryCodes[city["country code"]] = 1;
		
		var latLng = [parseFloat(city.latitude), parseFloat(city.longitude)];
		var options = {
			color : defaultMarkerColor,
			radius : 4,
			weight : 2
		};
		var marker = L.circleMarker(latLng, options).addTo(map);
		
		marker.bindTooltip(city.name);
		
        // Add the city data from the server, it will be needed later
        marker.data = city;

		markers.push(marker);
	}
	
	// For testing use only
	function testMapMarkersAndGeometry() {
		var marker = L.marker([51.5, -0.09]).addTo(map);
		
		var circle = L.circle([51.508, -0.11], {
			color: 'red',
			fillColor: '#f03',
			fillOpacity: 0.25,
			radius: 5000
		}).addTo(map);
	}	
}());

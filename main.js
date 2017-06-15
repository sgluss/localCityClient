(function () {
	var mc = window.mapController = window.mapController || {};
	
	var serverURL = "http://52.34.170.97:5000/";
	
	var map;
	var markers = [];
	
	var selectCenter;
	var selectRadius = 50;
	
	$(document).ready(function () {
		initmap();
		populateMapMarkers();
	});
	
	function initmap() {
		// set up the map
		map = new L.Map('leafletMap', {
			preferCanvas : true
		});

		// create the tile layer with correct attribution
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 12, attribution: osmAttrib});		

		// start the map in South-East England
		map.setView(new L.LatLng(51.3, 0.7),9);
		map.addLayer(osm);
		
		map.on('click', function(e) {
			console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
			
			var circle = L.circle([e.latlng.lat, e.latlng.lng], {
				color: 'green',
				fillColor: 'green',
				fillOpacity: 0.1,
				radius: 50000
			}).addTo(map);
			
			updateSelection(e.latlng.lat, e.latlng.lng, 50);
		});
		
		map.on('moveend', function() { 
			populateMapMarkers();
		});
		
		return map;
	}
	
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
						updateMarker(JSON.parse(response[i]), false);
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					console.log("Status: " + textStatus); 
					console.log("Error: " + errorThrown); 
				}
			});
	}
	
	function updateSelection(newLat, newLng, newRadius){
		selectCenter = {
			lat : newLat,
			lng : newLng
		};
		selectRadius = newRadius;
		
		var distance;
		
		for (var i = 0; i < markers.length; i++) {
			distance = getDistance(selectCenter.lat, selectCenter.lng, 
								markers[i]._latlng.lat, markers[i]._latlng.lng);
			if (distance < selectRadius) {
				markers[i].options.color = "#48f442";
				markers[i].redraw();
			}
		}
	}
	
	function getDistance(lat1, lon1, lat2, lon2) {
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((lat2 - lat1) * p)/2 + 
			  c(lat1 * p) * c(lat2 * p) * 
			  (1 - c((lon2 - lon1) * p))/2;

		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	}
	
	function clearAllMarkers() {
		for (var i = 0; i < markers.length; i++) {
			map.removeLayer(markers[i]);
		}
		markers = [];
	}
	
	function updateMarker(city, isInRadius) {
		var latLng = [parseFloat(city.latitude), parseFloat(city.longitude)];
		var options = {
			color : "#4286F4",
			radius : 4,
			weight : 2
		};
		var marker = L.circleMarker(latLng, options).addTo(map);
		
		marker.bindTooltip(city.name);
		
		markers.push(marker);
	}
	
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
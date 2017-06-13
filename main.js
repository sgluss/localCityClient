(function () {
    var mc = window.mapController = window.mapController || {};
	var map;
	
	$(document).ready(function () {
		initmap();
		testMapMarkersAndGeometry();
	});
	
	function initmap() {
		// set up the map
		map = new L.Map('leafletMap');

		// create the tile layer with correct attribution
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});		

		// start the map in South-East England
		map.setView(new L.LatLng(51.3, 0.7),9);
		map.addLayer(osm);
		
		return map;
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
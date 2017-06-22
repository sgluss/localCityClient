(function () {
	var mc = window.mapController = window.mapController || {};
	var sb = window.sideBar = window.sideBar || {};

	$(document).ready(function () {
		mc.initMap();
		sb.init();
	});
	
}());

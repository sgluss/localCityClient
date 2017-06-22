(function () {
	var mc = window.mapController = window.mapController || {};
	var sb = window.sideBar = window.sideBar || {};

	// Bootstrap modules once document is ready
	$(document).ready(function () {
		mc.initMap();
		sb.init();
	});
	
}());

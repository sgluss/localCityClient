(function () {
	var sb = window.sideBar = window.sideBar || {};

    var totalPopulationOutput;

    sb.init = function init() {
        totalPopulationOutput = document.getElementById("totalPopulation");
        selectedCities = document.getElementById("cityListing");
    };

	// Set total population readout in DOM
    sb.updateTotalPopulationDisplay = function updateTotalPopulationOutput(value){
        totalPopulationOutput.innerText = value;
    };

	// Provides alternating colors
    function getColorCodeForIndex(index) {
        switch(index % 3) {
            case 0:
                return "#660000";
            case 1:
                return "#000066";
            case 2:
                return "#006600";
        }
    }

    var cityTemplate = `
    <div style="color:{{colorHex}}">
    {{cityName}}<br>
    {{population}}
    </div>
    `;

	// Build and set HTML in DOM to display list of citie names and populations
    sb.updateCitySelectionDisplay = function updateCitySelectionDisplay(selectedMarkers) {
        var html = "";
        // enforce a maximum number of cities to output
        var maxIndex = selectedMarkers.length < 500 ? selectedMarkers.length : 500;

        for (var i = 0; i < maxIndex; i++) {
            html += cityTemplate.replace("{{colorHex}}", getColorCodeForIndex(i)).
            replace("{{cityName}}", selectedMarkers[i].data.name).
            replace("{{population}}", selectedMarkers[i].data.population);
        }

        // Display the city population readout and scroll to the top
        selectedCities.innerHTML = html;
        selectedCities.scrollTop = 0;
    };

}());
(function () {
	var sb = window.sideBar = window.sideBar || {};
	var mc = window.mapController = window.mapController || {};

    var totalPopulationOutput;
    var selectedCities;
    var countryFilterSelector;

    sb.init = function init() {
        totalPopulationOutput = document.getElementById("totalPopulation");
        selectedCities = document.getElementById("cityListing");
        countryFilterPicker = document.getElementById("countryFilterPicker");

        countryFilterPicker.addEventListener("change", filterPickerStateChanged);
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

    sb.setCountryFilters = function setCountryFilters(countryCodes, oldCode) {
        var html = '<option value="none">No Filter</option>';
        var countries = Object.getOwnPropertyNames(countryCodes);
        for (var i = 0; i < countries.length; i++) {
            html += '<option value="' + countries[i] + '">' + countries[i] + '</option>';
        }
        countryFilterPicker.innerHTML = html;
        
        if (countryCodes[oldCode]) {
            // Offset by 1 for "none"
            countryFilterPicker.selectedIndex = countries.indexOf(oldCode) + 1;
        }
        else {
            countryFilterPicker.selectedIndex = 0;
            setNewCountryFilter("none");
        }

    }

    function filterPickerStateChanged(e) {
        var target = e.currentTarget;
        var newValue = target.options[target.selectedIndex].value;
        
        mc.countryFilter = newValue;
        mc.countryFilterChanged(mc.countryFilter);
    }

    function setNewCountryFilter(newFilter) {
        mc.countryFilter = newFilter;
        mc.countryFilterChanged(mc.countryFilter);
    }

}());
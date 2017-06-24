# localCityClient

This is the web front end for LocalCity, which displays all the cities on the surface of the earth with a population greater than 1000.

Try clicking on the map to define a selection, and use the filter in the top of the infoBar to choose a specific country.

Data is mined from http://download.geonames.org/export/dump/cities1000.zip

The client uses Leaflet to generate a map with tiles sourced from OpenStreetMaps.

City Data is requested from the server when the map is scrolled or zoomed. The current city marker state is cached, so only changes in data will be rendered.
Thanks to RedisGEO, only city information visible within the current viewport is requested.

Closure scopes encapsulate the map and infoPanel logic, provding namespacing and separation of concerns.

The HTML uses table CSS to be responsive in different browser window sizes or in mobile.

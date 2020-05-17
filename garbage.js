$(document).ready(function(){

if ('serviceWorker' in navigator)
{
    navigator.serviceWorker
	.register('./sw.js')
	.then(function() {
	    console.log("Service Worker registered successfully");
	})
	.catch(function() {
	    console.log("Service Worker registration failed");
	});
}
    
function enableDisableCityFeatures(){
    for(var app in cityApps){
        //disable apps that are not available for the city
        if(cityApps[app] == 0){
            $('#' + app.toLowerCase() + 'SubMenuItem').addClass('disabledText');
        }
    }
    // hide Use Transit field when the city does not support
    if(cityTransit == 0){
        $('#transitContainer').hide();
    }
}
   
//cityDataPromise is defined in common.js
cityDataPromise.then(function(data){
    enableDisableCityFeatures();
}).catch(function(error){
    console.log(error);
});

var global_Map;
var global_heatData;
var conf_markerDisplay = "markers";
var conf_mapTile = "defaultMap";
var conf_searchItem = "";
var conf_searchValue = "";
var conf_searchLat = "";
var conf_searchLng = "";

var latitude;
var longitude;
var destLatitude;
var destLongitude;

// uses mobile-detect.js
var md = new MobileDetect(window.navigator.userAgent);
var isMobile = md.os() == 'iOS' || md.os() == 'AndroidOS';

//getLocation();
//handleUserClick(defaultCategory);
handleUserClick('garbage'); 

var global_map;
    function handleUserClick(tag)
    {
        //getUserLocation();
        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var r = $.post(url, {phoneNumber: '123456789', 'tag': tag, 'latitude': latitude, 'longitude': longitude},
        function (data, textStatus, jqXHR)
        {
//          console.log(data);
	    var map = initMap(data.config, tag);
	    global_map = map;
	    if (tag == 'voies_evacuation')
	    {
                showShapes(map, data.data, data.columns, data.config);
	    } else {
                showMarkers(map, data.data, data.columns, data.config, tag);
	    }
        }).fail(function(jqXHR, textStatus, errorThrown)
        {
            alert(textStatus);
        }
        );
    }

    function getUserLocation()
    {
        navigator.geolocation.getCurrentPosition(getPosition);
    }

    function getPosition(position)
    {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log("latitude: " + latitude);
        console.log("longitude: " + longitude);
    }

    function getTransitNodes(tag, userLocation)
    {
        
        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var r = $.post(url, {phoneNumber: '123456789', 'tag': tag, 'latitude': latitude, 'longitude': longitude},
        function (data, textStatus, jqXHR)
	{
//	    console.log(data);
	    var map = initMap(data.config, tag);
	    if (userLocation !== undefined)
	    {
		placeUserMarker(map, userLocation);
	    }
	    showMarkers(map, data.data, data.columns, data.config, tag);
	}).fail(function(jqXHR, textStatus, errorThrown)
        {
            alert(textStatus);
        }
        );
    }

    function getLocation()
    {
        navigator.geolocation.getCurrentPosition(showMap, showMapNoInput);
    }

    function showMapNoInput(err)
    {
	// user has not enabled location
	// default position to center of Douala
	var position = [];
	var coords = [];
	coords.latitude = 4.061536;
	coords.longitude = 9.786072;
	position.coords = coords;

	showMap(null, position);

    }

    function showMap(userLocation)
    {
	getTransitNodes('alltransit', userLocation);
    }

    function placeUserMarker(map, position)
    {
	console.log("showMap::latitude: " + position.coords.latitude);
	console.log("showMap::longitude: " + position.coords.longitude);
	var user_lat = position.coords.latitude;
	var user_lng = position.coords.longitude;

        L.circleMarker([user_lat, user_lng], {color:'red', radius: 5}).addTo(map);
    }

    function initMap(config, tag)
    {
	$("#map-container").remove();
	$("<div id='map-container' style='height:auto;width:auto;max-width:none;'><div id='map-canvas' style='height:100%;'></div></div>").appendTo('#contents');

	var tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	conf_mapTile = 'defaultMap';
	if (tag == 'connaissances_des_inondations')
	{
	    tileURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
	    conf_mapTile = 'topoMap';
	    conf_markerDisplay = 'heatmap';
	}

    $("#searchItem").keypress(function(){
        searchItem($("#searchItem").val());    
    });   
    

	var conf_marker = 'default';
        var center_lat = 4.061536; // US center lat
        var center_lng = 9.786072; // US center long
        var zoom_level = 4;  // country zoom
        if (config['center-lat'] !== undefined) center_lat = config['center-lat'];
        if (config['center-long'] !== undefined) center_lng = config['center-long'];
        if (config['distance'] !== undefined)
        {
            var dist = config['distance'];
            if (dist < 100) zoom_level = 11;
            else if (dist < 500) zoom_level = 8;
            else if (dist < 1500) zoom_level = 6;
            else if (dist < 4000) zoom_level = 4;
            else zoom_level = 2;
        }

	L.Control.include({_refocusOnMap: L.Util.falseFn});
        
	var theMap = {};
    if(isMobile){
        theMap = L.map('map-canvas',{zoomControl: false}).setView([center_lat, center_lng], zoom_level);
    } else {
        theMap = L.map('map-canvas').setView([center_lat, center_lng], zoom_level);
    }
    
        L.tileLayer(tileURL,
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: ['a', 'b', 'c'],
                maxZoom:17,
                minZoom: 2
            }).addTo(theMap);

	global_Map = theMap;
	return theMap;
    }

    function resetMap(markerDisplay, mapTile)
    {
	L.Control.include({_refocusOnMap: L.Util.falseFn});
	if (mapTile != conf_mapTile)
	{
	    var tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	    if (mapTile == 'topoMap')
	    {
	        tileURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
	    }
            L.tileLayer(tileURL,
                {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: ['a', 'b', 'c'],
                maxZoom:17,
                minZoom: 2
                }).addTo(global_Map);
	    conf_mapTile = mapTile;
	}
	if (markerDisplay != conf_markerDisplay)
	{
	    if (markerDisplay == 'heatmap')
	    {
		var heat = L.heatLayer(global_heatData, {
		    radius: 20,
		    blur: 15,
		    maxZoom: 17,
		}).addTo(global_Map);
	    }
	    if (markerDisplay == 'markers')
	    {
	    }
	    conf_markerDisplay = markerDisplay;
	}
    }

    function showMarkers(map, data, columns, config, tag)
    {
	    var theMap = map;
	    var hospitalIcon = L.AwesomeMarkers.icon({
			icon: 'ambulance',
			prefix: 'fa',
			markerColor: 'red',
			});
	    var pharmacyIcon = L.AwesomeMarkers.icon({
			icon: 'h-square',
			prefix: 'fa',
			markerColor: 'cadetblue',
			});
	    var clinicIcon = L.AwesomeMarkers.icon({
			icon: 'hospital-symbol',
			prefix: 'fa',
			markerColor: 'darkgreen',
			});
	    var pinIcon = L.AwesomeMarkers.icon({
			icon: 'thumbtack',
			prefix: 'fa',
			markerColor: 'blue',
			});
	    var garbage1IconG = L.AwesomeMarkers.icon({
			icon: 'truck-loading',
			prefix: 'fa',
			markerColor: 'darkgreen',
			});
	    var garbage1IconO = L.AwesomeMarkers.icon({
			icon: 'truck-loading',
			prefix: 'fa',
			markerColor: 'orange',
			});
	    var garbage1IconR = L.AwesomeMarkers.icon({
			icon: 'truck-loading',
			prefix: 'fa',
			markerColor: 'red',
			});
	    var garbage2IconG = L.AwesomeMarkers.icon({
			icon: 'trash-alt',
//			icon: 'dumpster',
			prefix: 'fa',
			markerColor: 'darkgreen',
			});
	    var garbage2IconO = L.AwesomeMarkers.icon({
			icon: 'trash-alt',
//			icon: 'dumpster',
			prefix: 'fa',
			markerColor: 'orange',
			});
	    var garbage2IconR = L.AwesomeMarkers.icon({
			icon: 'trash-alt',
//			icon: 'dumpster',
			prefix: 'fa',
			markerColor: 'red',
			});
	    var markerIcon = hospitalIcon;

	    global_heatData = [];
            if (data.length > 0) {
		var markerClusters = L.markerClusterGroup();
		if (tag == 'garbage')
		{
		    markerClusters = L.featureGroup();
		}
		markerClusters.on('clusterclick', function(a) {a.layer.zoomToBounds();});
		var latIndex = $.inArray('latitude', columns);
                var lngIndex = $.inArray('longitude', columns);
                var pi1 = $.inArray('pi1', columns);
                var pi2 = $.inArray('pi2', columns);
                var pi3 = $.inArray('pi3', columns);
                var pi4 = $.inArray('pi4', columns);
                var pi5 = $.inArray('pi5', columns);
                var pi6 = $.inArray('pi6', columns);
                var pi7 = $.inArray('pi7', columns);
                var scaleFactor = $.inArray('scaleFactor', columns);

		for (var i=0; i < data.length; i++)
                {
                    var point = data[i];
                    if (point[latIndex] == null || point[lngIndex] == null)
                    {
                        console.log(i + " is not defined");
                    } else {
			global_heatData.push([point[latIndex], point[lngIndex], 1]);
                        var title = "ID: " + i;
                        if (pi1 != -1)
                        {
                            title = point[pi1];
			    switch (title) {
				case 'Hospital':
				    markerIcon = hospitalIcon;
				    break;
				case 'Pharmacy':
				    markerIcon = pharmacyIcon;
				    break;
				case 'Clinic':
				    markerIcon = clinicIcon;
				    break;
				default:
				    markerIcon = pinIcon;
			    }
                        }
			if (tag == 'garbage')
			{
			    markerIcon = garbage2IconR;
			    if (title.includes("garbage3")) markerIcon = garbage1IconG; 
			    if (point[pi5] <= 1)
			    {
				markerIcon = garbage2IconG;
			        if (title.includes("garbage3")) markerIcon = garbage1IconG; 
			    } else if (point[pi5] <= 4)
			    {
				markerIcon = garbage2IconO;
			        if (title.includes("garbage3")) markerIcon = garbage1IconO; 
			    } else if (point[pi5] <= 6) 
			    {
				markerIcon = garbage2IconR;
			        if (title.includes("garbage3")) markerIcon = garbage1IconR; 
			    }
			}
                        if (pi2 != -1)
                        {
                            title = title + ", " + point[pi2];
                        }
                        if (pi3 != -1)
                        {
                            title = title + ", " + point[pi3];
                        }
			// check to see if title is an image
                        // in that case, wrap it in html.
                        if (title.startsWith("//"))
                        {
                            title = "<a href='" + title + "' target='_blank'><img src='" + title + "' width='200'/></a>";
                        }
if (config['marker'] === undefined || config['marker'] == 'default')
                        {
			    var dstLat = point[latIndex];
			    var dstLng = point[lngIndex];
                
			    var markerId = "markerId_" + config.type + "_" + i;
			    var markerIdTransit = "markerId_" + config.type + "_" + i + "_Transit";
			    title = title + ", <a href='#' id='" + markerId + "'>Go Here</a>";
//			    title = title + ", <a href='#' id='" + markerIdTransit + "'>Use Transit</a>";
			    if (tag == 'garbage')
			    {
//console.log(i + ", " + point[pi1] + ", " + pi2 + ", " + pi3);
				title = getGarbagePopup(markerId, point[pi2], point[pi3], point[pi4], point[pi5], point[pi7]);
			    }

                            var marker = L.marker([point[latIndex], point[lngIndex]], {icon: markerIcon});
                            marker.bindPopup(title, {maxWidth:300});
                            markerClusters.addLayer(marker);
			    var selector1 = "#" + markerId;
//			    var selector2 = "#" + markerIdTransit;
			    if (tag == 'garbage')
			    {
				var ids = point[pi6].split(":");
				var sheetId = ids[0];
				var objId = ids[1];
                    
			        $("#map-canvas").on('click', selector1, {'markerId': markerId, 'marker': marker, 'layer': point[pi1], 'sheetId': sheetId, 'objId': objId, 'clearedOn': point[pi7]}, emptyTrash);
			    } else {
			        //$("#map-canvas").on('click', selector1, {'srcLat': latitude, 'srcLng': longitude, 'dstLat': dstLat, 'dstLng': dstLng, 'useTransit': 0}, drawPath);
			        $("#map-canvas").on('click', selector1, {'srcLat': latitude, 'srcLng': longitude, 'dstLat': dstLat, 'dstLng': dstLng, 'dstName': point[pi1], 'useTransit': 0}, markSourceAndDest);
			    }
                        } else {
                            var radius = 5;
                            if (!isNaN(point[scaleFactor]))
                            {
                                radius = 5+point[scaleFactor]*50;
                            }
console.log(radius);
                            var m = L.circleMarker([point[latIndex], point[lngIndex]], {color:'red', radius: radius})
                            .bindPopup(title);
                            markerClusters.addLayer(m);
                        }
                    }
                }
                theMap.addLayer(markerClusters);
                theMap.fitBounds(markerClusters.getBounds());
		if (tag == 'connaissances_des_inondations')
	        {
		    var heat = L.heatLayer(global_heatData, {
		        radius: 20,
		        blur: 15,
		        maxZoom: 17,
		    }).addTo(global_Map);
		    conf_markerDisplay = "heatmap";
	        }
	    }
    }

    function getGarbagePopup(markerId, pi1, pi2, pi3, pi4, pi5){
        if (pi1 == null) pi1 = '';
        if (pi2 == null) pi2 = '';
        if (pi3 == null) pi3 = '';
        if (pi4 == null) pi3 = 0;
        var popupHtml = "<table style='text-align:left;width:300px;border-collapse:collapse;padding:3px 3px 3px 3px;'><tr style='text-align:left;font-weight:normal;background:#d3d3d3'><td>Location</td><td>" + pi1 + "</td></tr><tr style='text-align:left;font-weight:normal;background:#FFFFFF;'><td>District</td><td>" + pi2 + "</td></tr><tr style='text-align:left;font-weight:normal;background:#d3d3d3;'><td>Township</td><td>" + pi3 + "</td></tr><tr><td>Last Pickup</td><td><div id='eventTime_" + markerId + "'>" + pi5 + "</td></tr><tr style='text-align:left;font-weight:normal;background:#FFFFFF;line-height:4'><td>Fill Level</td><td><meter id='meter_" + markerId + "' max=6 min=0 high=4.9 low=1.9 optimum=1 value=" + pi4 + "></meter></td></tr></table>";
        popupHtml += "<br />";
        popupHtml += "<button type='button' id='" + markerId + "'>Empty Unit</button>";
        // convert string to an HTMLElement
        var d = document.createElement('div');
        d.innerHTML = popupHtml;
        return (d); 
    }

    function showShapes(map, data, columns, config)
    {
	    var theMap = map;
	    var myLayer = L.geoJSON();
	    var mmLayerGroup = L.layerGroup([]);
            $("<style>").prop("type", "text/css")
                .html("\
                    .leaflet-div-icon2 {\
                      background: red;\
                      border: 1px solid rgba(255,255,255,0.5);\
                      color: blue;\
                      font-weight: bold;\
                      text-align: center;\
                      border-radius: 50%;\
                      line-height: 30px;\
                    }")
                .appendTo("head");
                var myIcon = L.divIcon({className: 'leaflet-div-icon2'});

            if (data.length > 0) {
		var shapeIndex = $.inArray('shape', columns);
                var pi1 = $.inArray('pi1', columns);
                var pi2 = $.inArray('pi2', columns);
                var pi3 = $.inArray('pi3', columns);
                var scaleFactor = $.inArray('scaleFactor', columns);

		for (var i=0; i < data.length; i++)
                {
                    var point = data[i];
                    if (point[shapeIndex] == null)
                    {
                        console.log(i + " is not defined");
                    } else {
                        var title = "ID: " + i;
                        if (pi1 != -1)
                        {
                            title = point[pi1];
                        }
                        if (pi2 != -1)
                        {
                            title = title + ", " + point[pi2];
                        }
                        if (pi3 != -1)
                        {
                            title = title + ", " + point[pi3];
                        }
			// check to see if title is an image
                        // in that case, wrap it in html.
                        if (title.startsWith("//"))
                        {
                            title = "<a href='" + title + "' target='_blank'><img src='" + title + "' width='200'/></a>";
                        }

                        var line = [{
			    "type": "LineString",
			    "coordinates": point[shapeIndex]
			}]; 
/*
			L.geoJSON(line, {
			    coordsToLatLng: function(coords) {
				return new L.LatLng(coords[0], coords[1], coords[2]);
			    }
			}).addTo(theMap);
*/
			myLayer.addData(line);
//console.log(line);
			var flipCoords = [];
			var coords = point[shapeIndex];
			for (var j = 0; j < coords.length; j++)
			{
			    flipCoords.push([coords[j][1], coords[j][0]]);
			}
			var mm = L.Marker.movingMarker(flipCoords, 10000, {autostart: true, loop:true});
			mm.options.icon = myIcon;
			mmLayerGroup.addLayer(mm);	
                    }
                }
                theMap.fitBounds(myLayer.getBounds());
                theMap.addLayer(myLayer);
                theMap.addLayer(mmLayerGroup);
	    }
    }
    
var globalData;
var globalSubData;
var globalMap;
var globalMarkerType1;
var globalMarkerType2;
var globalMarker = null;
var globalLine = null;
    
    function markSourceAndDest(dataObj){

       $('#searchContainer').hide();
       $('#originDestContainer').show();
       $('#origin').val("Your Location");
       $('#dest').val(dataObj.data.dstName);

       $('#chooseCategory').hide();
       $('#bottomNavGoBtn').show();
       $('#bottomNavBackBtn').show();
    
        
        var srcLat = dataObj.data.srcLat;
        if (srcLat) {} else { srcLat = latitude; console.log("setting srcLat to " + srcLat);}
        var srcLng = dataObj.data.srcLng;
        if (srcLng) {} else { srcLng = longitude; console.log("setting srcLng to " + srcLng);}
        var dstLat = dataObj.data.dstLat;
        var dstLng = dataObj.data.dstLng;
        
console.log(srcLat + ", " + srcLng + ", " + dstLat + ", " + dstLng);
        var useTransit = dataObj.data.useTransit;
        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var r = $.post(url, {'srcLat': srcLat, 'srcLng': srcLng, 'dstLat': dstLat, 'dstLng': dstLng, 'useTransit': useTransit},
    function (data, textStatus, jqXHR){
//console.log(data);
          globalData = data;
          
          if (useTransit == 0)
          {
          console.log(data.data1.routes[0].legs[0].steps);
          console.log(data.data2);
              showLocations(data.data2, data.command.command);
              //showDetails(data.data1.routes[0].legs[0].steps);
          } else {
                if (data.command.command !== undefined)
                {
                    showLocations(data.data2, data.command.command);
                    //showDetails(data.data1.routes[0].legs[0].steps);
                } else {
                    showLocations(data.data21, data.command.command1, data.data22, data.command.command2);
                    //showDetails(data.data11.routes[0].legs[0].steps, data.transitData, data.data12.routes[0].legs[0].steps);
                }
          }
          //var x = document.getElementById("footer");
          //x.style.display = "block";
//            showMarkers(data.data, data.columns, data.config);
        }).fail(function(jqXHR, textStatus, errorThrown){
            alert(textStatus);
        });

    }
    
    
    function showLocations(collection1, marker1, collection2, marker2){
        $("#map-container").remove();
    //	$("<div id='map-container' style='width:100%;max-width:none;'><div id='map-canvas' style='height:100%'></div></div>").appendTo('#contents');
    
        $("<div id='map-container' style='width:auto;max-width:none;'><div id='map-canvas' style='height:100%'></div></div>").appendTo('#contents');

        var openstreetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        subdomains: ['a', 'b', 'c'],
                        maxZoom:17,
                        minZoom: 2
                    });

        var map  = {}
        if(isMobile){
            map = L.map('map-canvas',{zoomControl: false}).addLayer(openstreetTiles);
        } else {
            map = L.map('map-canvas').addLayer(openstreetTiles);
        }
        
        showMarkerForLocations(collection1, map, marker1, marker2);
        if (collection2 !== undefined) showMarkerForLocations(collection2, map, marker2);
    }
    
    
    function showMarkerForLocations(data, map, markerType1, markerType2)
    {
console.log("in move Marker: " + markerType1 + "," + markerType2);
console.log(data);
        
        map.setView([data[0].lat, data[0].lng], 14);
        var route = L.polyline(data);
        map.fitBounds(route.getBounds());
        
        globalLine = L.polyline([]).addTo(map);
        var srcMarker = L.marker([data[0].lat, data[0].lng], {rotationAngle: 10}).bindPopup('Start Here').addTo(map);
        var destMarker = L.marker([data[data.length-1].lat, data[data.length-1].lng], {rotationAngle: 10}).bindPopup('Your Destination').addTo(map);
        
        
        globalSubData = data;
        globalMap = map;
        globalMarkerType1 = markerType1;
        globalMarkerType2 = markerType2;

    }
    
    function drawPathBetweenLocations(){
       var subwayMarker = L.AwesomeMarkers.icon({
                icon: 'train',
                prefix: 'fa',
                markerColor: 'red'
            });

	   var taxiMarker = L.divIcon({
	       html: '<i class="fas fa-taxi fa-2x" style="color: darkorange"></i>',
	       iconSize: null,
	       className: 'myTransitIcon'
	   });
	   var walkingMarker = L.divIcon({
	       html: '<i class="fas fa-walking fa-2x" style="color: darkgreen"></i>',
	       iconSize: null,
	       className: 'myTransitIcon'
	   });

	   var iconMarker = taxiMarker;
        
        function redraw(point) {
            if (!globalMarker) {
                if (globalMarkerType1 == 'walk')
                {
                    iconMarker = walkingMarker;
                }
                globalMarker = L.marker([point.lat, point.lng], {icon: iconMarker}).addTo(globalMap);
                //var srcMarker = L.marker([point.lat, point.lng], {icon: iconMarker}).bindPopup('Start Here').addTo(globalMap);
            }
            globalLine.addLatLng([point.lat, point.lng]);
            globalMarker.setLatLng([point.lat, point.lng]).bindPopup('');

            if (point.station !== undefined)
            {
                var stationMarker = L.marker([point.lat, point.lng], {icon: subwayMarker}).bindPopup(point.station).addTo(globalMap);
                if (globalMarkerType2 == 'walk')
                {
                    iconMarker = walkingMarker;
                }
                globalMarker.setIcon(iconMarker);
            }
        }
        
        function update() {
            if (globalSubData.length) {
                redraw(globalSubData.shift());
                setTimeout(update, 30);
            }
        }
        setTimeout(update, 500);
    }

    function drawPath(event){
        var srcLat = event.data.srcLat;
        if (srcLat) {} else { srcLat = latitude; console.log("setting srcLat to " + srcLat);}
        var srcLng = event.data.srcLng;
        if (srcLng) {} else { srcLng = longitude; console.log("setting srcLng to " + srcLng);}
        var dstLat = event.data.dstLat;
        var dstLng = event.data.dstLng;
console.log(srcLat + ", " + srcLng + ", " + dstLat + ", " + dstLng);
        var useTransit = event.data.useTransit;
        
        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var r = $.post(url, {'srcLat': srcLat, 'srcLng': srcLng, 'dstLat': dstLat, 'dstLng': dstLng, 'useTransit': useTransit},
    function (data, textStatus, jqXHR){
//console.log(data);
          if (useTransit == 0)
          {
          console.log(data.data1.routes[0].legs[0].steps);
          console.log(data.data2);
              showDirections(data.data2, data.command.command);
              showDetails(data.data1.routes[0].legs[0].steps);
          } else {
                if (data.command.command !== undefined)
                {
                    showDirections(data.data2, data.command.command);
                    showDetails(data.data1.routes[0].legs[0].steps);
                } else {
                    showDirections(data.data21, data.command.command1, data.data22, data.command.command2);
                    showDetails(data.data11.routes[0].legs[0].steps, data.transitData, data.data12.routes[0].legs[0].steps);
                }
          }
          var x = document.getElementById("footer");
          x.style.display = "block";
//            showMarkers(data.data, data.columns, data.config);
        }).fail(function(jqXHR, textStatus, errorThrown){
            alert(textStatus);
        });

    }

    function emptyTrash(event){
        var markerId = event.data.markerId;
        var marker = event.data.marker;
        var dataLayer = event.data.layer;
        var sheetId = event.data.sheetId;
        var objId = event.data.objId;
        var clearedOn = event.data.clearedOn;
        console.log(sheetId);
        console.log(objId);
        var garbage1IconG = L.AwesomeMarkers.icon({
		icon: 'truck-loading',
		prefix: 'fa',
		markerColor: 'darkgreen',
		});
        var garbage2IconG = L.AwesomeMarkers.icon({
		icon: 'trash-alt',
		prefix: 'fa',
		markerColor: 'darkgreen',
		});
        if(dataLayer == 'garbage3'){
            marker.setIcon(garbage1IconG);
        } else {
            marker.setIcon(garbage2IconG);
        }
        $("#meter_" + markerId).attr('value', 0.1);
        $("#meter_" + markerId).val(0.1);
        
        var url = 'https://hawkaidata.net/api/addToDataset.php?key=' + cityApiKey;
        var r = $.post(url, {'tag': 'garbageeventlog', 'Sheet Id': sheetId, 'Object Id': objId, 'Operation': 'update', 'Name': 'level', 'Value': 0.1},
        function(data, textStatus, jqXHR){
	    var obj=JSON.parse(data);
	    $("#eventTime_" + markerId).html(obj.eventTime);
        }).fail(function(jqXHR, textStatus, errorThrown){
            alert(textStatus);
        });
    }

    function showDirections(collection1, marker1, collection2, marker2){
        $("#map-container").remove();
    //	$("<div id='map-container' style='width:100%;max-width:none;'><div id='map-canvas' style='height:100%'></div></div>").appendTo('#contents');
    
        $("<div id='map-container' style='width:auto;max-width:none;'><div id='map-canvas' style='height:100%'></div></div>").appendTo('#contents');

        var openstreetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        subdomains: ['a', 'b', 'c'],
                        maxZoom:17,
                        minZoom: 2
                    });

        var map  = {}
        if(isMobile){
            map = L.map('map-canvas',{zoomControl: false}).addLayer(openstreetTiles);
        } else {
            map = L.map('map-canvas').addLayer(openstreetTiles);
        }
        
        moveMarker(collection1, map, marker1, marker2);
        if (collection2 !== undefined) moveMarker(collection2, map, marker2);
    }

    function moveMarker(data, map, markerType1, markerType2)
    {
console.log("in move Marker: " + markerType1 + "," + markerType2);
console.log(data);
        console.log(data[0] + "Hello");
        map.setView([data[0].lat, data[0].lng], 14);
        var route = L.polyline(data);
        map.fitBounds(route.getBounds());
        var marker = null;
        var line = L.polyline([]).addTo(map);
        var srcMarker = L.marker([data[0].lat, data[0].lng], {rotationAngle: 10}).bindPopup('Start Here').addTo(map);
        var destMarker = L.marker([data[data.length-1].lat, data[data.length-1].lng], {rotationAngle: 10}).bindPopup('Your Destination').addTo(map);
/*
        var taxiMarker = L.AwesomeMarkers.icon({
               icon: 'taxi',
                prefix: 'fa',
                markerColor: 'cadetblue'
            });
*/
        var subwayMarker = L.AwesomeMarkers.icon({
                icon: 'train',
                prefix: 'fa',
                markerColor: 'red'
            });
/*
        var walkingMarker = L.AwesomeMarkers.icon({
                icon: 'walking',
                prefix: 'fa',
                markerColor: 'darkgreen'
            });
*/
	var taxiMarker = L.divIcon({
	    html: '<i class="fas fa-taxi fa-2x" style="color: darkorange"></i>',
	    iconSize: null,
	    className: 'myTransitIcon'
	});
	var walkingMarker = L.divIcon({
	    html: '<i class="fas fa-walking fa-2x" style="color: darkgreen"></i>',
	    iconSize: null,
	    className: 'myTransitIcon'
	});

	var iconMarker = taxiMarker;

        function redraw(point) {
            if (!marker) {
		if (markerType1 == 'walk')
		{
		    iconMarker = walkingMarker;
		}
                marker = L.marker([point.lat, point.lng], {icon: iconMarker}).addTo(map);
//                var srcMarker = L.marker([point.lat, point.lng], {icon: iconMarker}).bindPopup('Start Here').addTo(map);
            }
            line.addLatLng([point.lat, point.lng]);
            marker.setLatLng([point.lat, point.lng]).bindPopup('');

            if (point.station !== undefined)
            {
                var stationMarker = L.marker([point.lat, point.lng], {icon: subwayMarker}).bindPopup(point.station).addTo(map);
		if (markerType2 == 'walk')
		{
		    iconMarker = walkingMarker;
		}
		marker.setIcon(iconMarker);
            }
        }

        function update() {
            if (data.length) {
                redraw(data.shift());
                setTimeout(update, 30);
            }
        }
        setTimeout(update, 500);
    }

    function showDetails(steps, transit, steps2){
        $("#footer_content").html("<div id='showDetails-close-button' style='float:right; padding: 2px 20px 0px 0px;'><i class='fa fa-times-circle' aria-hidden='true'></i></div>");
        var numSteps = steps.length;
        for (var i=0; i < numSteps; i++){
            var dist = steps[i].distance.text;
            var duration = steps[i].duration.text;
            var text = steps[i].html_instructions + ", " + dist + ", " + duration + "<br />";
            $("#footer_content").append(text);
        }

        if (transit !== undefined){
            var transitText = "<br />" + transit + "<br /><br />";
            $("#footer_content").append(transitText);

            var numSteps = steps2.length;
            for (var i=0; i < numSteps; i++){
                var dist = steps2[i].distance.text;
                var duration = steps2[i].duration.text;
                var text = steps2[i].html_instructions + ", " + dist + ", " + duration + "<br />";
                $("#footer_content").append(text);
            }
        }
    }




    

});

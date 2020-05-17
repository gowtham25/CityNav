
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

handleUserClick('Essentials');

var global_map;
    function handleUserClick(tag)
    {
        var url = 'https://hawkaidata.net/api/citynavAPI.php?key=' + cityApiKey;
        var r = $.post(url, {appName: 'Covid', 'tag': tag},
        function (data, textStatus, jqXHR)
        {
//	    if (data.data === undefined) data = JSON.parse(data);
	    var map = initMap(data.config, tag);
	    global_map = map;
            showMarkers(map, data.data, data.columns, data.config, tag);
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

    $("#searchItem").keypress(function(){
        searchItem($("#searchItem").val());    
    });   
    

	var conf_marker = 'default';
/*
        var center_lat = 4.061536; // US center lat
        var center_lng = 9.786072; // US center long
        var zoom_level = 4;  // country zoom
*/
        var center_lat = cityCenter.lat; // US center lat
        var center_lng = cityCenter.lng; // US center long
        var zoom_level = 11;  // city zoom
	if (config !== undefined)
	{
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
	    if (markerDisplay == 'markers')
	    {
	    }
	    conf_markerDisplay = markerDisplay;
	}
    }

    function showMarkers(map, data, columns, config, tag)
    {
	    var theMap = map;

let categoryDetails = {
'hospital' : {'icon' : 'ambulance', 'prefix' : 'fa'},
'pharmacy' : {'icon' : 'hospital-symbol', 'prefix' : 'fa'},
'gas_station' : {'icon' : 'gas-pump', 'prefix' : 'fa'},
'default' : {'icon' : 'thumbtack', 'prefix' : 'fa'},
};

            if ((data !== undefined) && (data.length > 0)) {
//		var markerClusters = L.featureGroup();
		var markerClusters = L.markerClusterGroup(); 
		markerClusters.on('clusterclick', function(a) {a.layer.zoomToBounds();});
		var latIndex = $.inArray('latitude', columns);
                var lngIndex = $.inArray('longitude', columns);
                var categoryIndex = $.inArray('category', columns);
                var typeIndex = $.inArray('type', columns);
                var valuesIndex = $.inArray('values', columns);
                var lastUpdateIndex = $.inArray('lastUpdate', columns);
                var imageURLIndex = $.inArray('imageURL', columns);
                var pi1 = $.inArray('pi1', columns);
                var pi2 = $.inArray('pi2', columns);
                var pi3 = $.inArray('pi3', columns);
                var imageIndex = $.inArray('image', columns);

                var scaleFactor = $.inArray('scaleFactor', columns);

		for (var i=0; i < data.length; i++)
                {
                    var point = data[i];
                    if (point[latIndex] == null || point[lngIndex] == null)
                    {
                        console.log(i + " is not defined");
                    } else {
			var categoryType = "";
			var imageURL = "";
                        if (point[typeIndex] !== null)
                        {
			    categoryType = point[typeIndex];
			}
                        if (point[imageURLIndex] !== null)
                        {
			    imageURL = point[imageURLIndex];
			}
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
if (config['marker'] === undefined || config['marker'] == 'default')
                        {
			    var dstLat = point[latIndex];
			    var dstLng = point[lngIndex];
                
			    var markerId = "markerId_" + config.type + "_" + i;
			    var markerIdTransit = "markerId_" + config.type + "_" + i + "_Transit";
			    title = title + ", <a href='#' id='" + markerId + "'>Go Here</a>";
                if (point[imageIndex] && point[imageIndex].startsWith("//")){
                    var image = point[imageIndex];
                    title = "<a href='" + image + "' target='_blank'><img src='" + image + "' width='200'/></a>";
                }
				var resourceAvails = point[valuesIndex];
//				title = getEssentialsPopup(markerId, categoryType, point[pi1], resourceAvails, point[lastUpdateIndex]);
				var category = point[categoryIndex];
				title = getEssentialsPopup2(markerId, categoryType, point[pi1], resourceAvails, point[lastUpdateIndex], category, imageURL);
				var iconColor = "green";
			        var availUnits = 0;
			        var numResources = 0;
				Object.keys(resourceAvails).forEach(function(key) {
				    availUnits += resourceAvails[key];
				    numResources++;
				});
				var normalizedAvails = availUnits/numResources;
				if (normalizedAvails <= 1) iconColor = "orange";
				if (normalizedAvails == 0) iconColor = "red";
			    if (categoryDetails[categoryType] === undefined) categoryType = 'default';
//			    var markerIcon = L.AwesomeMarkers.icon({icon: categoryDetails[categoryType].icon, markerColor: iconColor, prefix: categoryDetails[categoryType].prefix});
			    var markerIcon = L.AwesomeMarkers.icon({icon: GLOBAL_categories[category].icon, markerColor: iconColor, prefix: 'fa'});
                            var marker = L.marker([point[latIndex], point[lngIndex]], {icon: markerIcon});
console.log(point[latIndex] + "," + point[lngIndex]);
                            marker.bindPopup(title, {maxWidth:300});
                            markerClusters.addLayer(marker);
			    var selector1 = "#" + markerId;
//			    var selector2 = "#" + markerIdTransit;
		            $("#map-canvas").on('click', selector1, {'srcLat': latitude, 'srcLng': longitude, 'dstLat': dstLat, 'dstLng': dstLng, 'dstName': point[pi1], 'useTransit': 0}, markSourceAndDest);
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
	    }
    }

    function getEssentialsPopup(markerId, category, name, resources, lastUpdate){
	var popupHtmlStart = name;
	popupHtmlStart += "<br/><br/><table style='text-align:left;border-collapse:collapse;padding:3px 3px 3px 3px;width:100px;'>";
	var popupHtmlEnd = "</table>";
	var popupMiddle = '';
	Object.keys(resources).forEach(function(key) {
	    popupMiddle += "<tr style='text-align:left;font-size:10px;'><td style=''>" + key + "</td>";
	    var resourceColor = "green";
	    if ((resources[key]) == 0) resourceColor = "red";
	    if ((resources[key]) == 1) resourceColor = "yellow";
	    popupMiddle += "<td><span style='height:10px;width:10px;border-radius:50%;display:inline-block;background-color:" + resourceColor + "'></td>";
	    popupMiddle += "</tr>";
	});
        popupHtmlEnd += "<br /><a href='#' id='" + markerId + "'>Go Here</a>" + "<br /><br/>Last Update: ";

	if (lastUpdate == 0)
	{
            popupHtmlEnd += "Status Unknown";
	} else {
            popupHtmlEnd += lastUpdate;
	}
        // convert string to an HTMLElement
        var d = document.createElement('div');
        d.innerHTML = popupHtmlStart + popupMiddle + popupHtmlEnd;
        return (d); 
    }

function getEssentialsPopup2( markerId, type, name, resources, lastUpdate, category, imageURL) {
const { bgclass = "bg-dark", color = "#000000", icon = "crosshairs", textclass = "text-black-50", title = category, types = {} } = GLOBAL_categories[category] || {};
        const { title: subTitle = type, icon: subIcon = "crosshairs" } = types[type] || {};
        let popupHtmlStart = "<div class='location-details'>";
        popupHtmlStart +=
            "<div class='marker-title text-warning " + textclass + "'><i class='fad fa-" + icon + "'></i>" +
            "<b>" + name + "</b></div>";
        popupHtmlStart += "<div class='divider'></div>";
        popupHtmlStart += '<div class="container marker-cattype ' + textclass + '">'; 
	popupHtmlStart += '<div class="row"><div class="col"><i class="fad fa-' + icon + '"></i>' + title + '</div>' +
            '<div class="col"><div class="text-right">' +
            '<i class="fad fa-' + subIcon + '"></i>' + subTitle +
            '</div></div></div></div>';
        popupHtmlStart += '<div class="container">' +
            '<div class="row">';
	if (imageURL && (/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i).test($.trim(imageURL))){
	    popupHtmlStart += '<div class="col-md-4">';
	    popupHtmlStart += '<div class="marker-img-url-holder bg-vicious-stance"><div class="marker-img-url" style="background-image: url(\''+imageURL+'\')"></div></div>';
	    popupHtmlStart += '</div>';
	    popupHtmlStart += '<div class="col-md-8">';
	} else {
	    popupHtmlStart += '<div class="col-md-12">';
	}
	popupHtmlStart += '</div></div></div>';
        popupHtmlStart += '<div class="container text-light"> <table class="values-table" width="100%" cellspacing="2" cellpadding="2" border="0"><tbody>';
        Object.keys(resources).forEach(function (key) {
            var resourceColor = "bg-success";
            if (resources[key] == 0) resourceColor = "bg-danger";
            if (resources[key] == 1) resourceColor = "bg-warning";
            popupHtmlStart +=
                "<tr>" +
                '<td style="text-align:left;"><span class="badge border-rounder ' +
                resourceColor +
                '"></span></td>' +
                "<td>" +
                key +
                "</td>";
            popupHtmlStart += "</tr>";
        });
        popupHtmlStart += "<tbody></table></div>";
        popupHtmlStart += "<div class='divider'></div>";
        let rgb = hexToRgba(color);
        let rgbaBorder = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
        let rgbaBackground = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.1)';
        popupHtmlStart += '<div class="flex-container">' +
            "<button style='background: " + rgbaBackground + ";border: 1px solid " + rgbaBorder + ";color: " + color + ";' class='go-button' id='" + markerId + "'><i class='reverse-icon fas fa-map-signs'></i>GO HERE</button>" +
            "<span><i class='text-center fas fa-calendar-check'></i> <span/>";

        if (lastUpdate == 0) {
            popupHtmlStart += "N/A";
        } else {
            popupHtmlStart += lastUpdate;
        }
        popupHtmlStart += "</div></div>";
        // convert string to an HTMLElement
        var d = document.createElement("div");
        d.innerHTML = popupHtmlStart;
        return d;
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
	var userLang = localStorage.getItem('userLang');
        userLang = userLang ? userLang : "en";
        
console.log(srcLat + ", " + srcLng + ", " + dstLat + ", " + dstLng);
        var useTransit = dataObj.data.useTransit;
        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var r = $.post(url, {'srcLat': srcLat, 'srcLng': srcLng, 'dstLat': dstLat, 'dstLng': dstLng, 'useTransit': useTransit, 'userLang': userLang},
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

    function searchItem(item){
        L.circleMarker([conf_searchLat, conf_searchLng], {color:'red', radius: 5}).bindPopup(item).addTo(global_Map);
    }

    var autoCompleteSetup = false;
    $(document).on('focus', '#searchItem', function(){
        if (autoCompleteSetup == false){
            $('#searchItem').autocomplete({
                appendTo: "#searchContainer",
                source: function(request, response) {
                    var inputText = request.term;
                    inputText = inputText.replace('#', '!hash!');
                    
                    var url = 'https://hawkaidata.net/api/citynavAPI.php?key=' + cityApiKey;
                    var r = $.post(url, {'inputText': inputText},
                        function (data, textStatus, jqXHR)
                    {
                    response(data);
                    });
                    },
                select: function(event, ui) {
                   conf_searchValue = ui.item.value;
                   conf_searchLat = ui.item.lat;
                   conf_searchLng = ui.item.lng;
                   searchItem(ui.item.value);
                    
                   getUserLocation();
                    
                   var dataObj = {"data":{}};
                   dataObj.data.srcLat = latitude;
                   dataObj.data.srcLng = longitude;
                   dataObj.data.dstLat = ui.item.lat;
                   dataObj.data.dstLng = ui.item.lng;
                   dataObj.data.dstName = ui.item.value;
                   dataObj.data.useTransit = 0;
                  
                   //drawPath(dataObj);
                   markSourceAndDest(dataObj);
                    
                }
            });
           autoCompleteSetup = true;
        }
    });
    
    function checkForNewMsg(){
        let timeDiff = 0;
        let lastMsgFetchTimeStamp = localStorage.getItem(lastMsgFetchTimeStampKey);
        if(lastMsgFetchTimeStamp == null){
            lastMsgFetchTimeStamp = new Date();
            fetchNewMessages();
            localStorage.setItem(lastMsgFetchTimeStampKey, lastMsgFetchTimeStamp);
        } else {
            //timeDiff in ms
            timeDiff = new Date().getTime() - new Date(localStorage.getItem(lastMsgFetchTimeStampKey)).getTime(); 
            if(timeDiff > msgCacheTimeout){ // Make the call to server to get messages
                fetchNewMessages();
            } else {
                lookupMessages();
            }
        }
    }

    function lookupMessages(){
        let newMsgCount = localStorage.getItem(newMsgCountKey);
        if(newMsgCount != null && newMsgCount > 0){
            $('#newMsgCount').html(' ('+ newMsgCount +')');
        }
    }

    function fetchNewMessages(){
        let newMsgCount = 0;
        let currentMaxMsgIndex = localStorage.getItem(currentMaxMsgIndexKey);
        let maxMsgIndex = localStorage.getItem(maxMsgIndexKey);
        if(currentMaxMsgIndex == null){
            currentMaxMsgIndex = 0;
            localStorage.setItem(currentMaxMsgIndexKey, currentMaxMsgIndex);
        }
        if(maxMsgIndex == null){
            maxMsgIndex = 0;
            localStorage.setItem(maxMsgIndexKey, maxMsgIndex);
        }

        var url = 'https://hawkaidata.net/api/eas.php?key=' + cityApiKey;
        var r = $.post(url, {},
        function (resp, textStatus, jqXHR)
        {
            let msgsArray = resp.data;
            let msgsLen = resp.data.length;
            
            for(let i=0;i<msgsLen;i++){
                if(msgsArray[i][0] > currentMaxMsgIndex){
                    newMsgCount++;
                }
                if(msgsArray[i][0] > maxMsgIndex){
                    maxMsgIndex = msgsArray[i][0];
                }
            }
            
            if(newMsgCount > 0){
                $('#newMsgCount').html(' ('+ newMsgCount +')');
                localStorage.setItem(maxMsgIndexKey, maxMsgIndex);
                localStorage.setItem(newMsgCountKey, newMsgCount);
                sessionStorage.setItem(msgDataKey, JSON.stringify(msgsArray));
            }
        }).fail(function(jqXHR, textStatus, errorThrown)
        {
            alert(textStatus);
        }
        );
    }
    
    $('#sideNavCloseBtn').click(function(){
        $('#sideNavContainer').slideUp();
    });
    
    $('#chooseCategory').on('click swipeup', function(){
        $('#sideNavContainer').hide();
        $('#bottomBar').hide();
        $('#categoriesContainer').slideToggle();
    });
    
    $('#categoriesCloseBtn').click(function(){
        $('#categoriesContainer').slideToggle();
        $('#bottomBar').show();
    });
    
    $('#searchIcon').click(function(){
        searchItem($('#searchItem').val());
    });
    
    $('#bottomNavGoBtn').click(function(){
        drawPathBetweenLocations();
        $('#bottomNavGoBtn').hide();
        $('#chooseCategory').hide();
        $('#bottomBar').show();
        $('#routeDetailsBtn').show();
    });
    
    $('#bottomNavBackBtn').click(function(){
        $('#bottomNavBackBtn').hide();
        $('#bottomNavGoBtn').hide();
        $('#chooseCategory').show();
        $('#bottomBar').show();
        $('#routeDetailsBtn').hide();
        $('#originDestContainer').hide();
        $('#searchContainer').show(); 
        $('#searchItem').autocomplete('close');
    });

    
    function showRouteDetails(steps, transit, steps2){
        
        $("#routeDetailsContainer").html('<div id="routeDetailsCloseBtnContainer"><i class="far fa-times-circle fa-2x" id="routeDetailsCloseBtn"></i></div>');
        var numSteps = steps.length;
        for (var i=0; i < numSteps; i++){
            var dist = steps[i].distance.text;
            var duration = steps[i].duration.text;
            var text = steps[i].html_instructions + ", " + dist + ", " + duration + "<br /><br />";
            $("#routeDetailsContainer").append(text);
        }

        if (transit !== undefined){
            var transitText = "<br />" + transit + "<br /><br />";
            $("#routeDetailsContainer").append(transitText);

            var numSteps = steps2.length;
            for (var i=0; i < numSteps; i++){
                var dist = steps2[i].distance.text;
                var duration = steps2[i].duration.text;
                var text = steps2[i].html_instructions + ", " + dist + ", " + duration + "<br /><br />";
                $("#routeDetailsContainer").append(text);
            }
        }
        
       $('#routeDetailsCloseBtn').click(function(){
          $('#routeDetailsContainer').hide();
       });
        
    }
    
    $('#routeDetailsBtn').click(function(){
       $('#routeDetailsContainer').show();
       showRouteDetails(globalData.data1.routes[0].legs[0].steps); 
    });
    
    $('.sideNavSubMenuItem').click(function(evt){
        evt.preventDefault();
        var fileName = $(this).attr('data-link-file');

        if(fileName != ''){
            var userLang = localStorage.getItem('userLang');
            userLang = userLang ? userLang : "en";
            //window.open('./' + fileName + '_' + userLang + '.html', '_self');
            window.open('./' + fileName + '_' + 'en' + '.html', '_self'); // for now default to en
        }
        
        
    });
    
    $('.sideNavMenuItem').click(function(evt){
        evt.preventDefault();
        var fileName = $(this).attr('data-filename');
        
        if(fileName){
            if(fileName == 'new-location-sel-category'){
                let userName = localStorage.getItem('username');
                let userEmail = localStorage.getItem('useremail');
                let userPhone = localStorage.getItem('userphone');

                if(!userPhone || !userName || !userEmail){
                    let confirmBox = confirm("Please provide all your details in the profile section to use this feature");
                    if(confirmBox){
                        fileName = 'profile-settings';
                    } else {
                        return;
                    }
                }
            }
            var userLang = localStorage.getItem('userLang');
            userLang = userLang ? userLang : "en";
            if(fileName == 'how-to-guide'){
                window.open('http://citiesnavigator.com/guide/how_to_' + userLang + '.html', '_blank'); 
            } else {
                //window.open('./' + fileName + '_' + userLang + '.html', '_self');
                window.open('./' + fileName + '_' + 'en' + '.html', '_self'); // for now default to en
            }
            return;
        }
        $('#' + $(this).attr('id') + ' .sideNavSubMenuItem').toggle();
    });


    // Handle category clicks
    $("#pharmaciesCat").click(function(event) {
        $('#categoriesContainer').slideToggle();
        $('#bottomBar').show();
        $('#sideNavContainer').hide();
        handleUserClick('pharmacy');
    });
    
    $("#gasStationsCat").click(function(event) {
        $('#categoriesContainer').slideToggle();
        $('#bottomBar').show();
        $('#sideNavContainer').hide();
        handleUserClick('gas_station');
    });
 
    $("#hospitalsCat").click(function(event) {
        $('#categoriesContainer').slideToggle();
        $('#bottomBar').show();
        $('#sideNavContainer').hide();
        handleUserClick('hospital');
    });
    
});

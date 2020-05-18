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

var latitude;
var longitude;

// uses mobile-detect.js
var md = new MobileDetect(window.navigator.userAgent);
var isMobile = md.os() == 'iOS' || md.os() == 'AndroidOS';

handleUserClick('connaissances_des_inondations');

var global_map;
    function handleUserClick(tag)
    {
//        var url = 'https://hawkaidata.net/api/esriAPI.php?key=' + cityApiKey;
        var url = 'https://hawkaidata.net/api/execCommand.php?fileId=310'
        var r = $.get(url, {'command': 'Latitude Longitude Confirmed Deaths Recovered Combined_Key Last_Update'},
        function (data, textStatus, jqXHR)
        {
	    var map = initMap(data.command, tag);
	    global_map = map;
            showMarkers(map, data.data, data.columns, data.labels, data.command, tag);
        }).fail(function(jqXHR, textStatus, errorThrown)
        {
            alert(textStatus);
        }
        );
    }

    function initMap(config, tag)
    {
	$("#map-container").remove();
	$("<div id='map-container' style='height:auto;width:auto;max-width:none;'><div id='map-canvas' style='height:100%;'></div></div>").appendTo('#contents');

	var tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	conf_mapTile = 'defaultMap';
        conf_markerDisplay = 'heatmap';

	var conf_marker = 'default';
        var center_lat = cityData.cityCenter.lat;
        var center_lng = cityData.cityCenter.lng;
        var zoom_level = 3;  // country zoom

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

    function showMarkers(map, data, columns, labels, config, tag)
    {
	    var theMap = map;
	    var hospitalIcon = L.AwesomeMarkers.icon({
			icon: 'ambulance',
			prefix: 'fa',
			markerColor: 'red',
			});
	    var coronaIcon = L.icon({
//		iconUrl:'./icons/nav-covid19.png',
		iconUrl:'./icons/Corona_Icon_24x24.png',
		iconSize: [24,24],
	    });
	    var markerIcon = coronaIcon;

	    global_heatData = [];
            if (data.length > 0) {
		var markerClusters = L.markerClusterGroup();
		markerClusters.on('clusterclick', function(a) {a.layer.zoomToBounds();});
		var latIndex = $.inArray('latitude', columns);
                var lngIndex = $.inArray('longitude', columns);
		var pi1Label = $.map(labels, function(v,k) {if (v == 'Confirmed') return k;});
		var pi2Label = $.map(labels, function(v,k) {if (v == 'Deaths') return k;});
		var pi3Label = $.map(labels, function(v,k) {if (v == 'Recovered') return k;});
		var pi4Label = $.map(labels, function(v,k) {if (v == 'Combined_Key') return k;});
		var pi5Label = $.map(labels, function(v,k) {if (v == 'Last_Update') return k;});
                var pi1 = $.inArray(pi1Label[0], columns);
                var pi2 = $.inArray(pi2Label[0], columns);
                var pi3 = $.inArray(pi3Label[0], columns);
                var pi4 = $.inArray(pi4Label[0], columns);
                var pi5 = $.inArray(pi5Label[0], columns);
                var scaleFactor = $.inArray('scaleFactor', columns);

		for (var i=0; i < data.length; i++)
                {
                    var point = data[i];
                    if (point[latIndex] == null || point[lngIndex] == null)
                    {
                        console.log(i + " is not defined");
                    } else {
			global_heatData.push([point[latIndex], point[lngIndex], point[pi1]]);
      var title = '<div class="location-details">';
  if (pi4 != -1) {
      title =
          title +
          "<b class='title'>" +
          point[pi4] +
          "</b><br>";
  }
  if (pi5 != -1) {
      var updateTime = point[pi5];
      if (isMobile) {
          title =
              title +
              '<div class="text-muted">Last Updated: ' +
              updateTime.substring(
                  0,
                  updateTime.indexOf(" ")
              ) +
              "</div></br>";
      } else {
          title =
              title +
              '<div class="text-muted">Last Updated: ' +
              updateTime.substring(
                  0,
                  updateTime.indexOf(" ")
              ) +
              "</div><div class='divider'></div>";
      }
  }
  title =
      title +
      '<div><table class="values-table" width="100%" cellspacing="2" cellpadding="0" border="0"><tbody>';
  if (pi1 != -1) {
      title =
          title +
          '<tr><td width="30px" align="left"><span class="badge badge-warning">&nbsp;</span></td><td>' +
          labels[pi1Label[0]] +
          ': </td><td style="color:#ff8c00">' +
          point[pi1] +
          "</td></tr>";
  }
  if (pi2 != -1) {
      title =
          title +
          '<tr><td width="30px" align="left"><span class="badge badge-danger">&nbsp;</span></td><td>' +
          labels[pi2Label[0]] +
          ': </td><td style="color:#dc143c">' +
          point[pi2] +
          "</td></tr>";
  }
  if (pi3 != -1) {
      title =
          title +
          '<tr><td width="30px" align="left"><span class="badge badge-success">&nbsp;</span></td><td>' +
          labels[pi3Label[0]] +
          ': </td><td style="color:#28a745">' +
          point[pi3] +
          "</td></tr>";
  }

  title += "</tbody><table></div>";
if (config['marker'] === undefined || config['marker'] == 'default')
                        {
			    var dstLat = point[latIndex];
			    var dstLng = point[lngIndex];

			    var markerId = "markerId_" + config.type + "_" + i;
			    var markerIdTransit = "markerId_" + config.type + "_" + i + "_Transit";

                            var marker = L.marker([point[latIndex], point[lngIndex]], {icon: markerIcon});
                            marker.bindPopup(title, {maxWidth:300});
                            markerClusters.addLayer(marker);
			    var selector1 = "#" + markerId;
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
	        var heat = L.heatLayer(global_heatData, {
		        radius: 20,
		        blur: 15,
		        maxZoom: 17,
		}).addTo(global_Map);
		conf_markerDisplay = "heatmap";
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
          } else {
                if (data.command.command !== undefined)
                {
                    showLocations(data.data2, data.command.command);
                } else {
                    showLocations(data.data21, data.command.command1, data.data22, data.command.command2);
                }
          }
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

});

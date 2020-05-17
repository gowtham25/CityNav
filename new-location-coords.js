let newLocationDataFields = ['new-location-sel-category-id','new-location-photo-image','new-location-photo-image-ext','new-location-est-name','new-location-est-type', 'new-location-est-desc', 'new-location-user-lat','new-location-user-lng','new-location-user-alti','new-location-user-accuracy'];
    
function removeNewLocDataFromSessionStorage(){ 
    for(let i=0;i<newLocationDataFields.length;i++){
        sessionStorage.removeItem(newLocationDataFields[i]);
    }     
}

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

// uses mobile-detect.js
var md = new MobileDetect(window.navigator.userAgent);
var isMobile = md.os() == 'iOS' || md.os() == 'AndroidOS';

getLocation();

function getLocation(){
    navigator.geolocation.getCurrentPosition(showMap, showMapNoInput);
}

function showMapNoInput(err){
    // user has not enabled location
    // default position to center of Douala
    var position = [];
    var coords = [];
    coords.latitude = 4.061536;
    coords.longitude = 9.786072;
    position.coords = coords;

    showMap(position);
}

function showMap(userLocation){
       console.log(userLocation);
       let userLat = userLocation.coords.latitude;
       let userLng = userLocation.coords.longitude;
       let userAlti = userLocation.coords.altitude;
       let userAccuracy = userLocation.coords.accuracy;
       $('#lat').html(userLat);
       $('#lng').html(userLng);
       $('#alti').html(userAlti);
       sessionStorage.setItem(newLocationUserLatKey, userLat);
       sessionStorage.setItem(newLocationUserLngKey, userLng);
       sessionStorage.setItem(newLocationUserAltiKey, userAlti);
       sessionStorage.setItem(newLocationUserAccuracyKey, userAccuracy);
        
//	   getTransitNodes('alltransit', userLocation);
	$("#map-container").remove();
	$("<div id='map-container' style='height:auto;width:auto;max-width:none;'><div id='map-canvas' style='height:100%;'></div></div>").appendTo('#contents');

	var tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

	L.Control.include({_refocusOnMap: L.Util.falseFn});
	var theMap = {};
	if (isMobile) {
	    theMap = L.map('map-canvas',{zoomControl: false}).setView([userLat, userLng], 17);
	} else {
	    theMap = L.map('map-canvas').setView([userLat, userLng], 17);
	}
	L.tileLayer(tileURL,
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: ['a', 'b', 'c'],
                maxZoom:18,
                minZoom: 2
            }).addTo(theMap);
	$("<style>").prop("type", "text/css")
            .html("\
                .leaflet-div-icon2 {\
                  background: red;\
                  border: 5px solid rgba(255,255,255,0.5);\
                  color: blue;\
                  font-weight: bold;\
                  text-align: center;\
                  border-radius: 50%;\
                  line-height: 30px;\
                }")
            .appendTo("head");

	var myIcon = L.divIcon({className: 'leaflet-div-icon2', iconSize: [25,25]});
	var marker = L.marker([userLat, userLng], {draggable: true, autoPan:true, icon: myIcon}).addTo(theMap);
	marker.on("drag", function(e) {
	    var target = e.target;
	    var pos = target.getLatLng();
    	    $('#lat').text(pos.lat);
    	    $('#lng').text(pos.lng);
	});
}
    
function buildErrorMsg(errorReason){
    let errorMsg = '';
    errorMsg += '<div class="errorMsgDesc">';
    if(errorReason == 'Not Registered'){
        if(userLang == 'en'){
            errorMsg += 'Thank you for submitting your business information. We will review it, reach out to you to confirm and validate the submitted data.  Once the data has been validated, we will share the information that will enable you to update the availability of your services or products in real-time. Sincerely, Your Cities Navigator Team';
        } else if(userLang == 'fr'){
            errorMsg += "Merci d'avoir soumis vos informations. Nous les examinerons et vous contacterons pour confirmer et valider les données soumises. Une fois les données validées, nous partagerons le lien qui vous permettra d’actualiser la disponibilité de vos services ou produits en temps réel. Cordialement, Votre équipe Cities Navigator";
        }
    }
    errorMsg += '</div>';
    return errorMsg;
}

    $('#cancelBtn').click(function(){
        history.back();
    });

    $('#submitBtn').click(function(){
        $('#loader').show();
        let userName = localStorage.getItem('username');
        let userEmail = localStorage.getItem('useremail');
        let userPhone = localStorage.getItem('userphone');

        let cat = sessionStorage.getItem(newLocationSelCategoryIdKey);
        let photoImg = sessionStorage.getItem(newLocationPhotoImageKey);
        let photoImgExt = sessionStorage.getItem(newLocationPhotoImageExtKey);
        let estName = sessionStorage.getItem(newLocationEstNameKey);
        let estType = sessionStorage.getItem(newLocationEstTypeKey);
        let estDesc = sessionStorage.getItem(newLocationEstDescKey);
        let userLat = sessionStorage.getItem(newLocationUserLatKey);
        let userLng = sessionStorage.getItem(newLocationUserLngKey);
        let userAlti = sessionStorage.getItem(newLocationUserAltiKey);
        let userAccuracy = sessionStorage.getItem(newLocationUserAccuracyKey);
        let url = 'https://hawkaidata.net/api/addToDataset.php?key=' + cityApiKey;
        
        let r = $.post(url, {'user_name':userName, 'user_email':userEmail, 'user_phone': userPhone, 'image_url': photoImg, 'extension': photoImgExt, 'latitude': userLat, 'longitude': userLng, 'altitude':userAlti, 'accuracy':userAccuracy, 'name':estName, 'type':estType, 'description':estDesc, 'category' : cat} ,
        function(data, textStatus, jqXHR){
            console.log(data);
            data = JSON.parse(data);
            removeNewLocDataFromSessionStorage();
            $('#loader').hide();
            if(data.status == 'error'){
                if(data.errorReason == 'Not Registered'){
                    let errMsg = buildErrorMsg(data.errorReason);
                    showError(errMsg);
                } else {
                    showError(data.errorReason);
                }
                return;
            }
            window.location.href = './new-location-submit-success_' + userLang + '.html';
            
		}).fail(function(jqXHR, textStatus, errorThrown){
            $('#loader').hide();
            showError(textStatus);
        }
        );
    });

    function showError(errorMsg){
        $('#error-msg').html(errorMsg);
        $('#error-modal').css({'display':'flex'}).show();
    }
    
    $('#home-icon').click(function(){
        location.href = './portal.html';
    });
    
});

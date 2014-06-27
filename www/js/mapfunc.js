
var gpsEnabled;
var map;
var watcher;
var markerYou;
var infowindowYou;
var myLocation;
var checkConnection = true;

document.addEventListener("deviceready",onDeviceReady,false);
function onDeviceReady(){
	if(navigator.network.connection.type == Connection.NONE){
	// alert('no connection');
		checkConnection = false;
	}
}

$(document).on('pageinit', function(){
	if(checkConnection == true){
	// alert('showing');
		loadMap();
	}
	else{
		alert('No Network Connection. Map not displayed.');
	}  
});

///////////////////////////////////////////
// current location GPS display code from:
//https://github.com/tkompare/projects/tree/master/stalker
//
//Name: Stalker POC
//Author: TOM KOMPARE
//Email: tom@kompare.us
//
///////////////////////////////////////////

function loadMap()
{
	var browserSupportFlag =  new Boolean();
	// Make the map
			map = new google.maps.Map(document.getElementById('map_canvas'), {
			zoom: 10,
			panControl: true,
			
			mapTypeControl: false,
			streetViewControl: false,
			center: new google.maps.LatLng(-40.9333,172.9500),
			mapTypeId: google.maps.MapTypeId.HYBRID
			});
			
	if(navigator.geolocation)
	{
		browserSupportFlag = true;
		
		// Get your the latest geolocation data from the user's device
		navigator.geolocation.getCurrentPosition(function(position) {
			gpsEnabled = true;
			// Create the Google Maps API location object
			myLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			
			// Tell the map to center on the user's location
			map.setCenter(myLocation);
			map.setZoom(20);
			map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			// Make the user's marker object and put it on the map
			
			markerYou = new google.maps.Marker({
				position: myLocation, 
				map: map, 
				title: 'You are here.',
				visible: true
			});
			// Bounce the marker on the map
			markerYou.setAnimation(google.maps.Animation.BOUNCE);
			// Make the marker information pop-up
			infowindowYou = new google.maps.InfoWindow({
				content: 'You are here'
			});
			// Listen for the user's click on the marker to show the pop-up
			google.maps.event.addListener(markerYou, 'click', function() {
				infowindowYou.open(map,markerYou);
			});
			// Watch the user's device GPS for new location.
			watcher = navigator.geolocation.watchPosition(function(newPosition) {
					// Each time a new location is registered, move the marker.
					myLocation = new google.maps.LatLng(newPosition.coords.latitude,newPosition.coords.longitude);
					markerYou.setPosition(myLocation);
			}, function() {}, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
			// Listen for the map page to be closed and stop listenting to the user's device GPS
			$(document).live('pagebeforehide', function(event,ui){
				navigator.geolocation.clearWatch(watcher);
				watcher = false;
			});
		}, function() {
			// If the device has a GPS, but still can't be located...
			handleNoGeolocation(browserSupportFlag);
		});
	}
	else
	{
		// If the device does not have GPS...
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}
	function handleNoGeolocation(errorFlag)
	{
	  gpsEnabled = false;
		
		map.setCenter(new google.maps.LatLng(-40.9333,172.9500));
		if (errorFlag == true)
		{
			alert("Geolocation service failed.");
		}
		else
		{
			alert("Your device does not support geolocation.");
		}
	}
}
$("#view_sharedPhoto").live('click', function(){

// placePhotos();
	
	if(checkConnection == true){
		viewSharedPhoto();
	}
	else{
		alert('No Network Connection. Cannot view shared photos.');
	}
  
});

function viewSharedPhoto(){
// alert('view2');
	if(gpsEnabled == true){
		// alert('view shared photo');
		  navigator.geolocation.clearWatch(watcher);
		  watcher = false;
		  markerYou.setMap(null);
		  // alert('watcher cleared');
		  map.setCenter(markerYou.getPosition());
		  placePhotos().then(function(){
		  	markerYou.setMap(map);
			// alert('place photos done, continue watching');
			watcher = navigator.geolocation.watchPosition(function(newPosition) {
					// Each time a new location is registered, move the marker.
					myLocation = new google.maps.LatLng(newPosition.coords.latitude,newPosition.coords.longitude);
					markerYou.setPosition(myLocation);
			}, function() {}, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
			// Listen for the map page to be closed and stop listenting to the user's device GPS
			$(document).live('pagebeforehide', function(event,ui){
				navigator.geolocation.clearWatch(watcher);
				watcher = false;
			});
		 });
	}
	else{
		placePhotos();
	}
}
 ////////////////////////////////////////////////////////
 // Marker + photo overlays code template from:
 // http://chrisltd.com/blog/2013/08/google-map-random-color-pins/
 ////////////////////////////////////////////////////////
 
	// Setup the different icons
    var iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';
    
    var icons = [
      //iconURLPrefix + 'red-dot.png',
      iconURLPrefix + 'green-dot.png',
      iconURLPrefix + 'blue-dot.png',
      iconURLPrefix + 'orange-dot.png',
      iconURLPrefix + 'purple-dot.png',
      iconURLPrefix + 'pink-dot.png',      
      iconURLPrefix + 'yellow-dot.png'
    ];
    var icons_length = icons.length;

	function placePhotos(){
	var deferred = new $.Deferred();
	//alert('start sharing');
	// var p = { URI:'content://media/external/images/media/19928',
					 // coords: {longitude:170.33416166666666,latitude:-45.871478333333336},
					 // shared: true,
					 // };
		var sharedPhotos = window.localStorage.getItem("sharedPhotos");
		sharedPhotos = JSON.parse(sharedPhotos);
		
		function addMarker(contentStr,icon,coords,pURI, markers){
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(coords.latitude, coords.longitude),
				map: map,
				icon: icon,
			});
			marker.pURI = pURI;
			// alert(marker.pURI+' '+pURI);
			var infowindow = new google.maps.InfoWindow({
				maxWidth: 150
			});
			infowindow.setContent(contentStr[0]);
			
			var removebtn = contentStr.find('button.un-Share')[0];
			google.maps.event.addDomListener(removebtn,'click',function(event){
				// alert('alert dom');
				remove_marker(marker);
			});
			google.maps.event.addListener(marker,'click',function(){
				map.setZoom(15);
				infowindow.open(map,marker);
			});
			google.maps.event.addListener(map,'click',function(){
				infowindow.close();
			});
			markers.push(marker);
		}
		function remove_marker(marker){
			// alert('removing1');
			
		// alert(marker+' '+marker.pURI+' '+sharedPhotos);
			var photos = window.localStorage.getItem("photos");

			photos = JSON.parse(photos);
			if(photos==null){
			
				photos = {};
				alert(photos);
			}
			// alert(sharedPhotos[pURI]+' '+photos[pURI]);
			if(sharedPhotos!=null && sharedPhotos !=''){
				if(sharedPhotos[marker.pURI]!=null && sharedPhotos[marker.pURI]!=''){
				// alert('removing');
					delete sharedPhotos[marker.pURI];
					if(photos[marker.pURI]!=null&& photos[marker.pURI]!='' ){
						photos[marker.pURI].shared = false;
						window.localStorage.setItem("photos",JSON.stringify(photos));
					}
					window.localStorage.setItem("sharedPhotos",JSON.stringify(sharedPhotos));
					marker.setMap(null);
					// AutoCenter(markers);
				}
			}
			
		}
		if(sharedPhotos!=null && sharedPhotos!=''){
			
			var markers = new Array();
			var iconCounter = 0;
			
			for(p in sharedPhotos){
				if(sharedPhotos.hasOwnProperty(p)){
					//alert('in loop p: '+sharedPhotos[p].URI);
					//alert(JSON.stringify(sharedPhotos[p].coords));
					var contentStr = $('<div style="width:100%;"><img style="width:100%;"'+
										' src="'+sharedPhotos[p].URI+'" crossOrigin="anonymous" '+
										'><br>by '+ p+'<br>'+
										'<button name="un-Share" id="un-Share" class="un-Share" >'+
										'UnShare</button> </div>');
					addMarker(contentStr,icons[iconCounter],sharedPhotos[p].coords,sharedPhotos[p].URI,markers);
					iconCounter++;
					if(iconCounter >=icons_length){
						iconCounter = 0;
					}
				}
				
			}
			
			AutoCenter(markers);
			// alert(gpsEnabled+' '+markers.length);
			if((gpsEnabled==null || gpsEnabled==false) && markers.length>0){
			// alert('gps');
				map.setCenter(markers[0].getPosition());
			}
			deferred.resolve();
		}
		else{
			//alert('no sharedPhotos found');
			deferred.resolve();
		}
		return deferred.promise();
	}

function AutoCenter(markers) {
//alert('auto center');
  //  Create a new viewpoint bound
  var bounds = new google.maps.LatLngBounds();
  //  Go through each...
  $.each(markers, function (index, marker) {
	bounds.extend(marker.getPosition());
  });
  //alert('s2');
  //  Fit these bounds to the map
  // map.fitBounds(bounds);
  //alert('s3');
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  //alert('s4');
}
	
function drawPath(data){
	var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);
	
	map.setCenter(myLatLng);
	map.setZoom(15);
	map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
	
	var trackCoords = [];
	
	// Add each GPS entry to an array
      for(i=0; i<data.length; i++){
	trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
      }
  
  // Plot the GPS entries as a line on the Google Map
  var trackPath = new google.maps.Polyline({
    path: trackCoords,
    strokeColor: getRandomColor(),
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  
   //Apply the line to the map
  trackPath.setMap(map);
  
}

////////////////////////////////////////////////////////////////
// calculate gps distance
// http://www.movable-type.co.uk/scripts/latlong.html
///////////////////////////////////////////////////////////////

function gps_distance(lat1, lon1, lat2, lon2)
{
  
  var R = 6371; // km
  var dLat = (lat2-lat1) * (Math.PI / 180);
  var dLon = (lon2-lon1) * (Math.PI / 180);
  var lat1 = lat1 * (Math.PI / 180);
  var lat2 = lat2 * (Math.PI / 180);
  
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  
  return d;
}


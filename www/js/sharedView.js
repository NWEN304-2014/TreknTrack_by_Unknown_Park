function viewSharedPhoto(){
	if(gpsEnabled == true){
		alert('view shared photo');
		  navigator.geolocation.clearWatch(watcher);
		  watcher = false;
		  markerYou.setMap(null);
		  alert('watcher cleared');
		  map.setCenter(markerYou.getPosition());
		  placePhotos().then(function(){
		  	markerYou.setMap(map);
			alert('place photos done, continue watching');
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
}
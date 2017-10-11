var locations = {
 	"locations" : [
 		{
 			"name" : "Chili's",
 			"type" : "Resturaunt",
 			"location" : {lat: 39.413115, lng: -104.871146},
 			"yelpID" : "chilis-castle-rock"
 		},
 		{
 			"name" : "Outback",
 			"type" : "Resturaunt",
 			"location" : {lat: 39.407199, lng: -104.862636},
 			"yelpID" : "outback-steakhouse-castle-rock"
 		},
 		{
 			"name" : "Village Inn",
 			"type" : "Resturaunt",
 			"location" : {lat: 39.380436, lng: -104.864787},
 			"yelpID" : "village-inn-castle-rock-3"
 		},
 		{
 			"name" : "Walmart",
 			"type" : "Grocery",
 			"location" : {lat: 39.406218, lng: -104.860948},
 			"yelpID" : "walmart-supercenter-castle-rock"
 		},
 		{
 			"name" : "King Soopers",
 			"type" : "Grocery",
 			"location" : {lat: 39.4158589, lng: -104.8802941},
 			"yelpID" : ""
 		},
 		{
 			"name" : "Sprouts",
 			"type" : "Grocery",
 			"location" : {lat: 39.415228, lng: -104.863347},
 			"yelpID" : "sprouts-farmers-market-castle-rock"
 		},
 		{
 			"name" : "Safeway",
 			"type" : "Grocery",
 			"location" : {lat: 39.361930, lng: -104.860977},
 			"yelpID" : "safeway-food-and-drug-castle-rock-3"
 		},
 		{
 			"name" : "Home Depot",
 			"type" : "Misc",
 			"location" : {lat: 39.415343, lng: -104.865925},
 			"yelpID" : "the-home-depot-castle-rock"
 		},
 		{
 			"name" : "PetSmart",
 			"type" : "Misc",
 			"location" : {lat: 39.4073852697085, lng: -104.8632410802915},
 			"yelpID" : "petsmart-castle-rock"
 		},
 		{
 			"name" : "Castle Rock Outlets",
 			"type" : "Misc",
 			"location" : {lat: 39.415464, lng: -104.873549},
 			"yelpID" : "outlets-at-castle-rock-castle-rock"
 		}
	]
 };

var Place = function(data) {
	this.name = ko.observable(data.name);
};

var ViewModel = function() {
	var self = this;
	
	this.typeArray = ko.observableArray(["All", "Resturants", "Grocery Stores", "Misc"]);

	this.locationArray = ko.observableArray([]);
	locations.locations.forEach(function(loc) {
		self.locationArray.push(new Place(loc));
	});

	this.typeValue = ko.observable();

	this.getInfo = function(data, event) {
		populateInfoWindowFromButton(data, event);
	}

	this.hoverButton = function(data, event) {
		buttonHoverIn(data, event);
	}

	this.hoverOutButton = function(data, event) {
		buttonHoverOut(data, event);
	}

	this.filterSubmit = function(data, event) {
		console.log(this.typeValue);
	}

};

ko.applyBindings(new ViewModel);
console.log()
var map,
 	markers = [],
 	largeInfowindow,
 	defaultIcon,
 	highlightedIcon;

function initMap() {
 	map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.340940, lng: -104.834341},
        zoom: 13,
        //styles: styles,
        mapTypeControl: false
    });

    defaultIcon = newMarker('FF0000'),
    highlightedIcon = newMarker('0000FF');
    	
    largeInfowindow = new google.maps.InfoWindow();

 	for (var i = 0; i < locations.locations.length; i++) {
 		var position = locations.locations[i].location,
 			title = locations.locations[i].name,
 			marker = new google.maps.Marker({
            	position: position,
            	title: title,
            	animation: google.maps.Animation.DROP,
            	icon: defaultIcon,
            	id: i
          	});

        markers.push(marker);

        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
 
        marker.addListener('mouseover', (function(marker) {
        	return function() {
        		var locationName = marker.title;
        		marker.setIcon(highlightedIcon);
        		document.getElementById(locationName).style.color = "cyan";
        	};
    	})(marker));

    	marker.addListener('mouseout',(function(marker) {
        	return function() {
        		var locationName = marker.title;
        		marker.setIcon(defaultIcon);
        		document.getElementById(locationName).style.color = "white";
        	};
    	})(marker));
 	}

 	showLocations();
}
 	
function showLocations() {
	var bounds = new google.maps.LatLngBounds();

	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);
}

function newMarker(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;

        infowindow.addListener('closeclick', function() {
        	infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
	            var nearStreetViewLocation = data.location.latLng;
            	var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');

                var panoramaOptions = {
                	position: nearStreetViewLocation,
                	pov: {
                    	heading: heading,
                    	pitch: 15
                  	}
                };

            	var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
              	panorama.setVisible(true);
            } else {
            	infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

function populateInfoWindowFromButton(data, event) {
   	var id = event.target.id;

   	for (marker of markers) {
   		if (id === marker.title) {
   			populateInfoWindow(marker, largeInfowindow);
   		}
   	}
}

function buttonHoverIn(data, event) {
	var id = event.target.id;

	for (marker of markers) {
		if (id === marker.title) {
			marker.setIcon(highlightedIcon);
		}
	}
}

function buttonHoverOut(data, event) {
	var id = event.target.id;

	for (marker of markers) {
		if (id === marker.title) {
			marker.setIcon(defaultIcon);
		}
	}
}

/*function review(id) {
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		req.post('NclwD2eZ9eQE1qYpBnmdjA', 'xSyP8G4WMXHdzpPWn8J50YlgZo8H9UtMOgbCi2v54VTZ8SBTgGPwM66jj7KWk4vS');
			req.open('GET', 'https://api.yelp.com/v3/businesses/chilis-castle-rock&Bearer ' + req.response);
			//var obj = JSON.parse(req);
			req.onload = resolve("success the buisness rating is " + req.rating);
			req.onerror = reject("there was an error");
			req.send();
	})
};
review("nothing")
.then(function(val) {
	console.log(val);
})
.catch(function(val) {
	console.log(val);
});*/



 


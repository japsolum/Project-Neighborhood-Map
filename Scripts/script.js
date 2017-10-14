var locations = {
 	"locations" : [
 		{
 			"name" : "Chili's",
 			"type" : "Restaurants",
 			"location" : {lat: 39.413115, lng: -104.871146},
 			"foursquareID" : "4bbdecd0a8cf76b0f255b2fd",
 			"rating" : ""
 		},
 		{
 			"name" : "Outback",
 			"type" : "Restaurants",
 			"location" : {lat: 39.407199, lng: -104.862636},
 			"foursquareID" : "4b4d1ce4f964a52078cb26e3",
 			"rating" : ""
 		},
 		{
 			"name" : "Village Inn",
 			"type" : "Restaurants",
 			"location" : {lat: 39.380436, lng: -104.864787},
 			"foursquareID" : "4bb9493d7421a59312b2c240",
 			"rating" : ""
 		},
 		{
 			"name" : "Walmart",
 			"type" : "Grocery Stores",
 			"location" : {lat: 39.406218, lng: -104.860948},
 			"foursquareID" : "4b130478f964a520bf9223e3",
 			"rating" : ""
 		},
 		{
 			"name" : "King Soopers",
 			"type" : "Grocery Stores",
 			"location" : {lat: 39.4158589, lng: -104.8802941},
 			"foursquareID" : "590a5aa3ad1ea47d2dd4a4e5",
 			"rating" : ""
 		},
 		{
 			"name" : "Sprouts",
 			"type" : "Grocery Stores",
 			"location" : {lat: 39.415228, lng: -104.863347},
 			"foursquareID" : "4b797f39f964a520cbfc2ee3",
 			"rating" : ""
 		},
 		{
 			"name" : "Safeway",
 			"type" : "Grocery Stores",
 			"location" : {lat: 39.361930, lng: -104.860977},
 			"foursquareID" : "4bcb9addfb84c9b668401f3e",
 			"rating" : ""
 		},
 		{
 			"name" : "Home Depot",
 			"type" : "Misc",
 			"location" : {lat: 39.415343, lng: -104.865925},
 			"foursquareID" : "4bd204049854d13a53c1fa4d",
 			"rating" : ""
 		},
 		{
 			"name" : "PetSmart",
 			"type" : "Misc",
 			"location" : {lat: 39.4073852697085, lng: -104.8632410802915},
 			"foursquareID" : "4bc7b88614d79521600368e9",
 			"rating" : ""
 		},
 		{
 			"name" : "Castle Rock Outlets",
 			"type" : "Misc",
 			"location" : {lat: 39.415464, lng: -104.873549},
 			"foursquareID" : "4b0ed46df964a520a75b23e3",
 			"rating" : ""
 		}
	]
 };

//Creates a ko object out of data passed in by locations object
var Place = function(data) {
	this.name = ko.observable(data.name);
	this.type = ko.observable(data.type);
	this.location = ko.observable(data.location);
	this.fsID = ko.observable(data.foursquareID);
};

var ViewModel = function() {
	var self = this;
	
	//Array that contains all types of location objects for use with select box.
	this.typeArray = ko.observableArray(["All", "Restaurants", "Grocery Stores", "Misc"]);

	//Value of select box, defaults to "All"
	this.typeValue = ko.observable('All');

	//Takes each locations object, creates a Place class object out of each one, 
	//and places it into an array
	this.locationArray = ko.observableArray([]);
		for (var i = 0; i < locations.locations.length; i++) {
			self.locationArray.push(new Place(locations.locations[i]));
		}

	//Populates info window for the marker that corresponds with button clicked.
	this.getInfo = function(data, event) {
		populateInfoWindowFromButton(data, event);
	};

	//Changes color of correcponding marker when button on mouseover event
	this.hoverButton = function(data, event) {
		buttonHoverIn(data, event);
	};

	//Changes color of correcponding marker when button on mouseout event
	this.hoverOutButton = function(data, event) {
		buttonHoverOut(data, event);
	};

	//Listens for select box to be changed and updates locationArray accordingly
	this.selectChange = function() {
		showLocations();
		self.locationArray.removeAll();
		if(self.typeValue() === "All") {
			for (var i = 0; i < locations.locations.length; i++) {
				self.locationArray.push(new Place(locations.locations[i]));
			}
		} else {
			for (var n = 0; n < locations.locations.length; n++) {
				if (self.typeValue() === locations.locations[n].type) {
					self.locationArray.push(new Place(locations.locations[n]));
				}
			}
		}
	};

	//Toggles navBar on click of menu button, also makes sure it appears 
	//on top of map until closed
	this.navBarToggle = function() {
		$(".navBar").toggleClass('hideNavBar');
		var mapElement = document.getElementById("map");
		if (mapElement.style.zIndex != -1) {
			mapElement.style.zIndex = -1;
		} else {
			mapElement.style.zIndex = 1;
		}

	};
};

ko.applyBindings(new ViewModel());

//Declares all variables that would be used in multiple functions, or would
//otherwise be declared within a loop.
var map,
	id,
	object,
 	markers = [],
 	largeInfowindow,
 	defaultIcon,
 	highlightedIcon,
 	selectedIcon,
 	streetViewService,
 	radius,
 	venueID,
 	baseURL = 'https://api.foursquare.com/v2/venues',
 	myFoursquareID = "PAPBKB4JDQSPNZFTE2J5E2KVRVNUBISYTF42D3PGYRHMMXZW",
 	foursquareSecret = "4TUCJDKUHWNW5MG5XFJKIGGGLLREXQJXVEKKH1EWIOGDEGYF",
 	foursquareVersion = "20170101";

//Ajax request to foursquare to retreive a buisness rating for a location.
function getRating(num) {
	venueID = locations.locations[num].foursquareID;
	object = $.ajax({
		url : baseURL + '/' + venueID,
		dataType: 'json',
		method: 'GET',
		data : {
			client_id: myFoursquareID,
			client_secret: foursquareSecret,
			v: foursquareVersion
		}

	}).done(function(data) {
		locations.locations[num].rating = data.response.venue.rating;
	});
}

//Loops through all locations and adds rating value to object.
for(var i = 0; i < locations.locations.length; i++) {
	getRating(i);
}

//Initializes google map.
function initMap() {
 	map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.340940, lng: -104.834341},
        zoom: 13,
        mapTypeControl: false
    });

 	//Sets values for what the default and highlighted icon should look like.
    defaultIcon = newMarker('FF0000');
    highlightedIcon = newMarker('0000FF');
    selectedIcon = newMarker('E6A910');
    	
    largeInfowindow = new google.maps.InfoWindow();

    //Loops though locations and creates a marker for each.
 	for (var i = 0; i < locations.locations.length; i++) {
 		var position = locations.locations[i].location,
 			title = locations.locations[i].name,
 			imageSrc = locations.locations[i].imageSrc,
 			marker = new google.maps.Marker({
            	position: position,
            	title: title,
            	animation: google.maps.Animation.DROP,
            	icon: defaultIcon,
            	id: i
          	});

        markers.push(marker);

        //Adds listener on marker to display correct info window for each marker
        marker.addListener('click', (function(marker) {
        	return function() {
            	populateInfoWindow(this, largeInfowindow);
            };
        })(marker));
 
 		//Creates listener on marker to create hover effect for both the marker and the 
 		//corresponding button, and then a second for when marker is not being hoverd.
        marker.addListener('mouseover', (function(marker) {
        	return function() {
        		var locationName = this.title;

        		document.getElementById(locationName).style.color = "blue";
        		document.getElementById(locationName).style.boxShadow = "inset 2px 2px 3px 3px #bbbab7";
        	};
    	})(marker));

    	marker.addListener('mouseout',(function(marker) {
        	return function() {
        		var locationName = this.title;

        		if (marker.icon.url === highlightedIcon.url) {
        			marker.setIcon(defaultIcon);	
        		}
        		
        		document.getElementById(locationName).style.color = "white";
        		document.getElementById(locationName).style.boxShadow = "inset -2px -2px 3px 3px #bbbab7";
        	};
    	})(marker));
 	}

 	showLocations();
}

//Decides which markers should be displayed and then shows them. 	
function showLocations() {
	var bounds = new google.maps.LatLngBounds(),
		selectValue = document.getElementById("filterBox").value,
		markerID;
	console.log(selectValue);

	if (selectValue === "All") {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	} else  {
		for (var n = 0; n < markers.length; n++) {
			markerID = markers[n].id;
			if (selectValue === locations.locations[markerID].type) {
				markers[n].setMap(map);
				bounds.extend(markers[n].position);
			} else {
				markers[n].setMap(null);
			}
		}
	}
}

//Function that takes a color and returns a marker of that color
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

//Makes sure there are no errors with api requests and displays info window accordingly.
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        for (var i = 0; i < markers.length; i++) {
        	markers[i].setIcon(defaultIcon);
        }

        marker.setIcon(selectedIcon);

        infowindow.addListener('closeclick', function() {
        	marker.setIcon(defaultIcon);
        	infowindow.marker = null;
        });
        streetViewService = new google.maps.StreetViewService();
        radius = 75;

        function getStreetView(data, status) {
        	
        	var ratingContent;
        	id = marker.id;
        	if (locations.locations[id].rating != "") {
        		ratingContent = '<a href = "https://foursquare.com/">Foursquare Rating:</a><span class="rating">' + locations.locations[marker.id].rating + ' / 10 </span>';
        	} else {
        		ratingContent = '<span> There was an error loading <a href = "https://foursquare.com/">Foursquare</a> rating.</span>';
        	}

            if (status == google.maps.StreetViewStatus.OK) {
	            var nearStreetViewLocation = data.location.latLng;
            	var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div class= "infoHeader">' +  marker.title + '</div><hr><div class="infoText">' + ratingContent + '</div><hr><div id="pano"></div>');

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
            	infowindow.setContent('<div class= "infoHeader">' +  marker.title + '</div><hr><div class="infoText">' + ratingContent + '</div><hr><div>No Street View Found</div>');
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

//Takes click event from ko.observable and populates info window on correct marker.
function populateInfoWindowFromButton(data) {
   	id = event.target.id;

   	for(var i = 0; i < markers.length; i++) {
   		if (id === markers[i].title) {
   			populateInfoWindow(markers[i], largeInfowindow);
   		}
   	}
}

//Takes hover event from ko.observable and displays hover effects to correct marker.
function buttonHoverIn(data) {
	id = event.target.id;

	for (var i = 0; i < markers.length; i++) {
		if (id === markers[i].title) {
			if (markers[i].icon.url === defaultIcon.url) {
				markers[i].setIcon(highlightedIcon);
			}
			
		}
	}

}

//Returns marker to default color after mouseout event
function buttonHoverOut(data) {
	id = event.target.id;

	for (var i = 0; i < markers.length; i++) {
		if (id === markers[i].title) {
			if (markers[i].icon.url === highlightedIcon.url) {
				markers[i].setIcon(defaultIcon);
			}
		}
	}
}





 


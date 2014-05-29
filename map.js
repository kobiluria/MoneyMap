

/* Map functions */


var map;

function initMap() {
    // set up the map
    map = L.map("map").setView([31.783333, 35.216667], 9);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
}

function loadGeoJsonString(geoString) {
    var geojson = JSON.parse(geoString);
    L.geoJson(geojson).addTo(map);

}





/* DOM (drag/drop) functions */

function initEvents() {
    // set up the drag & drop events
    var mapContainer = document.getElementById('map');
    var dropContainer = document.getElementById('drop-container');

    // first on common events
    [mapContainer, dropContainer].forEach(function(container) {
        container.addEventListener('drop', handleDrop, false);
        container.addEventListener('dropover',handleDrop, false);
        container.addEventListener('dragover', showPanel, false);
    });

// then map-specific events
    mapContainer.addEventListener('dragstart', showPanel, false);
    mapContainer.addEventListener('dragenter', showPanel, false);

// then the overlay specific events (since it only appears once drag starts)
    dropContainer.addEventListener('dragend', hidePanel, false);
    dropContainer.addEventListener('dragleave', hidePanel, false);
}

function showPanel(e) {
    e.stopPropagation();
    e.preventDefault();
    document.getElementById('drop-container').style.display = 'block';
    return false;
}

function hidePanel(e) {
    document.getElementById('drop-container').style.display = 'none';
}

function loadJsonp(url_str){
    $.ajax({
        type:'GET',
        url:url_str,
        async:false,
        jsonpCallback:'map_func',
        contentType:'application/json',
        dataType:'jsonp',
        success:loadGeoJsonString,
        error:function(e){
            console.log(e);
        }
    });
}

function handleDrop(e) {
    e.preventDefault();
    hidePanel(e);
    var url = e.dataTransfer.getData("url") || e.dataTransfer.getData("text/uri-list");
    var files = e.dataTransfer.files;
    if (files.length) {
        // process file(s) being dropped
        // grab the file data from each file
        for (var i = 0, file; file = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = function(e) {
                loadGeoJsonString(e.target.result);
            };
            reader.onerror = function(e) {
                console.error('reading failed');
            };
            reader.readAsText(file);
        }
    } else if(url){
        loadJsonp(url);
    }
    else {
        // process non-file (e.g. text or html) content being dropped
        // grab the plain text version of the data
        var plainText = e.dataTransfer.getData('text/plain');

        if (plainText) {

            loadGeoJsonString(plainText);
        }
    }

// prevent drag event from bubbling further
    return false;
}

initMap();
initEvents();
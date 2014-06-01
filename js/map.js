

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


function loadJsonp(url_str){
    $.ajax({
        type:'GET',
        url:url_str,
        async:false,
        data:null,
        jsonpCallback:'map_func',
        contentType:'application/json',
        dataType:'jsonp',
        success:function(response){
            L.geoJson(response).addTo(map);
            console.log(response);
        },
        error:function(e){
            console.log(e);
        }
    });
}

function handleDragStart(e) {
    this.style.opacity = '0.4';  // this / e.target is the source node.
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('over');
}
function init_drop(){
    dropbox = document.getElementById('map');
    dropbox.addEventListener('dragstart', handleDragStart, false);
    dropbox.addEventListener('dragenter', handleDragEnter, false)
    dropbox.addEventListener('dragover', handleDragOver, false);
    dropbox.addEventListener('dragleave', handleDragLeave, false);
    dropbox.addEventListener('dragend', handleDragEnd, false);
    dropbox.addEventListener('drop', drop, false);
}

function drop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var url = evt.dataTransfer.getData("url") || evt.dataTransfer.getData("text/uri-list");
    var files = evt.dataTransfer.files;
    var plainText = evt.dataTransfer.getData('text/plain');
    if(files.length){
        load_files(files)
    }
    else if(url) {
        loadJsonp(url);
    }
    else if(plainText){

        loadGeoJsonString(plainText);
    }
    else{
        console.log('wrong drop');
    }
}

function load_files(files) {

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
}

$(function(){
    // setup autocomplete function pulling from currencies[] array
    $('#autocomplete').autocomplete({
        lookup: collection,
        onSelect: function (suggestion) {
            var thehtml = '<strong>Entity Name:</strong> ' + suggestion.value + ' <br> <strong>ID:</strong> ' + suggestion.data;
            $('#outputcontent').html(thehtml);
            loadJsonp('http://kobiluria.github.io/MoneyMap/jsonp/' + suggestion.data+ '.jsonp')
        }
    });


});
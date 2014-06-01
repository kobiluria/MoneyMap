/**
 * Created by kobi on 6/1/14.
 */

var tools = require('./tools');
var async = require('async');
var unirest = require('unirest');



function update_collection() {
    tools.get_collection('entities', function(err, collection, mongoclient) {
       var curser = collection.find(); // find all documents.
        curser.each(function(err, item) {
            async.waterfall([
                function(callback){ callback(null,item)},
                build_reverse,

            ])
        });
    });
}

call_reverse = function(query_str, callback){

}


/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 * @param {JSON} osm_id the open muni osm id to reverse geocode.
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, query_result, api_result)
 * **********************************************/
build_reverse = function(osm_id , callback) {

    var osm_query = {
        osm_type: 'R',
        osm_id: osm_id,
        format: 'json',
        addressdetails: 1
    };

    var query_str = Object.keys(osm_query).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(osm_query[key]);
    }).join('&');
    console.log(query_str);
    callback(null, query_str);
};
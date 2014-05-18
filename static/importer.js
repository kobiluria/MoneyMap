var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    async = require('async'),
    unirest = require('unirest');


/** Const **/
var OSM = 'http://nominatim.openstreetmap.org/search?';

/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 * @return {String} a string representation of the Query to OSM
 * @param {JSON} api_result the open muni api result
 * ***********************************************************************/
build_query = function(api_result , callback) {

    var osm_query = {
        city: api_result.name,
        country: 'Israel',
        format: 'json',
        addressdetails: 1,
        polygon_geojson: 1,
        limit: 5
    };

    var query_str = Object.keys(osm_query).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(osm_query[key]);
    }).join('&');
    console.log('osm_query ' + query_str );
    callback(null, query_str, api_result);
};


/***********************************************************************
 * Get correct Osm entity from an API response
 * @param {JSON} osm_results all results from an OSM API request
 * @return {JSON} return the OSM result which fits best as an entity
 * polygon
 * ***********************************************************************/
function get_correct_osm(osm_results, api_result, callback) {
    var found;
    for (var i = 0; i < osm_results.length; i++) {
        if (osm_results[i].osm_type == 'relation') {
            found = true;
            console.log('correct osm ' + osm_results[i])
            callback(null, osm_results[i], api_result);
        }
    }
    if(!found){
    callback('err', null);
    }
}

/*************************************************************************
 * Build a document for the mongo db database.
 * @param {JSON} api_result
 * @param {JSON} osm_entity
 * @return {JSON} a complete document to be placed in the mongo database
 * *************************************************************************/
build_doc = function(osm_entity, api_result, callback) {
    var doc = {
        omuni_name: api_result.name,
        osm_name: osm_entity.display_name,
        omuni_id: api_result.id,
        muni_code: api_result.code,
        date_obtained: new Date(),
        date_updated: new Date(),
        geojson: osm_entity.geojson,
        osm_id: osm_entity.osm_id,
        place_id: osm_entity.place_id,
        license: osm_entity.licence
    };
    callback(null, doc);
}

get_osm_results = function(query, api_result, callback) {
    unirest.get(OSM + query).end(function(osm_results) {

        callback(null, osm_results.body, api_result);
    });
}
/************************************************************************
 * A function for importing all entities
 * in the open muni database into the
 * Polygon database.
 * This function should be called once in the intial build of the database
 *************************************************************************/

initializeAll = function() {

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server('localhost', 27017),
        {native_parser: true});

    // Open the connection to the server
    mongoclient.open(function(err, mongoclient) {

        // Get the first db and do an update document on it
        var db = mongoclient.db('MoneyMap');

        db.collection('entities2', function(err, collection) {

            unirest.get('http://ext.openmuni.org.il/v1/entities/')
                .end(proccess_api);

            function proccess_api(api_results) {
                var results = api_results.body.results;
                async.whilst(
                    function(){ if(results.length){
                        return true;
                    } else
                        return false;
                    },
                    function(callback_top) {
                    var result = results.shift();
                        console.log(result);
                    async.waterfall([
                        function(callback){setTimeout(callback,5000)},
                        function(callback){callback(null,result)},
                        build_query,
                        get_osm_results,
                        get_correct_osm,
                        build_doc,
                        function(result, callback) {
                            collection.insert(
                            result,function(err,mongo_result){
                                    callback(err, mongo_result);
                                });
                        }
                    ], function(err, result) {
                        if(err){
                            console.log(' could not find the entity'); // TODO add a err object which has info about err
                        }
                        else { console.log(result)}
                        setTimeout(callback_top(),000);

                    });
                    },function(err) {
                        console.log('err in top level');
                    }
                );
            }
        });
    });
}


initializeAll();

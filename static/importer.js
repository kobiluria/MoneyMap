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
build_query = function(api_result) {

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

    return query_str;
}


/***********************************************************************
 * Get correct Osm entity from an API response
 * @param {JSON} osm_results all results from an OSM API request
 * @return {JSON} return the OSM result which fits best as an entity
 * polygon
 * ***********************************************************************/
function get_correct_osm(osm_results) {
    for (var i = 0; i < osm_results.length; i++) {
        if (osm_results[i].osm_type == 'relation') {
            return osm_results[i];
        }
    }
    return null;
}

/*************************************************************************
 * Build a document for the mongo db database.
 * @param {JSON} api_result
 * @param {JSON} osm_entity
 * @return {JSON} a complete document to be placed in the mongo database
 * *************************************************************************/
build_doc = function(api_result, osm_entity) {
    return {
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

        db.collection('entities', function(err, collection) {

            unirest.get('http://ext.openmuni.org.il/v1/entities/')
                .end(proccess_api);

            function proccess_api(api_results) {
                var results = api_results.body.results;

                function series(result, callback) {
                    var doc = null;
                    console.log(result.name);
                    var query = build_query(result);
                    console.log(OSM + query);
                    unirest.get(OSM + query).end(insert_doc);

                    function insert_doc(api) {
                        var correct_osm = get_correct_osm(api.body);
                        if (!correct_osm) {
                            setTimeout(function() {
                                console.log('couldnt find ' + result.name);
                                callback(null);

                            }, 5000);
                        }
                        else {
                            console.log(correct_osm.display_name);
                            doc = build_doc(result, correct_osm);
                            setTimeout(callback(doc), 5000);
                        }
                    }
                }

                function for_loop(item) {

                    if (item) {
                        series(item, function(doc) {
                            if (doc) {
                                collection.insert(doc, function(err, result) {
                                    console.log(result);
                                });
                            }
                            return for_loop(results.shift());

                        });
                    }
                    else {
                        console.log('done');
                    }
                }


                for_loop(results.shift());

            }
        });
    });
}

initializeAll();

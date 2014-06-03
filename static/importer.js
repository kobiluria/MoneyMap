var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    async = require('async'),
    tools = require('./tools'),
    unirest = require('unirest');


/** Const **/
var OSM = 'http://nominatim.openstreetmap.org/search?';


/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 * @param {JSON} api_result the open muni api result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, query_result, api_result)
 * **********************************************/
build_query = function(api_result , callback) {

    var osm_query = {
        city: api_result.name,
        country: 'Israel',
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en',
        polygon_geojson: 1,
        limit: 5
    };

    var query_str = Object.keys(osm_query).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(osm_query[key]);
    }).join('&');
    console.log(query_str);
    callback(null, query_str, api_result);
};


/***********************************************************************
 * Get correct Osm entity from an Open Street Map API response
 * @param {JSON} osm_results all results from an OSM API request
 * @param {JSON} api_result the api results related to this query
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, osm_result, api_result)
 * ***********************************************************************/
function get_correct_osm(osm_results, api_result, callback) {
    var found;
    for (var i = 0; i < osm_results.length; i++) {
        if (osm_results[i].osm_type == 'relation') {
            found = true;
            callback(null, osm_results[i], api_result);
        }
    }
    if (!found) {
        var err = {name: api_result.name};
        callback(err, null);
    }
}

/*************************************************************************
 * Build a document for the mongo db database.
 * @param {JSON} osm_entity
 * @param {JSON} api_result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, doc)
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

/*************************************************************************
 * Get all results from open street map given a string Query
 * @param {string} query
 * @param {JSON} api_result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, osm_results, api_result)
 * *************************************************************************/
get_osm_results = function(query, api_result, callback) {
    unirest.get(OSM + query).end(function(osm_results) {

        callback(null, osm_results.body, api_result);
    });
}

/************************************************************************
 * A function for proccessing and adding intial data from the open muni api
 * This function should be called once in the intial build of the database
 * @param {JSON} api_results the results from the open muni api
 * @param {Collection} collection the MongoDB collection to store
 * the documents
 *************************************************************************/
function proccess_api(api_results, collection) {
    var results = api_results.body.results;
    // while the results have a length:
    async.whilst(function() {
            return results.length ? true : false;
        },
        function(callback_top) {
            var result = results.shift();
            // if this is not a real entity.
            if (result.code == '') { results.shift() }
            async.waterfall([
                function(callback) {setTimeout(callback, 2000)},
                function(callback) {callback(null, result)},
                build_query,
                get_osm_results,
                get_correct_osm,
                build_doc,
                function(result, callback) {
                    collection.insert(result, function(err, mongo_result) {
                        callback(err, mongo_result);
                    });
                }
            ], function(err, result) {
                err ? console.log('did not find this entity: ' + err.name) :
                    console.log('found:  ' + result[0].omuni_name);
                callback_top();

            });
        }, function(err) {
            console.log('error happend');
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

    mongoclient.open(function(err, mongoclient) {
        // Get the Money Map db
        var db = mongoclient.db('MoneyMap');

        db.collection('entities2', function(err, collection) {

            unirest.get(tools.OPEN_MUNI)
                .end(function(response) {proccess_api(response, collection);});
        });
    });
}



function update_collection() {
    var updated = 0;
    var inserted = 0;
    tools.get_collection('entities', function(err, collection, mongoclient) {
        collection.find().toArray(function(err, docs) {
            console.log(err);
            console.log(docs.length)});

        var curser = collection.find({}); // find all documents.
        curser.each(function(err, item) {
            if (item) {
                async.waterfall([
                    function(callback) {setTimeout(callback, 2000)},
                    function(callback) { callback(null, item)},
                    build_reverse,
                    call_reverse,
                    get_osm_results,
                    get_correct_osm,
                    build_doc
                ], function(err, doc) {
                    if (doc.geojson == item.geojson &&
                        doc.omuni_id == item.omuni_id) {
                        collection.update(
                            item,
                            {$set: {date_updated: new Date()}},
                            function(err, count) {
                                console.log('updated : ' + item.osm_name);
                                updated += count;
                            });
                    }
                    else {
                        collection.insert(doc, function(err, result) {
                            console.log('inserted : ' + result.osm_name);
                            inserted += 1;
                        });
                    }
                });
            }
            else{
                return;

            }
        });
    });
}

call_reverse = function(api_result, query_str, callback) {
    unirest.get(tools.NOMINATIM_REVERSE + query_str)
        .end(function(reverse_result) {
            var osm_query = {city: reverse_result.body.address.city,
                country: reverse_result.body.address.country,
                format: 'json',
                addressdetails: 1,
                'accept-language': 'en',
                polygon_geojson: 1,
                limit: 5
            }
            var query_str = Object.keys(osm_query).map(function(key) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(osm_query[key]);
            }).join('&');
            console.log(query_str);
            callback(null, query_str, api_result); // sends null as the
        });
}


/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 * @param {JSON} doc the open muni osm id to reverse geocode.
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, query_result, api_result)
 * **********************************************/
build_reverse = function(doc, callback) {

    var osm_query = {
        osm_type: 'R',
        osm_id: doc.osm_id,
        format: 'json',
        addressdetails: 1
    };

    var query_str = Object.keys(osm_query).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(osm_query[key]);
    }).join('&');

    console.log(query_str);
    unirest.get(tools.OPEN_MUNI + doc.omuni_id).end(function(results) {
        if (results) {
            callback(null, results.body.results, query_str);

        }
        //TODO need to add an error system
        else {
            console.log('error reaching Open Muni');
            callback('err');
        }
    });
};


update_collection();
/**
 * Created by kobi on 6/11/14.
 */

var unirest = require('unirest');
var tools = require('./tools');



/*************************************************************************
 * Build a Query to search for a document for the mongo db database.
 * @param {JSON} api_result the open muni api result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, query_result, api_result)
 * **********************************************/
exports.build_query = function(api_result , callback) {

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
exports.get_correct_osm = function(osm_results, api_result, callback) {
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
};

/*************************************************************************
 * Get all results from open street map given a string Query
 * @param {string} query
 * @param {JSON} api_result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, osm_results, api_result)
 * *************************************************************************/
exports.get_osm_results = function(query, api_result, callback) {
    unirest.get(tools.NOMINATIM + query).end(function(osm_results) {
        callback(null, osm_results.body, api_result);
    });
};

/**
 * Call the reverse Nominatim API in order to get the address
 * @param {JSON} api_result     the Open Muni entity result
 * @param {String} query_str    the intial query string
 * @param {Function} callback   the callback function
 */
exports.call_reverse = function(api_result, query_str, callback) {
    console.log(tools.NOMINATIM_REVERSE + query_str);
    unirest.get(tools.NOMINATIM_REVERSE + query_str)
        .end(function(reverse_result) {
            // no city like this exists. somethings wrong.
            if (reverse_result.body.error) {
                callback(new Error(reverse_result.body.error));
                return;
            }
            var osm_query = {city: reverse_result.body.address.city,
                country: reverse_result.body.address.country,
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
            callback(null, query_str, api_result); // sends null as the
        });
};




/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 * @param {JSON} doc the open muni osm id to reverse geocode.
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, query_result, api_result)
 * **********************************************/
exports.build_reverse = function(doc, callback) {

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


    console.log(tools.OPEN_MUNI + doc.omuni_id);
    unirest.get(tools.OPEN_MUNI + doc.omuni_id).end(function(results) {
        if (results) {


            callback(null, results.body, query_str);

        }
        //TODO need to add an error system
        else {
            console.log('error reaching Open Muni');
            callback('err');
        }
    });
};

/**
 * Created by kobi on 5/20/14.
 */

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    fs = require('fs'),
    async = require('async');


/*** @type {string}  Open Muni Api EndPoint **/
exports.OPEN_MUNI = 'http://ext.openmuni.org.il/v1/entities/';
/*** @type {string}  NOMINATIM API EndPoint **/
exports.NOMINATIM = 'http://nominatim.openstreetmap.org/search?';
/*** @type {string}  NOMINATIM Reverse API EndPoint **/
exports.NOMINATIM_REVERSE = 'http://nominatim.openstreetmap.org/reverse?';
/*** @type {string}  The open muni project API EndPoint **/
exports.OPEN_MUNI = 'http://ext.openmuni.org.il/v1/entities/';



/*************************************************************************
 * Build a document for this mongo db database.
 * @param {JSON} osm_entity
 * @param {JSON} api_result
 * @param {Function} callback a callback function, the callback
 * should be in the form callback(err, doc)
 * *************************************************************************/
exports.build_doc = function(osm_entity, api_result, callback) {
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
};


/**
 * Get a connection to the MongoDb collection database
 * @param {String} name Name of the collection which is trying to be accessed.
 * @param {Function} callback a callback function
 */
exports.get_collection = function(name, callback) {

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server('localhost', 27017),
        {native_parser: true});

    mongoclient.open(function(err, mongoclient) {
        // Get the Money Map db
        var db = mongoclient.db('MoneyMap');

        db.collection(name, {} , function(err, collection) {
            callback(err, collection, mongoclient);

        });
    });
}


/**
 * Query if a entity is in the system. returns the latest entity.
 * @param {String} omuni_id      the id of the entity
 * @param {async~callback} the callback function to handle
 */
exports.queryExists = function(item,callback) {
    exports.get_collection('entities', function(err, collection, mongoclient) {
        collection.find({'omuni_id': item.omuni_id},{sort: {date_updated: 1}})
            .toArray(function(err, results) {
                callback(null,item[0]); // return the must updated one.

        });
    });
};

/**
 * Query if a entity doesn't exists in the system. returns an Error if it does
 * @param {String} omuni_id      the id of the entity
 * @param {async~callback} the callback function to handle
 */
exports.queryDoesntExists = function(item,callback) {
    exports.get_collection('entities', function(err, collection, mongoclient) {
        collection.find({'omuni_id': item.omuni_id},{sort: {date_updated: 1}})
            .toArray(function(err, results) {
                 if(err) {
                     callback(null,item);
                 }
                 if(results.length == 0) {
                     callback(null,item);
                 }
                 else {
                     callback(new Error('Error - item found'),item);
                 }
            });
    });
};
/**
 * Loop through an api results
 * each iteration a new object from the results is returend to callback
 * function
 * @param {Array} api_results       the API to loop through
 * @param {Function} result_func    the Function to call with the result
 * @param {Function} end_func       a function to be called if there was an err
 */
exports.loop_api = function(api_results, result_func, end_func) {
    async.whilst(function() {
            return api_results.length ? true : false;
        },
        function(callback) {
            result = api_results.shift();
            result_func(result, callback);
        },
        function(err) {
            end_func(err);

        });
}
/**
 * Write a JSON file to a JSONP file
 * This method will write a JSON Object into a JSONP
 * @param {String} file the file name for the file
 * @param {JSON} obj            the JSON object to be wrapped with function
 * @param {String} wrapper      the function wrapper for the JSON object
 * @param {Function} callback   the callback function to be called.
 */
exports.writeJsonp = function(file, obj, wrapper, callback) {

    var str = wrapper;
    str += '(';

    try {
        str += JSON.stringify(obj);
    } catch (err) {
        if (callback) {
            callback(err, null);
        }
        return;
    }
    str += ')';
    fs.writeFile(file, str, callback);
}

exports.writeArry2File = function(file, array, var_str, callback){
    var str = 'var ';
    str += var_str + ' = ';

    try {
        str += JSON.stringify(array);
    } catch (err) {
        if (callback) {
            callback(err, null);
        }
        return;
    }
    str+= ';'
    fs.writeFile(file, str, callback);
}
/**
 * A Finally style for closing the Mongo
 * @param err
 * @param mongoclient
 */
exports.closeMongoClient = function(err, mongoclient){
    if (err) {
        console.log(err);
    }
    mongoclient.close();
}

/**
 * This method should throw an error message for a unvaild API request
 * @function throw Error
 * @param {Response} res        a express response object
 * @param {String} message      a message to present to the user
 */
//TODO add the error to other logs
exports.throwError = function (res , msg) {
    res.json({'ERROR':msg});
}
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
/*** @type {string}  The MoneyMap project API EndPoint **/
exports.API_HEAD_ENDPOINT = (process.env.OPENSHIFT_NODEJS_IP) ?
    'http://api-moneymap.rhcloud.com/api/' : 'http://localhost:3000/api/';
/*** @type {string}  The GUI MoneyMap project EndPoint **/
exports.GUI_HEAD_ENDPOINT = (process.env.OPENSHIFT_NODEJS_IP) ?
    'http://api-moneymap.rhcloud.com/gui/' : 'http://localhost:3000/api/';

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

    // default to a 'localhost' configuration:
    var connection_string = '127.0.0.1:27017/MoneyMap';

    // if the MongoLab env Variables are set

    if (process.env.MONGO_LAB_DB_PASSWORD) {
        connection_string = process.env.MONGO_LAB_DB_USERNAME + ':' +
            process.env.MONGO_LAB_DB_PASSWORD + '@' +
            process.env.MONGO_LAB_DB_HOST + ':' +
            process.env.MONGO_LAB_DB_PORT + '/' +
            process.env.MONGO_LAB_DB_NAME;
    }


    // if no MongoLab env use the OPENSHIFT env:
    else if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
    }

    //load the Client interface
// the client db connection scope is wrapped in a callback:
    MongoClient.connect('mongodb://' + connection_string, function(err, db) {
        if (err) throw err;
        db.collection(name, {} , function(err, collection) {
            // give the callback function the right to close the connection.
            callback(err, collection, db);

        });
    });
};


/**
 * Query if a entity is in the system. returns the latest entity.
 * @param {String} item  the id of the entity
 * @param {Function} callback the callback function to handle
 */
exports.queryExists = function(item, callback) {
    exports.get_collection('entities', function(err, collection, db) {
        collection.find({'omuni_id': item.omuni_id},{sort: {date_updated: 1}})
            .toArray(function(err, results) {
                callback(null, item[0]); // return the must updated one.
                db.close(); // close the mongo client

        });
    });
};

/**
 * Query if a entity doesn't exists in the system. returns an Error if it does
 * @param {String} omuni_id      the id of the entity
 * @param {async~callback} the callback function to handle
 */
exports.queryDoesntExists = function(item, callback) {
    exports.get_collection('entities', function(err, collection, db) {
        collection.find({'omuni_id': item.omuni_id},{sort: {date_updated: 1}})
            .toArray(function(err, results) {
                 if (err) {
                     callback(null, item);
                 }
                 if (results.length == 0) {
                     callback(null, item);
                 }
                 else {
                     err = new Error('Error - item found');
                     err.item = item;
                     callback(err, item);
                 }
                 db.close();
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
 * This method should throw an error message for a unvaild API request
 * @function throw Error
 * @param {Response} res        a express response object
 * @param {String} message      a message to present to the user
 */
//TODO add the error to other logs
exports.throwError = function (res , msg) {
    res.json({'ERROR':msg});
}
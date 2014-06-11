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
exports.NOMINATIM = 'http://nominatim.openstreetmap.org/search?';
exports.NOMINATIM_REVERSE = 'http://nominatim.openstreetmap.org/reverse?';
exports.OPEN_MUNI = 'http://ext.openmuni.org.il/v1/entities/';



/*************************************************************************
 * Build a document for the mongo db database.
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





exports.get_collection = function(name, callback) {

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server('localhost', 27017),
        {native_parser: true});

    mongoclient.open(function(err, mongoclient) {
        // Get the Money Map db
        var db = mongoclient.db('MoneyMap');

        db.collection(name, {} , function(err, collection) {
            callback(err, collection , mongoclient);

        });
    });
}

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

exports.writeJsonp = function(file, obj, wrapper, callback){

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
    str+= ')'
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

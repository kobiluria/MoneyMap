/**
 * Created by kobi on 6/11/14.
 */

var tools = require('../static/tools');
var osm_tools = require('../static/osmtools');
var async = require('async');
var csv = require('ya-csv');


exports.insertById = function(req, res) {
    var osm_id = req.query.osm_id;
    var omuni_id = req.query.omuni_id;
    var item = {osm_id: osm_id, omuni_id: omuni_id };
    insertDatabaseById(item, function(message) {
        res.json(message);
    });

};

function insertDatabaseById(item, callback){

    tools.get_collection('entities', function(err, collection, mongoclient) {
        async.waterfall([
            function(callback) { callback(null, item);},
            tools.queryDoesntExists,
            osm_tools.build_reverse,
            osm_tools.call_reverse,
            osm_tools.get_osm_results,
            osm_tools.get_correct_osm,
            tools.build_doc
        ], function(err, doc) {
            if (err) {
                mongoclient.close();
                var message = {};
                message.ERROR = err;
                message.item = item;
                callback(message);
            }
            else {
                collection.insert(doc, function(err, result) {
                    console.log('inserted : ' + result[0].osm_name);
                    mongoclient.close();
                    callback({item: result[0].osm_name});
                });
            }
        });
    });
}

exports.uploadCsv = function(req, res) {
    var found = [];
    var error = [];
    var count = 0;
    var reader = csv.createCsvFileReader(req.files.csvFile.path, {
        'separator': ',',
        'quote': '"',
        'escape': '"',
        'comment': '',
        'columnsFromHeader': true
    });
    reader.addListener('data', function(data) {
            count++;
            insertDatabaseById(data, function(message) {
                if (message.ERROR) {
                    error.push(message.item);
                    count--;
                }
                else {
                    found.push(message.item);
                    count--;
                }
            });
    });

    reader.addListener('end', function(data) {
        async.whilst(
           function() {
            return (count > 0);
        }, function(callback) {
            setTimeout(callback, 1000);
        }, function(finsh) {
            res.json({inserted: found, error: error});
        });
    });

};


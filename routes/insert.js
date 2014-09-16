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
            if(err){
                res.json({ERROR:err.message});
                mongoclient.close();
            }
            //TODO safe insert :  should only insert object where all fields are full.
            //TODO build a standard for the output in cases of insert and update.
            //TODO add a safe insert function in the tools library.
            else {
                collection.insert(doc, function (err, result) {
                    console.log('inserted : ' + result[0].osm_name);
                    res.json({inserted: result[0].osm_name});
                    mongoclient.close();
                });

            }
        });
    });
};

exports.insertByCSV = function(req, res) {
    console.log('File name is ' + req.files.insertCSV.name);
    console.log('File size is ' + req.files.insertCSV.size);
    console.log('File size is ' + req.files.insertCSV.path);
    var reader = csv.createCsvFileReader(req.files.insertCSV.path, {
        'separator': ',',
        'quote': '"',
        'escape': '"',
        'comment': ''
    });
    reader.addListener('data', function(data) {
        console.log(data);
        //TODO check if the entity is updated.
        //TODO if the entity is not updated should call the insertById

    });
    res.json({ok:'ok'});
};
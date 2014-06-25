/**
 * Created by kobi on 6/11/14.
 */

var tools = require('../static/tools');
var osm_tools = require('../static/osmtools');
var async = require('async');

exports.insertById = function(res, req){

    var osm_id = req.query.osm_id;
    var omuni_id = req.query.omuni_id;
    var item = {osm_id: osm_id, omuni_id: omuni_id };

    tools.get_collection('entities', function(err, collection, mongoclient) {
        async.waterfall([
            function(callback) { callback(null, item);},
            osm_tools.build_reverse,
            osm_tools.call_reverse,
            osm_tools.get_osm_results,
            osm_tools.get_correct_osm,
            tools.build_doc
        ], function(err, doc) {
            collection.insert(doc, function(err, result) {
                console.log('inserted : ' + result[0].osm_name);
                res.json({inserted: result[0].osm_name});
                mongoclient.close();
            });
        });
    });
};

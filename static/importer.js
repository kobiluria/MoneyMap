var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    async = require('async'),
    tools = require('./tools'),
    osm_tools = require('./osmtools.js'),
    unirest = require('unirest');



/************************************************************************
 * A function for importing all entities
 * in the open muni database into the
 * Polygon database.
 * This function should be called once in the intial build of the database
 *************************************************************************/
exports.import_collection = function() {
    tools.get_collection('entities', function(err, collection , mongoclient) {
        unirest.get(tools.OPEN_MUNI)
            .end(function proccess_api(api_results) {
                var results = api_results.body.results;
                // while the results have a length:
                async.whilst(function() {
                        return results.length ? true : false;
                    },function(callback) {
                        var result = results.shift();
                        import_entity(callback, result);
                    }
                    , function(err) {
                        tools.closeMongoClient(err, mongoclient);
                    });
            });
    });
};
/*********************************************************************
 * A function for importing a entity from the open muni
 * database into the Polygon database.
 * @param {Function} callback callback the callback function to call
 * when done.
 * @param {JSON} result the Open Muni Entity result to import from OSM
 *********************************************************************/
import_entity = function(callback, result) {
    // if this is not a real entity.
    if (result['code'] == '') {
        callback();
    }
    async.waterfall([
        function(callback) {setTimeout(callback, 2000)},
        function(callback) {callback(null, result)},
        osm_tools.build_query,
        osm_tools.get_osm_results,
        osm_tools.get_correct_osm,
        tools.build_doc,
        function(result, callback) {
            collection.insert(result, function(err, mongo_result) {
                callback(err, mongo_result);
            });
        }
    ], function(err, result) {
        err ? console.log('did not find  ' + err.name) :
            console.log('found:  ' + result[0].omuni_name);
        callback();

    });
};

/************************************************************************
 * A function for updating all entities in our DB
 * This function should be called once in a while
 * **********************************************************************/
exports.update_collection = function() {

    tools.get_collection('entities', function(err, collection, mongoclient) {
        // find all documents.
        collection.find({}).toArray(function(err, results) {
            async.whilst(
                function() {return (results.length > 0)}
                , function(callback) {
                    var item = results.shift();
                    update_item(callback, item);
                },function(err) {
                    tools.closeMongoClient(err, mongoclient);
                }
            );
        });
    });
};

/*********************************************************************
 * A function for updating a entity in our DB.
 * @param {Function} callback the callback function to call
 * when done.
 * @param {JSON} item our DB item to update
 *********************************************************************/
update_item = function(callback, item) {

    async.waterfall([
        function(callback) {setTimeout(callback, 2000)},
        function(callback) { callback(null, item);},
        osm_tools.build_reverse,
        osm_tools.call_reverse,
        osm_tools.get_osm_results,
        osm_tools.get_correct_osm,
        tools.build_doc
    ], function(err, doc) {
        console.log(doc);
        console.log(item);
        var doc_string = JSON.stringify(doc.geojson);
        var item_string = JSON.stringify(item['geojson']);
        if (doc_string == item_string &&
            doc.omuni_id == item['omuni_id']) {
            collection.update(
                item,
                {$set: {date_updated: new Date()}},
                function() { //TODO deal with an error
                    console.log('updated : ' + item['osm_name']);
                    callback();
                });
        }
        else {
            collection.insert(doc, function(err, result) {
                console.log('inserted : ' + result[0].osm_name);
                callback();
            });
        }
    });

};

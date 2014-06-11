var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    async = require('async'),
    tools = require('./tools'),
    osm_tools = require('./osmtools.js'),
    unirest = require('unirest');

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



exports.update_collection = function() {
    var updated = 0;
    var inserted = 0;
    tools.get_collection('entities', function(err, collection, mongoclient) {
        // find all documents.
        collection.find({}).toArray(function(err, results) {
            async.whilst(
                function() {return (results.length > 0)}
                ,function(top_callback) {
                    var item = results.shift();
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
                        var item_string = JSON.stringify(item.geojson);
                        if (doc_string == item_string &&
                            doc.omuni_id == item.omuni_id) {
                            collection.update(
                                item,
                                {$set: {date_updated: new Date()}},
                                function(err, count) {
                                    console.log('updated : ' + item.osm_name);
                                    updated += count;
                                    top_callback();
                                });
                        }
                        else {
                            collection.insert(doc, function(err, result) {
                                console.log('inserted : ' + result[0].osm_name);
                                inserted += 1;
                                top_callback();
                            });
                        }
                    })},function(err) {

                    console.log('got here');
                    console.log(err);
                });
        });
    });
}
this.update_collection();

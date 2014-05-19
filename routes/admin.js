/**
 * Created by kobi on 5/19/14.
 */
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    async = require('async'),
    unirest = require('unirest');


exports.find_missing = function(req, res) {

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server('localhost', 27017),
        {native_parser: true});

    mongoclient.open(function(err, mongoclient) {
        // Get the Money Map db
        var db = mongoclient.db('MoneyMap');

        db.collection('entities', {} , function(err, collection) {

            unirest.get('http://ext.openmuni.org.il/v1/entities/')
                .end(function(api) {
                    list_missing(api, collection, res);
                });
        });
    });
}

list_missing = function(api, collection, res) {
    var results = api.body.results;
    var missing = [];
    async.whilst(function() {
            return results.length ? true : false;
        },
        function(callback_top) {
            var result = results.shift();
            async.waterfall([
                function(callback) {
                    var curser = collection.find({ omuni_id: results.id});
                    curser.count(function(err, count) {
                        if (count == 0) {
                            missing.push(
                                {code: result.code,
                                    id: result.id,
                                    name: result.name
                                });
                            callback(null);
                        }
                        else {
                            callback(null);
                        }
                    });
                }
            ], function(err, result) {

            });
            callback_top();
        }, function(err) {
            console.log(missing);
            res.json(missing);
        });
}

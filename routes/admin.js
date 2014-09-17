

/**
 * a module of admin operations in the system.
 * @module admin
 * */
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    async = require('async'),
    unirest = require('unirest'),
    tools = require('../static/tools');

/**
 * Find a Admin Query in our DB
 * The Request is parased using the q= string
 * and depending on the request we will use either an
 * aggregation query or a loop through Open Muni Db and return
 * some info back. This function is used for a route to the
 * Correct function and query.
 * @param {Request} req the clients search req.
 * @param {Response} res the response to the client.
 */
exports.find = function(req, res) {
    var search = {};
    var search_str = req.query.q;
    console.log(search_str);
    switch (search_str) {
        case 'missing':
            find_missing(search_str, resposne);
            break;
        case 'unupdated':
            search = [{$match: {'date_updated': {$lte: new Date()}}}];
            aggregate(search, resposne);
            break;
        case 'not_muni':
            search = [{$match: {muni_code:''}}];

    }
    function resposne(result) {
        res.json({request: req.query.q, result: result});

    }
}

/**
 *  Find something missing in our DB
 *  entities which exists in Open Muni
 *  but doesn't exists in our database this function can query
 *  a bunch of operations , all of these operations should be looped
 *  for each entity in the open muni database.
 * @param {String} search the clients search req.
 * @param {Response} res the response to the client.
 */
find_missing = function(search_str, callback) {

    tools.get_collection('entities', function(err, collection, mongoclient) {
        unirest.get(tools.OPEN_MUNI).end(function(api) {
            var results = api.body.results;
            var answer = [];
            tools.loop_api(results, find_entity, send_missing);
            function find_entity(result, callback) {
                var search;
                switch (search_str) {
                    case 'missing' : search = {'omuni_id': result.id};
                }

                collection.find(search).toArray(function(err, items) {

                    if (err) { console.log(err); }

                    else if (!items.length) { // did not find this in DB
                        answer.push({code: result.code,
                            id: result.id, name: result.name});
                        callback();
                    }
                    else { // continue the loop
                        callback();
                    }
                });
            }

            function send_missing(err) { // when we are done.
                callback(answer);
                mongoclient.close();

            }
        });
    });
}
/**
 * An aggregation search on our DB
 * @param {Array} agg a aggregation framework array
 * @param {Function} callback  a callback function
 */
aggregate = function(agg, callback) {
    agg.push({$project: {_id: 0, code: '$muni_code',name:'$name', id: '$omuni_id'}});
    console.log(agg);
    tools.get_collection('entities', function(err, collection, mongoclient) {
        collection.aggregate(agg, function(err, result) {
            mongoclient.close();
            callback(result);
        });
    });
}


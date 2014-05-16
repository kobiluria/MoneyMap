/**
 * Created by kobi on 5/15/14.
 */

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    tools = require('../static/importer'),
    unirest = require('unirest');



update_by_code = function(err,req,res){

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});

    // Open the connection to the server
    mongoclient.open(function(err, mongoclient) {

        // Get the first db and do an update document on it
        var db = mongoclient.db("MoneyMap");

        var collection = db.collection('entities');

        unirest.get('http://ext.openmuni.org.il/v1/entities/').end(proccess_api);

        function proccess_api(api_results){

        }
    });
}
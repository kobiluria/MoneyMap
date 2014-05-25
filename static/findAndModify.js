/**
 * Created by kobi on 5/25/14.
 */

var tools = require('./tools'),
    async = require('async');

/*******************************************************
 * A admin function to remove non-entities from the db.
 * some objects in the open muni api are not entities.
 * therefore we delete those entities in this function
 * ******************************************************/
function removeNonEntities() {
    tools.get_collection('entities_t', function(err, collection, mongoclient) {

        var done = false;
        async.whilst(function() { return !done }, function(callback) {
            collection.findAndRemove({muni_code: ''},
                        {},{},function(err, item) {
                if (item == null) {
                    done = true;
                }
                else {
                    console.log(item);
                }
                callback();
            });
        }, function(err, result) {
            if (!err) { console.log('done'); }
            else { console.log(err) }
            mongoclient.close();
        });
    });
}

removeNonEntities();

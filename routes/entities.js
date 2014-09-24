
var tools = require('../static/tools.js')


exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving entity: ' + id);
    tools.get_collection('entities', function (err, collection, db) {
        collection.findOne({'omuni_id': id}, function (err, doc) {
            if(err){
                throw(err);
            }
            res.json(doc);
            db.close();
        });
    });
};

exports.findAll = function(req, res) {
    tools.get_collection('entities', function (err, collection, db) {
        collection.aggregate(
            [
                {$project: {_id: 0, 'omuni_name': '$omuni_name',
                    'osm_name': '$osm_name',
                    'url': {$concat: [tools.API_HEAD_ENDPOINT,'entities/', '$omuni_id'] },
                'map_url': {$concat: [tools.API_HEAD_ENDPOINT,'maps/', '$omuni_id'] }
                'map_gui_url':{$concat: [tools.API_HEAD_ENDPOINT,'maps/', '$omuni_id'] }}}
            ],
            function (err, result) {
                if (err) {
                    throw(err);
                }
                res.json(result);
                db.close();
            });
    });
};

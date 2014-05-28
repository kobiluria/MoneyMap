/**
 * Created by kobi on 5/25/14.
 */

var tools = require('../static/tools.js')


exports.map_by_code = function(req, res) {

    tools.get_collection('entities', function(err, collection, mongoclient) {
        console.log(req.query.q);
        collection.aggregate(
            [{$match: {muni_code: req.query.q}},
                {$project:
                {_id: 0,
                    'geometry': '$geojson',
                    'properties.code': '$muni_code' }}],
            function(err, result) {
                if (err) {console.log(err)}
                var geojson = result[0];

                geojson['type'] = 'Feature';

                res.json(geojson);

                mongoclient.close();
            });
    });
}






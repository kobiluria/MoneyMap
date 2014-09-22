/**
 * Created by kobi on 5/25/14.
 */

var tools = require('../static/tools.js')

exports.map_by_id = function(req, res){
    export_map({$match: {omuni_id: req.params.id}},req,res);
}

exports.map_by_code = function(req, res) {
    export_map({$match: {muni_code: req.query.muni_code}},req,res);

}
function export_map(agg,req,res) {
    tools.get_collection('entities', function(err, collection, mongoclient) {
        console.log(JSON.stringify(agg));
        collection.aggregate(
            [agg,
                {$project:
                {_id: 0,
                    'geometry': '$geojson',
                    'properties.code': '$muni_code' }}],
            function(err, result) {
                if (err) {console.log(err)}
                var geojson = result[0];

                geojson['type'] = 'Feature';

                res.json(geojson);
            });
    });
}




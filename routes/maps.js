/**
 * Created by kobi on 5/25/14.
 */

var tools = require('../static/tools.js')

exports.map_by_id = function(req, res){
    export_map({$match: {omuni_id: req.params.id}},res);
}

exports.map_by_query = function(req, res) {
    if (req.query.muni_code){
        export_map({$match: {muni_code: req.query.muni_code}},res);
    }
    else if (req.query.spatial) {
        map_by_coordinates(req, res);
    }
}

exports.map_all = function(req,res){
    export_map({$match:''},res,true);
}

map_by_coordinates = function(req, res) {
    var limit = (req.query.limit ? parseInt(req.query.limit) : 5);
    var lat = parseFloat(req.query.lat);
    var lng = parseFloat(req.query.lng);
    var agg = {$geoNear: { near: {type: 'Point', coordinates: [lng, lat]},
                num: limit, spherical: true, distanceField: 'dist.calculated'}};

    export_map(agg,res);
};
function export_map(agg, res, all) {
    tools.get_collection('entities', function(err, collection, db) {
        console.log(JSON.stringify(agg));
        collection.aggregate(
            [agg,
                {$project:
                {   _id: 0,
                    'geometry': '$geojson',
                    'properties.code': '$muni_code',
                    'type':{$concat:['Feature','']}//todo does this work?
                }}],
            function(err, result) {
                if (err) {console.log(err)}

                var geojson;
                if (agg.$geoNear || all) {
                    geojson = {type: 'FeatureCollection', features: result};
                }
                else {

                    geojson = result[0];
                }

                res.json(geojson);
                db.close();
            });
    });
}




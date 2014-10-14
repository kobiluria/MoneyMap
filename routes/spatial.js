/**
 * Created by kobi on 13/10/14.
 */

var tools = require('../static/tools.js');



/**
 * Find entities of the system using lat/lng coordinates.
 * will return the closest entities to a lat/lng location.
 * a limit can be defined , in order to limit the
 * amount of entities returned.
 * @param {Request} req the clients search req.
 * @param {Response} res the response to the client.
 */
exports.findByCoordinates = function(req, res) {
    var limit = (req.query.limit ? parseInt(req.query.limit) : 5);
    var lat = parseFloat(req.query.lat);
    var lng = parseFloat(req.query.lng);

    tools.get_collection('entities', function(err, collection, db) {
        collection.aggregate(
            [{$geoNear: { near: {type: 'Point', coordinates: [lng,lat]},
                num: limit, spherical: true, distanceField: 'dist.calculated'}},
                {$project: {
                    '_id': 0,
                    'omuni_name': '$omuni_name',
                    'osm_name': '$osm_name',
                    'dist': 1,
                     'url': {$concat: [tools.API_HEAD_ENDPOINT, 'entities/', '$omuni_id'] },
                    'map_url': {$concat: [tools.API_HEAD_ENDPOINT, 'maps/', '$omuni_id'] },
                    'map_gui_url': {$concat: [tools.GUI_HEAD_ENDPOINT, 'maps/', '$omuni_id'] }}}
            ],
            function(err, result) {
                if (err) {
                    throw (err);
                }
                res.json(result);
                db.close();
            });
    });
};

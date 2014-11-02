

exports.map_by_code = function(req, res) {
    res.render('index', req.query);
};
exports.map_by_id = function(req, res) {
    console.log(req.params.id);
    res.render('map_by_id', {id: req.params.id});
};
exports.map_by_coordinates = function(req, res) {
    res.render('map_by_coordinates', {lat: req.query.lat,lng : req.query.lng, limit:req.query.limit});
};
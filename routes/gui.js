

exports.map_by_query = function(req, res) {
    if(req.query.code){
        res.render('index', req.query);
    }
    else if (req.query.spatial){
        res.render('map_by_coordinates', {lat: req.query.lat,lng : req.query.lng, limit:req.query.limit});
    }
};
exports.map_by_id = function(req, res) {
    console.log(req.params.id);
    res.render('map_by_id', {id: req.params.id});
};
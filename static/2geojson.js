/**
 * Created by kobi on 5/21/14.
 */

var jf = require('jsonfile');

var tools = require('./tools');

tools.get_collection('entities', function(err, collection) {
    collection.aggregate([{$project:
        {_id: 0,
            'geometries': '$geojson',
            'properties.code': '$muni_code' }}],
        {},
        function(err, result) {
            if (err) {console.log(err)}
            for (var i; i < result.length; i++) {
                result[i]['type'] = 'Feature';
            }
            var file = './map.geojson';
            var geojson = {type: 'FeatureCollection', features: result};

            jf.writeFile(file, geojson, function(err) {
                console.log(err);
            });

        });
});



/**
 * Created by kobi on 6/1/14.
 */
/**
 * Created by kobi on 5/21/14.
 */

var jf = require('jsonfile');

var tools = require('../../static/tools');

tools.get_collection('entities', function(err, collection) {
    collection.aggregate([{$project:
    {_id: 0,
        'omuni_id' :1,
        'geometry': '$geojson',
        'properties.code': '$muni_code' }}],
        {},
        function(err, results) {
            if (err) {console.log('hi1' + err)}
            else{
                for (var i = 0; i < results.length; i++) {
                    result = results[i];
                    result['type'] = 'Feature';
                    var file = './jsonp/' + result.omuni_id +'.jsonp';
                    tools.writeJsonp(file,result,'map_func',function(err){
                        if(err) { console.log('hi2' + err)}
                    });
                }
            }
            console.log('done');
        });
});



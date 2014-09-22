/**
 * Created by kobi on 6/1/14.
 */

var jf = require('jsonfile');
var tools = require('../../static/tools');

tools.get_collection('entities2',function(err,collection,mongoclient){
    collection.aggregate([{'$project':{_id:0,'value':'$osm_name','data':'$omuni_id'}}],
        function(err, result){
            if(err){ console.log(err)}
            else{
                var file = '../js/entities.js';
                tools.writeArry2File(file, result, 'collection', function(err) {
                    if(err) {console.log(err) }
                    else {console.log('done')}

                });
            }

        });
});

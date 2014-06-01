/**
 * Created by kobi on 6/1/14.
 */

var jf = require('jsonfile');
var tools = require('../../static/tools');

tools.get_collection('entities',function(err,collection,mongoclient){
    collection.aggregate([{'$project':{_id:0,'value':'$omuni_name','data':'$omuni_id'}}],
        function(err, result){
            if(err){ console.log(err)}
            else{
                var file = './entities.js';
                var response = {'query': 'Unit',"suggestions":result};
                jf.writeFile(file, response, function(err) {
                    console.log(err);

                });
            }

        })
})

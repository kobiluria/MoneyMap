var needle = require('needle');

exports.import = function(req,res){
	needle.get('http://ext.openmuni.org.il/v1/entities/', function(error,response){
		//console.log(response.body.results[0]);
		res.send(response.body.results[0]);
	});
}

//exports.getBody = function(res,body){
//	var result = body.getBody()['results'][0];
//	res.json(result)
//};

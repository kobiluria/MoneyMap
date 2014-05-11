var needle = require('needle');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');


/**********************************************************
* A function for importing/updating all entities
* in the open muni database into the
* Polygon database.
* This function should be called every month give or take
***********************************************************/
//TODO add each entity from the results of the api to the mongo database. 

exports.importAll = function(err,req,res){

	async.auto({
	
		get_db : MongoClient.connect("mongodb://localhost:27017/entitydb"),

		get_collection : ['get_db' , function( callback ,  results){
			var collection = results.db.collection('entities');
			callback(null,collection);
		}],

		get_api : needle.get('http://ext.openmuni.org.il/v1/entities/'),


		update_data : ['get_collection','get_api' , update_data(callback , results)] ,


	},function(err,results){
	
	if(err){
		console.dir(err); //  if an error happend
	}

	else{
		res.send('update was successful')
	}
	
	});

}


/**********************************************************
* Given the Collection and the Open Muni Database 
* Start intializing the collection
***********************************************************/

//TODO add each entity from the results of the api to the mongo database. 
intialize_data = function(callback,results){
	
	var api_results = results.get_api.body.results;

	for( var i = 0 ; i < api_result.length ; i ++){ // loop through all results
		
		var api_result = api_results[i];
		
		needle.get('nominatim.openstreetmap.org/search?' , function(err , osm_result){

			var doc = buildMongoDocument(api_result,osm_result);

			results.get_collection.insert(doc);

		});

		setTimeout(function() {}, 500);

	}

	callback(null); // no errors
}

/**********************************************************
* Given the Collection and the Open Muni Database 
* Start updating the collection
***********************************************************/
update_data = function(callback,results){
	
	var results = results.get_api.body.results;

	for( var i = 0 ; i < results.length ; i ++){ // loop through all results
		
		var result = api_result[i];
		
		var curser = collection.find({id : result.id , update_date : { }} ,{ id:1 , geojson:1 , entry_date:1 , update_date:1 })
		.sort(entry_date: 1).limit(1);
		
		curser.each(function(err,item){
			if(item != null){
					if (item.)
					if (item.geojson = ) //TODO fix this to actually compare between them. 
			}
		needle.get('nominatim.openstreetmap.org/search?' , function(err , osm_response){


		})

	}
}


/**********************************************************
* A function for importing/updating one entity
* given by a muni_code. in the open muni database into the
* Polygon database.
* This function should can be called to fix a single muni. 
***********************************************************/
//TODO add each entity from the results of the api to the mongo database.

exports.importMuni = function(req,res,muniCode){
	//TODO fix the call to the muni database!
	needle.get('http://ext.openmuni.org.il/v1/entities/' + muniCode , function(error,response){
		var results = response.body.results;
		};
	});
}


/**********************************************************
* A function for building the mongodoc for each polygon
* in the system
***********************************************************/
exports.buildMongoDocument = function(api_result,osm_result){
	var doc = {
		
		code :
		date_obtained :
		osm_id :


	}
}


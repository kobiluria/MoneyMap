var unirest = require('unirest');
var MongoClient = require('mongodb').MongoClient;

/************************************************************************
* A function for importing all entities
* in the open muni database into the
* Polygon database.
* This function should be called once in the intial build of the database
*************************************************************************/
//TODO add each entity from the results of the api to the mongo database. 

exports.intailizeAll = function(err,req,res){

	MongoClient.connect("mongodb://localhost:27017/entitydb"), get_collection(err, db){ // get DB
		var collection = results.db.collection('entities'); // get Collection
		unirest.get('http://ext.openmuni.org.il/v1/entities/').end(function(api_response){
			var api_results = api_response.body.results;
			for( var i = 0 ; i < api_result.length ; i ++){ // loop through all results
				setTimeout(get_entity = function () {			
					var api_result = api_results[i];

					var osm_query = {
						city : api_result.name ,
						country : 'Israel' ,
						format : json,
						addressdetails : 1 ,
						polygon_geojson : 1 ,
						limit : 3
					}

					var query_str = Object.keys(osm_query).map(function(key){ 
  						return encodeURIComponent(key) + '=' + encodeURIComponent(osm_query[key]); 
  					}).join('&');


					unirest.get('http://nominatim.openstreetmap.org/search?'+query_str).end(function(osm_response){
						for(var i = 0 ; i < osm_response.length ; i++){
							if(osm_response.osm_type != 'relation'){
								continue;
							}
							else if 
						}


						var doc = {
							
							omuni_id : api_result.id,
							muni_code : api_result.code
							date_obtained :
							date_updated :
							geojson :
							osm_id :
							place_id : 
							license :
						}
						collection.insert(doc);
					});
				});
			}
		});
	});
}




/**********************************************************
* Given the Collection and the Open Muni Database 
* Start intializing the collection
***********************************************************/

//TODO add each entity from the results of the api to the mongo database. 
intialize_data = function(err,api_results,collection,res){
	
	var api_results = api_results.body.results;

	for( var i = 0 ; i < api_result.length ; i ++){ // loop through all results
		setTimeout(get_entity() {
			
			var api_result = api_results[i];
		
			needle.get('nominatim.openstreetmap.org/search?' , call_osm (err , osm_results){

				// for each results find the best result. 

				var doc = buildMongoDocument(api_result,osm_result);

				collection.insert(doc);
			});
		}, 500);
	}
}

/**********************************************************
* Given the Collection and the Open Muni Database 
* Start updating the collection
***********************************************************/
update_data = function(callback,results){

	MongoClient.connect("mongodb://localhost:27017/entitydb"), get_collection(err, db){
		var collection = results.db.collection('entities');
		// find all the entites that need to updated
		var curser = collection.find({id : result.id , updade_date:$gte:{} }} ,{ id:1 , geojson:1 , entry_date:1 , update_date:1 })
		.sort(entry_date: 1).limit(1);
		
		curser.each(function(err,item){
			if(item != null){

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
	return doc;
}


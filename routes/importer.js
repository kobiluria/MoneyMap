var needle = require('needle');
var mongodb = require('mongodb');

/*********************************************************
* Intialize the Mongo server for the import
**********************************************************/
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('entitydb', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'entitydb' database");
        db.collection('entities', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'entities' collection doesn't exist");
            }
        });
    }
});


/**********************************************************
* A function for importing/updating all entities
* in the open muni database into the
* Polygon database.
* This function should be called every month give or take
***********************************************************/
//TODO add each entity from the results of the api to the mongo database. 

exports.importAll = function(req,res,error){
	needle.get('http://ext.openmuni.org.il/v1/entities/', function(error,response){
		
		if (error){ // Bad connection to the open muni API. 
			return error;
		}

		var results = response.body.results;
		for (var i = results.length - 1; i >= 0; i--) {
			mongoDoc = buildMongoDocument(results[i]);

			db.entities.insert(mongodoc);

			
			//TODO query open street map here!
			//TODO if the polygon data is the same this loop should continue

		};
	});
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
exports.buildMongoDocument = function(result){
	var doc = {
		
		code :
		date_obtained :
		osm_id :


	}
}


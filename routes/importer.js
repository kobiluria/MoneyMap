var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert'),
    unirest = require('unirest');


exports.welcome = function(req,res){
    res.json({message:'welcome to Money Map API'});
}

/*************************************************************************
 * Build a Query to search  document for the mongo db database.
 **************************************************************************/
build_query = function(api_result){

    var osm_query = {
        city : api_result.name ,
        country : 'Israel' ,
        format : 'json',
        addressdetails : 1 ,
        polygon_geojson : 1 ,
        limit : 3
    };

    var query_str = Object.keys(osm_query).map(function(key){
        return encodeURIComponent(key) + '=' + encodeURIComponent(osm_query[key]);
    }).join('&');
    return query_str;
}



function get_correct_osm(osm_results){
    for(var i = 0 ; i < osm_results.length; i++){
        if(osm_results[i].osm_type == 'relation'){
            return osm_results[i];
        }
        return null
    }
}

/*************************************************************************
 * Build a document for the mongo db database.
 **************************************************************************/
build_doc = function(api_result, osm_entity){
    var doc = {
        omuni_name : api_result.name,
        osm_name : : osm_entity.display_name,
        omuni_id : api_result.id,
        muni_code : api_result.code,
        date_obtained : new Date(),
        date_updated : new Date(),
        geojson : osm_entity.address.geojson,
        osm_id : osm_entity.osm_id,
        place_id : osm_entity.place_id,
        license : osm_entity.licence
    };

    return doc;
}

/************************************************************************
 * A function for importing all entities
 * in the open muni database into the
 * Polygon database.
 * This function should be called once in the intial build of the database
 *************************************************************************/

exports.initializeAll = function(err,req,res){

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});

    // Open the connection to the server
    mongoclient.open(function(err, mongoclient) {

        // Get the first db and do an update document on it
        var db = mongoclient.db("entitydb");

        var collection = db.collection('entities2');

        unirest.get('http://ext.openmuni.org.il/v1/entities/').end(proccess_api);

        function proccess_api(api_results){

            var api_results = api_results.body.results;

            var i = 0;

            function loop(){
                if(i >  api_results.length){ return;}

                var api_result = api_results[i];
                var query = build_query(api_result);
                console.log(query );
                unirest.get('http://nominatim.openstreetmap.org/search?'+query).end(get_osm_entity);

                function get_osm_entity(osm_response){
                    if(!osm_response){console.log('not found'); return;}
                    var osm_entity = get_correct_osm(osm_response.body);

                    if(!osm_entity){console.log('not found'); return;}
                    var doc = build_doc(api_result,osm_entity);

                    collection.insert(doc, function(err,result) { console.log(result)});
                }

                i++;

                setTimeout(function(){loop();},5000);
            }
            loop();
        }
    });

}


/**********************************************************
 * Given the Collection and the Open Muni Database
 * Start updating the collection
 ***********************************************************/
/*
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
 */

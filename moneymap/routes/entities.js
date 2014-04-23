var mongo = require('mongodb');

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
                console.log("The 'entities' collection doesn't exist. Creating it with sample data...");
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;	
    console.log('Retrieving entity: ' + id);
    db.collection('entities', function(err, collection) {
    	//TODO  need to redit this
    item = collection.findOne({'code':parseInt(id)}, function(err, item) {
        	if(!item){
        		console.log("none");
        	}
        	console.log(item);
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('entities', function(err, collection) {
        collection.find().limit(5).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addEntity = function(req, res) {
    var entity = req.body;
    console.log('Adding entity: ' + JSON.stringify(entity));
    db.collection('entities', function(err, collection) {
        collection.insert(entity, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateEntity = function(req, res) {
    var id = req.params.id;
    var entity = req.body;
    delete entity._id;
    console.log('Updating entity: ' + id);
    console.log(JSON.stringify(entity));
    db.collection('entities', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, entity, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating entites: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(entity);
            }
        });
    });
}

exports.deleteEntity = function(req, res) {
    var id = req.params.id;
    console.log('Deleting entity: ' + id);
    db.collection('entities', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

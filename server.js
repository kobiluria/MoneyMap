// server.js


//=================
// SETUP
//=================

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    entities = require('./routes/entities');

var app = express(); // configure the app using express!!
app.use(logger()); 
app.use(bodyParser());
var port = process.env.PORT || 3000;
var router = express.Router();

app.use('/api',router);

router.get('/', entities.welcome);
router.get('/entities' , entities.findAll);

router.get('/:type(kobi)/:id',function(req,res){
	console.log('id = ' + req.params.id);
	res.json({message:req.params.type});
});

app.listen(port);
console.log('API is listening on port :' + port);
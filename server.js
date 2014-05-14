/***************************************
* Setup of express:
* express will the main tool to serve res
* from the api requests. 
***************************************/
var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    //entities = require('./routes/entities'),
    importer = require('./routes/importer');

var app = express(); // configure the app using express!!
app.use(logger()); 
app.use(bodyParser());
var port = process.env.PORT || 3000;
var router = express.Router();

/**************************************
* Routing
**************************************/
app.use('/api',router);
router.get('/', importer.welcome);
//router.get('/entity' , entities.findAll);
router.get('/import',importer.initializeAll);
app.listen(port);
console.log('API is listening on port :' + port);
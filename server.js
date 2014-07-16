/***************************************
 * Setup of express:
 * express will the main tool to serve res
 * from the api requests.
 ***************************************/
var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    admin = require('./routes/admin'),
    insert = require('./routes/insert'),
    maps = require('./routes/maps'),
    gui_route = require('./routes/gui'),
basic_response = require('./routes/basic_response');

var app = express(); // configure the app using express!!
app.use(logger());
app.use(bodyParser());
var port = process.env.PORT || 3000;
var router = express.Router();
var gui = express.Router();
app.use(express.static(__dirname + '/public'));

/**************************************
 * Routing and Settings API
 **************************************/
app.use('/api', router);
app.use('/gui', gui);
router.get('/', basic_response.welcome);
router.get('/admin', admin.find);
router.get('/add', insert.insertById);
router.get('/maps/?', maps.map_by_code);
router.get('/maps/:id', maps.map_by_id);

/**************************************
 * Routing and Settings GUI
 **************************************/
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
gui.get('/?', gui_route.map_by_code);
gui.get('/:id', gui_route.map_by_id);

/***************************************
 * Start server
 * **************************************/
app.listen(port);
console.log('API is listening on port :' + port);

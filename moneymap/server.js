// server.js


//=================
// SETUP
//=================

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser');

var app = express(); // configure the app using express!!
app.use(logger()); 
app.use(bodyParser());
//app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 3000;
var router = express.Router();


router.get('/',function(req,res) {
	res.json({message:'Welcome to Money Map API'});
});

router.get('/:type(kobi)/:id',function(req,res){
	console.log('id = ' + req.params.id);
	res.json({message:req.params.type});
});

app.use('/api',router);

app.listen(port);
console.log('API is listening on port :' + port);
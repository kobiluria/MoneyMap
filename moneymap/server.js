var express = require('express'),
    path = require('path'),
    http = require('http'),
    entity = require('./routes/entities');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/entities', entity.findAll);
app.get('/entities/:id', entity.findById);
app.post('/entities', entity.addEntity);
app.put('/entities/:id', entity.updateEntity);
app.delete('/entities/:id', entity.deleteEntity);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
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
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    session = require('express-session'),
    oauth = require('./static/oauth'),
    cookieParser = require('cookie-parser'),
    basic_response = require('./routes/basic_response');

var app = express(); // configure the app using express!!
app.use(logger());
app.use(bodyParser());
app.use(cookieParser());
var port = process.env.PORT || 3000;
var router = express.Router();
var gui = express.Router();
app.use(express.static(__dirname + '/public'));

/**************************************
 * Passport session
 **************************************/
passport.use(

    new GitHubStrategy({
        clientID: oauth.GITHUB_CLIENT_ID,
        clientSecret: oauth.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://127.0.0.1:3000/api/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {
            return done(null, profile);
        });
    }
));

app.use(session({
        secret: 'ilovescotchscotchyscotchscotch',
        saveUninitialized: true,
        resave: true
    }
)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);  // invalidates the existing login session.
});


/**************************************
 * Routing and Settings API
 **************************************/
app.use('/api', router);
app.use('/gui', gui);
router.get('/', basic_response.welcome);
router.get('/admin', admin.find);
router.get('/add', ensureAuthenticated, insert.insertById);
router.get('/maps/?', maps.map_by_code);
router.get('/maps/:id', maps.map_by_id);

/**************************************
 * Routing and Settings GUI
 **************************************/
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
gui.get('/?', gui_route.map_by_code);
gui.get('/:id', gui_route.map_by_id);

/**************************************
 * Routing for Login
 **************************************/

router.get('/login',
    passport.authenticate('github'),
    function(req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/api/pleaseLogin' }),
    function(req, res) {
        console.log(req);
        res.redirect('/api/goodLogin');
    });
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/goodLogin', function(req, res) {
        res.json({success: 'successful login'});
    }
)
router.get('/pleaseLogin', function(req, res)
    {
        loginMessage = {
            error: 'please login',
            login: 'http://localhost:3000/api/login'
        };
        if(req.path.equals())

        res.json(loginMessage);
    }
)

/***************************************
 * Start server
 * **************************************/
app.listen(port);
console.log('API is listening on port :' + port);



function ensureAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {

        next();
    }
    else {


    res.redirect('/api/pleaseLogin');

    }
}
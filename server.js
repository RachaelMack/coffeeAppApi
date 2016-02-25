// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var session      = require('express-session');

var configDB = require('./config/database.js');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
// var multer       = require('multer');
// var upload 	     = multer({ storage: options });
// var fs = require('fs');
// var path = require('path');
// var options = multer.diskStorage({ destination : 'assets/uploads/' ,
//  filename: function (req, file, cb) {
//  	cb(null, (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now() + path.extname(file.originalname));
//    }
//  });


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
 

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/views', express.static(__dirname + '/views'));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
  express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path');

module.exports = function(db) {
	// Initialize express app
	var app = express();
	var OAuth2 = require('oauth').OAuth2;
	var https = require('https');
	
  app.get('/public/Indexpage.jpg', function(req, res) {
    var img = fs.readFileSync('./public/Indexpage.jpg');
    res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(img, 'binary');
  });
  app.get('/public/lib/hello/dist/hello.all.min.js', function(req, res) {
    var img = fs.readFileSync('./public/lib/hello/dist/hello.all.min.js');
    res.writeHead(200, {'Content-Type': 'text/javascript' });
    res.end(img, 'binary');
  });

  app.get('/places', function(req, res) {
    var uri = '/maps/api/place/textsearch/json?query=' + req.query.query;
    if (req.query.language !== undefined) {
      uri = uri + '&language=' + req.query.language;
    }
    uri = uri + '&key=AIzaSyBXXWUbms4wO48NHxmFUPmVE0AlrY0ztZ8';
    var options = {
      hostname: 'maps.googleapis.com',
      path: encodeURI(uri),
    };

    https.get(options, function(result) {
      var buffer = '';
      result.setEncoding('utf8');
      result.on('data', function (data) {
        buffer += data;
      });
      result.on('end', function() {
        var tweets = JSON.parse(buffer);
        res.send(tweets);
      });
    });
  });

/*
  app.get('/placeId', function(req, res) {
    var uri = '/maps/api/place/details/json?placeid=' + req.query.placeId;
    uri = uri + '&key=AIzaSyBXXWUbms4wO48NHxmFUPmVE0AlrY0ztZ8';
    var options = {
      hostname: 'maps.googleapis.com',
      path: encodeURI(uri),
    };

    console.log(uri);
    console.log('!!!!!!!!!!!!!!');
    https.get(options, function(result) {
      var buffer = '';
      result.setEncoding('utf8');
      result.on('data', function(data) {
        buffer += data;
      });
      result.on('end', function() {
        var tweets = JSON.parse(buffer);
        res.send(tweets); 
      });
    });
  });

*/
	app.get('/tweets', function(req, res) {

var oauth2 = new OAuth2('1yox7gsaUR0Sqv8q5yIUji85e', 'HMeKBpB5qRAfqcvkUoP4qXC6ICZMMkRJ1py24p3QZjeIFt1GNA', 'https://api.twitter.com/', null, 'oauth2/token', null);
oauth2.getOAuthAccessToken('', {
    'grant_type': 'client_credentials'
}, function (e, access_token) {
    console.log(access_token); //string that we can use to authenticate request
    
    var query = req.query;

    var options = {
        hostname: 'api.twitter.com',
        path: encodeURI('/1.1/search/tweets.json?q=' + query.q + '&geocode=' + query.geocode + 'km' + '&result_type=recent&count=100'),
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    };

    console.log('AUTHED');

    https.get(options, function (result) {
        var buffer = '';
        result.setEncoding('utf8');
        result.on('data', function (data) {
            buffer += data;
        });
        result.on('end', function () {
            var tweets = JSON.parse(buffer);
        res.send(tweets);
        });
    });
});
	});

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();
	app.locals.secure = config.secure;

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Setting the app router and static folder
	app.use(express.static(__dirname + '/public'));

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	if (app.locals.secure) {
		console.log('Securely using https protocol');
		var https = require('https'),
		privateKey  = fs.readFileSync('./config/sslcert/key.pem', 'utf8'),
		certificate = fs.readFileSync('./config/sslcert/cert.pem', 'utf8'),
		credentials = {key: privateKey, cert: certificate},
		httpsServer = https.createServer(credentials, app);
		return httpsServer;
	} else {
		console.log('Insecurely using http protocol');
		var httpServer = http.createServer(app);
		return httpServer;
	}
};

<<<<<<< HEAD
<<<<<<< HEAD
'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
  passport = require('passport'),
  OAuth2 = require('oauth').OAuth2,
	mongoose = require('mongoose'),
  https = require('https'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

var oauth2 = new OAuth2('c9XONlgyV6M2K2KJ8wkHk24UN', 'x0OUguws5mQ7siBTO5Z9YodTy9VqiaCv0XkvzX2t4GMahEW0Dw', 'https://api.twitter.com/', null, 'oauth2/token', null);
oauth2.getOAuthAccessToken('', {
    'grant_type': 'client_credentials'
}, function (e, access_token) {
    console.log(access_token); //string that we can use to authenticate request
 
    var options = {
        hostname: 'api.twitter.com',
        path: '/1.1/search/tweets.json?q=&geocode=-22.912214,-43.230182,1km',
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    };
 
 
    https.get(options, function (result) {
        var buffer = '';
        result.setEncoding('utf8');
        result.on('data', function (data) {
            buffer += data;
        });
        result.on('end', function () {
            var tweets = JSON.parse(buffer);
            console.log(tweets); // the tweets!
        });
    });
});

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);

/**
 * server.js
 */

/*
 |--------------------------------------------------------------------------
 | Modules
 |--------------------------------------------------------------------------
 */

var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var methodOverride = require('method-override');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');

// file upload
var uuid = require('node-uuid');
var multiparty = require('multiparty');
var fs = require('fs');

/*
 |--------------------------------------------------------------------------
 | Config
 |--------------------------------------------------------------------------
 */

var config = require('./app/config');

/*
 |--------------------------------------------------------------------------
 | MongoDB
 |--------------------------------------------------------------------------
 */

mongoose.connect(config.MONGO_URI);
var monDb = mongoose.connection;

monDb.on('error', function() {
	console.error('MongoDB Connection Error. Please make sure that', config.MONGO_URI, 'is running.');
});

monDb.once('open', function callback() {
	console.info('Connected to MongoDB:', config.MONGO_URI);
});

/*
 |--------------------------------------------------------------------------
 | Models
 |--------------------------------------------------------------------------
 */

var User = require('./app/models/User.js');

/*
 |--------------------------------------------------------------------------
 | Application
 |--------------------------------------------------------------------------
 */

var app = express();

app.set('port', process.env.PORT || 8080);

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(path.join(__dirname, './public')));

app.use(compression());

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */

exports.postImage = function(req, res) {
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		var file = files.file[0];
		var contentType = file.headers['content-type'];
		var tmpPath = file.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		// uuid is for generating unique file names
		var fileName = uuid.v4() + extension;
		var destPath = './public/uploads/images/' + fileName;

		// server side file type check
		if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
			fs.unlink(tmpPath);
			return res.status(400).send('Unsupported file type.');
		}

		fs.rename(tmpPath, destPath, function(err) {
			if (err) {
				return res.status(400).send('Image was not saved!');
			}
			return res.json(destPath);
		});
	})
};

/*
 |--------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------
 */

// API routes
require('./app/api.js')(app, config);

// Pass routing to Angular app
app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
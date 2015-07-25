var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var qs = require('querystring');
// file upload
var Imagemin = require('imagemin');
var uuid = require('uuid');
var multiparty = require('multiparty');
var fs = require('fs');
// models
var User = require('./models/User');
var Recipe = require('./models/Recipe');

module.exports = function(app, config) {

//-------------------------- USERS API

	var _defaultPicture = '/assets/images/img-user.png';

	/**
	 * Set default display name to last 5 characters of ID
	 *
	 * @param id {object|string} ID
	 * @returns {string}
	 * @private
	 */
	function _defaultDisplayName(id) {
		var idStr = id.toString();
		return 'user' + idStr.substr(idStr.length - 5);
	}

	/*
	 |--------------------------------------------------------------------------
	 | Login Required Middleware
	 |--------------------------------------------------------------------------
	 */

	/**
	 * Make sure user is authenticated
	 *
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */
	function ensureAuthenticated(req, res, next) {
		if (!req.headers.authorization) {
			return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
		}
		var token = req.headers.authorization.split(' ')[1];

		var payload = null;
		try {
			payload = jwt.decode(token, config.TOKEN_SECRET);
		}
		catch (err){
			return res.status(401).send({message: err.message});
		}

		if (payload.exp <= moment().unix()) {
			return res.status(401).send({ message: 'Token has expired' });
		}
		req.user = payload.sub;
		next();
	}

	/**
	 * Check if the user is authenticated or not
	 * If authenticated, pass on req.user
	 *
	 * @param req
	 * @param res
	 * @param next
	 */
	function checkAuthenticated(req, res, next) {
		var token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
		var payload = token ? jwt.decode(token, config.TOKEN_SECRET) : null;
		if (payload) { req.user = payload.sub; }
		next();
	}

	/**
	 * Make sure user is authenticated and is authorized as an administrator
	 *
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */
	function ensureAdmin(req, res, next) {
		if (!req.headers.authorization) {
			return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
		}
		var token = req.headers.authorization.split(' ')[1];

		var payload = null;
		try {
			payload = jwt.decode(token, config.TOKEN_SECRET);
		}
		catch (err){
			return res.status(401).send({message: err.message});
		}

		if (payload.exp <= moment().unix()) {
			return res.status(401).send({ message: 'Token has expired' });
		}
		req.user = payload.sub;
		req.isAdmin = payload.role;

		if (!req.isAdmin) {
			return res.status(401).send({ message: 'Not authorized' });
		}
		next();
	}

	/*
	 |--------------------------------------------------------------------------
	 | Generate JSON Web Token
	 |--------------------------------------------------------------------------
	 */

	/**
	 * Create JSON Web Token for authentication
	 *
	 * @param user
	 * @returns {*}
	 */
	function createJWT(user) {
		var payload = {
			sub: user._id,
			role: user.isAdmin,
			iat: moment().unix(),
			exp: moment().add(14, 'days').unix()
		};
		return jwt.encode(payload, config.TOKEN_SECRET);
	}

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/user/:id - get public view of user (id, picture, display name)
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/user/:id', function(req, res) {
		User.findById(req.params.id, function(err, user) {
			var userObj = {
				id: req.params.id,
				picture: user.picture || _defaultPicture,
				displayName: user.displayName || _defaultDisplayName(req.params.id)
			};
			res.send(userObj);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/me
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (!user.displayName) {
				user.displayName = _defaultDisplayName(req.user);
			}
			if (!user.picture) {
				user.picture = _defaultPicture;
			}
			res.send(user);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | PUT /api/me
	 |--------------------------------------------------------------------------
	 */
	app.put('/api/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (!user) {
				return res.status(400).send({ message: 'User not found' });
			}
			user.displayName = req.body.displayName || user.displayName || _defaultDisplayName(req.user);
			user.picture = user.picture || _defaultPicture;
			user.save(function(err) {
				res.status(200).end();
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/users (authorize as admin)
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/users', ensureAdmin, function(req, res) {
		User.find({}, function(err, users) {
			var userArr = [];
			users.forEach(function(user) {
				if (!user.displayName) {
					user.displayName = _defaultDisplayName(user._id);
				}
				if (!user.picture) {
					user.picture = _defaultPicture;
				}
				userArr.push(user);
			});
			res.send(userArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Google
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/google', function(req, res) {
		var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
		var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.GOOGLE_SECRET,
			redirect_uri: req.body.redirectUri,
			grant_type: 'authorization_code'
		};

		// Step 1. Exchange authorization code for access token.
		request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
			var accessToken = token.access_token;
			var headers = { Authorization: 'Bearer ' + accessToken };

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

				// Step 3a. Link user accounts.
				if (req.headers.authorization) {
					User.findOne({ google: profile.sub }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.google = profile.sub;
							user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200') || _defaultPicture;
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ google: profile.sub }, function(err, existingUser) {
						if (existingUser) {
							return res.send({ token: createJWT(existingUser) });
						}
						var user = new User();
						user.google = profile.sub;
						user.picture = profile.picture.replace('sz=50', 'sz=200');
						user.displayName = profile.name;

						// TODO: to create an admin user, allow one-time isAdmin = true in one of the account creations
						// user.isAdmin = true;

						user.save(function(err) {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with GitHub
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/github', function(req, res) {
		var accessTokenUrl = 'https://github.com/login/oauth/access_token';
		var userApiUrl = 'https://api.github.com/user';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.GITHUB_SECRET,
			redirect_uri: req.body.redirectUri
		};

		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
			accessToken = qs.parse(accessToken);
			var headers = { 'User-Agent': 'Satellizer' };

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

				// Step 3a. Link user accounts.
				if (req.headers.authorization) {
					User.findOne({ github: profile.id }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.github = profile.id;
							user.picture = user.picture || profile.avatar_url || _defaultPicture;
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ github: profile.id }, function(err, existingUser) {
						if (existingUser) {
							var token = createJWT(existingUser);
							return res.send({ token: token });
						}
						var user = new User();
						user.github = profile.id;
						user.picture = profile.avatar_url;
						user.displayName = profile.name;
						user.save(function() {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Facebook
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/facebook', function(req, res) {
		var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
		var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.FACEBOOK_SECRET,
			redirect_uri: req.body.redirectUri
		};

		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
			if (response.statusCode !== 200) {
				return res.status(500).send({ message: accessToken.error.message });
			}

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
				if (response.statusCode !== 200) {
					return res.status(500).send({ message: profile.error.message });
				}
				if (req.headers.authorization) {
					User.findOne({ facebook: profile.id }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.facebook = profile.id;
							user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ facebook: profile.id }, function(err, existingUser) {
						if (existingUser) {
							var token = createJWT(existingUser);
							return res.send({ token: token });
						}
						var user = new User();
						user.facebook = profile.id;
						user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=small';
						user.displayName = profile.name;
						user.save(function() {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Twitter
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/twitter', function(req, res) {
		var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
		var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
		var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

		// Part 1 of 2: Initial request from Satellizer.
		if (!req.body.oauth_token || !req.body.oauth_verifier) {
			var requestTokenOauth = {
				consumer_key: config.TWITTER_KEY,
				consumer_secret: config.TWITTER_SECRET,
				callback: config.TWITTER_CALLBACK
			};

			// Step 1. Obtain request token for the authorization popup.
			request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
				var oauthToken = qs.parse(body);

				// Step 2. Send OAuth token back to open the authorization screen.
				res.send(oauthToken);
			});
		} else {
			// Part 2 of 2: Second request after Authorize app is clicked.
			var accessTokenOauth = {
				consumer_key: config.TWITTER_KEY,
				consumer_secret: config.TWITTER_SECRET,
				token: req.body.oauth_token,
				verifier: req.body.oauth_verifier
			};

			// Step 3. Exchange oauth token and oauth verifier for access token.
			request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

				accessToken = qs.parse(accessToken);

				var profileOauth = {
					consumer_key: config.TWITTER_KEY,
					consumer_secret: config.TWITTER_SECRET,
					oauth_token: accessToken.oauth_token
				};

				// Step 4. Retrieve profile information about the current user.
				request.get({ url: profileUrl + accessToken.screen_name, oauth: profileOauth, json: true }, function(err, response, profile) {

					// Step 5a. Link user accounts.
					if (req.headers.authorization) {
						User.findOne({ twitter: profile.id }, function(err, existingUser) {
							if (existingUser) {
								return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
							}

							var token = req.headers.authorization.split(' ')[1];
							var payload = jwt.decode(token, config.TOKEN_SECRET);

							User.findById(payload.sub, function(err, user) {
								if (!user) {
									return res.status(400).send({ message: 'User not found' });
								}

								user.twitter = profile.id;
								user.displayName = user.displayName || profile.name;
								user.picture = user.picture || profile.profile_image_url.replace('_normal', '') || _defaultPicture;
								user.save(function(err) {
									res.send({ token: createJWT(user) });
								});
							});
						});
					} else {
						// Step 5b. Create a new user account or return an existing one.
						User.findOne({ twitter: profile.id }, function(err, existingUser) {
							if (existingUser) {
								return res.send({ token: createJWT(existingUser) });
							}

							var user = new User();
							user.twitter = profile.id;
							user.displayName = profile.name;
							user.picture = profile.profile_image_url.replace('_normal', '');
							user.save(function() {
								res.send({ token: createJWT(user) });
							});
						});
					}
				});
			});
		}
	});

	/*
	 |--------------------------------------------------------------------------
	 | Unlink Provider
	 |--------------------------------------------------------------------------
	 */
	app.get('/auth/unlink/:provider', ensureAuthenticated, function(req, res) {
		var provider = req.params.provider;
		User.findById(req.user, function(err, user) {
			if (!user) {
				return res.status(400).send({ message: 'User not found' });
			}
			user[provider] = undefined;
			user.save(function() {
				res.status(200).end();
			});
		});
	});



//-------------------------- RECIPES API

	var _imgPath = './public/uploads/images/';

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/recipes - get all public recipes
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/recipes', function(req, res) {
		Recipe.find({isPublic: true}, function(err, recipes) {
			if (!recipes) {
				return res.status(400).send({ message: 'No recipes found.' });
			}

			var recipeArr = [];

			recipes.forEach(function(recipe) {
				recipeArr.push(recipe);
			});

			res.send(recipeArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/recipes/me - get my recipes
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/recipes/me', ensureAuthenticated, function(req, res) {
		Recipe.find({userId: req.user}, function(err, recipes) {
			if (!recipes) {
				return res.status(400).send({message: 'No recipes found.'});
			}
			var recipeArr = [];
			recipes.forEach(function(recipe) {
				recipeArr.push(recipe);
			});
			res.send(recipeArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | POST /api/recipes/me/filed - get my saved recipes
	 |--------------------------------------------------------------------------
	 */
	app.post('/api/recipes/me/filed', ensureAuthenticated, function(req, res) {
		Recipe.find({ isPublic: true}, function(err, recipes) {
			if (!recipes) {
				return res.status(400).send({message: 'No recipes found.'});
			}
			if (!req.body.savedRecipes) {
				return res.status(200).send({message: 'You do not have any recipes filed.'});
			}
			var recipeArr = [];
			recipes.forEach(function(recipe) {
				var rId = recipe._id.toString();
				if (req.body.savedRecipes.indexOf(rId) > -1) {
					recipeArr.push(recipe);
				}
			});
			res.send(recipeArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/recipes/author/:userId - get list of a user's public recipes
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/recipes/author/:userId', function(req, res) {
		Recipe.find({userId: req.params.userId, isPublic: true}, function(err, recipes) {
			if (!recipes) {
				return res.status(400).send({message: 'No public recipes found by this author.'});
			}
			var recipeArr = [];
			recipes.forEach(function(recipe) {
				recipeArr.push(recipe);
			});
			res.send(recipeArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/recipe/:slug - get recipe detail
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/recipe/:slug', checkAuthenticated, function(req, res) {
		Recipe.findOne({slug: req.params.slug}, function(err, recipe) {
			if (!recipe) {
				return res.status(400).send({ message: 'Recipe not found.' });
			}
			if (recipe.isPublic || req.user && recipe.userId === req.user) {
				res.send(recipe);
			} else {
				return res.status(401).send({ message: 'You are not authorized to view this recipe.' });
			}
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | POST /api/recipe - create a recipe
	 |--------------------------------------------------------------------------
	 */
	app.post('/api/recipe/new', ensureAuthenticated, function(req, res) {
		Recipe.findOne({slug: req.body.slug}, function(err, existingRecipe) {
			if (existingRecipe) {
				return res.status(409).send({message: 'You already have a recipe with that name.'});
			}
			var recipe = new Recipe({
				userId: req.user || req.body.userId,
				name: req.body.name,
				slug: req.body.slug,
				photo: req.body.photo,
				description: req.body.description,
				isPublic: req.body.isPublic,
				dietary: req.body.dietary,
				category: req.body.category,
				tags: req.body.tags,
				ingredients: req.body.ingredients,
				directions: req.body.directions,
				servings: req.body.servings,
				prepTime: req.body.prepTime,
				cookTime: req.body.cookTime
			});
			recipe.save(function() {
				res.send(recipe);
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | PUT /api/recipe/:id - update a recipe
	 |--------------------------------------------------------------------------
	 */
	app.put('/api/recipe/:id', ensureAuthenticated, function(req, res) {
		Recipe.findById(req.params.id, function(err, recipe) {
			if (!recipe) {
				return res.status(400).send({ message: 'Recipe not found.' });
			}
			if (recipe.userId !== req.user) {
				return res.status(401).send({ message: 'You cannot edit someone else\'s recipe.' });
			}

			// if photo is being removed or changed, remove old photo from the file system
			if (recipe.photo && (recipe.photo !== req.body.photo)) {
				fs.unlink(_imgPath + recipe.photo);
			}

			recipe.name = req.body.name || recipe.name;
			recipe.slug = req.body.slug || recipe.slug;
			recipe.photo = req.body.photo;
			recipe.description = req.body.description || recipe.description;
			recipe.isPublic = req.body.isPublic;
			recipe.dietary = req.body.dietary;
			recipe.category = req.body.category || recipe.category;
			recipe.tags = req.body.tags || recipe.tags;
			recipe.ingredients = req.body.ingredients || recipe.ingredients;
			recipe.directions = req.body.directions || recipe.directions;
			recipe.servings = req.body.servings;
			recipe.prepTime = req.body.prepTime;
			recipe.cookTime = req.body.cookTime;

			recipe.save(function(err) {
				res.status(200).end();
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | DELETE /api/recipe/:id - delete recipe
	 |--------------------------------------------------------------------------
	 */
	app.delete('/api/recipe/:id', ensureAuthenticated, function(req, res) {
		Recipe.findById(req.params.id, function(err, recipe) {
			if (!recipe) {
				return res.status(400).send({ message: 'Recipe not found.' });
			}
			if (recipe.userId !== req.user) {
				return res.status(401).send({ message: 'You cannot delete someone else\'s recipe.' });
			}
			if (recipe.photo) {
				fs.unlink(_imgPath + recipe.photo);
			}
			recipe.remove(function(err) {
				res.status(200).end();
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | PUT /api/recipe/:recipeId/file - save/remove a recipe ID in user data
	 |--------------------------------------------------------------------------
	 */
	app.put('/api/recipe/:recipeId/file', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (!user) {
				return res.status(400).send({ message: 'User not found' });
			}
			var rIndex = user.savedRecipes.indexOf(req.params.recipeId);
			var successMsg;
			var added;

			if (rIndex > -1) {
				// recipe exists - delete it
				user.savedRecipes.splice(rIndex, 1);
				successMsg = 'Recipe removed!';
				added = false;
			} else {
				// recipe does not exist - add it
				user.savedRecipes.push(req.params.recipeId);
				successMsg = 'Recipe saved!';
				added = true;
			}
			user.save(function(err) {
				res.status(200).send({ message: successMsg, added: added }).end();
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | POST /api/recipe/upload - save an image
	 |--------------------------------------------------------------------------
	 */

	app.post('/api/recipe/upload', ensureAuthenticated, function(req, res) {
		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files) {
			var file = files.file[0];
			var contentType = file.headers['content-type'];
			var tmpPath = file.path;
			var extIndex = tmpPath.lastIndexOf('.');
			var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);

			// uuid is for generating unique file names
			var fileName = uuid.v4() + extension;
			var destPath = _imgPath + fileName;

			// server side file type check
			if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
				fs.unlink(tmpPath);
				return res.status(400).send('Unsupported file type.');
			}

			// server side file size check
			if (file.size > 300000) {
				fs.unlink(tmpPath);
				return res.status(400).send('File is too large.');
			}

			// rename the file to ensure a unique ID
			fs.rename(tmpPath, destPath, function(err) {
				if (err) {
					return res.status(400).send('File rename failed:', err);
				}

				new Imagemin()
					.src(destPath)
					.dest(_imgPath)
					.use(Imagemin.jpegtran({progressive: true}))
					.use(Imagemin.optipng({optimizationLevel: 3}))
					.run(function(err, cImg) {
						if (err) {
							return res.status(400).send('Image could not be compressed:', err);
						}

						var img = {
							filename: fileName,
							headers: file.headers,
							size: file.size
						};

						return res.json(img);
					});
			});
		});
	});
};
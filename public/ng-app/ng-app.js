angular
	.module('rBox', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'resize', 'satellizer', 'slugifier', 'ngFileUpload']);
// login account constants
(function() {
	'use strict';

	var OAUTH = {
		LOGINS: [
			{
				account: 'google',
				name: 'Google',
				url: 'http://accounts.google.com'
			}, {
				account: 'twitter',
				name: 'Twitter',
				url: 'http://twitter.com'
			}, {
				account: 'facebook',
				name: 'Facebook',
				url: 'http://facebook.com'
			}, {
				account: 'github',
				name: 'GitHub',
				url: 'http://github.com'
			}
		]
	};

	angular
		.module('rBox')
		.constant('OAUTH', OAUTH);
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', 'MQ', 'mediaCheck', '$log'];

	function PageCtrl(Page, $scope, MQ, mediaCheck, $log) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var _mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			},
			debounce: 200
		});

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// associate page <title>
			page.pageTitle = Page;

			$scope.$on('$routeChangeStart', _routeChangeStart);
			$scope.$on('$routeChangeSuccess', _routeChangeSuccess);
			$scope.$on('$routeChangeError', _routeChangeError);
		}

		/**
		 * Enter mobile media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @private
		 */
		function _enterMobile() {
			$scope.$broadcast('enter-mobile');
		}

		/**
		 * Exit mobile media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @private
		 */
		function _exitMobile() {
			$scope.$broadcast('exit-mobile');
		}

		/**
		 * Turn on loading state
		 *
		 * @private
		 */
		function _loadingOn() {
			$scope.$broadcast('loading-on');
		}

		/**
		 * Turn off loading state
		 *
		 * @private
		 */
		function _loadingOff() {
			$scope.$broadcast('loading-off');
		}

		/**
		 * Route change start handler
		 * If next route has resolve, turn on loading
		 *
		 * @param $event {object}
		 * @param next {object}
		 * @param current {object}
		 * @private
		 */
		function _routeChangeStart($event, next, current) {
			if (next.$$route && next.$$route.resolve) { // eslint-disable-line angular/no-private-call
				_loadingOn();
			}
		}

		/**
		 * Route change success handler
		 * Match current media query and run appropriate function
		 * If current route has been resolved, turn off loading
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @private
		 */
		function _routeChangeSuccess($event, current, previous) {
			_mc.matchCurrent(MQ.SMALL);

			if (current.$$route && current.$$route.resolve) {   // eslint-disable-line angular/no-private-call
				_loadingOff();
			}
		}

		/**
		 * Route change error handler
		 * Handle route resolve failures
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @param rejection {object}
		 * @private
		 */
		function _routeChangeError($event, current, previous, rejection) {
			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			if (_handlingRouteChangeError) {
				return;
			}

			_handlingRouteChangeError = true;
			_loadingOff();

			$log.error(msg);
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Page', Page);

	function Page() {
		// private vars
		var siteTitle = 'rBox';
		var pageTitle = 'All Recipes';

		// callable members
		return {
			getTitle: getTitle,
			setTitle: setTitle
		};

		/**
		 * Title function
		 * Sets site title and page title
		 *
		 * @returns {string} site title + page title
		 */
		function getTitle() {
			return siteTitle + ' | ' + pageTitle;
		}

		/**
		 * Set page title
		 *
		 * @param newTitle {string}
		 */
		function setTitle(newTitle) {
			pageTitle = newTitle;
		}
	}
}());
// User functions
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('User', User);

	User.$inject = ['OAUTH'];

	function User(OAUTH) {
		// callable members
		return {
			getLinkedAccounts: getLinkedAccounts
		};

		/**
		 * Create array of a user's currently-linked account logins
		 *
		 * @param userObj
		 * @returns {Array}
		 */
		function getLinkedAccounts(userObj) {
			var linkedAccounts = [];

			angular.forEach(OAUTH.LOGINS, function(actObj) {
				var act = actObj.account;

				if (userObj[act]) {
					linkedAccounts.push(act);
				}
			});

			return linkedAccounts;
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Utils', Utils);

	Utils.$inject = ['$auth'];

	function Utils($auth) {
		// callable members
		return {
			isAuthenticated: isAuthenticated
		};

		/**
		 * Determines if user is authenticated
		 *
		 * @returns {Boolean}
		 */
		function isAuthenticated() {
			return $auth.isAuthenticated();
		}
	}
}());
// login/Oauth constants
(function() {
	'use strict';

	var OAUTHCLIENTS = {
		LOGINURL: 'http://localhost:8080/auth/login',
		CLIENT: {
			FB: '[your Facebook client ID]',
			GOOGLE: '[your Google client ID]',
			TWITTER: '/auth/twitter',
			GITHUB: '[your GitHub client ID]'
		}
	};

	angular
		.module('rBox')
		.constant('OAUTHCLIENTS', OAUTHCLIENTS);
}());
// login/Oauth constants
(function() {
	'use strict';

	var OAUTHCLIENTS = {
		LOGINURL: 'http://rbox.kmaida.io/auth/login',
		CLIENT: {
			FB: '360173197505650',
			GOOGLE: '362136322942-k45h52q3uq56dc1gas1f52c0ulhg5190.apps.googleusercontent.com',
			TWITTER: '/auth/twitter',
			GITHUB: '9ff097299c86e524b10f'
		}
	};

	angular
		.module('rBox')
		.constant('OAUTHCLIENTS', OAUTHCLIENTS);
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.config(authConfig)
		.run(authRun);

	authConfig.$inject = ['$authProvider', 'OAUTHCLIENTS'];

	function authConfig($authProvider, OAUTHCLIENTS) {
		$authProvider.loginUrl = OAUTHCLIENTS.LOGINURL;

		$authProvider.facebook({
			clientId: OAUTHCLIENTS.CLIENT.FB
		});

		$authProvider.google({
			clientId: OAUTHCLIENTS.CLIENT.GOOGLE
		});

		$authProvider.twitter({
			url: OAUTHCLIENTS.CLIENT.TWITTER
		});

		$authProvider.github({
			clientId: OAUTHCLIENTS.CLIENT.GITHUB
		});
	}

	authRun.$inject = ['$rootScope', '$location', '$auth'];

	function authRun($rootScope, $location, $auth) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {    // eslint-disable-line angular/on-watch
			if (next && next.$$route && next.$$route.secure && !$auth.isAuthenticated()) {  // eslint-disable-line angular/no-private-call
				$rootScope.authPath = $location.path();

				$rootScope.$evalAsync(function() {
					// send user to login
					$location.path('/login');
				});
			}
		});
	}

}());
// routes
(function() {
	'use strict';

	angular
		.module('rBox')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'ng-app/pages/home/Home.view.html',
				reloadOnSearch: false,
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/login', {
				templateUrl: 'ng-app/pages/login/Login.view.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.when('/recipe/:slug', {
				templateUrl: 'ng-app/pages/recipe/Recipe.view.html',
				controller: 'RecipeCtrl',
				controllerAs: 'recipe'
			})
			.when('/recipes/author/:userId', {
				templateUrl: 'ng-app/pages/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesAuthorCtrl',
				controllerAs: 'ra'
			})
			.when('/recipes/tag/:tag', {
				templateUrl: 'ng-app/pages/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesTagCtrl',
				controllerAs: 'ra'
			})
			.when('/recipes/category/:category', {
				templateUrl: 'ng-app/pages/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesCategoryCtrl',
				controllerAs: 'ra'
			})
			.when('/my-recipes', {
				templateUrl: 'ng-app/pages/my-recipes/MyRecipes.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'MyRecipesCtrl',
				controllerAs: 'myRecipes'
			})
			.when('/recipe/:slug/edit', {
				templateUrl: 'ng-app/pages/recipe/EditRecipe.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'EditRecipeCtrl',
				controllerAs: 'edit'
			})
			.when('/account', {
				templateUrl: 'ng-app/pages/account/Account.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'AccountCtrl',
				controllerAs: 'account'
			})
			.when('/admin', {
				templateUrl: 'ng-app/pages/admin/Admin.view.html',
				secure: true,
				controller: 'AdminCtrl',
				controllerAs: 'admin'
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Res', Res);

	function Res() {
		// callable members
		return {
			success: success,
			error: error
		};

		/**
		 * Promise response function
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 * Useful for APIs (ie, with nginx) where server error HTML page may be returned in error
		 *
		 * @param response {*} data from $http
		 * @returns {*} object, array
		 */
		function success(response) {
			if (angular.isObject(response.data)) {
				return response.data;
			} else {
				throw new Error('retrieved data is not typeof object.');
			}
		}

		/**
		 * Promise response function - error
		 * Throws an error with error data
		 *
		 * @param error {object}
		 */
		function error(error) {
			throw new Error('Error retrieving data', error);
		}
	}
}());
// Recipe API $http calls
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('recipeData', recipeData);

	recipeData.$inject = ['$http', 'Res'];

	function recipeData($http, Res) {
		// callable members
		return {
			getRecipe: getRecipe,
			createRecipe: createRecipe,
			updateRecipe: updateRecipe,
			deleteRecipe: deleteRecipe,
			getPublicRecipes: getPublicRecipes,
			getMyRecipes: getMyRecipes,
			getAuthorRecipes: getAuthorRecipes,
			fileRecipe: fileRecipe,
			getFiledRecipes: getFiledRecipes,
			cleanUploads: cleanUploads
		};

		/**
		 * Get recipe (GET)
		 *
		 * @param slug {string} recipe slug
		 * @returns {promise}
		 */
		function getRecipe(slug) {
			return $http
				.get('/api/recipe/' + slug)
				.then(Res.success, Res.error);
		}

		/**
		 * Create a recipe (POST)
		 *
		 * @param recipeData {object}
		 * @returns {promise}
		 */
		function createRecipe(recipeData) {
			return $http
				.post('/api/recipe/new', recipeData)
				.then(Res.success, Res.error);
		}

		/**
		 * Update a recipe (PUT)
		 *
		 * @param id {string} recipe ID (in case slug has changed)
		 * @param recipeData {object}
		 * @returns {promise}
		 */
		function updateRecipe(id, recipeData) {
			return $http
				.put('/api/recipe/' + id, recipeData);
		}

		/**
		 * Delete a recipe (DELETE)
		 *
		 * @param id {string} recipe ID
		 * @returns {promise}
		 */
		function deleteRecipe(id) {
			return $http
				.delete('/api/recipe/' + id);
		}

		/**
		 * Get all public recipes (GET)
		 *
		 * @returns {promise}
		 */
		function getPublicRecipes() {
			return $http
				.get('/api/recipes')
				.then(Res.success, Res.error);
		}

		/**
		 * Get my recipes (GET)
		 *
		 * @returns {promise}
		 */
		function getMyRecipes() {
			return $http
				.get('/api/recipes/me')
				.then(Res.success, Res.error);
		}

		/**
		 * Get a specific user's public recipes (GET)
		 *
		 * @param userId {string} user ID
		 * @returns {promise}
		 */
		function getAuthorRecipes(userId) {
			return $http
				.get('/api/recipes/author/' + userId)
				.then(Res.success, Res.error);
		}

		/**
		 * File/unfile this recipe in user data (PUT)
		 *
		 * @param recipeId {string} ID of recipe to save
		 * @returns {promise}
		 */
		function fileRecipe(recipeId) {
			return $http
				.put('/api/recipe/' + recipeId + '/file')
				.then(Res.success, Res.error);
		}

		/**
		 * Get my filed recipes (POST)
		 *
		 * @param recipeIds {Array} array of user's filed recipe IDs
		 * @returns {promise}
		 */
		function getFiledRecipes(recipeIds) {
			return $http
				.post('/api/recipes/me/filed', recipeIds)
				.then(Res.success, Res.error);
		}

		/**
		 * Clean upload files (POST)
		 *
		 * @param files
		 * @returns {*}
		 */
		function cleanUploads(files) {
			return $http
				.post('/api/recipe/clean-uploads', files);
		}
	}
}());
// User API $http calls
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('userData', userData);

	userData.$inject = ['$http', 'Res'];

	function userData($http, Res) {
		// callable members
		return {
			getAuthor: getAuthor,
			getUser: getUser,
			updateUser: updateUser,
			getAllUsers: getAllUsers
		};

		/**
		 * Get recipe author's basic data (GET)
		 *
		 * @param id {string} MongoDB ID of user
		 * @returns {promise}
		 */
		function getAuthor(id) {
			return $http
				.get('/api/user/' + id)
				.then(Res.success, Res.error);
		}

		/**
		 * Get current user's data (GET)
		 *
		 * @returns {promise}
		 */
		function getUser() {
			return $http
				.get('/api/me')
				.then(Res.success, Res.error);
		}

		/**
		 * Update current user's profile data (PUT)
		 *
		 * @param profileData {object}
		 * @returns {promise}
		 */
		function updateUser(profileData) {
			return $http
				.put('/api/me', profileData);
		}

		/**
		 * Get all users (admin authorized only) (GET)
		 *
		 * @returns {promise}
		 */
		function getAllUsers() {
			return $http
				.get('/api/users')
				.then(Res.success, Res.error);
		}
	}
}());
(function() {
	'use strict';

	var dietary = [
		'Gluten-free',
		'Vegan',
		'Vegetarian'
	];

	var insertChar = [
		'⅛',
		'¼',
		'⅓',
		'½',
		'⅔',
		'¾'
	];

	var categories = [
		'Appetizer',
		'Beverage',
		'Dessert',
		'Entree',
		'Salad',
		'Side',
		'Soup'
	];

	var tags = [
		'alcohol',
		'baked',
		'beef',
		'fast',
		'fish',
		'low-calorie',
		'one-pot',
		'pasta',
		'pork',
		'poultry',
		'slow-cook',
		'stock',
		'vegetable'
	];

	angular
		.module('rBox')
		.factory('Recipe', Recipe);

	function Recipe() {
		// callable members
		return {
			dietary: dietary,
			insertChar: insertChar,
			categories: categories,
			tags: tags
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['$timeout'];

	function recipeForm($timeout) {
		// return directive
		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/core/recipes/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true,
			link: recipeFormLink
		};

		/**
		 * recipeForm LINK function
		 *
		 * @param $scope
		 */
		function recipeFormLink($scope) {
			// set up $scope object for namespacing
			$scope.rfl = {};

			/**
			 * Add new item
			 * Ingredient or Direction step
			 * Focus the newest input field
			 *
			 * @param $event {object} click event
			 * @param model {object} rf.recipeData model
			 * @param type {string} ing -or- step
			 * @param isHeading {boolean}
			 */
			$scope.rfl.addItem = function($event, model, type, isHeading) {
				var _newItem = {
					id: $scope.generateId(),
					type: type
				};

				if (isHeading) {
					_newItem.isHeading = true;
				}

				model.push(_newItem);

				$timeout(function() {
					var _newestInput = angular.element($event.target).parent('p').prev('.last').find('input').eq(0);
					_newestInput.click();
					_newestInput.focus();   // TODO: focus isn't highlighting properly
				});
			};

			/**
			 * Remove item
			 * Ingredient or Direction step
			 *
			 * @param model {object} rf.recipeData model
			 * @param i {index}
			 */
			$scope.rfl.removeItem = function(model, i) {
				model.splice(i, 1);
			};

			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);

			/**
			 * Enter mobile - unset large view
			 *
			 * @private
			 */
			function _enterMobile() {
				$scope.rfl.isLargeView = false;
			}

			/**
			 * Exit mobile - set large view
			 *
			 * @private
			 */
			function _exitMobile() {
				$scope.rfl.isLargeView = true;
			}

			/**
			 * Move item up or down
			 *
			 * @param $event
			 * @param model {object} rf.recipeData model
			 * @param oldIndex {index} current index
			 * @param newIndex {number} new index
			 */
			$scope.rfl.moveItem = function($event, model, oldIndex, newIndex) {
				var _item = angular.element($event.target).closest('li');

				model.move(oldIndex, newIndex);

				_item.addClass('moved');

				$timeout(function() {
					_item.removeClass('moved');
				}, 700);
			};

			$scope.rfl.moveIngredients = false;
			$scope.rfl.moveDirections = false;
		}
	}

	recipeFormCtrl.$inject = ['$scope', 'recipeData', 'Recipe', 'Slug', '$location', '$timeout', 'Upload'];

	/**
	 * recipeForm CONTROLLER function
	 *
	 * @param $scope
	 * @param recipeData
	 * @param Recipe
	 * @param Slug
	 * @param $location
	 * @param $timeout
	 * @param Upload
	 */
	function recipeFormCtrl($scope, recipeData, Recipe, Slug, $location, $timeout, Upload) {
		var rf = this;
		var _isEdit = !!rf.recipe;
		var _originalSlug = _isEdit ? rf.recipe.slug : null;

		// setup special characters private vars
		var _lastInput;
		var _ingIndex;
		var _caretPos;

		rf.recipeData = _isEdit ? rf.recipe : {};
		rf.recipeData.userId = _isEdit ? rf.recipe.userId : rf.userId;
		rf.recipeData.photo = _isEdit ? rf.recipe.photo : null;

		/**
		 * Generates a unique 5-character ID;
		 * On $scope to share between controller and link
		 *
		 * @returns {string}
		 */
		$scope.generateId = function() {
			var _id = '';
			var _charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var i;

			for (i = 0; i < 5; i++) {
				_id += _charset.charAt(Math.floor(Math.random() * _charset.length));
			}

			return _id;
		};

		// is this a touch device?
		rf.isTouchDevice = !!Modernizr.touchevents;

		// build lists
		rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients : [{id: $scope.generateId(), type: 'ing'}];
		rf.recipeData.directions = _isEdit ? rf.recipe.directions : [{id: $scope.generateId(), type: 'step'}];

		rf.recipeData.tags = _isEdit ? rf.recipeData.tags : [];

		// manage time fields
		rf.timeRegex = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
		rf.timeError = 'Please enter a number in minutes. Multiply hours by 60.';

		// fetch categories options list
		rf.categories = Recipe.categories;

		// fetch tags options list
		rf.tags = Recipe.tags;

		// fetch dietary options list
		rf.dietary = Recipe.dietary;

		// fetch special characters
		rf.chars = Recipe.insertChar;

		/**
		 * Set selection range
		 *
		 * @param input
		 * @param selectionStart {number}
		 * @param selectionEnd {number}
		 * @private
		 */
		function _setSelectionRange(input, selectionStart, selectionEnd) {
			var range = input.createTextRange();

			if (input.setSelectionRange) {
				input.click();
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			}
			else if (input.createTextRange) {
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		}

		/**
		 * Set caret position
		 *
		 * @param input
		 * @param pos {number} intended caret position
		 * @private
		 */
		function _setCaretToPos(input, pos) {
			_setSelectionRange(input, pos, pos);
		}

		/**
		 * Keep track of caret position in ingredient amount text field
		 *
		 * @param $event {object}
		 * @param index {number}
		 */
		rf.insertCharInput = function($event, index) {
			$timeout(function() {
				_ingIndex = index;
				_lastInput = angular.element('#' + $event.target.id);
				_caretPos = _lastInput[0].selectionStart;
			});
		};

		/**
		 * Insert character at last caret position
		 * In supported field
		 *
		 * @param char {string} special character
		 */
		rf.insertChar = function(char) {
			var _textVal;

			if (_lastInput) {
				_textVal = angular.isUndefined(rf.recipeData.ingredients[_ingIndex].amt) ? '' : rf.recipeData.ingredients[_ingIndex].amt;

				rf.recipeData.ingredients[_ingIndex].amt = _textVal.substring(0, _caretPos) + char + _textVal.substring(_caretPos);

				$timeout(function() {
					_caretPos = _caretPos + 1;
					_setCaretToPos(_lastInput[0], _caretPos);
				});
			}
		};

		/**
		 * Clear caret position and last input
		 * So that special characters don't end up in undesired fields
		 */
		rf.clearChar = function() {
			_ingIndex = null;
			_lastInput = null;
			_caretPos = null;
		};

		rf.uploadedFile = null;

		/**
		 * Upload image file
		 *
		 * @param files {Array} array of files to upload
		 */
		rf.updateFile = function(files) {
			if (files && files.length) {
				if (files[0].size > 300000) {
					rf.uploadError = 'Filesize over 500kb - photo was not uploaded.';
					rf.removePhoto();
				} else {
					rf.uploadError = false;
					rf.uploadedFile = files[0];    // only single upload allowed
				}
			}
		};

		/**
		 * Remove uploaded photo from front-end
		 */
		rf.removePhoto = function() {
			rf.recipeData.photo = null;
			rf.uploadedFile = null;
			angular.element('#recipePhoto').val('');
		};

		// create map of touched tags
		rf.tagMap = {};
		if (_isEdit && rf.recipeData.tags.length) {
			angular.forEach(rf.recipeData.tags, function(tag, i) {
				rf.tagMap[tag] = true;
			});
		}

		/**
		 * Add / remove tag
		 *
		 * @param tag {string} tag name
		 */
		rf.addRemoveTag = function(tag) {
			var _activeTagIndex = rf.recipeData.tags.indexOf(tag);

			if (_activeTagIndex > -1) {
				// tag exists in model, turn it off
				rf.recipeData.tags.splice(_activeTagIndex, 1);
				rf.tagMap[tag] = false;
			} else {
				// tag does not exist in model, turn it on
				rf.recipeData.tags.push(tag);
				rf.tagMap[tag] = true;
			}
		};

		/**
		 * Clean empty items out of array before saving
		 * Ingredients or Directions
		 * Also clears out empty headings
		 *
		 * @param modelName {string} ingredients / directions
		 * @private
		 */
		function _cleanEmpties(modelName) {
			var _array = rf.recipeData[modelName];
			var _check = modelName === 'ingredients' ? 'ingredient' : 'step';

			angular.forEach(_array, function(obj, i) {
				if (!!obj[_check] === false && !obj.isHeading || obj.isHeading && !!obj.headingText === false) {
					_array.splice(i, 1);
				}
			});
		}

		/**
		 * Reset save button
		 *
		 * @private
		 */
		function _resetSaveBtn() {
			rf.saved = false;
			rf.uploadError = false;
			rf.saveBtnText = _isEdit ? 'Update Recipe' : 'Save Recipe';
		}

		_resetSaveBtn();

		/**
		 * Recipe created or saved successfully
		 *
		 * @param recipe {promise} if editing event
		 * @private
		 */
		function _recipeSaved(recipe) {
			rf.saved = true;
			rf.saveBtnText = _isEdit ? 'Updated!' : 'Saved!';

			/**
			 * Go to new slug (if new) or updated slug (if slug changed)
			 *
			 * @private
			 */
			function _goToNewSlug() {
				var _path = !_isEdit ? recipe.slug : rf.recipeData.slug + '/edit';

				$location.path('/recipe/' + _path);
			}

			if (!_isEdit || _isEdit && _originalSlug !== rf.recipeData.slug) {
				$timeout(_goToNewSlug, 1000);
			} else {
				$timeout(_resetSaveBtn, 2000);
			}
		}

		/**
		 * Recipe not saved / created due to error
		 *
		 * @param err {promise}
		 * @private
		 */
		function _recipeSaveError(err) {
			rf.saveBtnText = 'Error saving!';
			rf.saved = 'error';
			$timeout(_resetSaveBtn, 4000);
		}

		/**
		 * Save recipe data
		 *
		 * @private
		 */
		function _saveRecipe() {
			if (!_isEdit) {
				recipeData.createRecipe(rf.recipeData)
				.then(_recipeSaved, _recipeSaveError);
			} else {
				recipeData.updateRecipe(rf.recipe._id, rf.recipeData)
				.then(_recipeSaved, _recipeSaveError);
			}
		}

		/**
		 * Save recipe
		 * Click on submit
		 */
		rf.saveRecipe = function() {
			rf.uploadError = false;
			rf.saveBtnText = _isEdit ? 'Updating...' : 'Saving...';

			// prep data for saving
			rf.recipeData.slug = Slug.slugify(rf.recipeData.name);
			_cleanEmpties('ingredients');
			_cleanEmpties('directions');

			// save uploaded file, if there is one
			// once successfully uploaded image, save recipe with reference to saved image
			if (rf.uploadedFile) {
				Upload
					.upload({
						url: '/api/recipe/upload',
						file: rf.uploadedFile
					})
					.progress(function(evt) {
						var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
						rf.uploadError = false;
						rf.uploadInProgress = true;
						rf.uploadProgress = progressPercentage + '% ' + evt.config.file.name;

						console.log(rf.uploadProgress);
					})
					.success(function(data, status, headers, config) {
						$timeout(function() {
							rf.uploadInProgress = false;
							rf.recipeData.photo = data.filename;

							_saveRecipe();
						});
					})
					.error(function(err) {
						rf.uploadInProgress = false;
						rf.uploadError = err.message || err;

						console.log('Error uploading file:', err.message || err);

						_recipeSaveError();
					});

			} else {
				// no uploaded file, save recipe
				_saveRecipe();
			}

		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipesList', recipesList);

	function recipesList() {
		// return directive
		return {
			restrict: 'EA',
			scope: {
				recipes: '=',
				openFilters: '@',
				customLabels: '@',
				categoryFilter: '@',
				tagFilter: '@'
			},
			templateUrl: 'ng-app/core/recipes/recipesList.tpl.html',
			controller: recipesListCtrl,
			controllerAs: 'rl',
			bindToController: true,
			link: recipesListLink
		};

		/**
		 * recipesList LINK function
		 *
		 * @param $scope
		 */
		function recipesListLink($scope) {
			$scope.rll = {};

			// watch the currently visible number of recipes to display a count
			$scope.$watch(
				function() {
					return angular.element('.recipesList-list-item').length;
				},
				function(newVal, oldVal) {
					if (newVal) {
						$scope.rll.displayedResults = newVal;
					}
				}
			);
		}
	}

	recipesListCtrl.$inject = ['$scope', 'Recipe'];

	/**
	 * recipesList CONTROLLER
	 *
	 * @param $scope
	 * @param Recipe
	 */
	function recipesListCtrl($scope, Recipe) {
		// controllerAs view model
		var rl = this;

		// build out the total time and number of ingredients for sorting
		var _watchRecipes = $scope.$watch('rl.recipes', function(newVal, oldVal) {
			if (newVal) {
				angular.forEach(rl.recipes, function(recipe) {
					recipe.totalTime = (recipe.cookTime ? recipe.cookTime : 0) + (recipe.prepTime ? recipe.prepTime : 0);
					recipe.nIng = recipe.ingredients.length;
				});
				// deregister the watch
				_watchRecipes();
			}
		});
		var _lastSortedBy = 'name';
		var _resultsSet = 15;   // number of recipes to show/add in a set

		var _openFiltersOnload = $scope.$watch('rl.openFilters', function(newVal, oldVal) {
			if (angular.isDefined(newVal)) {
				rl.showSearchFilter = newVal === 'true';
				_openFiltersOnload();
			}
		});

		// conditionally show category / tag filters
		// always show special diet filter
		if (rl.categoryFilter === 'true') {
			rl.categories = Recipe.categories;
			rl.showCategoryFilter = true;
		}
		if (rl.tagFilter === 'true') {
			rl.tags = Recipe.tags;
			rl.showTagFilter = true;
		}
		rl.specialDiet = Recipe.dietary;

		// set all filters to empty
		rl.filterPredicates = {};

		function _resetFilterPredicates() {
			rl.filterPredicates.cat = '';
			rl.filterPredicates.tag = '';
			rl.filterPredicates.diet = '';
		}

		// set up sort predicate and reversals
		rl.sortPredicate = 'name';

		rl.reverseObj = {
			name: false,
			totalTime: false,
			nIng: false
		};

		/**
		 * Toggle sort asc/desc
		 *
		 * @param predicate {string}
		 */
		rl.toggleSort = function(predicate) {
			if (_lastSortedBy === predicate) {
				rl.reverseObj[predicate] = !rl.reverseObj[predicate];
			}
			rl.reverse = rl.reverseObj[predicate];
			_lastSortedBy = predicate;
		};

		/**
		 * Reset results showing to initial default on search/filter
		 *
		 * @private
		 */
		function _resetResultsShowing() {
			rl.nResultsShowing = _resultsSet;
		}
		_resetResultsShowing();

		/**
		 * Load More results
		 */
		rl.loadMore = function() {
			rl.nResultsShowing = rl.nResultsShowing += _resultsSet;
		};

		// watch search query and if it exists, clear filters and reset results showing
		$scope.$watch('rl.query', function(newVal, oldVal) {
			if (rl.query) {
				_resetFilterPredicates();
				_resetResultsShowing();
			}
		});

		// watch filters and if any of them change, reset the results showing
		$scope.$watch('rl.filterPredicates', function(newVal, oldVal) {
			if (!!newVal && newVal !== oldVal) {
				_resetResultsShowing();
			}
		});

		/**
		 * Toggle search/filter section open/closed
		 */
		rl.toggleSearchFilter = function() {
			rl.showSearchFilter = !rl.showSearchFilter;
		};

		/**
		 * Clear search query and all filters
		 */
		rl.clearSearchFilter = function() {
			_resetFilterPredicates();
			rl.query = '';
		};

		/**
		 * Show number of currently active search + filter items
		 *
		 * @param query {string}
		 * @param filtersObj {object}
		 * @returns {number}
		 */
		rl.activeSearchFilters = function(query, filtersObj) {
			var total = 0;

			if (query) {
				total = total += 1;
			}
			angular.forEach(filtersObj, function(filter) {
				if (filter) {
					total = total += 1;
				}
			});

			return total;
		};
	}
}());
// media query constants
(function() {
	'use strict';

	var MQ = {
		SMALL: '(max-width: 767px)',
		LARGE: '(min-width: 768px)'
	};

	angular
		.module('rBox')
		.constant('MQ', MQ);
}());
// For touchend/mouseup blur
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('blurOnEnd', blurOnEnd);

	function blurOnEnd() {
		// return directive
		return {
			restrict: 'EA',
			link: blurOnEndLink
		};

		/**
		 * blurOnEnd LINK function
		 *
		 * @param $scope
		 * @param $elem
		 */
		function blurOnEndLink($scope, $elem) {
			_init();

			/**
			 * INIT
			 *
			 * @private
			 */
			function _init() {
				$elem.bind('touchend', _blurElem);
				$elem.bind('mouseup', _blurElem);

				$scope.$on('$destroy', _onDestroy);
			}

			/**
			 * Fire blur event
			 *
			 * @private
			 */
			function _blurElem() {
				$elem.trigger('blur');
			}

			/**
			 * On $destroy, unbind handlers
			 *
			 * @private
			 */
			function _onDestroy() {
				$elem.unbind('touchend', _blurElem);
				$elem.unbind('mouseup', _blurElem);
			}
		}
	}
}());
(function() {

	angular
		.module('rBox')
		.directive('detectAdblock', detectAdblock);

	detectAdblock.$inject = ['$timeout', '$location'];

	function detectAdblock($timeout, $location) {
		// return directive
		return {
			restrict: 'EA',
			link: detectAdblockLink,
			template:   '<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div>' +
						'<div ng-if="ab.blocked" class="ab-message alert alert-danger">' +
						'<i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.' +
						'</div>'
		};

		/**
		 * detectAdBlock LINK function
		 *
		 * @param $scope
		 * @param $elem
		 * @param $attrs
		 */
		function detectAdblockLink($scope, $elem, $attrs) {
			_init();

			/**
			 * INIT
			 *
			 * @private
			 */
			function _init() {
				// data object
				$scope.ab = {};

				// hostname for messaging
				$scope.ab.host = $location.host();

				$timeout(_areAdsBlocked, 200);
			}

			/**
			 * Check if ads are blocked - called in $timeout to let AdBlockers run
			 *
			 * @private
			 */
			function _areAdsBlocked() {
				var _a = $elem.find('.ad-test');

				$scope.ab.blocked = _a.height() <= 0 || !$elem.find('.ad-test:visible').length;
			}
		}
	}

}());
(function() {

	angular
		.module('rBox')
		.directive('divider', divider);

	function divider() {
		// return directive
		return {
			restrict: 'EA',
			template: '<div class="rBox-divider"><i class="fa fa-cutlery"></i></div>'
		};
	}

}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('loading', loading);

	loading.$inject = ['$window', 'resize'];

	function loading($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'ng-app/core/ui/loading.tpl.html',
			transclude: true,
			controller: loadingCtrl,
			controllerAs: 'loading',
			bindToController: true,
			link: loadingLink
		};

		/**
		 * loading LINK
		 * Disables page scrolling when loading overlay is open
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param loading {controller}
		 */
		function loadingLink($scope, $element, $attrs, loading) {
			// private variables
			var _$body = angular.element('body');
			var _winHeight = $window.innerHeight + 'px';

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 200
				});

				// $watch active state
				$scope.$watch('loading.active', _$watchActive);
			}

			/**
			 * Window resized
			 * If loading, reapply body height
			 * to prevent scrollbar
			 *
			 * @private
			 */
			function _resized() {
				_winHeight = $window.innerHeight + 'px';

				if (loading.active) {
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				}
			}

			/**
			 * $watch loading.active
			 *
			 * @param newVal {boolean}
			 * @param oldVal {undefined|boolean}
			 * @private
			 */
			function _$watchActive(newVal, oldVal) {
				if (newVal) {
					_open();
				} else {
					_close();
				}
			}

			/**
			 * Open loading
			 * Disable scroll
			 *
			 * @private
			 */
			function _open() {
				_$body.css({
					height: _winHeight,
					overflowY: 'hidden'
				});
			}

			/**
			 * Close loading
			 * Enable scroll
			 *
			 * @private
			 */
			function _close() {
				_$body.css({
					height: 'auto',
					overflowY: 'auto'
				});
			}
		}
	}

	loadingCtrl.$inject = ['$scope'];
	/**
	 * loading CONTROLLER
	 * Update the loading status based
	 * on routeChange state
	 */
	function loadingCtrl($scope) {
		var loading = this;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			$scope.$on('loading-on', _loadingActive);
			$scope.$on('loading-off', _loadingInactive);
		}

		/**
		 * Set loading to active
		 *
		 * @private
		 */
		function _loadingActive() {
			loading.active = true;
		}

		/**
		 * Set loading to inactive
		 *
		 * @private
		 */
		function _loadingInactive() {
			loading.active = false;
		}
	}

}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('trimStr', trimStr);

	function trimStr() {
		return function(str, chars) {
			var trimmedStr = str;
			var _chars = angular.isUndefined(chars) ? 50 : chars;

			if (str.length > _chars) {
				trimmedStr = str.substr(0, _chars) + '...';
			}

			return trimmedStr;
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', '$auth', 'userData', 'Utils'];

	function headerCtrl($scope, $location, $auth, userData, Utils) {
		// controllerAs ViewModel
		var header = this;

		// bindable members
		header.logout = logout;
		header.isAuthenticated = Utils.isAuthenticated;
		header.indexIsActive = indexIsActive;
		header.navIsActive = navIsActive;

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		function logout() {
			header.adminUser = undefined;
			$auth.logout('/login');
		}

		/**
		 * If user is authenticated and adminUser is undefined,
		 * get the user and set adminUser boolean.
		 *
		 * Do this on first controller load (init, refresh)
		 * and subsequent location changes (ie, catching logout, login, etc).
		 *
		 * @private
		 */
		function _checkUserAdmin() {
			/**
			 * Successful promise getting user
			 *
			 * @param data {promise}.data
			 * @private
			 */
			function _getUserSuccess(data) {
				header.user = data;
				header.adminUser = data.isAdmin;
			}

			// if user is authenticated, get user data
			if (Utils.isAuthenticated() && angular.isUndefined(header.user)) {
				userData.getUser()
					.then(_getUserSuccess);
			}
		}
		_checkUserAdmin();
		$scope.$on('$locationChangeSuccess', _checkUserAdmin);

		/**
		 * Currently active nav item when '/' index
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		function indexIsActive(path) {
			// path should be '/'
			return $location.path() === path;
		}

		/**
		 * Currently active nav item
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		function navIsActive(path) {
			return $location.path().substr(0, path.length) === path;
		}
	}

}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('navControl', navControl);

	navControl.$inject = ['$window', 'resize'];

	function navControl($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			link: navControlLink
		};

		/**
		 * navControl LINK function
		 *
		 * @param $scope
		 */
		function navControlLink($scope) {
			// private variables
			var _$body = angular.element('body');
			var _layoutCanvas = _$body.find('.layout-canvas');
			var _navOpen;

			// data model
			$scope.nav = {};

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 100
				});

				$scope.$on('$locationChangeStart', _$locationChangeStart);
				$scope.$on('enter-mobile', _enterMobile);
				$scope.$on('exit-mobile', _exitMobile);
			}

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css({
					minHeight: $window.innerHeight + 'px'
				});
			}

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_$body
				.removeClass('nav-closed')
				.addClass('nav-open');

				_navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_$body
				.removeClass('nav-open')
				.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Toggle nav open/closed
			 */
			function toggleNav() {
				if (!_navOpen) {
					_openNav();
				} else {
					_closeNav();
				}
			}

			/**
			 * When changing location, close the nav if it's open
			 */
			function _$locationChangeStart() {
				if (_navOpen) {
					_closeNav();
				}
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile(mq) {
				_closeNav();

				// bind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = toggleNav;
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile(mq) {
				// unbind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = null;

				_$body.removeClass('nav-closed nav-open');
			}
		}
	}

}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', 'Page', 'Utils', '$auth', 'userData', '$timeout', 'OAUTH', 'User', '$location'];

	function AccountCtrl($scope, Page, Utils, $auth, userData, $timeout, OAUTH, User, $location) {
		// controllerAs ViewModel
		var account = this;
		var _tab = $location.search().view;

		Page.setTitle('My Account');

		account.tabs = [
			{
				name: 'User Info',
				query: 'user-info'
			},
			{
				name: 'Manage Logins',
				query: 'manage-logins'
			}
		];
		account.currentTab = _tab ? _tab : 'user-info';

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		account.changeTab = function(query) {
			$location.search('view', query);
			account.currentTab = query;
		};

		// all available login services
		account.logins = OAUTH.LOGINS;

		account.isAuthenticated = Utils.isAuthenticated;

		/**
		 * Get user's profile information
		 */
		account.getProfile = function() {
			/**
			 * Function for successful API call getting user's profile data
			 * Show Account UI
			 *
			 * @param data {object} promise provided by $http success
			 * @private
			 */
			function _getUserSuccess(data) {
				account.user = data;
				account.administrator = account.user.isAdmin;
				account.linkedAccounts = User.getLinkedAccounts(account.user, 'account');
				account.showAccount = true;
			}

			/**
			 * Function for error API call getting user's profile data
			 * Show an error alert in the UI
			 *
			 * @param error
			 * @private
			 */
			function _getUserError(error) {
				account.errorGettingUser = true;
			}

			userData.getUser().then(_getUserSuccess, _getUserError);
		};

		/**
		 * Reset profile save button to initial state
		 *
		 * @private
		 */
		function _btnSaveReset() {
			account.btnSaved = false;
			account.btnSaveText = 'Save';
		}

		_btnSaveReset();

		/**
		 * Watch display name changes to check for empty or null string
		 * Set button text accordingly
		 *
		 * @param newVal {string} updated displayName value from input field
		 * @param oldVal {*} previous displayName value
		 * @private
		 */
		function _watchDisplayName(newVal, oldVal) {
			if (newVal === '' || newVal === null) {
				account.btnSaveText = 'Enter Name';
			} else {
				account.btnSaveText = 'Save';
			}
		}
		$scope.$watch('account.user.displayName', _watchDisplayName);

		/**
		 * Update user's profile information
		 * Called on submission of update form
		 */
		account.updateProfile = function() {
			var profileData = { displayName: account.user.displayName };

			/**
			 * Success callback when profile has been updated
			 *
			 * @private
			 */
			function _updateSuccess() {
				account.btnSaved = true;
				account.btnSaveText = 'Saved!';

				$timeout(_btnSaveReset, 2500);
			}

			/**
			 * Error callback when profile update has failed
			 *
			 * @private
			 */
			function _updateError() {
				account.btnSaved = 'error';
				account.btnSaveText = 'Error saving!';
			}

			if (account.user.displayName) {
				// Set status to Saving... and update upon success or error in callbacks
				account.btnSaveText = 'Saving...';

				// Update the user, passing profile data and assigning success and error callbacks
				userData.updateUser(profileData).then(_updateSuccess, _updateError);
			}
		};

		/**
		 * Link third-party provider
		 *
		 * @param {string} provider
		 */
		account.link = function(provider) {
			$auth.link(provider)
				.then(function() {
					account.getProfile();
				})
				.catch(function(response) {
					alert(response.data.message);
				});
		};

		/**
		 * Unlink third-party provider
		 *
		 * @param {string} provider
		 */
		account.unlink = function(provider) {
			$auth.unlink(provider)
				.then(function() {
					account.getProfile();
				})
				.catch(function(response) {
					alert(response.data ? response.data.message : 'Could not unlink ' + provider + ' account');
				});
		};

		account.getProfile();
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['Page', 'Utils', 'userData', 'User'];

	function AdminCtrl(Page, Utils, userData, User) {
		// controllerAs ViewModel
		var admin = this;

		Page.setTitle('Admin');

		admin.isAuthenticated = Utils.isAuthenticated;

		/**
		 * Function for successful API call getting user list
		 * Show Admin UI
		 * Display list of users
		 *
		 * @param data {Array} promise provided by $http success
		 * @private
		 */
		function _getAllUsersSuccess(data) {
			admin.users = data;

			angular.forEach(admin.users, function(user) {
				user.linkedAccounts = User.getLinkedAccounts(user);
			});

			admin.showAdmin = true;
		}

		/**
		 * Function for unsuccessful API call getting user list
		 * Show Unauthorized error
		 *
		 * @param error {error} response
		 * @private
		 */
		function _getAllUsersError(error) {
			admin.showAdmin = false;
		}

		userData.getAllUsers().then(_getAllUsersSuccess, _getAllUsersError);
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'Page', 'recipeData', 'Recipe', 'Utils', 'userData', '$location'];

	function HomeCtrl($scope, Page, recipeData, Recipe, Utils, userData, $location) {
		// controllerAs ViewModel
		var home = this;

		var _tab = $location.search().view;
		var i;
		var n;
		var t;

		Page.setTitle('All Recipes');

		home.tabs = [
			{
				name: 'Recipe Boxes',
				query: 'recipe-boxes'
			},
			{
				name: 'Search / Browse All',
				query: 'search-browse-all'
			}
		];
		home.currentTab = _tab ? _tab : 'recipe-boxes';

		$scope.$on('enter-mobile', _enterMobile);
		$scope.$on('exit-mobile', _exitMobile);

		/**
		 * Enter mobile - view is small
		 *
		 * @private
		 */
		function _enterMobile() {
			home.viewformat = 'small';
		}

		/**
		 * Exit mobile - view is large
		 *
		 * @private
		 */
		function _exitMobile() {
			home.viewformat = 'large';
		}

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		home.changeTab = function(query) {
			$location.search('view', query);
			home.currentTab = query;
		};

		home.categories = Recipe.categories;
		home.tags = Recipe.tags;

		// build hashmap of categories
		home.mapCategories = {};
		for (i = 0; i < home.categories.length; i++) {
			home.mapCategories[home.categories[i]] = 0;
		}

		// build hashmap of tags
		home.mapTags = {};
		for (n = 0; n < home.tags.length; n++) {
			home.mapTags[home.tags[n]] = 0;
		}

		/**
		 * Successful promise returned from getting public recipes
		 *
		 * @param data {Array} recipes array
		 * @private
		 */
		function _publicRecipesSuccess(data) {
			home.recipes = data;

			// count number of recipes per category and tag
			angular.forEach(home.recipes, function(recipe) {
				home.mapCategories[recipe.category] += 1;

				for (t = 0; t < recipe.tags.length; t++) {
					home.mapTags[recipe.tags[t]] += 1;
				}
			});
		}

		/**
		 * Failure to return public recipes
		 *
		 * @param error
		 * @private
		 */
		function _publicRecipesFailure(error) {
			console.log('There was an error retrieving recipes:', error);
		}

		recipeData.getPublicRecipes()
			.then(_publicRecipesSuccess, _publicRecipesFailure);

		/**
		 * Successful promise getting user
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			home.user = data;
			home.welcomeMsg = 'Hello, ' + home.user.displayName + '! Want to <a href="/my-recipes?view=new-recipe">add a new recipe</a>?';
		}

		// if user is authenticated, get user data
		if (Utils.isAuthenticated() && angular.isUndefined(home.user)) {
			userData.getUser()
				.then(_getUserSuccess);
		} else if (!Utils.isAuthenticated()) {
			home.welcomeMsg = 'Welcome to <strong>rBox</strong>! Browse through the public recipe box or <a href="/login">Login</a> to file or contribute recipes.';
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('LoginCtrl', LoginCtrl);

	LoginCtrl.$inject = ['Page', 'Utils', '$auth', 'OAUTH', '$rootScope', '$location'];

	function LoginCtrl(Page, Utils, $auth, OAUTH, $rootScope, $location) {
		// controllerAs ViewModel
		var login = this;

		Page.setTitle('Login');

		login.logins = OAUTH.LOGINS;
		login.isAuthenticated = Utils.isAuthenticated;

		/**
		 * Authenticate the user via Oauth with the specified provider
		 *
		 * @param {string} provider - (twitter, facebook, github, google)
		 */
		login.authenticate = function(provider) {
			login.loggingIn = true;

			/**
			 * Successfully authenticated
			 * Go to initially intended authenticated path
			 *
			 * @param response {promise}
			 * @private
			 */
			function _authSuccess(response) {
				login.loggingIn = false;

				if ($rootScope.authPath) {
					$location.path($rootScope.authPath);
				}
			}

			/**
			 * Error authenticating
			 *
			 * @param response {promise}
			 * @private
			 */
			function _authCatch(response) {
				console.log(response.data);
				login.loggingIn = 'error';
				login.loginMsg = '';
			}

			$auth.authenticate(provider)
				.then(_authSuccess)
				.catch(_authCatch);
		};

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		login.logout = function() {
			$auth.logout('/login');
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['Page', 'Utils', 'recipeData', 'userData', '$location', '$scope'];

	function MyRecipesCtrl(Page, Utils, recipeData, userData, $location, $scope) {
		// controllerAs ViewModel
		var myRecipes = this;
		var _tab = $location.search().view;

		Page.setTitle('My Recipes');

		myRecipes.tabs = [
			{
				query: 'recipe-box'
			},
			{
				query: 'filed-recipes'
			},
			{
				query: 'new-recipe'
			}
		];
		myRecipes.currentTab = _tab ? _tab : 'recipe-box';

		$scope.$on('enter-mobile', _enterMobile);
		$scope.$on('exit-mobile', _exitMobile);

		/**
		 * Enter mobile - set shorter tab names
		 *
		 * @private
		 */
		function _enterMobile() {
			myRecipes.tabs[0].name = 'Recipe Box';
			myRecipes.tabs[1].name = 'Filed';
			myRecipes.tabs[2].name = 'New Recipe';
		}

		/**
		 * Exit mobile - set longer tab names
		 *
		 * @private
		 */
		function _exitMobile() {
			myRecipes.tabs[0].name = 'My Recipe Box';
			myRecipes.tabs[1].name = 'Filed Recipes';
			myRecipes.tabs[2].name = 'Add New Recipe';
		}

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		myRecipes.changeTab = function(query) {
			$location.search('view', query);
			myRecipes.currentTab = query;
		};

		myRecipes.isAuthenticated = Utils.isAuthenticated;

		/**
		 * Successful promise getting user's data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			var savedRecipesObj = {savedRecipes: data.savedRecipes};
			myRecipes.user = data;

			/**
			 * Successful promise returning user's saved recipes
			 *
			 * @param recipes {promise}.data
			 * @private
			 */
			function _filedSuccess(recipes) {
				myRecipes.filedRecipes = recipes;
			}
			recipeData.getFiledRecipes(savedRecipesObj)
				.then(_filedSuccess);
		}
		userData.getUser()
			.then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _recipesSuccess(data) {
			myRecipes.recipes = data;
		}
		recipeData.getMyRecipes()
			.then(_recipesSuccess);
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['Page', 'Utils', '$routeParams', 'recipeData', 'userData', '$location', '$timeout'];

	function EditRecipeCtrl(Page, Utils, $routeParams, recipeData, userData, $location, $timeout) {
		// controllerAs ViewModel
		var edit = this;
		var _recipeSlug = $routeParams.slug;
		var _tab = $location.search().view;

		Page.setTitle('Edit Recipe');

		edit.tabs = [
			{
				name: 'Edit Recipe',
				query: 'edit'
			},
			{
				name: 'Delete Recipe',
				query: 'delete'
			}
		];
		edit.currentTab = _tab ? _tab : 'edit';

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		edit.changeTab = function(query) {
			$location.search('view', query);
			edit.currentTab = query;
		};

		edit.isAuthenticated = Utils.isAuthenticated;

		function _getUserSuccess(data) {
			edit.user = data;
		}
		userData.getUser()
			.then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipeSuccess(data) {
			edit.recipe = data;
			edit.originalName = edit.recipe.name;
			Page.setTitle('Edit ' + edit.originalName);
		}

		/**
		 * Error retrieving recipe
		 *
		 * @private
		 */
		function _recipeError(err) {
			edit.recipe = 'error';
			Page.setTitle('Error');
			edit.errorMsg = err.data.message;
		}
		recipeData.getRecipe(_recipeSlug)
			.then(_recipeSuccess, _recipeError);

		/**
		 * Reset delete button
		 *
		 * @private
		 */
		function _resetDeleteBtn() {
			edit.deleted = false;
			edit.deleteBtnText = 'Delete Recipe';
		}

		_resetDeleteBtn();

		/**
		 * Successful promise after deleting recipe
		 *
		 * @param data {promise}
		 * @private
		 */
		function _deleteSuccess(data) {
			edit.deleted = true;
			edit.deleteBtnText = 'Deleted!';

			function _goToRecipes() {
				$location.path('/my-recipes');
				$location.search('view', null);
			}

			$timeout(_goToRecipes, 1500);
		}

		/**
		 * Error deleting recipe
		 *
		 * @private
		 */
		function _deleteError() {
			edit.deleted = 'error';
			edit.deleteBtnText = 'Error deleting!';

			$timeout(_resetDeleteBtn, 2500);
		}

		edit.deleteRecipe = function() {
			edit.deleteBtnText = 'Deleting...';
			recipeData.deleteRecipe(edit.recipe._id)
				.then(_deleteSuccess, _deleteError);
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['Page', 'Utils', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl(Page, Utils, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;
		var recipeSlug = $routeParams.slug;

		Page.setTitle('Recipe');

		/**
		 * Successful promise returning user's data
		 *
		 * @param data {object} user info
		 * @private
		 */
		function _getUserSuccess(data) {
			recipe.user = data;

			// logged in users can file recipes
			recipe.fileText = 'File this recipe';
			recipe.unfileText = 'Remove from Filed Recipes';
		}
		if (Utils.isAuthenticated()) {
			userData.getUser()
				.then(_getUserSuccess);
		}

		/**
		 * Successful promise returning recipe data
		 *
		 * @param data {promise} recipe data
		 * @private
		 */
		function _recipeSuccess(data) {
			var i;

			recipe.recipe = data;
			Page.setTitle(recipe.recipe.name);

			/**
			 * Successful promise returning author data
			 *
			 * @param data {promise} author picture, displayName
			 * @private
			 */
			function _authorSuccess(data) {
				recipe.author = data;
			}
			userData.getAuthor(recipe.recipe.userId)
				.then(_authorSuccess);

			recipe.ingChecked = [];
			recipe.stepChecked = [];

			/**
			 * Create array to keep track of checked / unchecked items
			 *
			 * @param checkedArr
			 * @param sourceArr
			 * @private
			 */
			function _createCheckedArrays(checkedArr, sourceArr) {
				for (i = 0; i < sourceArr.length; i++) {
					checkedArr[i] = false;
				}
			}

			_createCheckedArrays(recipe.ingChecked, recipe.recipe.ingredients);
			_createCheckedArrays(recipe.stepChecked, recipe.recipe.directions);

			/**
			 * Toggle checkmark
			 *
			 * @param type
			 * @param index
			 */
			recipe.toggleCheck = function(type, index) {
				recipe[type + 'Checked'][index] = !recipe[type + 'Checked'][index];
			};
		}
		/**
		 * Error retrieving recipe
		 *
		 * @param res {promise}
		 * @private
		 */
		function _recipeError(res) {
			recipe.recipe = 'error';
			Page.setTitle('Error');
			recipe.errorMsg = res.data.message;
		}
		recipeData.getRecipe(recipeSlug)
			.then(_recipeSuccess, _recipeError);

		/**
		 * File or unfile this recipe
		 *
		 * @param recipeId {string} ID of recipe to save
		 */
		recipe.fileRecipe = function(recipeId) {
			/**
			 * Successful promise from saving recipe to user data
			 *
			 * @param data {promise}.data
			 * @private
			 */
			function _fileSuccess(data) {
				console.log(data.message);
				recipe.apiMsg = data.added ? 'Recipe saved!' : 'Recipe removed!';
				recipe.filed = data.added;
			}

			/**
			 * Error promise from saving recipe to user data
			 *
			 * @param response {promise}
			 * @private
			 */
			function _fileError(response) {
				console.log(response.data.message);
			}
			recipeData.fileRecipe(recipeId)
				.then(_fileSuccess, _fileError);
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('minToH', minToH);

	function minToH() {
		return function(min) {
			var _hour = 60;
			var _min = min * 1;
			var _gtHour = _min / _hour >= 1;
			var _hPlusMin = _min % _hour;
			var _hasMinutes = _hPlusMin !== 0;
			var _hours = Math.floor(_min / _hour);
			var _hoursText = _hours === 1 ? ' hour' : ' hours';
			var _minutes = _hasMinutes ? ', ' + _hPlusMin + _minText(_hPlusMin) : '';
			var _noHMinText = _min === 1 ? ' minute' : ' minutes';
			var timeStr = null;

			/**
			 * Get minute/s text from minutes
			 *
			 * @param minutes {number}
			 * @private
			 * @returns {string}
			 */
			function _minText(minutes) {
				if (_hasMinutes && minutes === 1) {
					return ' minute';
				} else if (_hasMinutes && minutes !== 1) {
					return ' minutes';
				}
			}

			if (_gtHour) {
				timeStr = _hours + _hoursText + _minutes;
			} else {
				timeStr = _min + _noHMinText;
			}

			return timeStr;
		};
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesAuthorCtrl', RecipesAuthorCtrl);

	RecipesAuthorCtrl.$inject = ['Page', 'recipeData', 'userData', '$routeParams'];

	function RecipesAuthorCtrl(Page, recipeData, userData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;
		var _aid = $routeParams.userId;

		ra.className = 'recipesAuthor';

		ra.showCategoryFilter = 'true';
		ra.showTagFilter = 'true';

		/**
		 * Successful promise returned from getting author's basic data
		 *
		 * @param data {promise}
		 * @private
		 */
		function _authorSuccess(data) {
			ra.author = data;
			ra.heading = 'Recipes by ' + ra.author.displayName;
			ra.customLabels = ra.heading;
			Page.setTitle(ra.heading);
		}
		userData.getAuthor(_aid)
			.then(_authorSuccess);

		/**
		 * Successful promise returned from getting user's public recipes
		 *
		 * @param data {Array} recipes array
		 * @private
		 */
		function _recipesSuccess(data) {
			ra.recipes = data;
		}
		recipeData.getAuthorRecipes(_aid)
			.then(_recipesSuccess);
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesCategoryCtrl', RecipesCategoryCtrl);

	RecipesCategoryCtrl.$inject = ['Page', 'recipeData', '$routeParams'];

	function RecipesCategoryCtrl(Page, recipeData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;
		var _cat = $routeParams.category;
		var _catTitle = _cat.substring(0,1).toLocaleUpperCase() + _cat.substring(1);

		ra.className = 'recipesCategory';
		ra.heading = _catTitle + 's';
		ra.customLabels = ra.heading;
		Page.setTitle(ra.heading);

		ra.showCategoryFilter = 'false';
		ra.showTagFilter = 'true';

		/**
		 * Successful promise returned from getting public recipes
		 *
		 * @param data {Array} recipes array
		 * @private
		 */
		function _recipesSuccess(data) {
			var catArr = [];

			angular.forEach(data, function(recipe) {
				if (recipe.category == _catTitle) {
					catArr.push(recipe);
				}
			});

			ra.recipes = catArr;
		}
		recipeData.getPublicRecipes()
			.then(_recipesSuccess);
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesTagCtrl', RecipesTagCtrl);

	RecipesTagCtrl.$inject = ['Page', 'recipeData', '$routeParams'];

	function RecipesTagCtrl(Page, recipeData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;
		var _tag = $routeParams.tag;

		ra.className = 'recipesTag';

		ra.heading = 'Recipes tagged "' + _tag + '"';
		ra.customLabels = ra.heading;
		Page.setTitle(ra.heading);

		ra.showCategoryFilter = 'true';
		ra.showTagFilter = 'false';

		/**
		 * Successful promise returned from getting public recipes
		 *
		 * @param data {Array} recipes array
		 * @private
		 */
		function _recipesSuccess(data) {
			var taggedArr = [];

			angular.forEach(data, function(recipe) {
				if (recipe.tags.indexOf(_tag) > -1) {
					taggedArr.push(recipe);
				}
			});

			ra.recipes = taggedArr;
		}
		recipeData.getPublicRecipes()
			.then(_recipesSuccess);
	}
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvT0FVVEhDTElFTlRTLlNBTVBMRS5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL09BVVRIQ0xJRU5UUy5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvZ2V0LWRhdGEvUmVzLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL3JlY2lwZURhdGEuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvdXNlckRhdGEuZmFjdG9yeS5qcyIsImNvcmUvcmVjaXBlcy9SZWNpcGUuZmFjdG9yeS5qcyIsImNvcmUvcmVjaXBlcy9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvcmVjaXBlcy9yZWNpcGVzTGlzdC5kaXIuanMiLCJjb3JlL3VpL01RLmNvbnN0YW50LmpzIiwiY29yZS91aS9ibHVyT25FbmQuZGlyLmpzIiwiY29yZS91aS9kZXRlY3RBZEJsb2NrLmRpci5qcyIsImNvcmUvdWkvZGl2aWRlci5kaXIuanMiLCJjb3JlL3VpL2xvYWRpbmcuZGlyLmpzIiwiY29yZS91aS90cmltU3RyLmZpbHRlci5qcyIsImNvcmUvdWkvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwibW9kdWxlcy9oZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZDb250cm9sLmRpci5qcyIsInBhZ2VzL2FjY291bnQvQWNjb3VudC5jdHJsLmpzIiwicGFnZXMvYWRtaW4vQWRtaW4uY3RybC5qcyIsInBhZ2VzL2hvbWUvSG9tZS5jdHJsLmpzIiwicGFnZXMvbG9naW4vTG9naW4uY3RybC5qcyIsInBhZ2VzL215LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJywgJ25nRmlsZVVwbG9hZCddKTsiLCIvLyBsb2dpbiBhY2NvdW50IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIID0ge1xuXHRcdExPR0lOUzogW1xuXHRcdFx0e1xuXHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0fVxuXHRcdF1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIE9BVVRIKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0dmFyIF9tYyA9IG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bWVkaWE6IHtcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnJlc29sdmUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZSAmJiBjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAnckJveCc7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdBbGwgUmVjaXBlcyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRUaXRsZSgpIHtcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cblx0VXNlci4kaW5qZWN0ID0gWydPQVVUSCddO1xuXG5cdGZ1bmN0aW9uIFVzZXIoT0FVVEgpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRVdGlscy4kaW5qZWN0ID0gWyckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIFV0aWxzKCRhdXRoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWQ6IGlzQXV0aGVudGljYXRlZFxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBsb2dpbi9PYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBPQVVUSENMSUVOVFMgPSB7XG5cdFx0TE9HSU5VUkw6ICdodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9sb2dpbicsXG5cdFx0Q0xJRU5UOiB7XG5cdFx0XHRGQjogJ1t5b3VyIEZhY2Vib29rIGNsaWVudCBJRF0nLFxuXHRcdFx0R09PR0xFOiAnW3lvdXIgR29vZ2xlIGNsaWVudCBJRF0nLFxuXHRcdFx0VFdJVFRFUjogJy9hdXRoL3R3aXR0ZXInLFxuXHRcdFx0R0lUSFVCOiAnW3lvdXIgR2l0SHViIGNsaWVudCBJRF0nXG5cdFx0fVxuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ09BVVRIQ0xJRU5UUycsIE9BVVRIQ0xJRU5UUyk7XG59KCkpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIQ0xJRU5UUyA9IHtcblx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHRDTElFTlQ6IHtcblx0XHRcdEZCOiAnMzYwMTczMTk3NTA1NjUwJyxcblx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRUV0lUVEVSOiAnL2F1dGgvdHdpdHRlcicsXG5cdFx0XHRHSVRIVUI6ICc5ZmYwOTcyOTljODZlNTI0YjEwZidcblx0XHR9XG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEhDTElFTlRTJywgT0FVVEhDTElFTlRTKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlcicsICdPQVVUSENMSUVOVFMnXTtcblxuXHRmdW5jdGlvbiBhdXRoQ29uZmlnKCRhdXRoUHJvdmlkZXIsIE9BVVRIQ0xJRU5UUykge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBPQVVUSENMSUVOVFMuTE9HSU5VUkw7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkZCXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HT09HTEVcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIudHdpdHRlcih7XG5cdFx0XHR1cmw6IE9BVVRIQ0xJRU5UUy5DTElFTlQuVFdJVFRFUlxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5naXRodWIoe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuR0lUSFVCXG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoUnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJ107XG5cblx0ZnVuY3Rpb24gYXV0aFJ1bigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRhdXRoKSB7XG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIG5leHQsIGN1cnJlbnQpIHsgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL29uLXdhdGNoXG5cdFx0XHRpZiAobmV4dCAmJiBuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnNlY3VyZSAmJiAhJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSgpKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2xvZ2luJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9sb2dpbi9Mb2dpbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTG9naW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbG9naW4nXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGUvOnNsdWcnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZS9SZWNpcGUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyZWNpcGUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL2F1dGhvci86dXNlcklkJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0F1dGhvckN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvdGFnLzp0YWcnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzVGFnQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9jYXRlZ29yeS86Y2F0ZWdvcnknLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzQ2F0ZWdvcnlDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9teS1yZWNpcGVzJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9teS1yZWNpcGVzL015UmVjaXBlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ015UmVjaXBlc0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdteVJlY2lwZXMnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGUvOnNsdWcvZWRpdCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlL0VkaXRSZWNpcGUudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdFZGl0UmVjaXBlQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2VkaXQnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hY2NvdW50Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9hY2NvdW50L0FjY291bnQudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBY2NvdW50Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FjY291bnQnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hZG1pbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWRtaW4vQWRtaW4udmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWRtaW4nXG5cdFx0XHR9KVxuXHRcdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRcdHJlZGlyZWN0VG86ICcvJ1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUmVzJywgUmVzKTtcblxuXHRmdW5jdGlvbiBSZXMoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRzdWNjZXNzOiBzdWNjZXNzLFxuXHRcdFx0ZXJyb3I6IGVycm9yXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UuZGF0YSkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiLy8gUmVjaXBlIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdyZWNpcGVEYXRhJywgcmVjaXBlRGF0YSk7XG5cblx0cmVjaXBlRGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFJlY2lwZTogZ2V0UmVjaXBlLFxuXHRcdFx0Y3JlYXRlUmVjaXBlOiBjcmVhdGVSZWNpcGUsXG5cdFx0XHR1cGRhdGVSZWNpcGU6IHVwZGF0ZVJlY2lwZSxcblx0XHRcdGRlbGV0ZVJlY2lwZTogZGVsZXRlUmVjaXBlLFxuXHRcdFx0Z2V0UHVibGljUmVjaXBlczogZ2V0UHVibGljUmVjaXBlcyxcblx0XHRcdGdldE15UmVjaXBlczogZ2V0TXlSZWNpcGVzLFxuXHRcdFx0Z2V0QXV0aG9yUmVjaXBlczogZ2V0QXV0aG9yUmVjaXBlcyxcblx0XHRcdGZpbGVSZWNpcGU6IGZpbGVSZWNpcGUsXG5cdFx0XHRnZXRGaWxlZFJlY2lwZXM6IGdldEZpbGVkUmVjaXBlcyxcblx0XHRcdGNsZWFuVXBsb2FkczogY2xlYW5VcGxvYWRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGUgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBzbHVnIHtzdHJpbmd9IHJlY2lwZSBzbHVnXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UmVjaXBlKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgcmVjaXBlIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjcmVhdGVSZWNpcGUocmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZS9uZXcnLCByZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYSByZWNpcGUgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSUQgKGluIGNhc2Ugc2x1ZyBoYXMgY2hhbmdlZClcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVJlY2lwZShpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIGEgcmVjaXBlIChERUxFVEUpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGVsZXRlUmVjaXBlKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmRlbGV0ZSgnL2FwaS9yZWNpcGUvJyArIGlkKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRQdWJsaWNSZWNpcGVzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRNeVJlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGEgc3BlY2lmaWMgdXNlcidzIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlcklkIHtzdHJpbmd9IHVzZXIgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3JSZWNpcGVzKHVzZXJJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9hdXRob3IvJyArIHVzZXJJZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRmlsZS91bmZpbGUgdGhpcyByZWNpcGUgaW4gdXNlciBkYXRhIChQVVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmaWxlUmVjaXBlKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIHJlY2lwZUlkICsgJy9maWxlJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IGZpbGVkIHJlY2lwZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWRzIHtBcnJheX0gYXJyYXkgb2YgdXNlcidzIGZpbGVkIHJlY2lwZSBJRHNcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRGaWxlZFJlY2lwZXMocmVjaXBlSWRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlcy9tZS9maWxlZCcsIHJlY2lwZUlkcylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gdXBsb2FkIGZpbGVzIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYW5VcGxvYWRzKGZpbGVzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL2NsZWFuLXVwbG9hZHMnLCBmaWxlcyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldEF1dGhvcjogZ2V0QXV0aG9yLFxuXHRcdFx0Z2V0VXNlcjogZ2V0VXNlcixcblx0XHRcdHVwZGF0ZVVzZXI6IHVwZGF0ZVVzZXIsXG5cdFx0XHRnZXRBbGxVc2VyczogZ2V0QWxsVXNlcnNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QXV0aG9yKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VyLycgKyBpZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSkgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGRpZXRhcnkgPSBbXG5cdFx0J0dsdXRlbi1mcmVlJyxcblx0XHQnVmVnYW4nLFxuXHRcdCdWZWdldGFyaWFuJ1xuXHRdO1xuXG5cdHZhciBpbnNlcnRDaGFyID0gW1xuXHRcdCfihZsnLFxuXHRcdCfCvCcsXG5cdFx0J+KFkycsXG5cdFx0J8K9Jyxcblx0XHQn4oWUJyxcblx0XHQnwr4nXG5cdF07XG5cblx0dmFyIGNhdGVnb3JpZXMgPSBbXG5cdFx0J0FwcGV0aXplcicsXG5cdFx0J0JldmVyYWdlJyxcblx0XHQnRGVzc2VydCcsXG5cdFx0J0VudHJlZScsXG5cdFx0J1NhbGFkJyxcblx0XHQnU2lkZScsXG5cdFx0J1NvdXAnXG5cdF07XG5cblx0dmFyIHRhZ3MgPSBbXG5cdFx0J2FsY29ob2wnLFxuXHRcdCdiYWtlZCcsXG5cdFx0J2JlZWYnLFxuXHRcdCdmYXN0Jyxcblx0XHQnZmlzaCcsXG5cdFx0J2xvdy1jYWxvcmllJyxcblx0XHQnb25lLXBvdCcsXG5cdFx0J3Bhc3RhJyxcblx0XHQncG9yaycsXG5cdFx0J3BvdWx0cnknLFxuXHRcdCdzbG93LWNvb2snLFxuXHRcdCdzdG9jaycsXG5cdFx0J3ZlZ2V0YWJsZSdcblx0XTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlY2lwZScsIFJlY2lwZSk7XG5cblx0ZnVuY3Rpb24gUmVjaXBlKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGlldGFyeTogZGlldGFyeSxcblx0XHRcdGluc2VydENoYXI6IGluc2VydENoYXIsXG5cdFx0XHRjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuXHRcdFx0dGFnczogdGFnc1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZUZvcm0nLCByZWNpcGVGb3JtKTtcblxuXHRyZWNpcGVGb3JtLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gcmVjaXBlRm9ybSgkdGltZW91dCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGU6ICc9Jyxcblx0XHRcdFx0dXNlcklkOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZXMvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVGb3JtTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiByZWNpcGVGb3JtIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWNpcGVGb3JtTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIHNldCB1cCAkc2NvcGUgb2JqZWN0IGZvciBuYW1lc3BhY2luZ1xuXHRcdFx0JHNjb3BlLnJmbCA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZCBuZXcgaXRlbVxuXHRcdFx0ICogSW5ncmVkaWVudCBvciBEaXJlY3Rpb24gc3RlcFxuXHRcdFx0ICogRm9jdXMgdGhlIG5ld2VzdCBpbnB1dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH0gY2xpY2sgZXZlbnRcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSBpbmcgLW9yLSBzdGVwXG5cdFx0XHQgKiBAcGFyYW0gaXNIZWFkaW5nIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBmdW5jdGlvbigkZXZlbnQsIG1vZGVsLCB0eXBlLCBpc0hlYWRpbmcpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLFxuXHRcdFx0XHRcdHR5cGU6IHR5cGVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoaXNIZWFkaW5nKSB7XG5cdFx0XHRcdFx0X25ld0l0ZW0uaXNIZWFkaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1vZGVsLnB1c2goX25ld0l0ZW0pO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBfbmV3ZXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkucGFyZW50KCdwJykucHJldignLmxhc3QnKS5maW5kKCdpbnB1dCcpLmVxKDApO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5mb2N1cygpOyAgIC8vIFRPRE86IGZvY3VzIGlzbid0IGhpZ2hsaWdodGluZyBwcm9wZXJseVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVtb3ZlIGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIGkge2luZGV4fVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihtb2RlbCwgaSkge1xuXHRcdFx0XHRtb2RlbC5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRW50ZXIgbW9iaWxlIC0gdW5zZXQgbGFyZ2Ugdmlld1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdFx0JHNjb3BlLnJmbC5pc0xhcmdlVmlldyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEV4aXQgbW9iaWxlIC0gc2V0IGxhcmdlIHZpZXdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdFx0JHNjb3BlLnJmbC5pc0xhcmdlVmlldyA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogTW92ZSBpdGVtIHVwIG9yIGRvd25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIG9sZEluZGV4IHtpbmRleH0gY3VycmVudCBpbmRleFxuXHRcdFx0ICogQHBhcmFtIG5ld0luZGV4IHtudW1iZXJ9IG5ldyBpbmRleFxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLm1vdmVJdGVtID0gZnVuY3Rpb24oJGV2ZW50LCBtb2RlbCwgb2xkSW5kZXgsIG5ld0luZGV4KSB7XG5cdFx0XHRcdHZhciBfaXRlbSA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdsaScpO1xuXG5cdFx0XHRcdG1vZGVsLm1vdmUob2xkSW5kZXgsIG5ld0luZGV4KTtcblxuXHRcdFx0XHRfaXRlbS5hZGRDbGFzcygnbW92ZWQnKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfaXRlbS5yZW1vdmVDbGFzcygnbW92ZWQnKTtcblx0XHRcdFx0fSwgNzAwKTtcblx0XHRcdH07XG5cblx0XHRcdCRzY29wZS5yZmwubW92ZUluZ3JlZGllbnRzID0gZmFsc2U7XG5cdFx0XHQkc2NvcGUucmZsLm1vdmVEaXJlY3Rpb25zID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cmVjaXBlRm9ybUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ3JlY2lwZURhdGEnLCAnUmVjaXBlJywgJ1NsdWcnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0JywgJ1VwbG9hZCddO1xuXG5cdC8qKlxuXHQgKiByZWNpcGVGb3JtIENPTlRST0xMRVIgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtICRzY29wZVxuXHQgKiBAcGFyYW0gcmVjaXBlRGF0YVxuXHQgKiBAcGFyYW0gUmVjaXBlXG5cdCAqIEBwYXJhbSBTbHVnXG5cdCAqIEBwYXJhbSAkbG9jYXRpb25cblx0ICogQHBhcmFtICR0aW1lb3V0XG5cdCAqIEBwYXJhbSBVcGxvYWRcblx0ICovXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm1DdHJsKCRzY29wZSwgcmVjaXBlRGF0YSwgUmVjaXBlLCBTbHVnLCAkbG9jYXRpb24sICR0aW1lb3V0LCBVcGxvYWQpIHtcblx0XHR2YXIgcmYgPSB0aGlzO1xuXHRcdHZhciBfaXNFZGl0ID0gISFyZi5yZWNpcGU7XG5cdFx0dmFyIF9vcmlnaW5hbFNsdWcgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnNsdWcgOiBudWxsO1xuXG5cdFx0Ly8gc2V0dXAgc3BlY2lhbCBjaGFyYWN0ZXJzIHByaXZhdGUgdmFyc1xuXHRcdHZhciBfbGFzdElucHV0O1xuXHRcdHZhciBfaW5nSW5kZXg7XG5cdFx0dmFyIF9jYXJldFBvcztcblxuXHRcdHJmLnJlY2lwZURhdGEgPSBfaXNFZGl0ID8gcmYucmVjaXBlIDoge307XG5cdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnVzZXJJZCA6IHJmLnVzZXJJZDtcblx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5waG90byA6IG51bGw7XG5cblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgNS1jaGFyYWN0ZXIgSUQ7XG5cdFx0ICogT24gJHNjb3BlIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlciBhbmQgbGlua1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHQgKi9cblx0XHQkc2NvcGUuZ2VuZXJhdGVJZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIF9pZCA9ICcnO1xuXHRcdFx0dmFyIF9jaGFyc2V0ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Jztcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG5cdFx0XHRcdF9pZCArPSBfY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2NoYXJzZXQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBfaWQ7XG5cdFx0fTtcblxuXHRcdC8vIGlzIHRoaXMgYSB0b3VjaCBkZXZpY2U/XG5cdFx0cmYuaXNUb3VjaERldmljZSA9ICEhTW9kZXJuaXpyLnRvdWNoZXZlbnRzO1xuXG5cdFx0Ly8gYnVpbGQgbGlzdHNcblx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5pbmdyZWRpZW50cyA6IFt7aWQ6ICRzY29wZS5nZW5lcmF0ZUlkKCksIHR5cGU6ICdpbmcnfV07XG5cdFx0cmYucmVjaXBlRGF0YS5kaXJlY3Rpb25zID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5kaXJlY3Rpb25zIDogW3tpZDogJHNjb3BlLmdlbmVyYXRlSWQoKSwgdHlwZTogJ3N0ZXAnfV07XG5cblx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MgPSBfaXNFZGl0ID8gcmYucmVjaXBlRGF0YS50YWdzIDogW107XG5cblx0XHQvLyBtYW5hZ2UgdGltZSBmaWVsZHNcblx0XHRyZi50aW1lUmVnZXggPSAvXlsrXT8oWzAtOV0rKD86W1xcLl1bMC05XSopP3xcXC5bMC05XSspJC87XG5cdFx0cmYudGltZUVycm9yID0gJ1BsZWFzZSBlbnRlciBhIG51bWJlciBpbiBtaW51dGVzLiBNdWx0aXBseSBob3VycyBieSA2MC4nO1xuXG5cdFx0Ly8gZmV0Y2ggY2F0ZWdvcmllcyBvcHRpb25zIGxpc3Rcblx0XHRyZi5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XG5cblx0XHQvLyBmZXRjaCB0YWdzIG9wdGlvbnMgbGlzdFxuXHRcdHJmLnRhZ3MgPSBSZWNpcGUudGFncztcblxuXHRcdC8vIGZldGNoIGRpZXRhcnkgb3B0aW9ucyBsaXN0XG5cdFx0cmYuZGlldGFyeSA9IFJlY2lwZS5kaWV0YXJ5O1xuXG5cdFx0Ly8gZmV0Y2ggc3BlY2lhbCBjaGFyYWN0ZXJzXG5cdFx0cmYuY2hhcnMgPSBSZWNpcGUuaW5zZXJ0Q2hhcjtcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25FbmQge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCkge1xuXHRcdFx0dmFyIHJhbmdlID0gaW5wdXQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cblx0XHRcdGlmIChpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSkge1xuXHRcdFx0XHRpbnB1dC5jbGljaygpO1xuXHRcdFx0XHRpbnB1dC5mb2N1cygpO1xuXHRcdFx0XHRpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGlucHV0LmNyZWF0ZVRleHRSYW5nZSkge1xuXHRcdFx0XHRyYW5nZS5jb2xsYXBzZSh0cnVlKTtcblx0XHRcdFx0cmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0cmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25TdGFydCk7XG5cdFx0XHRcdHJhbmdlLnNlbGVjdCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBjYXJldCBwb3NpdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0ICogQHBhcmFtIHBvcyB7bnVtYmVyfSBpbnRlbmRlZCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3NldENhcmV0VG9Qb3MoaW5wdXQsIHBvcykge1xuXHRcdFx0X3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBwb3MsIHBvcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogS2VlcCB0cmFjayBvZiBjYXJldCBwb3NpdGlvbiBpbiBpbmdyZWRpZW50IGFtb3VudCB0ZXh0IGZpZWxkXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGluZGV4IHtudW1iZXJ9XG5cdFx0ICovXG5cdFx0cmYuaW5zZXJ0Q2hhcklucHV0ID0gZnVuY3Rpb24oJGV2ZW50LCBpbmRleCkge1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9pbmdJbmRleCA9IGluZGV4O1xuXHRcdFx0XHRfbGFzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCcjJyArICRldmVudC50YXJnZXQuaWQpO1xuXHRcdFx0XHRfY2FyZXRQb3MgPSBfbGFzdElucHV0WzBdLnNlbGVjdGlvblN0YXJ0O1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEluc2VydCBjaGFyYWN0ZXIgYXQgbGFzdCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEluIHN1cHBvcnRlZCBmaWVsZFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGNoYXIge3N0cmluZ30gc3BlY2lhbCBjaGFyYWN0ZXJcblx0XHQgKi9cblx0XHRyZi5pbnNlcnRDaGFyID0gZnVuY3Rpb24oY2hhcikge1xuXHRcdFx0dmFyIF90ZXh0VmFsO1xuXG5cdFx0XHRpZiAoX2xhc3RJbnB1dCkge1xuXHRcdFx0XHRfdGV4dFZhbCA9IGFuZ3VsYXIuaXNVbmRlZmluZWQocmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCkgPyAnJyA6IHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQ7XG5cblx0XHRcdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCA9IF90ZXh0VmFsLnN1YnN0cmluZygwLCBfY2FyZXRQb3MpICsgY2hhciArIF90ZXh0VmFsLnN1YnN0cmluZyhfY2FyZXRQb3MpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9jYXJldFBvcyA9IF9jYXJldFBvcyArIDE7XG5cdFx0XHRcdFx0X3NldENhcmV0VG9Qb3MoX2xhc3RJbnB1dFswXSwgX2NhcmV0UG9zKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENsZWFyIGNhcmV0IHBvc2l0aW9uIGFuZCBsYXN0IGlucHV0XG5cdFx0ICogU28gdGhhdCBzcGVjaWFsIGNoYXJhY3RlcnMgZG9uJ3QgZW5kIHVwIGluIHVuZGVzaXJlZCBmaWVsZHNcblx0XHQgKi9cblx0XHRyZi5jbGVhckNoYXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdF9pbmdJbmRleCA9IG51bGw7XG5cdFx0XHRfbGFzdElucHV0ID0gbnVsbDtcblx0XHRcdF9jYXJldFBvcyA9IG51bGw7XG5cdFx0fTtcblxuXHRcdHJmLnVwbG9hZGVkRmlsZSA9IG51bGw7XG5cblx0XHQvKipcblx0XHQgKiBVcGxvYWQgaW1hZ2UgZmlsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzIHtBcnJheX0gYXJyYXkgb2YgZmlsZXMgdG8gdXBsb2FkXG5cdFx0ICovXG5cdFx0cmYudXBkYXRlRmlsZSA9IGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0XHRpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChmaWxlc1swXS5zaXplID4gMzAwMDAwKSB7XG5cdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSAnRmlsZXNpemUgb3ZlciA1MDBrYiAtIHBob3RvIHdhcyBub3QgdXBsb2FkZWQuJztcblx0XHRcdFx0XHRyZi5yZW1vdmVQaG90bygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRcdFx0cmYudXBsb2FkZWRGaWxlID0gZmlsZXNbMF07ICAgIC8vIG9ubHkgc2luZ2xlIHVwbG9hZCBhbGxvd2VkXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVtb3ZlIHVwbG9hZGVkIHBob3RvIGZyb20gZnJvbnQtZW5kXG5cdFx0ICovXG5cdFx0cmYucmVtb3ZlUGhvdG8gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBudWxsO1xuXHRcdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblx0XHRcdGFuZ3VsYXIuZWxlbWVudCgnI3JlY2lwZVBob3RvJykudmFsKCcnKTtcblx0XHR9O1xuXG5cdFx0Ly8gY3JlYXRlIG1hcCBvZiB0b3VjaGVkIHRhZ3Ncblx0XHRyZi50YWdNYXAgPSB7fTtcblx0XHRpZiAoX2lzRWRpdCAmJiByZi5yZWNpcGVEYXRhLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRhbmd1bGFyLmZvckVhY2gocmYucmVjaXBlRGF0YS50YWdzLCBmdW5jdGlvbih0YWcsIGkpIHtcblx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQWRkIC8gcmVtb3ZlIHRhZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHRhZyB7c3RyaW5nfSB0YWcgbmFtZVxuXHRcdCAqL1xuXHRcdHJmLmFkZFJlbW92ZVRhZyA9IGZ1bmN0aW9uKHRhZykge1xuXHRcdFx0dmFyIF9hY3RpdmVUYWdJbmRleCA9IHJmLnJlY2lwZURhdGEudGFncy5pbmRleE9mKHRhZyk7XG5cblx0XHRcdGlmIChfYWN0aXZlVGFnSW5kZXggPiAtMSkge1xuXHRcdFx0XHQvLyB0YWcgZXhpc3RzIGluIG1vZGVsLCB0dXJuIGl0IG9mZlxuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3Muc3BsaWNlKF9hY3RpdmVUYWdJbmRleCwgMSk7XG5cdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB0YWcgZG9lcyBub3QgZXhpc3QgaW4gbW9kZWwsIHR1cm4gaXQgb25cblx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnB1c2godGFnKTtcblx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDbGVhbiBlbXB0eSBpdGVtcyBvdXQgb2YgYXJyYXkgYmVmb3JlIHNhdmluZ1xuXHRcdCAqIEluZ3JlZGllbnRzIG9yIERpcmVjdGlvbnNcblx0XHQgKiBBbHNvIGNsZWFycyBvdXQgZW1wdHkgaGVhZGluZ3Ncblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBtb2RlbE5hbWUge3N0cmluZ30gaW5ncmVkaWVudHMgLyBkaXJlY3Rpb25zXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfY2xlYW5FbXB0aWVzKG1vZGVsTmFtZSkge1xuXHRcdFx0dmFyIF9hcnJheSA9IHJmLnJlY2lwZURhdGFbbW9kZWxOYW1lXTtcblx0XHRcdHZhciBfY2hlY2sgPSBtb2RlbE5hbWUgPT09ICdpbmdyZWRpZW50cycgPyAnaW5ncmVkaWVudCcgOiAnc3RlcCc7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChfYXJyYXksIGZ1bmN0aW9uKG9iaiwgaSkge1xuXHRcdFx0XHRpZiAoISFvYmpbX2NoZWNrXSA9PT0gZmFsc2UgJiYgIW9iai5pc0hlYWRpbmcgfHwgb2JqLmlzSGVhZGluZyAmJiAhIW9iai5oZWFkaW5nVGV4dCA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRfYXJyYXkuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBzYXZlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXRTYXZlQnRuKCkge1xuXHRcdFx0cmYuc2F2ZWQgPSBmYWxzZTtcblx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRlIFJlY2lwZScgOiAnU2F2ZSBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdF9yZXNldFNhdmVCdG4oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlY2lwZSBjcmVhdGVkIG9yIHNhdmVkIHN1Y2Nlc3NmdWxseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZSB7cHJvbWlzZX0gaWYgZWRpdGluZyBldmVudFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVkKHJlY2lwZSkge1xuXHRcdFx0cmYuc2F2ZWQgPSB0cnVlO1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZWQhJyA6ICdTYXZlZCEnO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdvIHRvIG5ldyBzbHVnIChpZiBuZXcpIG9yIHVwZGF0ZWQgc2x1ZyAoaWYgc2x1ZyBjaGFuZ2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nb1RvTmV3U2x1ZygpIHtcblx0XHRcdFx0dmFyIF9wYXRoID0gIV9pc0VkaXQgPyByZWNpcGUuc2x1ZyA6IHJmLnJlY2lwZURhdGEuc2x1ZyArICcvZWRpdCc7XG5cblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9yZWNpcGUvJyArIF9wYXRoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFfaXNFZGl0IHx8IF9pc0VkaXQgJiYgX29yaWdpbmFsU2x1ZyAhPT0gcmYucmVjaXBlRGF0YS5zbHVnKSB7XG5cdFx0XHRcdCR0aW1lb3V0KF9nb1RvTmV3U2x1ZywgMTAwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCAyMDAwKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZWNpcGUgbm90IHNhdmVkIC8gY3JlYXRlZCBkdWUgdG8gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnIge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZUVycm9yKGVycikge1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHRyZi5zYXZlZCA9ICdlcnJvcic7XG5cdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCA0MDAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTYXZlIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zYXZlUmVjaXBlKCkge1xuXHRcdFx0aWYgKCFfaXNFZGl0KSB7XG5cdFx0XHRcdHJlY2lwZURhdGEuY3JlYXRlUmVjaXBlKHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWNpcGVEYXRhLnVwZGF0ZVJlY2lwZShyZi5yZWNpcGUuX2lkLCByZi5yZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNhdmUgcmVjaXBlXG5cdFx0ICogQ2xpY2sgb24gc3VibWl0XG5cdFx0ICovXG5cdFx0cmYuc2F2ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGluZy4uLicgOiAnU2F2aW5nLi4uJztcblxuXHRcdFx0Ly8gcHJlcCBkYXRhIGZvciBzYXZpbmdcblx0XHRcdHJmLnJlY2lwZURhdGEuc2x1ZyA9IFNsdWcuc2x1Z2lmeShyZi5yZWNpcGVEYXRhLm5hbWUpO1xuXHRcdFx0X2NsZWFuRW1wdGllcygnaW5ncmVkaWVudHMnKTtcblx0XHRcdF9jbGVhbkVtcHRpZXMoJ2RpcmVjdGlvbnMnKTtcblxuXHRcdFx0Ly8gc2F2ZSB1cGxvYWRlZCBmaWxlLCBpZiB0aGVyZSBpcyBvbmVcblx0XHRcdC8vIG9uY2Ugc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIGltYWdlLCBzYXZlIHJlY2lwZSB3aXRoIHJlZmVyZW5jZSB0byBzYXZlZCBpbWFnZVxuXHRcdFx0aWYgKHJmLnVwbG9hZGVkRmlsZSkge1xuXHRcdFx0XHRVcGxvYWRcblx0XHRcdFx0XHQudXBsb2FkKHtcblx0XHRcdFx0XHRcdHVybDogJy9hcGkvcmVjaXBlL3VwbG9hZCcsXG5cdFx0XHRcdFx0XHRmaWxlOiByZi51cGxvYWRlZEZpbGVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5wcm9ncmVzcyhmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0XHRcdHZhciBwcm9ncmVzc1BlcmNlbnRhZ2UgPSBwYXJzZUludCgxMDAuMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWwpO1xuXHRcdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0cmYudXBsb2FkUHJvZ3Jlc3MgPSBwcm9ncmVzc1BlcmNlbnRhZ2UgKyAnJSAnICsgZXZ0LmNvbmZpZy5maWxlLm5hbWU7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJmLnVwbG9hZFByb2dyZXNzKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG5cdFx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gZGF0YS5maWxlbmFtZTtcblxuXHRcdFx0XHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuZXJyb3IoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGVyci5tZXNzYWdlIHx8IGVycjtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yIHVwbG9hZGluZyBmaWxlOicsIGVyci5tZXNzYWdlIHx8IGVycik7XG5cblx0XHRcdFx0XHRcdF9yZWNpcGVTYXZlRXJyb3IoKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gbm8gdXBsb2FkZWQgZmlsZSwgc2F2ZSByZWNpcGVcblx0XHRcdFx0X3NhdmVSZWNpcGUoKTtcblx0XHRcdH1cblxuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZXNMaXN0JywgcmVjaXBlc0xpc3QpO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZXNMaXN0KCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGVzOiAnPScsXG5cdFx0XHRcdG9wZW5GaWx0ZXJzOiAnQCcsXG5cdFx0XHRcdGN1c3RvbUxhYmVsczogJ0AnLFxuXHRcdFx0XHRjYXRlZ29yeUZpbHRlcjogJ0AnLFxuXHRcdFx0XHR0YWdGaWx0ZXI6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcmVjaXBlcy9yZWNpcGVzTGlzdC50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVzTGlzdEN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdybCcsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogcmVjaXBlc0xpc3RMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIHJlY2lwZXNMaXN0IExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWNpcGVzTGlzdExpbmsoJHNjb3BlKSB7XG5cdFx0XHQkc2NvcGUucmxsID0ge307XG5cblx0XHRcdC8vIHdhdGNoIHRoZSBjdXJyZW50bHkgdmlzaWJsZSBudW1iZXIgb2YgcmVjaXBlcyB0byBkaXNwbGF5IGEgY291bnRcblx0XHRcdCRzY29wZS4kd2F0Y2goXG5cdFx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiBhbmd1bGFyLmVsZW1lbnQoJy5yZWNpcGVzTGlzdC1saXN0LWl0ZW0nKS5sZW5ndGg7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdFx0JHNjb3BlLnJsbC5kaXNwbGF5ZWRSZXN1bHRzID0gbmV3VmFsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZWNpcGVzTGlzdEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1JlY2lwZSddO1xuXG5cdC8qKlxuXHQgKiByZWNpcGVzTGlzdCBDT05UUk9MTEVSXG5cdCAqXG5cdCAqIEBwYXJhbSAkc2NvcGVcblx0ICogQHBhcmFtIFJlY2lwZVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RDdHJsKCRzY29wZSwgUmVjaXBlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIHZpZXcgbW9kZWxcblx0XHR2YXIgcmwgPSB0aGlzO1xuXG5cdFx0Ly8gYnVpbGQgb3V0IHRoZSB0b3RhbCB0aW1lIGFuZCBudW1iZXIgb2YgaW5ncmVkaWVudHMgZm9yIHNvcnRpbmdcblx0XHR2YXIgX3dhdGNoUmVjaXBlcyA9ICRzY29wZS4kd2F0Y2goJ3JsLnJlY2lwZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmwucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdFx0cmVjaXBlLnRvdGFsVGltZSA9IChyZWNpcGUuY29va1RpbWUgPyByZWNpcGUuY29va1RpbWUgOiAwKSArIChyZWNpcGUucHJlcFRpbWUgPyByZWNpcGUucHJlcFRpbWUgOiAwKTtcblx0XHRcdFx0XHRyZWNpcGUubkluZyA9IHJlY2lwZS5pbmdyZWRpZW50cy5sZW5ndGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvLyBkZXJlZ2lzdGVyIHRoZSB3YXRjaFxuXHRcdFx0XHRfd2F0Y2hSZWNpcGVzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dmFyIF9sYXN0U29ydGVkQnkgPSAnbmFtZSc7XG5cdFx0dmFyIF9yZXN1bHRzU2V0ID0gMTU7ICAgLy8gbnVtYmVyIG9mIHJlY2lwZXMgdG8gc2hvdy9hZGQgaW4gYSBzZXRcblxuXHRcdHZhciBfb3BlbkZpbHRlcnNPbmxvYWQgPSAkc2NvcGUuJHdhdGNoKCdybC5vcGVuRmlsdGVycycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAoYW5ndWxhci5pc0RlZmluZWQobmV3VmFsKSkge1xuXHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gbmV3VmFsID09PSAndHJ1ZSc7XG5cdFx0XHRcdF9vcGVuRmlsdGVyc09ubG9hZCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gY29uZGl0aW9uYWxseSBzaG93IGNhdGVnb3J5IC8gdGFnIGZpbHRlcnNcblx0XHQvLyBhbHdheXMgc2hvdyBzcGVjaWFsIGRpZXQgZmlsdGVyXG5cdFx0aWYgKHJsLmNhdGVnb3J5RmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdHJsLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblx0XHRcdHJsLnNob3dDYXRlZ29yeUZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdGlmIChybC50YWdGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0cmwudGFncyA9IFJlY2lwZS50YWdzO1xuXHRcdFx0cmwuc2hvd1RhZ0ZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdHJsLnNwZWNpYWxEaWV0ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHQvLyBzZXQgYWxsIGZpbHRlcnMgdG8gZW1wdHlcblx0XHRybC5maWx0ZXJQcmVkaWNhdGVzID0ge307XG5cblx0XHRmdW5jdGlvbiBfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCkge1xuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5jYXQgPSAnJztcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMudGFnID0gJyc7XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLmRpZXQgPSAnJztcblx0XHR9XG5cblx0XHQvLyBzZXQgdXAgc29ydCBwcmVkaWNhdGUgYW5kIHJldmVyc2Fsc1xuXHRcdHJsLnNvcnRQcmVkaWNhdGUgPSAnbmFtZSc7XG5cblx0XHRybC5yZXZlcnNlT2JqID0ge1xuXHRcdFx0bmFtZTogZmFsc2UsXG5cdFx0XHR0b3RhbFRpbWU6IGZhbHNlLFxuXHRcdFx0bkluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVG9nZ2xlIHNvcnQgYXNjL2Rlc2Ncblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcmVkaWNhdGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRybC50b2dnbGVTb3J0ID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG5cdFx0XHRpZiAoX2xhc3RTb3J0ZWRCeSA9PT0gcHJlZGljYXRlKSB7XG5cdFx0XHRcdHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXSA9ICFybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV07XG5cdFx0XHR9XG5cdFx0XHRybC5yZXZlcnNlID0gcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0X2xhc3RTb3J0ZWRCeSA9IHByZWRpY2F0ZTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcmVzdWx0cyBzaG93aW5nIHRvIGluaXRpYWwgZGVmYXVsdCBvbiBzZWFyY2gvZmlsdGVyXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldFJlc3VsdHNTaG93aW5nKCkge1xuXHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gX3Jlc3VsdHNTZXQ7XG5cdFx0fVxuXHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cblx0XHQvKipcblx0XHQgKiBMb2FkIE1vcmUgcmVzdWx0c1xuXHRcdCAqL1xuXHRcdHJsLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRybC5uUmVzdWx0c1Nob3dpbmcgPSBybC5uUmVzdWx0c1Nob3dpbmcgKz0gX3Jlc3VsdHNTZXQ7XG5cdFx0fTtcblxuXHRcdC8vIHdhdGNoIHNlYXJjaCBxdWVyeSBhbmQgaWYgaXQgZXhpc3RzLCBjbGVhciBmaWx0ZXJzIGFuZCByZXNldCByZXN1bHRzIHNob3dpbmdcblx0XHQkc2NvcGUuJHdhdGNoKCdybC5xdWVyeScsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAocmwucXVlcnkpIHtcblx0XHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gd2F0Y2ggZmlsdGVycyBhbmQgaWYgYW55IG9mIHRoZW0gY2hhbmdlLCByZXNldCB0aGUgcmVzdWx0cyBzaG93aW5nXG5cdFx0JHNjb3BlLiR3YXRjaCgncmwuZmlsdGVyUHJlZGljYXRlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAoISFuZXdWYWwgJiYgbmV3VmFsICE9PSBvbGRWYWwpIHtcblx0XHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqIFRvZ2dsZSBzZWFyY2gvZmlsdGVyIHNlY3Rpb24gb3Blbi9jbG9zZWRcblx0XHQgKi9cblx0XHRybC50b2dnbGVTZWFyY2hGaWx0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSAhcmwuc2hvd1NlYXJjaEZpbHRlcjtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYXIgc2VhcmNoIHF1ZXJ5IGFuZCBhbGwgZmlsdGVyc1xuXHRcdCAqL1xuXHRcdHJsLmNsZWFyU2VhcmNoRmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRybC5xdWVyeSA9ICcnO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTaG93IG51bWJlciBvZiBjdXJyZW50bHkgYWN0aXZlIHNlYXJjaCArIGZpbHRlciBpdGVtc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9XG5cdFx0ICogQHBhcmFtIGZpbHRlcnNPYmoge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdHJsLmFjdGl2ZVNlYXJjaEZpbHRlcnMgPSBmdW5jdGlvbihxdWVyeSwgZmlsdGVyc09iaikge1xuXHRcdFx0dmFyIHRvdGFsID0gMDtcblxuXHRcdFx0aWYgKHF1ZXJ5KSB7XG5cdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdH1cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzT2JqLCBmdW5jdGlvbihmaWx0ZXIpIHtcblx0XHRcdFx0aWYgKGZpbHRlcikge1xuXHRcdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0b3RhbDtcblx0XHR9O1xuXHR9XG59KCkpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE1RID0ge1xuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdNUScsIE1RKTtcbn0oKSk7IiwiLy8gRm9yIHRvdWNoZW5kL21vdXNldXAgYmx1clxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2JsdXJPbkVuZCcsIGJsdXJPbkVuZCk7XG5cblx0ZnVuY3Rpb24gYmx1ck9uRW5kKCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBibHVyT25FbmRMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGJsdXJPbkVuZCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYmx1ck9uRW5kTGluaygkc2NvcGUsICRlbGVtKSB7XG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0JGVsZW0uYmluZCgndG91Y2hlbmQnLCBfYmx1ckVsZW0pO1xuXHRcdFx0XHQkZWxlbS5iaW5kKCdtb3VzZXVwJywgX2JsdXJFbGVtKTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIF9vbkRlc3Ryb3kpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZpcmUgYmx1ciBldmVudFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9ibHVyRWxlbSgpIHtcblx0XHRcdFx0JGVsZW0udHJpZ2dlcignYmx1cicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9uICRkZXN0cm95LCB1bmJpbmQgaGFuZGxlcnNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb25EZXN0cm95KCkge1xuXHRcdFx0XHQkZWxlbS51bmJpbmQoJ3RvdWNoZW5kJywgX2JsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCdtb3VzZXVwJywgX2JsdXJFbGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdkZXRlY3RBZGJsb2NrJywgZGV0ZWN0QWRibG9jayk7XG5cblx0ZGV0ZWN0QWRibG9jay4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrKCR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogZGV0ZWN0QWRibG9ja0xpbmssXG5cdFx0XHR0ZW1wbGF0ZTogICAnPGRpdiBjbGFzcz1cImFkLXRlc3QgZmEtZmFjZWJvb2sgZmEtdHdpdHRlclwiIHN0eWxlPVwiaGVpZ2h0OjFweDtcIj48L2Rpdj4nICtcblx0XHRcdFx0XHRcdCc8ZGl2IG5nLWlmPVwiYWIuYmxvY2tlZFwiIGNsYXNzPVwiYWItbWVzc2FnZSBhbGVydCBhbGVydC1kYW5nZXJcIj4nICtcblx0XHRcdFx0XHRcdCc8aSBjbGFzcz1cImZhIGZhLWJhblwiPjwvaT4gPHN0cm9uZz5BZEJsb2NrPC9zdHJvbmc+IGlzIHByb2hpYml0aW5nIGltcG9ydGFudCBmdW5jdGlvbmFsaXR5ISBQbGVhc2UgZGlzYWJsZSBhZCBibG9ja2luZyBvbiA8c3Ryb25nPnt7YWIuaG9zdH19PC9zdHJvbmc+LiBUaGlzIHNpdGUgaXMgYWQtZnJlZS4nICtcblx0XHRcdFx0XHRcdCc8L2Rpdj4nXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGRldGVjdEFkQmxvY2sgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0XHQkc2NvcGUuYWIgPSB7fTtcblxuXHRcdFx0XHQvLyBob3N0bmFtZSBmb3IgbWVzc2FnaW5nXG5cdFx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGl2aWRlcicsIGRpdmlkZXIpO1xuXG5cdGZ1bmN0aW9uIGRpdmlkZXIoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInJCb3gtZGl2aWRlclwiPjxpIGNsYXNzPVwiZmEgZmEtY3V0bGVyeVwiPjwvaT48L2Rpdj4nXG5cdFx0fTtcblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3VpL2xvYWRpbmcudHBsLmh0bWwnLFxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcblx0XHRcdGNvbnRyb2xsZXI6IGxvYWRpbmdDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogbG9hZGluZ0xpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbG9hZGluZyBMSU5LXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkaW5nTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIGxvYWRpbmcpIHtcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vICR3YXRjaCBhY3RpdmUgc3RhdGVcblx0XHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9hZGluZy5hY3RpdmUnLCBfJHdhdGNoQWN0aXZlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxuXHRcdFx0ICogdG8gcHJldmVudCBzY3JvbGxiYXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Ym9vbGVhbn1cblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEFjdGl2ZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0X29wZW4oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbG9hZGluZ1xuXHRcdFx0ICogRGlzYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3BlbigpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbG9hZGluZ1xuXHRcdFx0ICogRW5hYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZSgpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnYXV0bydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiBsb2FkaW5nIENPTlRST0xMRVJcblx0ICogVXBkYXRlIHRoZSBsb2FkaW5nIHN0YXR1cyBiYXNlZFxuXHQgKiBvbiByb3V0ZUNoYW5nZSBzdGF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbG9hZGluZ0N0cmwoJHNjb3BlKSB7XG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vbicsIF9sb2FkaW5nQWN0aXZlKTtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nQWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGluYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nSW5hY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cmltU3RyJywgdHJpbVN0cik7XG5cblx0ZnVuY3Rpb24gdHJpbVN0cigpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyLCBjaGFycykge1xuXHRcdFx0dmFyIHRyaW1tZWRTdHIgPSBzdHI7XG5cdFx0XHR2YXIgX2NoYXJzID0gYW5ndWxhci5pc1VuZGVmaW5lZChjaGFycykgPyA1MCA6IGNoYXJzO1xuXG5cdFx0XHRpZiAoc3RyLmxlbmd0aCA+IF9jaGFycykge1xuXHRcdFx0XHR0cmltbWVkU3RyID0gc3RyLnN1YnN0cigwLCBfY2hhcnMpICsgJy4uLic7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cmltbWVkU3RyO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnVXRpbHMnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgJGF1dGgsIHVzZXJEYXRhLCBVdGlscykge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGxvZ291dDtcclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGluZGV4SXNBY3RpdmU7XHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBuYXZJc0FjdGl2ZTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2dvdXQoKSB7XHJcblx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSB1bmRlZmluZWQ7XHJcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIGFkbWluVXNlciBpcyB1bmRlZmluZWQsXHJcblx0XHQgKiBnZXQgdGhlIHVzZXIgYW5kIHNldCBhZG1pblVzZXIgYm9vbGVhbi5cclxuXHRcdCAqXHJcblx0XHQgKiBEbyB0aGlzIG9uIGZpcnN0IGNvbnRyb2xsZXIgbG9hZCAoaW5pdCwgcmVmcmVzaClcclxuXHRcdCAqIGFuZCBzdWJzZXF1ZW50IGxvY2F0aW9uIGNoYW5nZXMgKGllLCBjYXRjaGluZyBsb2dvdXQsIGxvZ2luLCBldGMpLlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9jaGVja1VzZXJBZG1pbigpIHtcclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdFx0aGVhZGVyLnVzZXIgPSBkYXRhO1xyXG5cdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgZ2V0IHVzZXIgZGF0YVxyXG5cdFx0XHRpZiAoVXRpbHMuaXNBdXRoZW50aWNhdGVkKCkgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChoZWFkZXIudXNlcikpIHtcclxuXHRcdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcclxuXHRcdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdF9jaGVja1VzZXJBZG1pbigpO1xyXG5cdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbmF2Q29udHJvbCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcblx0XHRcdHZhciBfbmF2T3BlbjtcblxuXHRcdFx0Ly8gZGF0YSBtb2RlbFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcblx0XHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcblx0XHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzaXplZCB3aW5kb3cgKGRlYm91bmNlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X2xheW91dENhbnZhcy5jc3Moe1xuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKF9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZShtcSkge1xuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ1V0aWxzJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCBQYWdlLCBVdGlscywgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ015IEFjY291bnQnKTtcblxuXHRcdGFjY291bnQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ1VzZXIgSW5mbycsXG5cdFx0XHRcdHF1ZXJ5OiAndXNlci1pbmZvJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ01hbmFnZSBMb2dpbnMnLFxuXHRcdFx0XHRxdWVyeTogJ21hbmFnZS1sb2dpbnMnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICd1c2VyLWluZm8nO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRhY2NvdW50LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0YWNjb3VudC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8vIGFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdGFjY291bnQuaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBBY2NvdW50IFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRhY2NvdW50LnVzZXIgPSBkYXRhO1xuXHRcdFx0XHRhY2NvdW50LmFkbWluaXN0cmF0b3IgPSBhY2NvdW50LnVzZXIuaXNBZG1pbjtcblx0XHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0XHRhY2NvdW50LnNob3dBY2NvdW50ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IGFuIGVycm9yIGFsZXJ0IGluIHRoZSBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0XHRhY2NvdW50LmVycm9yR2V0dGluZ1VzZXIgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0X2J0blNhdmVSZXNldCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfd2F0Y2hEaXNwbGF5TmFtZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCA9PT0gJycgfHwgbmV3VmFsID09PSBudWxsKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRW50ZXIgTmFtZSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGFjY291bnQudXBkYXRlUHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2VzcyBjYWxsYmFjayB3aGVuIHByb2ZpbGUgaGFzIGJlZW4gdXBkYXRlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlZCEnO1xuXG5cdFx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUpIHtcblx0XHRcdFx0Ly8gU2V0IHN0YXR1cyB0byBTYXZpbmcuLi4gYW5kIHVwZGF0ZSB1cG9uIHN1Y2Nlc3Mgb3IgZXJyb3IgaW4gY2FsbGJhY2tzXG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHVzZXIsIHBhc3NpbmcgcHJvZmlsZSBkYXRhIGFuZCBhc3NpZ25pbmcgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzXG5cdFx0XHRcdHVzZXJEYXRhLnVwZGF0ZVVzZXIocHJvZmlsZURhdGEpLnRoZW4oX3VwZGF0ZVN1Y2Nlc3MsIF91cGRhdGVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIExpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVubGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC51bmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgudW5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSA/IHJlc3BvbnNlLmRhdGEubWVzc2FnZSA6ICdDb3VsZCBub3QgdW5saW5rICcgKyBwcm92aWRlciArICcgYWNjb3VudCcpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ1V0aWxzJywgJ3VzZXJEYXRhJywgJ1VzZXInXTtcblxuXHRmdW5jdGlvbiBBZG1pbkN0cmwoUGFnZSwgVXRpbHMsIHVzZXJEYXRhLCBVc2VyKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdBZG1pbicpO1xuXG5cdFx0YWRtaW4uaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciB1bnN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IFVuYXV0aG9yaXplZCBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtlcnJvcn0gcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR1c2VyRGF0YS5nZXRBbGxVc2VycygpLnRoZW4oX2dldEFsbFVzZXJzU3VjY2VzcywgX2dldEFsbFVzZXJzRXJyb3IpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdVdGlscycsICd1c2VyRGF0YScsICckbG9jYXRpb24nXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCBQYWdlLCByZWNpcGVEYXRhLCBSZWNpcGUsIFV0aWxzLCB1c2VyRGF0YSwgJGxvY2F0aW9uKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcclxuXHRcdHZhciBpO1xyXG5cdFx0dmFyIG47XHJcblx0XHR2YXIgdDtcclxuXHJcblx0XHRQYWdlLnNldFRpdGxlKCdBbGwgUmVjaXBlcycpO1xyXG5cclxuXHRcdGhvbWUudGFicyA9IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdSZWNpcGUgQm94ZXMnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveGVzJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1NlYXJjaCAvIEJyb3dzZSBBbGwnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAnc2VhcmNoLWJyb3dzZS1hbGwnXHJcblx0XHRcdH1cclxuXHRcdF07XHJcblx0XHRob21lLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94ZXMnO1xyXG5cclxuXHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVudGVyIG1vYmlsZSAtIHZpZXcgaXMgc21hbGxcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IG1vYmlsZSAtIHZpZXcgaXMgbGFyZ2VcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoYW5nZSB0YWJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xyXG5cdFx0ICovXHJcblx0XHRob21lLmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XHJcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XHJcblx0XHRcdGhvbWUuY3VycmVudFRhYiA9IHF1ZXJ5O1xyXG5cdFx0fTtcclxuXHJcblx0XHRob21lLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcclxuXHRcdGhvbWUudGFncyA9IFJlY2lwZS50YWdzO1xyXG5cclxuXHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgY2F0ZWdvcmllc1xyXG5cdFx0aG9tZS5tYXBDYXRlZ29yaWVzID0ge307XHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgaG9tZS5jYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGhvbWUubWFwQ2F0ZWdvcmllc1tob21lLmNhdGVnb3JpZXNbaV1dID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBidWlsZCBoYXNobWFwIG9mIHRhZ3NcclxuXHRcdGhvbWUubWFwVGFncyA9IHt9O1xyXG5cdFx0Zm9yIChuID0gMDsgbiA8IGhvbWUudGFncy5sZW5ndGg7IG4rKykge1xyXG5cdFx0XHRob21lLm1hcFRhZ3NbaG9tZS50YWdzW25dXSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnJlY2lwZXMgPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gY291bnQgbnVtYmVyIG9mIHJlY2lwZXMgcGVyIGNhdGVnb3J5IGFuZCB0YWdcclxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGhvbWUucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW3JlY2lwZS5jYXRlZ29yeV0gKz0gMTtcclxuXHJcblx0XHRcdFx0Zm9yICh0ID0gMDsgdCA8IHJlY2lwZS50YWdzLmxlbmd0aDsgdCsrKSB7XHJcblx0XHRcdFx0XHRob21lLm1hcFRhZ3NbcmVjaXBlLnRhZ3NbdF1dICs9IDE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZhaWx1cmUgdG8gcmV0dXJuIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGVycm9yXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc0ZhaWx1cmUoZXJyb3IpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1RoZXJlIHdhcyBhbiBlcnJvciByZXRyaWV2aW5nIHJlY2lwZXM6JywgZXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXHJcblx0XHRcdC50aGVuKF9wdWJsaWNSZWNpcGVzU3VjY2VzcywgX3B1YmxpY1JlY2lwZXNGYWlsdXJlKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS51c2VyID0gZGF0YTtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ0hlbGxvLCAnICsgaG9tZS51c2VyLmRpc3BsYXlOYW1lICsgJyEgV2FudCB0byA8YSBocmVmPVwiL215LXJlY2lwZXM/dmlldz1uZXctcmVjaXBlXCI+YWRkIGEgbmV3IHJlY2lwZTwvYT4/JztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkKGhvbWUudXNlcikpIHtcclxuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdH0gZWxzZSBpZiAoIVV0aWxzLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcblx0XHRcdGhvbWUud2VsY29tZU1zZyA9ICdXZWxjb21lIHRvIDxzdHJvbmc+ckJveDwvc3Ryb25nPiEgQnJvd3NlIHRocm91Z2ggdGhlIHB1YmxpYyByZWNpcGUgYm94IG9yIDxhIGhyZWY9XCIvbG9naW5cIj5Mb2dpbjwvYT4gdG8gZmlsZSBvciBjb250cmlidXRlIHJlY2lwZXMuJztcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5cdExvZ2luQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ1V0aWxzJywgJyRhdXRoJywgJ09BVVRIJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gTG9naW5DdHJsKFBhZ2UsIFV0aWxzLCAkYXV0aCwgT0FVVEgsICRyb290U2NvcGUsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbG9naW4gPSB0aGlzO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTG9naW4nKTtcblxuXHRcdGxvZ2luLmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblx0XHRsb2dpbi5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cblx0XHQvKipcblx0XHQgKiBBdXRoZW50aWNhdGUgdGhlIHVzZXIgdmlhIE9hdXRoIHdpdGggdGhlIHNwZWNpZmllZCBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyIC0gKHR3aXR0ZXIsIGZhY2Vib29rLCBnaXRodWIsIGdvb2dsZSlcblx0XHQgKi9cblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdFx0ICogR28gdG8gaW5pdGlhbGx5IGludGVuZGVkIGF1dGhlbnRpY2F0ZWQgcGF0aFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoJHJvb3RTY29wZS5hdXRoUGF0aCkge1xuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgYXV0aGVudGljYXRpbmdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aENhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSAnZXJyb3InO1xuXHRcdFx0XHRsb2dpbi5sb2dpbk1zZyA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHQkYXV0aC5hdXRoZW50aWNhdGUocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKF9hdXRoU3VjY2Vzcylcblx0XHRcdFx0LmNhdGNoKF9hdXRoQ2F0Y2gpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcblx0XHQgKi9cblx0XHRsb2dpbi5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XG5cdFx0fTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ015UmVjaXBlc0N0cmwnLCBNeVJlY2lwZXNDdHJsKTtcblxuXHRNeVJlY2lwZXNDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnVXRpbHMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnJHNjb3BlJ107XG5cblx0ZnVuY3Rpb24gTXlSZWNpcGVzQ3RybChQYWdlLCBVdGlscywgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRsb2NhdGlvbiwgJHNjb3BlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBteVJlY2lwZXMgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBSZWNpcGVzJyk7XG5cblx0XHRteVJlY2lwZXMudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdmaWxlZC1yZWNpcGVzJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICduZXctcmVjaXBlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94JztcblxuXHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgLSBzZXQgc2hvcnRlciB0YWIgbmFtZXNcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdSZWNpcGUgQm94Jztcblx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQnO1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdOZXcgUmVjaXBlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSAtIHNldCBsb25nZXIgdGFiIG5hbWVzXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdNeSBSZWNpcGUgQm94Jztcblx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQgUmVjaXBlcyc7XG5cdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ0FkZCBOZXcgUmVjaXBlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdG15UmVjaXBlcy5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdG15UmVjaXBlcy5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgc2F2ZWRSZWNpcGVzT2JqID0ge3NhdmVkUmVjaXBlczogZGF0YS5zYXZlZFJlY2lwZXN9O1xuXHRcdFx0bXlSZWNpcGVzLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHNhdmVkIHJlY2lwZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlcyB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVkU3VjY2VzcyhyZWNpcGVzKSB7XG5cdFx0XHRcdG15UmVjaXBlcy5maWxlZFJlY2lwZXMgPSByZWNpcGVzO1xuXHRcdFx0fVxuXHRcdFx0cmVjaXBlRGF0YS5nZXRGaWxlZFJlY2lwZXMoc2F2ZWRSZWNpcGVzT2JqKVxuXHRcdFx0XHQudGhlbihfZmlsZWRTdWNjZXNzKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldE15UmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignRWRpdFJlY2lwZUN0cmwnLCBFZGl0UmVjaXBlQ3RybCk7XG5cblx0RWRpdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdVdGlscycsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBFZGl0UmVjaXBlQ3RybChQYWdlLCBVdGlscywgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgZWRpdCA9IHRoaXM7XG5cdFx0dmFyIF9yZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgUmVjaXBlJyk7XG5cblx0XHRlZGl0LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdFZGl0IFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZWRpdCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdEZWxldGUgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdkZWxldGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRlZGl0LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdlZGl0JztcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZWRpdC5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGVkaXQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHRlZGl0LmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnVzZXIgPSBkYXRhO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gZGF0YTtcblx0XHRcdGVkaXQub3JpZ2luYWxOYW1lID0gZWRpdC5yZWNpcGUubmFtZTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgJyArIGVkaXQub3JpZ2luYWxOYW1lKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciByZXRyaWV2aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IoZXJyKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0ZWRpdC5lcnJvck1zZyA9IGVyci5kYXRhLm1lc3NhZ2U7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UmVjaXBlKF9yZWNpcGVTbHVnKVxuXHRcdFx0LnRoZW4oX3JlY2lwZVN1Y2Nlc3MsIF9yZWNpcGVFcnJvcik7XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBkZWxldGUgYnV0dG9uXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldERlbGV0ZUJ0bigpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9IGZhbHNlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZSBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdF9yZXNldERlbGV0ZUJ0bigpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGFmdGVyIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSB0cnVlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZWQhJztcblxuXHRcdFx0ZnVuY3Rpb24gX2dvVG9SZWNpcGVzKCkge1xuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL215LXJlY2lwZXMnKTtcblx0XHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfZ29Ub1JlY2lwZXMsIDE1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlRXJyb3IoKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSAnZXJyb3InO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0Vycm9yIGRlbGV0aW5nISc7XG5cblx0XHRcdCR0aW1lb3V0KF9yZXNldERlbGV0ZUJ0biwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0ZWRpdC5kZWxldGVSZWNpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGluZy4uLic7XG5cdFx0XHRyZWNpcGVEYXRhLmRlbGV0ZVJlY2lwZShlZGl0LnJlY2lwZS5faWQpXG5cdFx0XHRcdC50aGVuKF9kZWxldGVTdWNjZXNzLCBfZGVsZXRlRXJyb3IpO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVDdHJsJywgUmVjaXBlQ3RybCk7XG5cblx0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ1V0aWxzJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlQ3RybChQYWdlLCBVdGlscywgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmVjaXBlID0gdGhpcztcblx0XHR2YXIgcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnUmVjaXBlJyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSB1c2VyIGluZm9cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUudXNlciA9IGRhdGE7XG5cblx0XHRcdC8vIGxvZ2dlZCBpbiB1c2VycyBjYW4gZmlsZSByZWNpcGVzXG5cdFx0XHRyZWNpcGUuZmlsZVRleHQgPSAnRmlsZSB0aGlzIHJlY2lwZSc7XG5cdFx0XHRyZWNpcGUudW5maWxlVGV4dCA9ICdSZW1vdmUgZnJvbSBGaWxlZCBSZWNpcGVzJztcblx0XHR9XG5cdFx0aWYgKFV0aWxzLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gcmVjaXBlIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRyZWNpcGUucmVjaXBlID0gZGF0YTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmVjaXBlLnJlY2lwZS5uYW1lKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIGF1dGhvciBkYXRhXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IGF1dGhvciBwaWN0dXJlLCBkaXNwbGF5TmFtZVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhvclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRyZWNpcGUuYXV0aG9yID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdHVzZXJEYXRhLmdldEF1dGhvcihyZWNpcGUucmVjaXBlLnVzZXJJZClcblx0XHRcdFx0LnRoZW4oX2F1dGhvclN1Y2Nlc3MpO1xuXG5cdFx0XHRyZWNpcGUuaW5nQ2hlY2tlZCA9IFtdO1xuXHRcdFx0cmVjaXBlLnN0ZXBDaGVja2VkID0gW107XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ3JlYXRlIGFycmF5IHRvIGtlZXAgdHJhY2sgb2YgY2hlY2tlZCAvIHVuY2hlY2tlZCBpdGVtc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBjaGVja2VkQXJyXG5cdFx0XHQgKiBAcGFyYW0gc291cmNlQXJyXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY3JlYXRlQ2hlY2tlZEFycmF5cyhjaGVja2VkQXJyLCBzb3VyY2VBcnIpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHNvdXJjZUFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNoZWNrZWRBcnJbaV0gPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfY3JlYXRlQ2hlY2tlZEFycmF5cyhyZWNpcGUuaW5nQ2hlY2tlZCwgcmVjaXBlLnJlY2lwZS5pbmdyZWRpZW50cyk7XG5cdFx0XHRfY3JlYXRlQ2hlY2tlZEFycmF5cyhyZWNpcGUuc3RlcENoZWNrZWQsIHJlY2lwZS5yZWNpcGUuZGlyZWN0aW9ucyk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIGNoZWNrbWFya1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSB0eXBlXG5cdFx0XHQgKiBAcGFyYW0gaW5kZXhcblx0XHRcdCAqL1xuXHRcdFx0cmVjaXBlLnRvZ2dsZUNoZWNrID0gZnVuY3Rpb24odHlwZSwgaW5kZXgpIHtcblx0XHRcdFx0cmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XSA9ICFyZWNpcGVbdHlwZSArICdDaGVja2VkJ11baW5kZXhdO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXMge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IocmVzKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRyZWNpcGUuZXJyb3JNc2cgPSByZXMuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShyZWNpcGVTbHVnKVxuXHRcdFx0LnRoZW4oX3JlY2lwZVN1Y2Nlc3MsIF9yZWNpcGVFcnJvcik7XG5cblx0XHQvKipcblx0XHQgKiBGaWxlIG9yIHVuZmlsZSB0aGlzIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZUlkIHtzdHJpbmd9IElEIG9mIHJlY2lwZSB0byBzYXZlXG5cdFx0ICovXG5cdFx0cmVjaXBlLmZpbGVSZWNpcGUgPSBmdW5jdGlvbihyZWNpcGVJZCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHRyZWNpcGUuYXBpTXNnID0gZGF0YS5hZGRlZCA/ICdSZWNpcGUgc2F2ZWQhJyA6ICdSZWNpcGUgcmVtb3ZlZCEnO1xuXHRcdFx0XHRyZWNpcGUuZmlsZWQgPSBkYXRhLmFkZGVkO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlRXJyb3IocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdHJlY2lwZURhdGEuZmlsZVJlY2lwZShyZWNpcGVJZClcblx0XHRcdFx0LnRoZW4oX2ZpbGVTdWNjZXNzLCBfZmlsZUVycm9yKTtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCdtaW5Ub0gnLCBtaW5Ub0gpO1xuXG5cdGZ1bmN0aW9uIG1pblRvSCgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24obWluKSB7XG5cdFx0XHR2YXIgX2hvdXIgPSA2MDtcblx0XHRcdHZhciBfbWluID0gbWluICogMTtcblx0XHRcdHZhciBfZ3RIb3VyID0gX21pbiAvIF9ob3VyID49IDE7XG5cdFx0XHR2YXIgX2hQbHVzTWluID0gX21pbiAlIF9ob3VyO1xuXHRcdFx0dmFyIF9oYXNNaW51dGVzID0gX2hQbHVzTWluICE9PSAwO1xuXHRcdFx0dmFyIF9ob3VycyA9IE1hdGguZmxvb3IoX21pbiAvIF9ob3VyKTtcblx0XHRcdHZhciBfaG91cnNUZXh0ID0gX2hvdXJzID09PSAxID8gJyBob3VyJyA6ICcgaG91cnMnO1xuXHRcdFx0dmFyIF9taW51dGVzID0gX2hhc01pbnV0ZXMgPyAnLCAnICsgX2hQbHVzTWluICsgX21pblRleHQoX2hQbHVzTWluKSA6ICcnO1xuXHRcdFx0dmFyIF9ub0hNaW5UZXh0ID0gX21pbiA9PT0gMSA/ICcgbWludXRlJyA6ICcgbWludXRlcyc7XG5cdFx0XHR2YXIgdGltZVN0ciA9IG51bGw7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2V0IG1pbnV0ZS9zIHRleHQgZnJvbSBtaW51dGVzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1pbnV0ZXMge251bWJlcn1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfbWluVGV4dChtaW51dGVzKSB7XG5cdFx0XHRcdGlmIChfaGFzTWludXRlcyAmJiBtaW51dGVzID09PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgbWludXRlJztcblx0XHRcdFx0fSBlbHNlIGlmIChfaGFzTWludXRlcyAmJiBtaW51dGVzICE9PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgbWludXRlcyc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKF9ndEhvdXIpIHtcblx0XHRcdFx0dGltZVN0ciA9IF9ob3VycyArIF9ob3Vyc1RleHQgKyBfbWludXRlcztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRpbWVTdHIgPSBfbWluICsgX25vSE1pblRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aW1lU3RyO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzQXV0aG9yQ3RybCcsIFJlY2lwZXNBdXRob3JDdHJsKTtcblxuXHRSZWNpcGVzQXV0aG9yQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc0F1dGhvckN0cmwoUGFnZSwgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfYWlkID0gJHJvdXRlUGFyYW1zLnVzZXJJZDtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQXV0aG9yJztcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICd0cnVlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBhdXRob3IncyBiYXNpYyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJhLmF1dGhvciA9IGRhdGE7XG5cdFx0XHRyYS5oZWFkaW5nID0gJ1JlY2lwZXMgYnkgJyArIHJhLmF1dGhvci5kaXNwbGF5TmFtZTtcblx0XHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRBdXRob3IoX2FpZClcblx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgdXNlcidzIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5yZWNpcGVzID0gZGF0YTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRBdXRob3JSZWNpcGVzKF9haWQpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0NhdGVnb3J5Q3RybCcsIFJlY2lwZXNDYXRlZ29yeUN0cmwpO1xuXG5cdFJlY2lwZXNDYXRlZ29yeUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNDYXRlZ29yeUN0cmwoUGFnZSwgcmVjaXBlRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF9jYXQgPSAkcm91dGVQYXJhbXMuY2F0ZWdvcnk7XG5cdFx0dmFyIF9jYXRUaXRsZSA9IF9jYXQuc3Vic3RyaW5nKDAsMSkudG9Mb2NhbGVVcHBlckNhc2UoKSArIF9jYXQuc3Vic3RyaW5nKDEpO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNDYXRlZ29yeSc7XG5cdFx0cmEuaGVhZGluZyA9IF9jYXRUaXRsZSArICdzJztcblx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAnZmFsc2UnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgY2F0QXJyID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0aWYgKHJlY2lwZS5jYXRlZ29yeSA9PSBfY2F0VGl0bGUpIHtcblx0XHRcdFx0XHRjYXRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IGNhdEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzVGFnQ3RybCcsIFJlY2lwZXNUYWdDdHJsKTtcblxuXHRSZWNpcGVzVGFnQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc1RhZ0N0cmwoUGFnZSwgcmVjaXBlRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF90YWcgPSAkcm91dGVQYXJhbXMudGFnO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNUYWcnO1xuXG5cdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIHRhZ2dlZCBcIicgKyBfdGFnICsgJ1wiJztcblx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICdmYWxzZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgdGFnZ2VkQXJyID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0aWYgKHJlY2lwZS50YWdzLmluZGV4T2YoX3RhZykgPiAtMSkge1xuXHRcdFx0XHRcdHRhZ2dlZEFyci5wdXNoKHJlY2lwZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyYS5yZWNpcGVzID0gdGFnZ2VkQXJyO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

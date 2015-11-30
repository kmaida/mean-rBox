angular
	.module('rBox', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'satellizer', 'slugifier', 'ngFileUpload']);
// login account constants
(function() {
	'use strict';

	angular
		.module('rBox')
		.constant('OAUTH', {
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
		});
})();
// login/Oauth constants
(function() {
	'use strict';

	angular
		.module('rBox')
		.constant('OAUTHCLIENTS', {
			LOGINURL: 'http://rbox.kmaida.io/auth/login',
			CLIENT: {
				FB: '360173197505650',
				GOOGLE: '362136322942-k45h52q3uq56dc1gas1f52c0ulhg5190.apps.googleusercontent.com',
				TWITTER: '/auth/twitter',
				GITHUB: '9ff097299c86e524b10f'
			}
		});
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', 'MQ', 'mediaCheck'];

	function PageCtrl(Page, $scope, MQ, mediaCheck) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var mc = mediaCheck.init({
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
			if (next.$$route && next.$$route.resolve) {
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
			mc.matchCurrent(MQ.SMALL);

			if (current.$$route && current.$$route.resolve) {
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
			if (_handlingRouteChangeError) {
				return;
			}

			_handlingRouteChangeError = true;
			_loadingOff();

			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			console.log(msg);

			/**
			 * On routing error, show an error.
			 */
			alert('An error occurred. Please try again.');
		}
	}
})();
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
})();
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
})();
// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('viewSwitch', viewSwitch);

	viewSwitch.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function viewSwitch(mediaCheck, MQ, $timeout) {

		viewSwitchLink.$inject = ['$scope'];

		/**
		 * viewSwitch directive link function
		 *
		 * @param $scope
		 */
		function viewSwitchLink($scope) {
			// data object
			$scope.vs = {};

			/**
			 * Function to execute on enter media query
			 *
			 * @private
			 */
			function _enterFn() {
				$timeout(function () {
					$scope.vs.viewformat = 'small';
				});
			}

			/**
			 * Function to execute on exit media query
			 *
			 * @private
			 */
			function _exitFn() {
				$timeout(function () {
					$scope.vs.viewformat = 'large';
				});
			}

			// Initialize mediaCheck
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _enterFn,
				exit: _exitFn
			});
		}

		return {
			restrict: 'EA',
			link: viewSwitchLink
		};
	}
})();
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
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			if (next && next.$$route && next.$$route.secure && !$auth.isAuthenticated()) {
				$rootScope.authPath = $location.path();

				$rootScope.$evalAsync(function() {
					// send user to login
					$location.path('/login');
				});
			}
		});
	}

})();
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
})();
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
			if (typeof response.data === 'object') {
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
})();
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
})();
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
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Recipe', Recipe);

	function Recipe() {
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

		return {
			dietary: dietary,
			insertChar: insertChar,
			categories: categories,
			tags: tags
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['$timeout', 'mediaCheck', 'MQ'];

	function recipeForm($timeout, mediaCheck, MQ) {
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

			function _exitMobile(mq) {
				$scope.rfl.isLargeView = true;
			}

			function _enterMobile(mq) {
				$scope.rfl.isLargeView = false;
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

			for (var i = 0; i < 5; i++) {
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

		// setup special characters private vars
		var _lastInput;
		var _ingIndex;
		var _caretPos;

		/**
		 * Set selection range
		 *
		 * @param input
		 * @param selectionStart {number}
		 * @param selectionEnd {number}
		 * @private
		 */
		function _setSelectionRange(input, selectionStart, selectionEnd) {
			if (input.setSelectionRange) {
				input.click();
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			}
			else if (input.createTextRange) {
				var range = input.createTextRange();
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
			if (_lastInput) {
				var _textVal = rf.recipeData.ingredients[_ingIndex].amt === undefined ? '' : rf.recipeData.ingredients[_ingIndex].amt;

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
					$timeout(function () {
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
})();
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
		var _lastSortedBy = 'name';

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

		// number of recipes to show/add in a set
		var _resultsSet = 15;

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
			if (!!rl.query) {
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

		var _openFiltersOnload = $scope.$watch('rl.openFilters', function(newVal, oldVal) {
			if (newVal !== undefined) {
				rl.showSearchFilter = newVal === 'true';
				_openFiltersOnload();
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
})();
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
})();
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
})();
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

})();
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

})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('trimStr', trimStr);

	function trimStr() {
		return function(str, chars) {
			var trimmedStr = str;
			var _chars = chars === undefined ? 50 : chars;

			if (str.length > _chars) {
				trimmedStr = str.substr(0, _chars) + '...';
			}

			return trimmedStr;
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', '$auth', 'userData'];

	function headerCtrl($scope, $location, $auth, userData) {
		// controllerAs ViewModel
		var header = this;

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		header.logout = function() {
			header.adminUser = undefined;
			$auth.logout('/login');
		};

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
			if ($auth.isAuthenticated() && header.user === undefined) {
				userData.getUser()
					.then(_getUserSuccess);
			}
		}
		_checkUserAdmin();
		$scope.$on('$locationChangeSuccess', _checkUserAdmin);

		/**
		 * Is the user authenticated?
		 * Needs to be a function so it is re-executed
		 *
		 * @returns {boolean}
		 */
		header.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Currently active nav item when '/' index
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		header.indexIsActive = function(path) {
			// path should be '/'
			return $location.path() === path;
		};

		/**
		 * Currently active nav item
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		header.navIsActive = function(path) {
			return $location.path().substr(0, path.length) === path;
		};
	}

})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('navControl', navControl);

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout', '$window'];

	function navControl(mediaCheck, MQ, $timeout, $window) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _win = angular.element($window);
			var _body = angular.element('body');
			var _layoutCanvas = _body.find('.layout-canvas');
			var _navOpen;
			var _debounceResize;

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css('min-height', $window.innerHeight + 'px');
			}

			/**
			 * Bind resize event to window
			 * Apply min-height to layout to
			 * make nav full-height
			 */
			function _layoutHeight() {
				$timeout.cancel(_debounceResize);
				_debounceResize = $timeout(_resized, 200);
			}

			// run initial layout height calculation
			_layoutHeight();

			// bind height calculation to window resize
			_win.bind('resize', _layoutHeight);

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_body
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
				_body
						.removeClass('nav-open')
						.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile() {
				_closeNav();

				$timeout(function () {
					// toggle mobile navigation open/closed
					$scope.nav.toggleNav = function () {
						if (!_navOpen) {
							_openNav();
						} else {
							_closeNav();
						}
					};
				});

				$scope.$on('$locationChangeStart', _closeNav);
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile() {
				$timeout(function () {
					$scope.nav.toggleNav = null;
				});

				_body.removeClass('nav-closed nav-open');
			}

			/**
			 * Unbind resize listener on destruction of scope
			 */
			$scope.$on('$destroy', function() {
				win.unbind('resize', _layoutHeight);
			});

			// Set up functionality to run on enter/exit of media query
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			});
		}

		return {
			restrict: 'EA',
			link: navControlLink
		};
	}

})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', 'Page', '$auth', 'userData', '$timeout', 'OAUTH', 'User', '$location'];

	function AccountCtrl($scope, Page, $auth, userData, $timeout, OAUTH, User, $location) {
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

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		account.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

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

			if (!!account.user.displayName) {
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
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['Page', '$auth', 'userData', 'User'];

	function AdminCtrl(Page, $auth, userData, User) {
		// controllerAs ViewModel
		var admin = this;

		Page.setTitle('Admin');

		/**
		 * Determines if the user is authenticated
		 *
		 * @returns {boolean}
		 */
		admin.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

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
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['Page', 'recipeData', 'Recipe', '$auth', 'userData', '$location'];

	function HomeCtrl(Page, recipeData, Recipe, $auth, userData, $location) {
		// controllerAs ViewModel
		var home = this;

		Page.setTitle('All Recipes');

		var _tab = $location.search().view;

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
		for (var i = 0; i < home.categories.length; i++) {
			home.mapCategories[home.categories[i]] = 0;
		}

		// build hashmap of tags
		home.mapTags = {};
		for (var n = 0; n < home.tags.length; n++) {
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

				for (var t = 0; t < recipe.tags.length; t++) {
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
		if ($auth.isAuthenticated() && home.user === undefined) {
			userData.getUser()
				.then(_getUserSuccess);
		} else if (!$auth.isAuthenticated()) {
			home.welcomeMsg = 'Welcome to <strong>rBox</strong>! Browse through the public recipe box or <a href="/login">Login</a> to file or contribute recipes.';
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('LoginCtrl', LoginCtrl);

	LoginCtrl.$inject = ['Page', '$auth', 'OAUTH', '$rootScope', '$location'];

	function LoginCtrl(Page, $auth, OAUTH, $rootScope, $location) {
		// controllerAs ViewModel
		var login = this;

		Page.setTitle('Login');

		login.logins = OAUTH.LOGINS;

		/**
		 * Check if user is authenticated
		 *
		 * @returns {boolean}
		 */
		login.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

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
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['Page', '$auth', 'recipeData', 'userData', '$location', 'mediaCheck', '$scope', 'MQ', '$timeout'];

	function MyRecipesCtrl(Page, $auth, recipeData, userData, $location, mediaCheck, $scope, MQ, $timeout) {
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

		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: function() {
				$timeout(function() {
					myRecipes.tabs[0].name = 'Recipe Box';
					myRecipes.tabs[1].name = 'Filed';
					myRecipes.tabs[2].name = 'New Recipe';
				});
			},
			exit: function() {
				$timeout(function() {
					myRecipes.tabs[0].name = 'My Recipe Box';
					myRecipes.tabs[1].name = 'Filed Recipes';
					myRecipes.tabs[2].name = 'Add New Recipe';
				});
			}
		});

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		myRecipes.changeTab = function(query) {
			$location.search('view', query);
			myRecipes.currentTab = query;
		};

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		myRecipes.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Successful promise getting user's data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			myRecipes.user = data;
			var savedRecipesObj = {savedRecipes: data.savedRecipes};

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
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['Page', '$auth', '$routeParams', 'recipeData', 'userData', '$location', '$timeout'];

	function EditRecipeCtrl(Page, $auth, $routeParams, recipeData, userData, $location, $timeout) {
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

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		edit.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

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
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['Page', '$auth', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl(Page, $auth, $routeParams, recipeData, userData) {
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
		if ($auth.isAuthenticated()) {
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
				for (var i = 0; i < sourceArr.length; i++) {
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
})();
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
			var timeStr = null;

			/**
			 * Get minute/s text from minutes
			 *
			 * @param minutes {number}
			 * @returns {string}
			 */
			function minText(minutes) {
				if (_hasMinutes && minutes === 1) {
					return ' minute';
				} else if (_hasMinutes && minutes !== 1) {
					return ' minutes';
				}
			}

			if (_gtHour) {
				var hPlusMin = _min % _hour;
				var _hasMinutes = hPlusMin !== 0;
				var hours = Math.floor(_min / _hour);
				var hoursText = hours === 1 ? ' hour' : ' hours';
				var minutes = _hasMinutes ? ', ' + hPlusMin + minText(hPlusMin) : '';

				timeStr = hours + hoursText + minutes;
			} else {
				var noHMinText = _min === 1 ? ' minute' : ' minutes';
				timeStr = _min + noHMinText;
			}

			return timeStr;
		};
	}
})();
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
})();
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
})();
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSENMSUVOVFMuY29uc3RhbnQuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvUGFnZS5mYWN0b3J5LmpzIiwiY29yZS9Vc2VyLmZhY3RvcnkuanMiLCJjb3JlL3ZpZXdTd2l0Y2guZGlyLmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmF1dGguanMiLCJjb3JlL2FwcC1zZXR1cC9hcHAuY29uZmlnLmpzIiwiY29yZS9nZXQtZGF0YS9SZXMuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvcmVjaXBlRGF0YS5mYWN0b3J5LmpzIiwiY29yZS9nZXQtZGF0YS91c2VyRGF0YS5mYWN0b3J5LmpzIiwiY29yZS9yZWNpcGVzL1JlY2lwZS5mYWN0b3J5LmpzIiwiY29yZS9yZWNpcGVzL3JlY2lwZUZvcm0uZGlyLmpzIiwiY29yZS9yZWNpcGVzL3JlY2lwZXNMaXN0LmRpci5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9kaXZpZGVyLmRpci5qcyIsImNvcmUvdWkvdHJpbVN0ci5maWx0ZXIuanMiLCJjb3JlL3VpL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsIm1vZHVsZXMvaGVhZGVyL0hlYWRlci5jdHJsLmpzIiwibW9kdWxlcy9oZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJwYWdlcy9hY2NvdW50L0FjY291bnQuY3RybC5qcyIsInBhZ2VzL2FkbWluL0FkbWluLmN0cmwuanMiLCJwYWdlcy9ob21lL0hvbWUuY3RybC5qcyIsInBhZ2VzL2xvZ2luL0xvZ2luLmN0cmwuanMiLCJwYWdlcy9teS1yZWNpcGVzL015UmVjaXBlcy5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL0VkaXRSZWNpcGUuY3RybC5qcyIsInBhZ2VzL3JlY2lwZS9SZWNpcGUuY3RybC5qcyIsInBhZ2VzL3JlY2lwZS9taW5Ub0guZmlsdGVyLmpzIiwicGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXV0aG9yLmN0cmwuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNDYXRlZ29yeS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzVGFnLmN0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAnc2F0ZWxsaXplcicsICdzbHVnaWZpZXInLCAnbmdGaWxlVXBsb2FkJ10pOyIsIi8vIGxvZ2luIGFjY291bnQgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIHtcblx0XHRcdExPR0lOUzogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dvb2dsZScsXG5cdFx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2FjY291bnRzLmdvb2dsZS5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdFx0bmFtZTogJ1R3aXR0ZXInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly90d2l0dGVyLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdmYWNlYm9vaycsXG5cdFx0XHRcdFx0bmFtZTogJ0ZhY2Vib29rJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dpdGh1YicsXG5cdFx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2dpdGh1Yi5jb20nXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSENMSUVOVFMnLCB7XG5cdFx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHRcdENMSUVOVDoge1xuXHRcdFx0XHRGQjogJzM2MDE3MzE5NzUwNTY1MCcsXG5cdFx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRcdFRXSVRURVI6ICcvYXV0aC90d2l0dGVyJyxcblx0XHRcdFx0R0lUSFVCOiAnOWZmMDk3Mjk5Yzg2ZTUyNGIxMGYnXG5cdFx0XHR9XG5cdFx0fSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckc2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjayddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UsICRzY29wZSwgTVEsIG1lZGlhQ2hlY2spIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XG5cdFx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZW50ZXItbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZXhpdC1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9uJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3RhcnQoJGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7XG5cdFx0XHRcdF9sb2FkaW5nT24oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3VjY2VzcyBoYW5kbGVyXG5cdFx0ICogTWF0Y2ggY3VycmVudCBtZWRpYSBxdWVyeSBhbmQgcnVuIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG5cdFx0ICogSWYgY3VycmVudCByb3V0ZSBoYXMgYmVlbiByZXNvbHZlZCwgdHVybiBvZmYgbG9hZGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcblx0XHRcdG1jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cblx0XHRcdGlmIChjdXJyZW50LiQkcm91dGUgJiYgY3VycmVudC4kJHJvdXRlLnJlc29sdmUpIHtcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cdFx0XHRfbG9hZGluZ09mZigpO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xuXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XG5cdFx0Ly8gcHJpdmF0ZSB2YXJzXG5cdFx0dmFyIHNpdGVUaXRsZSA9ICdyQm94Jztcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0FsbCBSZWNpcGVzJztcblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFRpdGxlIGZ1bmN0aW9uXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArICcgfCAnICsgcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TGlua2VkQWNjb3VudHM6IGdldExpbmtlZEFjY291bnRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhcnJheSBvZiBhIHVzZXIncyBjdXJyZW50bHktbGlua2VkIGFjY291bnQgbG9naW5zXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlck9ialxuXHRcdCAqIEByZXR1cm5zIHtBcnJheX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMaW5rZWRBY2NvdW50cyh1c2VyT2JqKSB7XG5cdFx0XHR2YXIgbGlua2VkQWNjb3VudHMgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKE9BVVRILkxPR0lOUywgZnVuY3Rpb24oYWN0T2JqKSB7XG5cdFx0XHRcdHZhciBhY3QgPSBhY3RPYmouYWNjb3VudDtcblxuXHRcdFx0XHRpZiAodXNlck9ialthY3RdKSB7XG5cdFx0XHRcdFx0bGlua2VkQWNjb3VudHMucHVzaChhY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGxpbmtlZEFjY291bnRzO1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBGb3IgZXZlbnRzIGJhc2VkIG9uIHZpZXdwb3J0IHNpemUgLSB1cGRhdGVzIGFzIHZpZXdwb3J0IGlzIHJlc2l6ZWRcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCd2aWV3U3dpdGNoJywgdmlld1N3aXRjaCk7XG5cblx0dmlld1N3aXRjaC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gdmlld1N3aXRjaChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdHZpZXdTd2l0Y2hMaW5rLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0LyoqXG5cdFx0ICogdmlld1N3aXRjaCBkaXJlY3RpdmUgbGluayBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHZpZXdTd2l0Y2hMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS52cyA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBleGl0IG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluaXRpYWxpemUgbWVkaWFDaGVja1xuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyRm4sXG5cdFx0XHRcdGV4aXQ6IF9leGl0Rm5cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IHZpZXdTd2l0Y2hMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ09BVVRIQ0xJRU5UUyddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlciwgT0FVVEhDTElFTlRTKSB7XG5cdFx0JGF1dGhQcm92aWRlci5sb2dpblVybCA9IE9BVVRIQ0xJRU5UUy5MT0dJTlVSTDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuRkJcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkdPT0dMRVxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogT0FVVEhDTElFTlRTLkNMSUVOVC5UV0lUVEVSXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblxuXHRmdW5jdGlvbiBhdXRoUnVuKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJGF1dGgpIHtcblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdFx0aWYgKG5leHQgJiYgbmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5zZWN1cmUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuYXV0aFBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG5cdFx0XHRcdCRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyBzZW5kIHVzZXIgdG8gbG9naW5cblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cbn0pKCk7IiwiLy8gcm91dGVzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmVjaXBlJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9hdXRob3IvOnVzZXJJZCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNBdXRob3JDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL3RhZy86dGFnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc1RhZ0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvY2F0ZWdvcnkvOmNhdGVnb3J5Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0NhdGVnb3J5Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbXktcmVjaXBlcycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbXktcmVjaXBlcy9NeVJlY2lwZXMudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNeVJlY2lwZXNDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbXlSZWNpcGVzJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRWRpdFJlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlZGl0J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlcycsIFJlcyk7XG5cblx0ZnVuY3Rpb24gUmVzKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3VjY2Vzczogc3VjY2Vzcyxcblx0XHRcdGVycm9yOiBlcnJvclxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKiBVc2VmdWwgZm9yIEFQSXMgKGllLCB3aXRoIG5naW54KSB3aGVyZSBzZXJ2ZXIgZXJyb3IgSFRNTCBwYWdlIG1heSBiZSByZXR1cm5lZCBpbiBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gUmVjaXBlIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdyZWNpcGVEYXRhJywgcmVjaXBlRGF0YSk7XG5cblx0cmVjaXBlRGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFJlY2lwZTogZ2V0UmVjaXBlLFxuXHRcdFx0Y3JlYXRlUmVjaXBlOiBjcmVhdGVSZWNpcGUsXG5cdFx0XHR1cGRhdGVSZWNpcGU6IHVwZGF0ZVJlY2lwZSxcblx0XHRcdGRlbGV0ZVJlY2lwZTogZGVsZXRlUmVjaXBlLFxuXHRcdFx0Z2V0UHVibGljUmVjaXBlczogZ2V0UHVibGljUmVjaXBlcyxcblx0XHRcdGdldE15UmVjaXBlczogZ2V0TXlSZWNpcGVzLFxuXHRcdFx0Z2V0QXV0aG9yUmVjaXBlczogZ2V0QXV0aG9yUmVjaXBlcyxcblx0XHRcdGZpbGVSZWNpcGU6IGZpbGVSZWNpcGUsXG5cdFx0XHRnZXRGaWxlZFJlY2lwZXM6IGdldEZpbGVkUmVjaXBlcyxcblx0XHRcdGNsZWFuVXBsb2FkczogY2xlYW5VcGxvYWRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGUgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBzbHVnIHtzdHJpbmd9IHJlY2lwZSBzbHVnXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UmVjaXBlKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgcmVjaXBlIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjcmVhdGVSZWNpcGUocmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZS9uZXcnLCByZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYSByZWNpcGUgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSUQgKGluIGNhc2Ugc2x1ZyBoYXMgY2hhbmdlZClcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVJlY2lwZShpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIGEgcmVjaXBlIChERUxFVEUpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGVsZXRlUmVjaXBlKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmRlbGV0ZSgnL2FwaS9yZWNpcGUvJyArIGlkKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRQdWJsaWNSZWNpcGVzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRNeVJlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGEgc3BlY2lmaWMgdXNlcidzIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlcklkIHtzdHJpbmd9IHVzZXIgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3JSZWNpcGVzKHVzZXJJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9hdXRob3IvJyArIHVzZXJJZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRmlsZS91bmZpbGUgdGhpcyByZWNpcGUgaW4gdXNlciBkYXRhIChQVVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmaWxlUmVjaXBlKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIHJlY2lwZUlkICsgJy9maWxlJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IGZpbGVkIHJlY2lwZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWRzIHtBcnJheX0gYXJyYXkgb2YgdXNlcidzIGZpbGVkIHJlY2lwZSBJRHNcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRGaWxlZFJlY2lwZXMocmVjaXBlSWRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlcy9tZS9maWxlZCcsIHJlY2lwZUlkcylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gdXBsb2FkIGZpbGVzIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYW5VcGxvYWRzKGZpbGVzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL2NsZWFuLXVwbG9hZHMnLCBmaWxlcyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldEF1dGhvcjogZ2V0QXV0aG9yLFxuXHRcdFx0Z2V0VXNlcjogZ2V0VXNlcixcblx0XHRcdHVwZGF0ZVVzZXI6IHVwZGF0ZVVzZXIsXG5cdFx0XHRnZXRBbGxVc2VyczogZ2V0QWxsVXNlcnNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QXV0aG9yKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VyLycgKyBpZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSkgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdSZWNpcGUnLCBSZWNpcGUpO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZSgpIHtcblx0XHR2YXIgZGlldGFyeSA9IFtcblx0XHRcdCdHbHV0ZW4tZnJlZScsXG5cdFx0XHQnVmVnYW4nLFxuXHRcdFx0J1ZlZ2V0YXJpYW4nXG5cdFx0XTtcblxuXHRcdHZhciBpbnNlcnRDaGFyID0gW1xuXHRcdFx0J+KFmycsXG5cdFx0XHQnwrwnLFxuXHRcdFx0J+KFkycsXG5cdFx0XHQnwr0nLFxuXHRcdFx0J+KFlCcsXG5cdFx0XHQnwr4nXG5cdFx0XTtcblxuXHRcdHZhciBjYXRlZ29yaWVzID0gW1xuXHRcdFx0J0FwcGV0aXplcicsXG5cdFx0XHQnQmV2ZXJhZ2UnLFxuXHRcdFx0J0Rlc3NlcnQnLFxuXHRcdFx0J0VudHJlZScsXG5cdFx0XHQnU2FsYWQnLFxuXHRcdFx0J1NpZGUnLFxuXHRcdFx0J1NvdXAnXG5cdFx0XTtcblxuXHRcdHZhciB0YWdzID0gW1xuXHRcdFx0J2FsY29ob2wnLFxuXHRcdFx0J2Jha2VkJyxcblx0XHRcdCdiZWVmJyxcblx0XHRcdCdmYXN0Jyxcblx0XHRcdCdmaXNoJyxcblx0XHRcdCdsb3ctY2Fsb3JpZScsXG5cdFx0XHQnb25lLXBvdCcsXG5cdFx0XHQncGFzdGEnLFxuXHRcdFx0J3BvcmsnLFxuXHRcdFx0J3BvdWx0cnknLFxuXHRcdFx0J3Nsb3ctY29vaycsXG5cdFx0XHQnc3RvY2snLFxuXHRcdFx0J3ZlZ2V0YWJsZSdcblx0XHRdO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRpZXRhcnk6IGRpZXRhcnksXG5cdFx0XHRpbnNlcnRDaGFyOiBpbnNlcnRDaGFyLFxuXHRcdFx0Y2F0ZWdvcmllczogY2F0ZWdvcmllcyxcblx0XHRcdHRhZ3M6IHRhZ3Ncblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZUZvcm0nLCByZWNpcGVGb3JtKTtcblxuXHRyZWNpcGVGb3JtLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJ21lZGlhQ2hlY2snLCAnTVEnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVGb3JtKCR0aW1lb3V0LCBtZWRpYUNoZWNrLCBNUSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGU6ICc9Jyxcblx0XHRcdFx0dXNlcklkOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZXMvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVGb3JtTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiByZWNpcGVGb3JtIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWNpcGVGb3JtTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIHNldCB1cCAkc2NvcGUgb2JqZWN0IGZvciBuYW1lc3BhY2luZ1xuXHRcdFx0JHNjb3BlLnJmbCA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZCBuZXcgaXRlbVxuXHRcdFx0ICogSW5ncmVkaWVudCBvciBEaXJlY3Rpb24gc3RlcFxuXHRcdFx0ICogRm9jdXMgdGhlIG5ld2VzdCBpbnB1dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH0gY2xpY2sgZXZlbnRcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSBpbmcgLW9yLSBzdGVwXG5cdFx0XHQgKiBAcGFyYW0gaXNIZWFkaW5nIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBmdW5jdGlvbigkZXZlbnQsIG1vZGVsLCB0eXBlLCBpc0hlYWRpbmcpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLFxuXHRcdFx0XHRcdHR5cGU6IHR5cGVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoaXNIZWFkaW5nKSB7XG5cdFx0XHRcdFx0X25ld0l0ZW0uaXNIZWFkaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1vZGVsLnB1c2goX25ld0l0ZW0pO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBfbmV3ZXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkucGFyZW50KCdwJykucHJldignLmxhc3QnKS5maW5kKCdpbnB1dCcpLmVxKDApO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5mb2N1cygpOyAgIC8vIFRPRE86IGZvY3VzIGlzbid0IGhpZ2hsaWdodGluZyBwcm9wZXJseVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVtb3ZlIGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIGkge2luZGV4fVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihtb2RlbCwgaSkge1xuXHRcdFx0XHRtb2RlbC5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKG1xKSB7XG5cdFx0XHRcdCRzY29wZS5yZmwuaXNMYXJnZVZpZXcgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0JHNjb3BlLnJmbC5pc0xhcmdlVmlldyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE1vdmUgaXRlbSB1cCBvciBkb3duXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtICRldmVudFxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBvbGRJbmRleCB7aW5kZXh9IGN1cnJlbnQgaW5kZXhcblx0XHRcdCAqIEBwYXJhbSBuZXdJbmRleCB7bnVtYmVyfSBuZXcgaW5kZXhcblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlSXRlbSA9IGZ1bmN0aW9uKCRldmVudCwgbW9kZWwsIG9sZEluZGV4LCBuZXdJbmRleCkge1xuXHRcdFx0XHR2YXIgX2l0ZW0gPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnbGknKTtcblxuXHRcdFx0XHRtb2RlbC5tb3ZlKG9sZEluZGV4LCBuZXdJbmRleCk7XG5cblx0XHRcdFx0X2l0ZW0uYWRkQ2xhc3MoJ21vdmVkJyk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0X2l0ZW0ucmVtb3ZlQ2xhc3MoJ21vdmVkJyk7XG5cdFx0XHRcdH0sIDcwMCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkc2NvcGUucmZsLm1vdmVJbmdyZWRpZW50cyA9IGZhbHNlO1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlRGlyZWN0aW9ucyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJlY2lwZUZvcm1DdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdTbHVnJywgJyRsb2NhdGlvbicsICckdGltZW91dCcsICdVcGxvYWQnXTtcblxuXHQvKipcblx0ICogcmVjaXBlRm9ybSBDT05UUk9MTEVSIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSAkc2NvcGVcblx0ICogQHBhcmFtIHJlY2lwZURhdGFcblx0ICogQHBhcmFtIFJlY2lwZVxuXHQgKiBAcGFyYW0gU2x1Z1xuXHQgKiBAcGFyYW0gJGxvY2F0aW9uXG5cdCAqIEBwYXJhbSAkdGltZW91dFxuXHQgKiBAcGFyYW0gVXBsb2FkXG5cdCAqL1xuXHRmdW5jdGlvbiByZWNpcGVGb3JtQ3RybCgkc2NvcGUsIHJlY2lwZURhdGEsIFJlY2lwZSwgU2x1ZywgJGxvY2F0aW9uLCAkdGltZW91dCwgVXBsb2FkKSB7XG5cdFx0dmFyIHJmID0gdGhpcztcblx0XHR2YXIgX2lzRWRpdCA9ICEhcmYucmVjaXBlO1xuXHRcdHZhciBfb3JpZ2luYWxTbHVnID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5zbHVnIDogbnVsbDtcblxuXHRcdHJmLnJlY2lwZURhdGEgPSBfaXNFZGl0ID8gcmYucmVjaXBlIDoge307XG5cdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnVzZXJJZCA6IHJmLnVzZXJJZDtcblx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5waG90byA6IG51bGw7XG5cblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgNS1jaGFyYWN0ZXIgSUQ7XG5cdFx0ICogT24gJHNjb3BlIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlciBhbmQgbGlua1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHQgKi9cblx0XHQkc2NvcGUuZ2VuZXJhdGVJZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIF9pZCA9ICcnO1xuXHRcdFx0dmFyIF9jaGFyc2V0ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcblx0XHRcdFx0X2lkICs9IF9jaGFyc2V0LmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfY2hhcnNldC5sZW5ndGgpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIF9pZDtcblx0XHR9O1xuXG5cdFx0Ly8gaXMgdGhpcyBhIHRvdWNoIGRldmljZT9cblx0XHRyZi5pc1RvdWNoRGV2aWNlID0gISFNb2Rlcm5penIudG91Y2hldmVudHM7XG5cblx0XHQvLyBidWlsZCBsaXN0c1xuXHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmluZ3JlZGllbnRzIDogW3tpZDogJHNjb3BlLmdlbmVyYXRlSWQoKSwgdHlwZTogJ2luZyd9XTtcblx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiBbe2lkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLCB0eXBlOiAnc3RlcCd9XTtcblxuXHRcdHJmLnJlY2lwZURhdGEudGFncyA9IF9pc0VkaXQgPyByZi5yZWNpcGVEYXRhLnRhZ3MgOiBbXTtcblxuXHRcdC8vIG1hbmFnZSB0aW1lIGZpZWxkc1xuXHRcdHJmLnRpbWVSZWdleCA9IC9eWytdPyhbMC05XSsoPzpbXFwuXVswLTldKik/fFxcLlswLTldKykkLztcblx0XHRyZi50aW1lRXJyb3IgPSAnUGxlYXNlIGVudGVyIGEgbnVtYmVyIGluIG1pbnV0ZXMuIE11bHRpcGx5IGhvdXJzIGJ5IDYwLic7XG5cblx0XHQvLyBmZXRjaCBjYXRlZ29yaWVzIG9wdGlvbnMgbGlzdFxuXHRcdHJmLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblxuXHRcdC8vIGZldGNoIHRhZ3Mgb3B0aW9ucyBsaXN0XG5cdFx0cmYudGFncyA9IFJlY2lwZS50YWdzO1xuXG5cdFx0Ly8gZmV0Y2ggZGlldGFyeSBvcHRpb25zIGxpc3Rcblx0XHRyZi5kaWV0YXJ5ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHQvLyBmZXRjaCBzcGVjaWFsIGNoYXJhY3RlcnNcblx0XHRyZi5jaGFycyA9IFJlY2lwZS5pbnNlcnRDaGFyO1xuXG5cdFx0Ly8gc2V0dXAgc3BlY2lhbCBjaGFyYWN0ZXJzIHByaXZhdGUgdmFyc1xuXHRcdHZhciBfbGFzdElucHV0O1xuXHRcdHZhciBfaW5nSW5kZXg7XG5cdFx0dmFyIF9jYXJldFBvcztcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25FbmQge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCkge1xuXHRcdFx0aWYgKGlucHV0LnNldFNlbGVjdGlvblJhbmdlKSB7XG5cdFx0XHRcdGlucHV0LmNsaWNrKCk7XG5cdFx0XHRcdGlucHV0LmZvY3VzKCk7XG5cdFx0XHRcdGlucHV0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaW5wdXQuY3JlYXRlVGV4dFJhbmdlKSB7XG5cdFx0XHRcdHZhciByYW5nZSA9IGlucHV0LmNyZWF0ZVRleHRSYW5nZSgpO1xuXHRcdFx0XHRyYW5nZS5jb2xsYXBzZSh0cnVlKTtcblx0XHRcdFx0cmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0cmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25TdGFydCk7XG5cdFx0XHRcdHJhbmdlLnNlbGVjdCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBjYXJldCBwb3NpdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0ICogQHBhcmFtIHBvcyB7bnVtYmVyfSBpbnRlbmRlZCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3NldENhcmV0VG9Qb3MoaW5wdXQsIHBvcykge1xuXHRcdFx0X3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBwb3MsIHBvcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogS2VlcCB0cmFjayBvZiBjYXJldCBwb3NpdGlvbiBpbiBpbmdyZWRpZW50IGFtb3VudCB0ZXh0IGZpZWxkXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGluZGV4IHtudW1iZXJ9XG5cdFx0ICovXG5cdFx0cmYuaW5zZXJ0Q2hhcklucHV0ID0gZnVuY3Rpb24oJGV2ZW50LCBpbmRleCkge1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9pbmdJbmRleCA9IGluZGV4O1xuXHRcdFx0XHRfbGFzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCcjJyArICRldmVudC50YXJnZXQuaWQpO1xuXHRcdFx0XHRfY2FyZXRQb3MgPSBfbGFzdElucHV0WzBdLnNlbGVjdGlvblN0YXJ0O1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEluc2VydCBjaGFyYWN0ZXIgYXQgbGFzdCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEluIHN1cHBvcnRlZCBmaWVsZFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGNoYXIge3N0cmluZ30gc3BlY2lhbCBjaGFyYWN0ZXJcblx0XHQgKi9cblx0XHRyZi5pbnNlcnRDaGFyID0gZnVuY3Rpb24oY2hhcikge1xuXHRcdFx0aWYgKF9sYXN0SW5wdXQpIHtcblx0XHRcdFx0dmFyIF90ZXh0VmFsID0gcmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCA9PT0gdW5kZWZpbmVkID8gJycgOiByZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10O1xuXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQgPSBfdGV4dFZhbC5zdWJzdHJpbmcoMCwgX2NhcmV0UG9zKSArIGNoYXIgKyBfdGV4dFZhbC5zdWJzdHJpbmcoX2NhcmV0UG9zKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfY2FyZXRQb3MgPSBfY2FyZXRQb3MgKyAxO1xuXHRcdFx0XHRcdF9zZXRDYXJldFRvUG9zKF9sYXN0SW5wdXRbMF0sIF9jYXJldFBvcyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDbGVhciBjYXJldCBwb3NpdGlvbiBhbmQgbGFzdCBpbnB1dFxuXHRcdCAqIFNvIHRoYXQgc3BlY2lhbCBjaGFyYWN0ZXJzIGRvbid0IGVuZCB1cCBpbiB1bmRlc2lyZWQgZmllbGRzXG5cdFx0ICovXG5cdFx0cmYuY2xlYXJDaGFyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRfaW5nSW5kZXggPSBudWxsO1xuXHRcdFx0X2xhc3RJbnB1dCA9IG51bGw7XG5cdFx0XHRfY2FyZXRQb3MgPSBudWxsO1xuXHRcdH07XG5cblx0XHRyZi51cGxvYWRlZEZpbGUgPSBudWxsO1xuXG5cdFx0LyoqXG5cdFx0ICogVXBsb2FkIGltYWdlIGZpbGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBmaWxlcyB7QXJyYXl9IGFycmF5IG9mIGZpbGVzIHRvIHVwbG9hZFxuXHRcdCAqL1xuXHRcdHJmLnVwZGF0ZUZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0aWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoZmlsZXNbMF0uc2l6ZSA+IDMwMDAwMCkge1xuXHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gJ0ZpbGVzaXplIG92ZXIgNTAwa2IgLSBwaG90byB3YXMgbm90IHVwbG9hZGVkLic7XG5cdFx0XHRcdFx0cmYucmVtb3ZlUGhvdG8oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IGZpbGVzWzBdOyAgICAvLyBvbmx5IHNpbmdsZSB1cGxvYWQgYWxsb3dlZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZSB1cGxvYWRlZCBwaG90byBmcm9tIGZyb250LWVuZFxuXHRcdCAqL1xuXHRcdHJmLnJlbW92ZVBob3RvID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gbnVsbDtcblx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IG51bGw7XG5cdFx0XHRhbmd1bGFyLmVsZW1lbnQoJyNyZWNpcGVQaG90bycpLnZhbCgnJyk7XG5cdFx0fTtcblxuXHRcdC8vIGNyZWF0ZSBtYXAgb2YgdG91Y2hlZCB0YWdzXG5cdFx0cmYudGFnTWFwID0ge307XG5cdFx0aWYgKF9pc0VkaXQgJiYgcmYucmVjaXBlRGF0YS50YWdzLmxlbmd0aCkge1xuXHRcdFx0YW5ndWxhci5mb3JFYWNoKHJmLnJlY2lwZURhdGEudGFncywgZnVuY3Rpb24odGFnLCBpKSB7XG5cdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFkZCAvIHJlbW92ZSB0YWdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB0YWcge3N0cmluZ30gdGFnIG5hbWVcblx0XHQgKi9cblx0XHRyZi5hZGRSZW1vdmVUYWcgPSBmdW5jdGlvbih0YWcpIHtcblx0XHRcdHZhciBfYWN0aXZlVGFnSW5kZXggPSByZi5yZWNpcGVEYXRhLnRhZ3MuaW5kZXhPZih0YWcpO1xuXG5cdFx0XHRpZiAoX2FjdGl2ZVRhZ0luZGV4ID4gLTEpIHtcblx0XHRcdFx0Ly8gdGFnIGV4aXN0cyBpbiBtb2RlbCwgdHVybiBpdCBvZmZcblx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnNwbGljZShfYWN0aXZlVGFnSW5kZXgsIDEpO1xuXHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGFnIGRvZXMgbm90IGV4aXN0IGluIG1vZGVsLCB0dXJuIGl0IG9uXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEudGFncy5wdXNoKHRhZyk7XG5cdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gZW1wdHkgaXRlbXMgb3V0IG9mIGFycmF5IGJlZm9yZSBzYXZpbmdcblx0XHQgKiBJbmdyZWRpZW50cyBvciBEaXJlY3Rpb25zXG5cdFx0ICogQWxzbyBjbGVhcnMgb3V0IGVtcHR5IGhlYWRpbmdzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbW9kZWxOYW1lIHtzdHJpbmd9IGluZ3JlZGllbnRzIC8gZGlyZWN0aW9uc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2NsZWFuRW1wdGllcyhtb2RlbE5hbWUpIHtcblx0XHRcdHZhciBfYXJyYXkgPSByZi5yZWNpcGVEYXRhW21vZGVsTmFtZV07XG5cdFx0XHR2YXIgX2NoZWNrID0gbW9kZWxOYW1lID09PSAnaW5ncmVkaWVudHMnID8gJ2luZ3JlZGllbnQnIDogJ3N0ZXAnO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goX2FycmF5LCBmdW5jdGlvbihvYmosIGkpIHtcblx0XHRcdFx0aWYgKCEhb2JqW19jaGVja10gPT09IGZhbHNlICYmICFvYmouaXNIZWFkaW5nIHx8IG9iai5pc0hlYWRpbmcgJiYgISFvYmouaGVhZGluZ1RleHQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0X2FycmF5LnNwbGljZShpLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgc2F2ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0U2F2ZUJ0bigpIHtcblx0XHRcdHJmLnNhdmVkID0gZmFsc2U7XG5cdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZSBSZWNpcGUnIDogJ1NhdmUgUmVjaXBlJztcblx0XHR9XG5cblx0XHRfcmVzZXRTYXZlQnRuKCk7XG5cblx0XHQvKipcblx0XHQgKiBSZWNpcGUgY3JlYXRlZCBvciBzYXZlZCBzdWNjZXNzZnVsbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGUge3Byb21pc2V9IGlmIGVkaXRpbmcgZXZlbnRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlZChyZWNpcGUpIHtcblx0XHRcdHJmLnNhdmVkID0gdHJ1ZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGVkIScgOiAnU2F2ZWQhJztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHbyB0byBuZXcgc2x1ZyAoaWYgbmV3KSBvciB1cGRhdGVkIHNsdWcgKGlmIHNsdWcgY2hhbmdlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ29Ub05ld1NsdWcoKSB7XG5cdFx0XHRcdHZhciBfcGF0aCA9ICFfaXNFZGl0ID8gcmVjaXBlLnNsdWcgOiByZi5yZWNpcGVEYXRhLnNsdWcgKyAnL2VkaXQnO1xuXG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvcmVjaXBlLycgKyBfcGF0aCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghX2lzRWRpdCB8fCBfaXNFZGl0ICYmIF9vcmlnaW5hbFNsdWcgIT09IHJmLnJlY2lwZURhdGEuc2x1Zykge1xuXHRcdFx0XHQkdGltZW91dChfZ29Ub05ld1NsdWcsIDEwMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgMjAwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVjaXBlIG5vdCBzYXZlZCAvIGNyZWF0ZWQgZHVlIHRvIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVFcnJvcihlcnIpIHtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0cmYuc2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgNDAwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2F2ZSByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc2F2ZVJlY2lwZSgpIHtcblx0XHRcdGlmICghX2lzRWRpdCkge1xuXHRcdFx0XHRyZWNpcGVEYXRhLmNyZWF0ZVJlY2lwZShyZi5yZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVjaXBlRGF0YS51cGRhdGVSZWNpcGUocmYucmVjaXBlLl9pZCwgcmYucmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX3JlY2lwZVNhdmVkLCBfcmVjaXBlU2F2ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTYXZlIHJlY2lwZVxuXHRcdCAqIENsaWNrIG9uIHN1Ym1pdFxuXHRcdCAqL1xuXHRcdHJmLnNhdmVSZWNpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRpbmcuLi4nIDogJ1NhdmluZy4uLic7XG5cblx0XHRcdC8vIHByZXAgZGF0YSBmb3Igc2F2aW5nXG5cdFx0XHRyZi5yZWNpcGVEYXRhLnNsdWcgPSBTbHVnLnNsdWdpZnkocmYucmVjaXBlRGF0YS5uYW1lKTtcblx0XHRcdF9jbGVhbkVtcHRpZXMoJ2luZ3JlZGllbnRzJyk7XG5cdFx0XHRfY2xlYW5FbXB0aWVzKCdkaXJlY3Rpb25zJyk7XG5cblx0XHRcdC8vIHNhdmUgdXBsb2FkZWQgZmlsZSwgaWYgdGhlcmUgaXMgb25lXG5cdFx0XHQvLyBvbmNlIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZCBpbWFnZSwgc2F2ZSByZWNpcGUgd2l0aCByZWZlcmVuY2UgdG8gc2F2ZWQgaW1hZ2Vcblx0XHRcdGlmIChyZi51cGxvYWRlZEZpbGUpIHtcblx0XHRcdFx0VXBsb2FkXG5cdFx0XHRcdC51cGxvYWQoe1xuXHRcdFx0XHRcdHVybDogJy9hcGkvcmVjaXBlL3VwbG9hZCcsXG5cdFx0XHRcdFx0ZmlsZTogcmYudXBsb2FkZWRGaWxlXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5wcm9ncmVzcyhmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0XHR2YXIgcHJvZ3Jlc3NQZXJjZW50YWdlID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcblx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuXHRcdFx0XHRcdHJmLnVwbG9hZFByb2dyZXNzID0gcHJvZ3Jlc3NQZXJjZW50YWdlICsgJyUgJyArIGV2dC5jb25maWcuZmlsZS5uYW1lO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cocmYudXBsb2FkUHJvZ3Jlc3MpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBkYXRhLmZpbGVuYW1lO1xuXG5cdFx0XHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZXJyb3IoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yIHVwbG9hZGluZyBmaWxlOicsIGVyci5tZXNzYWdlIHx8IGVycik7XG5cblx0XHRcdFx0XHRfcmVjaXBlU2F2ZUVycm9yKCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyB1cGxvYWRlZCBmaWxlLCBzYXZlIHJlY2lwZVxuXHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0fVxuXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlc0xpc3QnLCByZWNpcGVzTGlzdCk7XG5cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3QoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZXM6ICc9Jyxcblx0XHRcdFx0b3BlbkZpbHRlcnM6ICdAJyxcblx0XHRcdFx0Y3VzdG9tTGFiZWxzOiAnQCcsXG5cdFx0XHRcdGNhdGVnb3J5RmlsdGVyOiAnQCcsXG5cdFx0XHRcdHRhZ0ZpbHRlcjogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzL3JlY2lwZXNMaXN0LnRwbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6IHJlY2lwZXNMaXN0Q3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JsJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVzTGlzdExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogcmVjaXBlc0xpc3QgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlY2lwZXNMaXN0TGluaygkc2NvcGUpIHtcblx0XHRcdCRzY29wZS5ybGwgPSB7fTtcblxuXHRcdFx0Ly8gd2F0Y2ggdGhlIGN1cnJlbnRseSB2aXNpYmxlIG51bWJlciBvZiByZWNpcGVzIHRvIGRpc3BsYXkgYSBjb3VudFxuXHRcdFx0JHNjb3BlLiR3YXRjaChcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFuZ3VsYXIuZWxlbWVudCgnLnJlY2lwZXNMaXN0LWxpc3QtaXRlbScpLmxlbmd0aDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0XHQkc2NvcGUucmxsLmRpc3BsYXllZFJlc3VsdHMgPSBuZXdWYWw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJlY2lwZXNMaXN0Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUmVjaXBlJ107XG5cblx0LyoqXG5cdCAqIHJlY2lwZXNMaXN0IENPTlRST0xMRVJcblx0ICpcblx0ICogQHBhcmFtICRzY29wZVxuXHQgKiBAcGFyYW0gUmVjaXBlXG5cdCAqL1xuXHRmdW5jdGlvbiByZWNpcGVzTGlzdEN0cmwoJHNjb3BlLCBSZWNpcGUpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgdmlldyBtb2RlbFxuXHRcdHZhciBybCA9IHRoaXM7XG5cblx0XHQvLyBidWlsZCBvdXQgdGhlIHRvdGFsIHRpbWUgYW5kIG51bWJlciBvZiBpbmdyZWRpZW50cyBmb3Igc29ydGluZ1xuXHRcdHZhciBfd2F0Y2hSZWNpcGVzID0gJHNjb3BlLiR3YXRjaCgncmwucmVjaXBlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChybC5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0XHRyZWNpcGUudG90YWxUaW1lID0gKHJlY2lwZS5jb29rVGltZSA/IHJlY2lwZS5jb29rVGltZSA6IDApICsgKHJlY2lwZS5wcmVwVGltZSA/IHJlY2lwZS5wcmVwVGltZSA6IDApO1xuXHRcdFx0XHRcdHJlY2lwZS5uSW5nID0gcmVjaXBlLmluZ3JlZGllbnRzLmxlbmd0aDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vIGRlcmVnaXN0ZXIgdGhlIHdhdGNoXG5cdFx0XHRcdF93YXRjaFJlY2lwZXMoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIGNvbmRpdGlvbmFsbHkgc2hvdyBjYXRlZ29yeSAvIHRhZyBmaWx0ZXJzXG5cdFx0Ly8gYWx3YXlzIHNob3cgc3BlY2lhbCBkaWV0IGZpbHRlclxuXHRcdGlmIChybC5jYXRlZ29yeUZpbHRlciA9PT0gJ3RydWUnKSB7XG5cdFx0XHRybC5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XG5cdFx0XHRybC5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSB0cnVlO1xuXHRcdH1cblx0XHRpZiAocmwudGFnRmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdHJsLnRhZ3MgPSBSZWNpcGUudGFncztcblx0XHRcdHJsLnNob3dUYWdGaWx0ZXIgPSB0cnVlO1xuXHRcdH1cblx0XHRybC5zcGVjaWFsRGlldCA9IFJlY2lwZS5kaWV0YXJ5O1xuXG5cdFx0Ly8gc2V0IGFsbCBmaWx0ZXJzIHRvIGVtcHR5XG5cdFx0cmwuZmlsdGVyUHJlZGljYXRlcyA9IHt9O1xuXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpIHtcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuY2F0ID0gJyc7XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLnRhZyA9ICcnO1xuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5kaWV0ID0gJyc7XG5cdFx0fVxuXG5cdFx0Ly8gc2V0IHVwIHNvcnQgcHJlZGljYXRlIGFuZCByZXZlcnNhbHNcblx0XHRybC5zb3J0UHJlZGljYXRlID0gJ25hbWUnO1xuXG5cdFx0cmwucmV2ZXJzZU9iaiA9IHtcblx0XHRcdG5hbWU6IGZhbHNlLFxuXHRcdFx0dG90YWxUaW1lOiBmYWxzZSxcblx0XHRcdG5Jbmc6IGZhbHNlXG5cdFx0fTtcblx0XHR2YXIgX2xhc3RTb3J0ZWRCeSA9ICduYW1lJztcblxuXHRcdC8qKlxuXHRcdCAqIFRvZ2dsZSBzb3J0IGFzYy9kZXNjXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcHJlZGljYXRlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0cmwudG9nZ2xlU29ydCA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuXHRcdFx0aWYgKF9sYXN0U29ydGVkQnkgPT09IHByZWRpY2F0ZSkge1xuXHRcdFx0XHRybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV0gPSAhcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0fVxuXHRcdFx0cmwucmV2ZXJzZSA9IHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdF9sYXN0U29ydGVkQnkgPSBwcmVkaWNhdGU7XG5cdFx0fTtcblxuXHRcdC8vIG51bWJlciBvZiByZWNpcGVzIHRvIHNob3cvYWRkIGluIGEgc2V0XG5cdFx0dmFyIF9yZXN1bHRzU2V0ID0gMTU7XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCByZXN1bHRzIHNob3dpbmcgdG8gaW5pdGlhbCBkZWZhdWx0IG9uIHNlYXJjaC9maWx0ZXJcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0UmVzdWx0c1Nob3dpbmcoKSB7XG5cdFx0XHRybC5uUmVzdWx0c1Nob3dpbmcgPSBfcmVzdWx0c1NldDtcblx0XHR9XG5cdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblxuXHRcdC8qKlxuXHRcdCAqIExvYWQgTW9yZSByZXN1bHRzXG5cdFx0ICovXG5cdFx0cmwubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IHJsLm5SZXN1bHRzU2hvd2luZyArPSBfcmVzdWx0c1NldDtcblx0XHR9O1xuXG5cdFx0Ly8gd2F0Y2ggc2VhcmNoIHF1ZXJ5IGFuZCBpZiBpdCBleGlzdHMsIGNsZWFyIGZpbHRlcnMgYW5kIHJlc2V0IHJlc3VsdHMgc2hvd2luZ1xuXHRcdCRzY29wZS4kd2F0Y2goJ3JsLnF1ZXJ5JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmICghIXJsLnF1ZXJ5KSB7XG5cdFx0XHRcdF9yZXNldEZpbHRlclByZWRpY2F0ZXMoKTtcblx0XHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIHdhdGNoIGZpbHRlcnMgYW5kIGlmIGFueSBvZiB0aGVtIGNoYW5nZSwgcmVzZXQgdGhlIHJlc3VsdHMgc2hvd2luZ1xuXHRcdCRzY29wZS4kd2F0Y2goJ3JsLmZpbHRlclByZWRpY2F0ZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKCEhbmV3VmFsICYmIG5ld1ZhbCAhPT0gb2xkVmFsKSB7XG5cdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR2YXIgX29wZW5GaWx0ZXJzT25sb2FkID0gJHNjb3BlLiR3YXRjaCgncmwub3BlbkZpbHRlcnMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSBuZXdWYWwgPT09ICd0cnVlJztcblx0XHRcdFx0X29wZW5GaWx0ZXJzT25sb2FkKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKiBUb2dnbGUgc2VhcmNoL2ZpbHRlciBzZWN0aW9uIG9wZW4vY2xvc2VkXG5cdFx0ICovXG5cdFx0cmwudG9nZ2xlU2VhcmNoRmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gIXJsLnNob3dTZWFyY2hGaWx0ZXI7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENsZWFyIHNlYXJjaCBxdWVyeSBhbmQgYWxsIGZpbHRlcnNcblx0XHQgKi9cblx0XHRybC5jbGVhclNlYXJjaEZpbHRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0cmwucXVlcnkgPSAnJztcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogU2hvdyBudW1iZXIgb2YgY3VycmVudGx5IGFjdGl2ZSBzZWFyY2ggKyBmaWx0ZXIgaXRlbXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfVxuXHRcdCAqIEBwYXJhbSBmaWx0ZXJzT2JqIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge251bWJlcn1cblx0XHQgKi9cblx0XHRybC5hY3RpdmVTZWFyY2hGaWx0ZXJzID0gZnVuY3Rpb24ocXVlcnksIGZpbHRlcnNPYmopIHtcblx0XHRcdHZhciB0b3RhbCA9IDA7XG5cblx0XHRcdGlmIChxdWVyeSkge1xuXHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZmlsdGVyc09iaiwgZnVuY3Rpb24oZmlsdGVyKSB7XG5cdFx0XHRcdGlmIChmaWx0ZXIpIHtcblx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdG90YWw7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KSgpOyIsIi8vIEZvciB0b3VjaGVuZC9tb3VzZXVwIGJsdXJcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdibHVyT25FbmQnLCBibHVyT25FbmQpO1xuXG5cdGZ1bmN0aW9uIGJsdXJPbkVuZCgpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogYmx1ck9uRW5kTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBibHVyT25FbmQgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGJsdXJPbkVuZExpbmsoJHNjb3BlLCAkZWxlbSkge1xuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdCRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgX2JsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0uYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBfb25EZXN0cm95KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGaXJlIGJsdXIgZXZlbnRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYmx1ckVsZW0oKSB7XG5cdFx0XHRcdCRlbGVtLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiAkZGVzdHJveSwgdW5iaW5kIGhhbmRsZXJzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29uRGVzdHJveSgpIHtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCd0b3VjaGVuZCcsIF9ibHVyRWxlbSk7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBkZXRlY3RBZEJsb2NrIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1cblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0XHQkc2NvcGUuYWIuaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RpdmlkZXInLCBkaXZpZGVyKTtcblxuXHRmdW5jdGlvbiBkaXZpZGVyKCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJyQm94LWRpdmlkZXJcIj48aSBjbGFzcz1cImZhIGZhLWN1dGxlcnlcIj48L2k+PC9kaXY+J1xuXHRcdH07XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJpbVN0cicsIHRyaW1TdHIpO1xuXG5cdGZ1bmN0aW9uIHRyaW1TdHIoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHN0ciwgY2hhcnMpIHtcblx0XHRcdHZhciB0cmltbWVkU3RyID0gc3RyO1xuXHRcdFx0dmFyIF9jaGFycyA9IGNoYXJzID09PSB1bmRlZmluZWQgPyA1MCA6IGNoYXJzO1xuXG5cdFx0XHRpZiAoc3RyLmxlbmd0aCA+IF9jaGFycykge1xuXHRcdFx0XHR0cmltbWVkU3RyID0gc3RyLnN1YnN0cigwLCBfY2hhcnMpICsgJy4uLic7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cmltbWVkU3RyO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBoZWFkZXJDdHJsKTtcclxuXHJcblx0aGVhZGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJywgJ3VzZXJEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIGhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sICRhdXRoLCB1c2VyRGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlclxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0XHRoZWFkZXIudXNlciA9IGRhdGE7XHJcblx0XHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IGRhdGEuaXNBZG1pbjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkLCBnZXQgdXNlciBkYXRhXHJcblx0XHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBoZWFkZXIudXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRfY2hlY2tVc2VyQWRtaW4oKTtcclxuXHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2hlY2tVc2VyQWRtaW4pO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cclxuXHRcdCAqIE5lZWRzIHRvIGJlIGEgZnVuY3Rpb24gc28gaXQgaXMgcmUtZXhlY3V0ZWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbSB3aGVuICcvJyBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBmdW5jdGlvbihwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBmdW5jdGlvbihwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJ21lZGlhQ2hlY2snLCAnTVEnLCAnJHRpbWVvdXQnLCAnJHdpbmRvdyddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2wobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0LCAkd2luZG93KSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdHZhciBfd2luID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuXHRcdFx0dmFyIF9ib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX2xheW91dENhbnZhcyA9IF9ib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cdFx0XHR2YXIgX2RlYm91bmNlUmVzaXplO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKCdtaW4taGVpZ2h0JywgJHdpbmRvdy5pbm5lckhlaWdodCArICdweCcpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEJpbmQgcmVzaXplIGV2ZW50IHRvIHdpbmRvd1xuXHRcdFx0ICogQXBwbHkgbWluLWhlaWdodCB0byBsYXlvdXQgdG9cblx0XHRcdCAqIG1ha2UgbmF2IGZ1bGwtaGVpZ2h0XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9sYXlvdXRIZWlnaHQoKSB7XG5cdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChfZGVib3VuY2VSZXNpemUpO1xuXHRcdFx0XHRfZGVib3VuY2VSZXNpemUgPSAkdGltZW91dChfcmVzaXplZCwgMjAwKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcnVuIGluaXRpYWwgbGF5b3V0IGhlaWdodCBjYWxjdWxhdGlvblxuXHRcdFx0X2xheW91dEhlaWdodCgpO1xuXG5cdFx0XHQvLyBiaW5kIGhlaWdodCBjYWxjdWxhdGlvbiB0byB3aW5kb3cgcmVzaXplXG5cdFx0XHRfd2luLmJpbmQoJ3Jlc2l6ZScsIF9sYXlvdXRIZWlnaHQpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfYm9keVxuXHRcdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBlbnRlcmluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIENsb3NlIG5hdiBhbmQgc2V0IHVwIG1lbnUgdG9nZ2xpbmcgZnVuY3Rpb25hbGl0eVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdFx0XHRfb3Blbk5hdigpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBfY2xvc2VOYXYpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdF9ib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVW5iaW5kIHJlc2l6ZSBsaXN0ZW5lciBvbiBkZXN0cnVjdGlvbiBvZiBzY29wZVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR3aW4udW5iaW5kKCdyZXNpemUnLCBfbGF5b3V0SGVpZ2h0KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIEFjY291bnRDdHJsKTtcblxuXHRBY2NvdW50Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICckYXV0aCcsICd1c2VyRGF0YScsICckdGltZW91dCcsICdPQVVUSCcsICdVc2VyJywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIEFjY291bnRDdHJsKCRzY29wZSwgUGFnZSwgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ015IEFjY291bnQnKTtcblxuXHRcdGFjY291bnQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ1VzZXIgSW5mbycsXG5cdFx0XHRcdHF1ZXJ5OiAndXNlci1pbmZvJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ01hbmFnZSBMb2dpbnMnLFxuXHRcdFx0XHRxdWVyeTogJ21hbmFnZS1sb2dpbnMnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICd1c2VyLWluZm8nO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRhY2NvdW50LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0YWNjb3VudC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8vIGFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhY2NvdW50LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKi9cblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IEFjY291bnQgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdGFjY291bnQudXNlciA9IGRhdGE7XG5cdFx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0XHRhY2NvdW50LmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyhhY2NvdW50LnVzZXIsICdhY2NvdW50Jyk7XG5cdFx0XHRcdGFjY291bnQuc2hvd0FjY291bnQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBlcnJvciBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVycm9yXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlckVycm9yKGVycm9yKSB7XG5cdFx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2VzcywgX2dldFVzZXJFcnJvcik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHByb2ZpbGUgc2F2ZSBidXR0b24gdG8gaW5pdGlhbCBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYnRuU2F2ZVJlc2V0KCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IGZhbHNlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHR9XG5cblx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cblx0XHQvKipcblx0XHQgKiBXYXRjaCBkaXNwbGF5IG5hbWUgY2hhbmdlcyB0byBjaGVjayBmb3IgZW1wdHkgb3IgbnVsbCBzdHJpbmdcblx0XHQgKiBTZXQgYnV0dG9uIHRleHQgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdXBkYXRlZCBkaXNwbGF5TmFtZSB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkXG5cdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn0gcHJldmlvdXMgZGlzcGxheU5hbWUgdmFsdWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF93YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF93YXRjaERpc3BsYXlOYW1lKTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqIENhbGxlZCBvbiBzdWJtaXNzaW9uIG9mIHVwZGF0ZSBmb3JtXG5cdFx0ICovXG5cdFx0YWNjb3VudC51cGRhdGVQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSB0cnVlO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZUVycm9yKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCEhYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lKSB7XG5cdFx0XHRcdC8vIFNldCBzdGF0dXMgdG8gU2F2aW5nLi4uIGFuZCB1cGRhdGUgdXBvbiBzdWNjZXNzIG9yIGVycm9yIGluIGNhbGxiYWNrc1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB1c2VyLCBwYXNzaW5nIHByb2ZpbGUgZGF0YSBhbmQgYXNzaWduaW5nIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrc1xuXHRcdFx0XHR1c2VyRGF0YS51cGRhdGVVc2VyKHByb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQudW5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWRtaW5DdHJsJywgQWRtaW5DdHJsKTtcblxuXHRBZG1pbkN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICd1c2VyRGF0YScsICdVc2VyJ107XG5cblx0ZnVuY3Rpb24gQWRtaW5DdHJsKFBhZ2UsICRhdXRoLCB1c2VyRGF0YSwgVXNlcikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWRtaW4gPSB0aGlzO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnQWRtaW4nKTtcblxuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZXMgaWYgdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWRtaW4uaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBBZG1pbiBVSVxuXHRcdCAqIERpc3BsYXkgbGlzdCBvZiB1c2Vyc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWRtaW4udXNlcnMgPSBkYXRhO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goYWRtaW4udXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0dXNlci5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHModXNlcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgdW5zdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBVbmF1dGhvcml6ZWQgZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7ZXJyb3J9IHJlc3BvbnNlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNFcnJvcihlcnJvcikge1xuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dXNlckRhdGEuZ2V0QWxsVXNlcnMoKS50aGVuKF9nZXRBbGxVc2Vyc1N1Y2Nlc3MsIF9nZXRBbGxVc2Vyc0Vycm9yKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJ1JlY2lwZScsICckYXV0aCcsICd1c2VyRGF0YScsICckbG9jYXRpb24nXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoUGFnZSwgcmVjaXBlRGF0YSwgUmVjaXBlLCAkYXV0aCwgdXNlckRhdGEsICRsb2NhdGlvbikge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FsbCBSZWNpcGVzJyk7XHJcblxyXG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcclxuXHJcblx0XHRob21lLnRhYnMgPSBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUmVjaXBlIEJveGVzJyxcclxuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3hlcydcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdTZWFyY2ggLyBCcm93c2UgQWxsJyxcclxuXHRcdFx0XHRxdWVyeTogJ3NlYXJjaC1icm93c2UtYWxsJ1xyXG5cdFx0XHR9XHJcblx0XHRdO1xyXG5cdFx0aG9tZS5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveGVzJztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoYW5nZSB0YWJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xyXG5cdFx0ICovXHJcblx0XHRob21lLmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XHJcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XHJcblx0XHRcdGhvbWUuY3VycmVudFRhYiA9IHF1ZXJ5O1xyXG5cdFx0fTtcclxuXHJcblx0XHRob21lLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcclxuXHRcdGhvbWUudGFncyA9IFJlY2lwZS50YWdzO1xyXG5cclxuXHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgY2F0ZWdvcmllc1xyXG5cdFx0aG9tZS5tYXBDYXRlZ29yaWVzID0ge307XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGhvbWUuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRob21lLm1hcENhdGVnb3JpZXNbaG9tZS5jYXRlZ29yaWVzW2ldXSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gYnVpbGQgaGFzaG1hcCBvZiB0YWdzXHJcblx0XHRob21lLm1hcFRhZ3MgPSB7fTtcclxuXHRcdGZvciAodmFyIG4gPSAwOyBuIDwgaG9tZS50YWdzLmxlbmd0aDsgbisrKSB7XHJcblx0XHRcdGhvbWUubWFwVGFnc1tob21lLnRhZ3Nbbl1dID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9wdWJsaWNSZWNpcGVzU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUucmVjaXBlcyA9IGRhdGE7XHJcblxyXG5cdFx0XHQvLyBjb3VudCBudW1iZXIgb2YgcmVjaXBlcyBwZXIgY2F0ZWdvcnkgYW5kIHRhZ1xyXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goaG9tZS5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcclxuXHRcdFx0XHRob21lLm1hcENhdGVnb3JpZXNbcmVjaXBlLmNhdGVnb3J5XSArPSAxO1xyXG5cclxuXHRcdFx0XHRmb3IgKHZhciB0ID0gMDsgdCA8IHJlY2lwZS50YWdzLmxlbmd0aDsgdCsrKSB7XHJcblx0XHRcdFx0XHRob21lLm1hcFRhZ3NbcmVjaXBlLnRhZ3NbdF1dICs9IDE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZhaWx1cmUgdG8gcmV0dXJuIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGVycm9yXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc0ZhaWx1cmUoZXJyb3IpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1RoZXJlIHdhcyBhbiBlcnJvciByZXRyaWV2aW5nIHJlY2lwZXM6JywgZXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXHJcblx0XHRcdC50aGVuKF9wdWJsaWNSZWNpcGVzU3VjY2VzcywgX3B1YmxpY1JlY2lwZXNGYWlsdXJlKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS51c2VyID0gZGF0YTtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ0hlbGxvLCAnICsgaG9tZS51c2VyLmRpc3BsYXlOYW1lICsgJyEgV2FudCB0byA8YSBocmVmPVwiL215LXJlY2lwZXM/dmlldz1uZXctcmVjaXBlXCI+YWRkIGEgbmV3IHJlY2lwZTwvYT4/JztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBob21lLnVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcclxuXHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0fSBlbHNlIGlmICghJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ1dlbGNvbWUgdG8gPHN0cm9uZz5yQm94PC9zdHJvbmc+ISBCcm93c2UgdGhyb3VnaCB0aGUgcHVibGljIHJlY2lwZSBib3ggb3IgPGEgaHJlZj1cIi9sb2dpblwiPkxvZ2luPC9hPiB0byBmaWxlIG9yIGNvbnRyaWJ1dGUgcmVjaXBlcy4nO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBMb2dpbkN0cmwoUGFnZSwgJGF1dGgsIE9BVVRILCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGxvZ2luID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0xvZ2luJyk7XG5cblx0XHRsb2dpbi5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGxvZ2luLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBBdXRoZW50aWNhdGUgdGhlIHVzZXIgdmlhIE9hdXRoIHdpdGggdGhlIHNwZWNpZmllZCBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyIC0gKHR3aXR0ZXIsIGZhY2Vib29rLCBnaXRodWIsIGdvb2dsZSlcblx0XHQgKi9cblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdFx0ICogR28gdG8gaW5pdGlhbGx5IGludGVuZGVkIGF1dGhlbnRpY2F0ZWQgcGF0aFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoJHJvb3RTY29wZS5hdXRoUGF0aCkge1xuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgYXV0aGVudGljYXRpbmdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aENhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSAnZXJyb3InO1xuXHRcdFx0XHRsb2dpbi5sb2dpbk1zZyA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHQkYXV0aC5hdXRoZW50aWNhdGUocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKF9hdXRoU3VjY2Vzcylcblx0XHRcdFx0LmNhdGNoKF9hdXRoQ2F0Y2gpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcblx0XHQgKi9cblx0XHRsb2dpbi5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ015UmVjaXBlc0N0cmwnLCBNeVJlY2lwZXNDdHJsKTtcblxuXHRNeVJlY2lwZXNDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnbWVkaWFDaGVjaycsICckc2NvcGUnLCAnTVEnLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBNeVJlY2lwZXNDdHJsKFBhZ2UsICRhdXRoLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCBtZWRpYUNoZWNrLCAkc2NvcGUsIE1RLCAkdGltZW91dCkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbXlSZWNpcGVzID0gdGhpcztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTXkgUmVjaXBlcycpO1xuXG5cdFx0bXlSZWNpcGVzLnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnZmlsZWQtcmVjaXBlcydcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnbmV3LXJlY2lwZSdcblx0XHRcdH1cblx0XHRdO1xuXHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveCc7XG5cblx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdGVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdSZWNpcGUgQm94Jztcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1sxXS5uYW1lID0gJ0ZpbGVkJztcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ05ldyBSZWNpcGUnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRleGl0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdNeSBSZWNpcGUgQm94Jztcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1sxXS5uYW1lID0gJ0ZpbGVkIFJlY2lwZXMnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzJdLm5hbWUgPSAnQWRkIE5ldyBSZWNpcGUnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0bXlSZWNpcGVzLmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdG15UmVjaXBlcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnVzZXIgPSBkYXRhO1xuXHRcdFx0dmFyIHNhdmVkUmVjaXBlc09iaiA9IHtzYXZlZFJlY2lwZXM6IGRhdGEuc2F2ZWRSZWNpcGVzfTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBzYXZlZCByZWNpcGVzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlY2lwZXMge3Byb21pc2V9LmRhdGFcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlZFN1Y2Nlc3MocmVjaXBlcykge1xuXHRcdFx0XHRteVJlY2lwZXMuZmlsZWRSZWNpcGVzID0gcmVjaXBlcztcblx0XHRcdH1cblx0XHRcdHJlY2lwZURhdGEuZ2V0RmlsZWRSZWNpcGVzKHNhdmVkUmVjaXBlc09iailcblx0XHRcdFx0LnRoZW4oX2ZpbGVkU3VjY2Vzcyk7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKVxuXHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdG15UmVjaXBlcy5yZWNpcGVzID0gZGF0YTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRNeVJlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0VkaXRSZWNpcGVDdHJsJywgRWRpdFJlY2lwZUN0cmwpO1xuXG5cdEVkaXRSZWNpcGVDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAnJHJvdXRlUGFyYW1zJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gRWRpdFJlY2lwZUN0cmwoUGFnZSwgJGF1dGgsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGVkaXQgPSB0aGlzO1xuXHRcdHZhciBfcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdFZGl0IFJlY2lwZScpO1xuXG5cdFx0ZWRpdC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRWRpdCBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2VkaXQnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRGVsZXRlIFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZGVsZXRlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0ZWRpdC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAnZWRpdCc7XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGVkaXQuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRlZGl0LmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGVkaXQuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnVzZXIgPSBkYXRhO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gZGF0YTtcblx0XHRcdGVkaXQub3JpZ2luYWxOYW1lID0gZWRpdC5yZWNpcGUubmFtZTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgJyArIGVkaXQub3JpZ2luYWxOYW1lKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciByZXRyaWV2aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IoZXJyKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0ZWRpdC5lcnJvck1zZyA9IGVyci5kYXRhLm1lc3NhZ2U7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UmVjaXBlKF9yZWNpcGVTbHVnKVxuXHRcdFx0LnRoZW4oX3JlY2lwZVN1Y2Nlc3MsIF9yZWNpcGVFcnJvcik7XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBkZWxldGUgYnV0dG9uXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldERlbGV0ZUJ0bigpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9IGZhbHNlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZSBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdF9yZXNldERlbGV0ZUJ0bigpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGFmdGVyIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSB0cnVlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZWQhJztcblxuXHRcdFx0ZnVuY3Rpb24gX2dvVG9SZWNpcGVzKCkge1xuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL215LXJlY2lwZXMnKTtcblx0XHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfZ29Ub1JlY2lwZXMsIDE1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlRXJyb3IoKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSAnZXJyb3InO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0Vycm9yIGRlbGV0aW5nISc7XG5cblx0XHRcdCR0aW1lb3V0KF9yZXNldERlbGV0ZUJ0biwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0ZWRpdC5kZWxldGVSZWNpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGluZy4uLic7XG5cdFx0XHRyZWNpcGVEYXRhLmRlbGV0ZVJlY2lwZShlZGl0LnJlY2lwZS5faWQpXG5cdFx0XHRcdC50aGVuKF9kZWxldGVTdWNjZXNzLCBfZGVsZXRlRXJyb3IpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZUN0cmwnLCBSZWNpcGVDdHJsKTtcblxuXHRSZWNpcGVDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAnJHJvdXRlUGFyYW1zJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVDdHJsKFBhZ2UsICRhdXRoLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByZWNpcGUgPSB0aGlzO1xuXHRcdHZhciByZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdSZWNpcGUnKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9IHVzZXIgaW5mb1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS51c2VyID0gZGF0YTtcblxuXHRcdFx0Ly8gbG9nZ2VkIGluIHVzZXJzIGNhbiBmaWxlIHJlY2lwZXNcblx0XHRcdHJlY2lwZS5maWxlVGV4dCA9ICdGaWxlIHRoaXMgcmVjaXBlJztcblx0XHRcdHJlY2lwZS51bmZpbGVUZXh0ID0gJ1JlbW92ZSBmcm9tIEZpbGVkIFJlY2lwZXMnO1xuXHRcdH1cblx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxuXHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSByZWNpcGUgZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJlY2lwZS5yZWNpcGUubmFtZSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyBhdXRob3IgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSBhdXRob3IgcGljdHVyZSwgZGlzcGxheU5hbWVcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0cmVjaXBlLmF1dGhvciA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHR1c2VyRGF0YS5nZXRBdXRob3IocmVjaXBlLnJlY2lwZS51c2VySWQpXG5cdFx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblxuXHRcdFx0cmVjaXBlLmluZ0NoZWNrZWQgPSBbXTtcblx0XHRcdHJlY2lwZS5zdGVwQ2hlY2tlZCA9IFtdO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENyZWF0ZSBhcnJheSB0byBrZWVwIHRyYWNrIG9mIGNoZWNrZWQgLyB1bmNoZWNrZWQgaXRlbXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gY2hlY2tlZEFyclxuXHRcdFx0ICogQHBhcmFtIHNvdXJjZUFyclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NyZWF0ZUNoZWNrZWRBcnJheXMoY2hlY2tlZEFyciwgc291cmNlQXJyKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlQXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y2hlY2tlZEFycltpXSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF9jcmVhdGVDaGVja2VkQXJyYXlzKHJlY2lwZS5pbmdDaGVja2VkLCByZWNpcGUucmVjaXBlLmluZ3JlZGllbnRzKTtcblx0XHRcdF9jcmVhdGVDaGVja2VkQXJyYXlzKHJlY2lwZS5zdGVwQ2hlY2tlZCwgcmVjaXBlLnJlY2lwZS5kaXJlY3Rpb25zKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgY2hlY2ttYXJrXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHR5cGVcblx0XHRcdCAqIEBwYXJhbSBpbmRleFxuXHRcdFx0ICovXG5cdFx0XHRyZWNpcGUudG9nZ2xlQ2hlY2sgPSBmdW5jdGlvbih0eXBlLCBpbmRleCkge1xuXHRcdFx0XHRyZWNpcGVbdHlwZSArICdDaGVja2VkJ11baW5kZXhdID0gIXJlY2lwZVt0eXBlICsgJ0NoZWNrZWQnXVtpbmRleF07XG5cdFx0XHR9O1xuXHRcdH1cblx0XHQvKipcblx0XHQgKiBFcnJvciByZXRyaWV2aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlcyB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVFcnJvcihyZXMpIHtcblx0XHRcdHJlY2lwZS5yZWNpcGUgPSAnZXJyb3InO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRXJyb3InKTtcblx0XHRcdHJlY2lwZS5lcnJvck1zZyA9IHJlcy5kYXRhLm1lc3NhZ2U7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UmVjaXBlKHJlY2lwZVNsdWcpXG5cdFx0XHQudGhlbihfcmVjaXBlU3VjY2VzcywgX3JlY2lwZUVycm9yKTtcblxuXHRcdC8qKlxuXHRcdCAqIEZpbGUgb3IgdW5maWxlIHRoaXMgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKi9cblx0XHRyZWNpcGUuZmlsZVJlY2lwZSA9IGZ1bmN0aW9uKHJlY2lwZUlkKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBmcm9tIHNhdmluZyByZWNpcGUgdG8gdXNlciBkYXRhXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdHJlY2lwZS5hcGlNc2cgPSBkYXRhLmFkZGVkID8gJ1JlY2lwZSBzYXZlZCEnIDogJ1JlY2lwZSByZW1vdmVkISc7XG5cdFx0XHRcdHJlY2lwZS5maWxlZCA9IGRhdGEuYWRkZWQ7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgcHJvbWlzZSBmcm9tIHNhdmluZyByZWNpcGUgdG8gdXNlciBkYXRhXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVFcnJvcihyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmVjaXBlRGF0YS5maWxlUmVjaXBlKHJlY2lwZUlkKVxuXHRcdFx0XHQudGhlbihfZmlsZVN1Y2Nlc3MsIF9maWxlRXJyb3IpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ21pblRvSCcsIG1pblRvSCk7XG5cblx0ZnVuY3Rpb24gbWluVG9IKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihtaW4pIHtcblx0XHRcdHZhciBfaG91ciA9IDYwO1xuXHRcdFx0dmFyIF9taW4gPSBtaW4gKiAxO1xuXHRcdFx0dmFyIF9ndEhvdXIgPSBfbWluIC8gX2hvdXIgPj0gMTtcblx0XHRcdHZhciB0aW1lU3RyID0gbnVsbDtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHZXQgbWludXRlL3MgdGV4dCBmcm9tIG1pbnV0ZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbWludXRlcyB7bnVtYmVyfVxuXHRcdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gbWluVGV4dChtaW51dGVzKSB7XG5cdFx0XHRcdGlmIChfaGFzTWludXRlcyAmJiBtaW51dGVzID09PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgbWludXRlJztcblx0XHRcdFx0fSBlbHNlIGlmIChfaGFzTWludXRlcyAmJiBtaW51dGVzICE9PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgbWludXRlcyc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKF9ndEhvdXIpIHtcblx0XHRcdFx0dmFyIGhQbHVzTWluID0gX21pbiAlIF9ob3VyO1xuXHRcdFx0XHR2YXIgX2hhc01pbnV0ZXMgPSBoUGx1c01pbiAhPT0gMDtcblx0XHRcdFx0dmFyIGhvdXJzID0gTWF0aC5mbG9vcihfbWluIC8gX2hvdXIpO1xuXHRcdFx0XHR2YXIgaG91cnNUZXh0ID0gaG91cnMgPT09IDEgPyAnIGhvdXInIDogJyBob3Vycyc7XG5cdFx0XHRcdHZhciBtaW51dGVzID0gX2hhc01pbnV0ZXMgPyAnLCAnICsgaFBsdXNNaW4gKyBtaW5UZXh0KGhQbHVzTWluKSA6ICcnO1xuXG5cdFx0XHRcdHRpbWVTdHIgPSBob3VycyArIGhvdXJzVGV4dCArIG1pbnV0ZXM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgbm9ITWluVGV4dCA9IF9taW4gPT09IDEgPyAnIG1pbnV0ZScgOiAnIG1pbnV0ZXMnO1xuXHRcdFx0XHR0aW1lU3RyID0gX21pbiArIG5vSE1pblRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aW1lU3RyO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzQXV0aG9yQ3RybCcsIFJlY2lwZXNBdXRob3JDdHJsKTtcblxuXHRSZWNpcGVzQXV0aG9yQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc0F1dGhvckN0cmwoUGFnZSwgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfYWlkID0gJHJvdXRlUGFyYW1zLnVzZXJJZDtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQXV0aG9yJztcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICd0cnVlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBhdXRob3IncyBiYXNpYyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJhLmF1dGhvciA9IGRhdGE7XG5cdFx0XHRyYS5oZWFkaW5nID0gJ1JlY2lwZXMgYnkgJyArIHJhLmF1dGhvci5kaXNwbGF5TmFtZTtcblx0XHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRBdXRob3IoX2FpZClcblx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgdXNlcidzIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5yZWNpcGVzID0gZGF0YTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRBdXRob3JSZWNpcGVzKF9haWQpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0NhdGVnb3J5Q3RybCcsIFJlY2lwZXNDYXRlZ29yeUN0cmwpO1xuXG5cdFJlY2lwZXNDYXRlZ29yeUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNDYXRlZ29yeUN0cmwoUGFnZSwgcmVjaXBlRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF9jYXQgPSAkcm91dGVQYXJhbXMuY2F0ZWdvcnk7XG5cdFx0dmFyIF9jYXRUaXRsZSA9IF9jYXQuc3Vic3RyaW5nKDAsMSkudG9Mb2NhbGVVcHBlckNhc2UoKSArIF9jYXQuc3Vic3RyaW5nKDEpO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNDYXRlZ29yeSc7XG5cdFx0cmEuaGVhZGluZyA9IF9jYXRUaXRsZSArICdzJztcblx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAnZmFsc2UnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgY2F0QXJyID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0aWYgKHJlY2lwZS5jYXRlZ29yeSA9PSBfY2F0VGl0bGUpIHtcblx0XHRcdFx0XHRjYXRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IGNhdEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzVGFnQ3RybCcsIFJlY2lwZXNUYWdDdHJsKTtcblxuXHRSZWNpcGVzVGFnQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc1RhZ0N0cmwoUGFnZSwgcmVjaXBlRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF90YWcgPSAkcm91dGVQYXJhbXMudGFnO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNUYWcnO1xuXG5cdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIHRhZ2dlZCBcIicgKyBfdGFnICsgJ1wiJztcblx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICdmYWxzZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgdGFnZ2VkQXJyID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0aWYgKHJlY2lwZS50YWdzLmluZGV4T2YoX3RhZykgPiAtMSkge1xuXHRcdFx0XHRcdHRhZ2dlZEFyci5wdXNoKHJlY2lwZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyYS5yZWNpcGVzID0gdGFnZ2VkQXJyO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
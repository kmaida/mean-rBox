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
		 * INIT
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
		LOGINURL: 'http://rbox.kmaida.io/auth/login',
		//LOGINURL: 'http://localhost:8080/auth/login',
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
		/**
		 * $on $routeChangeStart
		 * Check authentication
		 * Redirect appropriately
		 *
		 * @param event
		 * @param next
		 * @param current
		 * @private
		 */
		function _$routeChangeStart(event, next, current) {
			if (next && next.$$route && next.$$route.secure && !$auth.isAuthenticated()) {  // eslint-disable-line angular/no-private-call
				$rootScope.authPath = $location.path();

				$rootScope.$evalAsync(function() {
					// send user to login
					$location.path('/login');
				});
			}
		}

		$rootScope.$on('$routeChangeStart', _$routeChangeStart);    // eslint-disable-line angular/on-watch
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
		 * @param recipeId {string} recipe ID
		 * @returns {promise}
		 */
		function deleteRecipe(recipeId) {
			return $http
				.delete('/api/recipe/' + recipeId);
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
		'confection',
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
			tags: tags,
			generateId: generateId
		};

		/**
		 * Generates a unique 5-character ID;
		 *
		 * @returns {string}
		 */
		function generateId() {
			var _id = '';
			var _charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var i;

			for (i = 0; i < 5; i++) {
				_id += _charset.charAt(Math.floor(Math.random() * _charset.length));
			}

			return _id;
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['$timeout', 'Recipe'];

	function recipeForm($timeout, Recipe) {
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
		 * @param $element
		 * @param $attrs
		 * @param rf {controllerAs}
		 */
		function recipeFormLink($scope, $element, $attrs, rf) {
			// set up $scope object for namespacing
			$scope.rfl = {};

			$scope.rfl.addItem = addItem;
			$scope.rfl.removeItem = removeItem;
			$scope.rfl.moveItem = moveItem;
			$scope.rfl.moveIngredients = false;
			$scope.rfl.moveDirections = false;

			_init();

			/**
			 * INIT
			 *
			 * @private
			 */
			function _init() {
				$scope.$on('enter-mobile', _enterMobile);
				$scope.$on('exit-mobile', _exitMobile);
			}

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
			function addItem($event, model, type, isHeading) {
				var _newItem = {
					id: Recipe.generateId(),
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
			}

			/**
			 * Remove item
			 * Ingredient or Direction step
			 *
			 * @param model {object} rf.recipeData model
			 * @param i {index}
			 */
			function removeItem(model, i) {
				model.splice(i, 1);
			}

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
			function moveItem($event, model, oldIndex, newIndex) {
				var _item = angular.element($event.target).closest('li');

				model.move(oldIndex, newIndex);

				_item.addClass('moved');

				$timeout(function() {
					_item.removeClass('moved');
				}, 700);
			}
		}
	}

	recipeFormCtrl.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout', 'Upload'];

	/**
	 * recipeForm CONTROLLER function
	 *
	 * @param recipeData
	 * @param Recipe
	 * @param Slug
	 * @param $location
	 * @param $timeout
	 * @param Upload
	 */
	function recipeFormCtrl(recipeData, Recipe, Slug, $location, $timeout, Upload) {
		// controllerAs ViewModel
		var rf = this;

		// private variables
		var _isEdit = !!rf.recipe;
		var _originalSlug = _isEdit ? rf.recipe.slug : null;
		var _lastInput;
		var _ingIndex;
		var _caretPos;

		// bindable members
		rf.recipeData = _isEdit ? rf.recipe : {};
		rf.recipeData.userId = _isEdit ? rf.recipe.userId : rf.userId;
		rf.recipeData.photo = _isEdit ? rf.recipe.photo : null;
		rf.isTouchDevice = !!Modernizr.touchevents;
		rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients : [{id: Recipe.generateId(), type: 'ing'}];
		rf.recipeData.directions = _isEdit ? rf.recipe.directions : [{id: Recipe.generateId(), type: 'step'}];
		rf.recipeData.tags = _isEdit ? rf.recipeData.tags : [];
		rf.timeRegex = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
		rf.timeError = 'Please enter a number in minutes. Multiply hours by 60.';
		rf.categories = Recipe.categories;
		rf.tags = Recipe.tags;
		rf.dietary = Recipe.dietary;
		rf.chars = Recipe.insertChar;
		rf.insertCharInput = insertCharInput;
		rf.insertChar = insertChar;
		rf.clearChar = clearChar;
		rf.uploadedFile = null;
		rf.updateFile = updateFile;
		rf.removePhoto = removePhoto;
		rf.tagMap = {};
		rf.addRemoveTag = addRemoveTag;
		rf.saveRecipe = saveRecipe;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			// create map of touched tags
			if (_isEdit && rf.recipeData.tags.length) {
				angular.forEach(rf.recipeData.tags, function(tag, i) {
					rf.tagMap[tag] = true;
				});
			}

			_resetSaveBtn();
		}

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

			} else if (input.createTextRange) {
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
		function insertCharInput($event, index) {
			$timeout(function() {
				_ingIndex = index;
				_lastInput = angular.element('#' + $event.target.id);
				_caretPos = _lastInput[0].selectionStart;
			});
		}

		/**
		 * Insert character at last caret position
		 * In supported field
		 *
		 * @param char {string} special character
		 */
		function insertChar(char) {
			var _textVal;

			if (_lastInput) {
				_textVal = angular.isUndefined(rf.recipeData.ingredients[_ingIndex].amt) ? '' : rf.recipeData.ingredients[_ingIndex].amt;

				rf.recipeData.ingredients[_ingIndex].amt = _textVal.substring(0, _caretPos) + char + _textVal.substring(_caretPos);

				$timeout(function() {
					_caretPos = _caretPos + 1;
					_setCaretToPos(_lastInput[0], _caretPos);
				});
			}
		}

		/**
		 * Clear caret position and last input
		 * So that special characters don't end up in undesired fields
		 */
		function clearChar() {
			_ingIndex = null;
			_lastInput = null;
			_caretPos = null;
		}

		/**
		 * Upload image file
		 *
		 * @param files {Array} array of files to upload
		 */
		function updateFile(files) {
			if (files && files.length) {
				if (files[0].size > 300000) {
					rf.uploadError = 'Filesize over 500kb - photo was not uploaded.';
					rf.removePhoto();
				} else {
					rf.uploadError = false;
					rf.uploadedFile = files[0];    // only single upload allowed
				}
			}
		}

		/**
		 * Remove uploaded photo from front-end
		 */
		function removePhoto() {
			rf.recipeData.photo = null;
			rf.uploadedFile = null;
			angular.element('#recipePhoto').val('');
		}

		/**
		 * Add / remove tag
		 *
		 * @param tag {string} tag name
		 */
		function addRemoveTag(tag) {
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
		}

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

		/**
		 * Recipe created or saved successfully
		 *
		 * @param recipe {promise} if editing event
		 * @private
		 */
		function _recipeSaved(recipe) {
			rf.saved = true;
			rf.saveBtnText = _isEdit ? 'Updated!' : 'Saved!';

			if (!_isEdit || _isEdit && _originalSlug !== rf.recipeData.slug) {
				$timeout(_goToNewSlug, 1000);
			} else {
				$timeout(_resetSaveBtn, 2000);
			}
		}

		/**
		 * Go to new slug (if new) or updated slug (if slug changed)
		 *
		 * @private
		 */
		function _goToNewSlug() {
			var _path = !_isEdit ? recipe.slug : rf.recipeData.slug + '/edit';

			$location.path('/recipe/' + _path);
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
		 * Determine if edit/new
		 * Either create or update recipe accordingly
		 *
		 * @private
		 */
		function _goSaveRecipe() {
			if (!_isEdit) {
				recipeData.createRecipe(rf.recipeData).then(_recipeSaved, _recipeSaveError);
			} else {
				recipeData.updateRecipe(rf.recipe._id, rf.recipeData).then(_recipeSaved, _recipeSaveError);
			}
		}

		/**
		 * Save recipe
		 * Click on submit
		 */
		function saveRecipe() {
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
					.progress(_uploadProgressCB)
					.success(_uploadSuccessCB)
					.error(_uploadErrorCB);

			} else {
				// no uploaded file, save recipe
				_goSaveRecipe();
			}
		}

		/**
		 * Upload progress callback
		 *
		 * @param evt {event}
		 * @private
		 */
		function _uploadProgressCB(evt) {
			var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
			rf.uploadError = false;
			rf.uploadInProgress = true;
			rf.uploadProgress = progressPercentage + '% ' + evt.config.file.name;

			console.log(rf.uploadProgress);
		}

		/**
		 * Upload success callback
		 *
		 * @param data
		 * @param status
		 * @param headers
		 * @param config
		 * @private
		 */
		function _uploadSuccessCB(data, status, headers, config) {
			$timeout(function() {
				rf.uploadInProgress = false;
				rf.recipeData.photo = data.filename;

				_goSaveRecipe();
			});
		}

		/**
		 * Upload error callback
		 *
		 * @param err {object}
		 * @private
		 */
		function _uploadErrorCB(err) {
			rf.uploadInProgress = false;
			rf.uploadError = err.message || err;

			console.log('Error uploading file:', err.message || err);

			_recipeSaveError();
		}
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
				_$watchRecipesList
			);

			/**
			 * $watch recipesList list items
			 *
			 * @param newVal
			 * @param oldVal
			 * @private
			 */
			function _$watchRecipesList(newVal, oldVal) {
				if (newVal) {
					$scope.rll.displayedResults = newVal;
				}
			}
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

		// set up sort predicate and reversals
		rl.sortPredicate = 'name';

		rl.reverseObj = {
			name: false,
			totalTime: false,
			nIng: false
		};

		rl.toggleSort = toggleSort;
		rl.loadMore = loadMore;
		rl.toggleSearchFilter = toggleSearchFilter;
		rl.clearSearchFilter = clearSearchFilter;
		rl.activeSearchFilters = activeSearchFilters;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			_resetResultsShowing();
			$scope.$watch('rl.query', _$watchQuery);
			$scope.$watch('rl.filterPredicates', _$watchPredicates);
		}

		/**
		 * Reset filter predicates
		 *
		 * @private
		 */
		function _resetFilterPredicates() {
			rl.filterPredicates.cat = '';
			rl.filterPredicates.tag = '';
			rl.filterPredicates.diet = '';
		}

		/**
		 * Toggle sort asc/desc
		 *
		 * @param predicate {string}
		 */
		function toggleSort(predicate) {
			if (_lastSortedBy === predicate) {
				rl.reverseObj[predicate] = !rl.reverseObj[predicate];
			}
			rl.reverse = rl.reverseObj[predicate];
			_lastSortedBy = predicate;
		}

		/**
		 * Reset results showing to initial default on search/filter
		 *
		 * @private
		 */
		function _resetResultsShowing() {
			rl.nResultsShowing = _resultsSet;
		}

		/**
		 * Load More results
		 */
		function loadMore() {
			rl.nResultsShowing = rl.nResultsShowing += _resultsSet;
		}

		/**
		 * $watch search query and if it exists, clear filters and reset results showing
		 *
		 * @private
		 */
		function _$watchQuery() {
			if (rl.query) {
				_resetFilterPredicates();
				_resetResultsShowing();
			}
		}

		/**
		 * $watch filterPredicates
		 * watch filters and if any of them change, reset the results showing
		 *
		 * @param newVal
		 * @param oldVal
		 * @private
		 */
		function _$watchPredicates(newVal, oldVal) {
			if (!!newVal && newVal !== oldVal) {
				_resetResultsShowing();
			}
		}

		/**
		 * Toggle search/filter section open/closed
		 */
		function toggleSearchFilter() {
			rl.showSearchFilter = !rl.showSearchFilter;
		}

		/**
		 * Clear search query and all filters
		 */
		function clearSearchFilter() {
			_resetFilterPredicates();
			rl.query = '';
		}

		/**
		 * Show number of currently active search + filter items
		 *
		 * @param query {string}
		 * @param filtersObj {object}
		 * @returns {number}
		 */
		function activeSearchFilters(query, filtersObj) {
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
		}
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

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			_checkUserAdmin();
			$scope.$on('$locationChangeSuccess', _checkUserAdmin);
		}

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

		// private variables
		var _tab = $location.search().view;

		// bindable members
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
		account.logins = OAUTH.LOGINS;  // all available login services
		account.isAuthenticated = Utils.isAuthenticated;
		account.changeTab = changeTab;
		account.getProfile = getProfile;
		account.updateProfile = updateProfile;
		account.link = link;
		account.unlink = unlink;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('My Account');
			_btnSaveReset();
			$scope.$watch('account.user.displayName', _$watchDisplayName);

			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');
			return account.getProfile();
		}

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		function changeTab(query) {
			$location.search('view', query);
			account.currentTab = query;
		}

		/**
		 * Get user's profile information
		 */
		function getProfile() {
			return userData.getUser().then(_getUserSuccess, _getUserError);
		}

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

			$scope.$emit('loading-off');
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

		/**
		 * Reset profile save button to initial state
		 *
		 * @private
		 */
		function _btnSaveReset() {
			account.btnSaved = false;
			account.btnSaveText = 'Save';
		}

		/**
		 * Watch display name changes to check for empty or null string
		 * Set button text accordingly
		 *
		 * @param newVal {string} updated displayName value from input field
		 * @param oldVal {*} previous displayName value
		 * @private
		 */
		function _$watchDisplayName(newVal, oldVal) {
			if (newVal === '' || newVal === null) {
				account.btnSaveText = 'Enter Name';
			} else {
				account.btnSaveText = 'Save';
			}
		}

		/**
		 * Update user's profile information
		 * Called on submission of update form
		 */
		function updateProfile() {
			var _profileData = { displayName: account.user.displayName };

			if (account.user.displayName) {
				// Set status to Saving... and update upon success or error in callbacks
				account.btnSaveText = 'Saving...';

				// Update the user, passing profile data and assigning success and error callbacks
				userData.updateUser(_profileData).then(_updateSuccess, _updateError);
			}
		}

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

		/**
		 * Link third-party provider
		 *
		 * @param {string} provider
		 */
		function link(provider) {
			$auth.link(provider)
				.then(account.getProfile)
				.catch(function(response) {
					alert(response.data.message);
				});
		}

		/**
		 * Unlink third-party provider
		 *
		 * @param {string} provider
		 */
		function unlink(provider) {
			$auth.unlink(provider)
				.then(account.getProfile)
				.catch(function(response) {
					alert(response.data ? response.data.message : 'Could not unlink ' + provider + ' account');
				});
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['$scope', 'Page', 'Utils', 'userData', 'User'];

	function AdminCtrl($scope, Page, Utils, userData, User) {
		// controllerAs ViewModel
		var admin = this;

		// bindable members
		admin.isAuthenticated = Utils.isAuthenticated;
		admin.users = null;
		admin.showAdmin = false;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Admin');
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return userData.getAllUsers().then(_getAllUsersSuccess, _getAllUsersError);
		}

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

			$scope.$emit('loading-off');
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

		// private variables
		var _tab = $location.search().view;
		var i;
		var n;
		var t;

		// bindable members
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
		home.changeTab = changeTab;
		home.categories = Recipe.categories;
		home.tags = Recipe.tags;
		home.mapCategories = {};
		home.mapTags = {};

		_init();

		function _init() {
			Page.setTitle('All Recipes');

			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);

			// build hashmap of categories
			for (i = 0; i < home.categories.length; i++) {
				home.mapCategories[home.categories[i]] = 0;
			}

			// build hashmap of tags
			for (n = 0; n < home.tags.length; n++) {
				home.mapTags[home.tags[n]] = 0;
			}

			_activate();

			// if user is authenticated, get user data
			if (Utils.isAuthenticated() && angular.isUndefined(home.user)) {
				userData.getUser().then(_getUserSuccess);
			} else if (!Utils.isAuthenticated()) {
				home.welcomeMsg = 'Welcome to <strong>rBox</strong>! Browse through the public recipe box or <a href="/login">Login</a> to file or contribute recipes.';
			}
		}

		/**
		 * ACTIVATE
		 *
		 * @returns {promise}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return recipeData.getPublicRecipes().then(_publicRecipesSuccess, _publicRecipesFailure);
		}

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
		function changeTab(query) {
			$location.search('view', query);
			home.currentTab = query;
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

			$scope.$emit('loading-off');
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

		// bindable members
		login.logins = OAUTH.LOGINS;
		login.isAuthenticated = Utils.isAuthenticated;
		login.authenticate = authenticate;
		login.logout = logout;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Login');
		}

		/**
		 * Authenticate the user via Oauth with the specified provider
		 *
		 * @param {string} provider - (twitter, facebook, github, google)
		 */
		function authenticate(provider) {
			login.loggingIn = true;

			$auth.authenticate(provider)
				.then(_authSuccess)
				.catch(_authCatch);
		}

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

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		function logout() {
			$auth.logout('/login');
		}
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

		// private variables
		var _tab = $location.search().view;

		// bindable members
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
		myRecipes.changeTab = changeTab;
		myRecipes.isAuthenticated = Utils.isAuthenticated;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('My Recipes');

			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);

			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			userData.getUser().then(_getUserSuccess);
			recipeData.getMyRecipes().then(_recipesSuccess, _recipesError);
		}

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
		function changeTab(query) {
			$location.search('view', query);
			myRecipes.currentTab = query;
		}

		/**
		 * Successful promise getting user's data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			var savedRecipesObj = {savedRecipes: data.savedRecipes};
			myRecipes.user = data;

			recipeData.getFiledRecipes(savedRecipesObj).then(_filedSuccess);
		}

		/**
		 * Successful promise returning user's saved recipes
		 *
		 * @param recipes {promise}.data
		 * @private
		 */
		function _filedSuccess(recipes) {
			myRecipes.filedRecipes = recipes;
		}

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _recipesSuccess(data) {
			myRecipes.recipes = data;

			$scope.$emit('loading-off');
		}

		/**
		 * Error returning user's recipe data
		 *
		 * @param error {object}
		 * @private
		 */
		function _recipesError(error) {
			console.log('Error loading recipes', error);
			$scope.$emit('loading-off');
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['$scope', 'Page', 'Utils', '$routeParams', 'recipeData', 'userData', '$location', '$timeout'];

	function EditRecipeCtrl($scope, Page, Utils, $routeParams, recipeData, userData, $location, $timeout) {
		// controllerAs ViewModel
		var edit = this;

		// private variables
		var _recipeSlug = $routeParams.slug;
		var _tab = $location.search().view;

		// bindable members
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
		edit.changeTab = changeTab;
		edit.isAuthenticated = Utils.isAuthenticated;
		edit.deleteRecipe = deleteRecipe;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Edit Recipe');
			_activate();
			_resetDeleteBtn();
		}

		function _activate() {
			$scope.$emit('loading-on');

			userData.getUser().then(_getUserSuccess);
			recipeData.getRecipe(_recipeSlug).then(_recipeSuccess, _recipeError);
		}

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		function changeTab(query) {
			$location.search('view', query);
			edit.currentTab = query;
		}

		/**
		 * Successfully retrieved user
		 *
		 * @param data
		 * @private
		 */
		function _getUserSuccess(data) {
			edit.user = data;
		}

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

			$scope.$emit('loading-off');
		}

		/**
		 * Error retrieving recipe
		 *
		 * @param err {object}
		 * @private
		 */
		function _recipeError(err) {
			edit.recipe = 'error';
			Page.setTitle('Error');
			edit.errorMsg = err.data.message;

			$scope.$emit('loading-off');
		}

		/**
		 * Reset delete button
		 *
		 * @private
		 */
		function _resetDeleteBtn() {
			edit.deleted = false;
			edit.deleteBtnText = 'Delete Recipe';
		}

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

		/**
		 * Delete recipe
		 */
		function deleteRecipe() {
			edit.deleteBtnText = 'Deleting...';
			recipeData.deleteRecipe(edit.recipe._id).then(_deleteSuccess, _deleteError);
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['$scope', 'Page', 'Utils', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl($scope, Page, Utils, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;

		// private variables
		var recipeSlug = $routeParams.slug;

		// bindable members
		recipe.ingChecked = [];
		recipe.stepChecked = [];
		recipe.toggleCheck = toggleCheck;
		recipe.fileRecipe = fileRecipe;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Recipe');
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			if (Utils.isAuthenticated()) {
				userData.getUser().then(_getUserSuccess);
			}

			recipeData.getRecipe(recipeSlug).then(_recipeSuccess, _recipeError);
		}

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

		/**
		 * Successful promise returning recipe data
		 *
		 * @param data {promise} recipe data
		 * @private
		 */
		function _recipeSuccess(data) {
			recipe.recipe = data;
			Page.setTitle(recipe.recipe.name);

			userData.getAuthor(recipe.recipe.userId).then(_authorSuccess);

			_createCheckedArrays(recipe.ingChecked, recipe.recipe.ingredients);
			_createCheckedArrays(recipe.stepChecked, recipe.recipe.directions);

			$scope.$emit('loading-off');
		}

		/**
		 * Create array to keep track of checked / unchecked items
		 *
		 * @param checkedArr
		 * @param sourceArr
		 * @private
		 */
		function _createCheckedArrays(checkedArr, sourceArr) {
			var i;

			for (i = 0; i < sourceArr.length; i++) {
				checkedArr[i] = false;
			}
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

			$scope.$emit('loading-off');
		}

		/**
		 * Toggle checkmark
		 *
		 * @param type
		 * @param index
		 */
		function toggleCheck(type, index) {
			recipe[type + 'Checked'][index] = !recipe[type + 'Checked'][index];
		}

		/**
		 * Successful promise returning author data
		 *
		 * @param data {promise} author picture, displayName
		 * @private
		 */
		function _authorSuccess(data) {
			recipe.author = data;
		}

		/**
		 * File or unfile this recipe
		 *
		 * @param recipeId {string} ID of recipe to save
		 * @returns {promise}
		 */
		function fileRecipe(recipeId) {
			return recipeData.fileRecipe(recipeId).then(_fileSuccess, _fileError);
		}

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

	RecipesAuthorCtrl.$inject = ['$scope', 'Page', 'recipeData', 'userData', '$routeParams'];

	function RecipesAuthorCtrl($scope, Page, recipeData, userData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;

		// private variables
		var _aid = $routeParams.userId;

		// bindable members
		ra.className = 'recipesAuthor';
		ra.showCategoryFilter = 'true';
		ra.showTagFilter = 'true';

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			userData.getAuthor(_aid).then(_authorSuccess);
			recipeData.getAuthorRecipes(_aid).then(_recipesSuccess);
		}

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

		/**
		 * Successful promise returned from getting user's public recipes
		 *
		 * @param data {Array} recipes array
		 * @private
		 */
		function _recipesSuccess(data) {
			ra.recipes = data;

			$scope.$emit('loading-off');
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesCategoryCtrl', RecipesCategoryCtrl);

	RecipesCategoryCtrl.$inject = ['$scope', 'Page', 'recipeData', '$routeParams'];

	function RecipesCategoryCtrl($scope, Page, recipeData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;

		// private variables
		var _cat = $routeParams.category;
		var _catTitle = _cat.substring(0,1).toLocaleUpperCase() + _cat.substring(1);

		// bindable members
		ra.className = 'recipesCategory';
		ra.heading = _catTitle + 's';
		ra.customLabels = ra.heading;
		ra.showCategoryFilter = 'false';
		ra.showTagFilter = 'true';

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle(ra.heading);
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @returns {promise}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return recipeData.getPublicRecipes().then(_recipesSuccess);
		}

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

			$scope.$emit('loading-off');
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesTagCtrl', RecipesTagCtrl);

	RecipesTagCtrl.$inject = ['$scope', 'Page', 'recipeData', '$routeParams'];

	function RecipesTagCtrl($scope, Page, recipeData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;

		// private variables
		var _tag = $routeParams.tag;

		// bindable members
		ra.className = 'recipesTag';
		ra.heading = 'Recipes tagged "' + _tag + '"';
		ra.customLabels = ra.heading;
		ra.showCategoryFilter = 'true';
		ra.showTagFilter = 'false';

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle(ra.heading);
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @returns {promise}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return recipeData.getPublicRecipes().then(_recipesSuccess);
		}

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

			$scope.$emit('loading-off');
		}
	}
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvT0FVVEhDTElFTlRTLmNvbnN0YW50LmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmF1dGguanMiLCJjb3JlL2FwcC1zZXR1cC9hcHAuY29uZmlnLmpzIiwiY29yZS9nZXQtZGF0YS9SZXMuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvcmVjaXBlRGF0YS5mYWN0b3J5LmpzIiwiY29yZS9nZXQtZGF0YS91c2VyRGF0YS5mYWN0b3J5LmpzIiwiY29yZS9yZWNpcGVzL1JlY2lwZS5mYWN0b3J5LmpzIiwiY29yZS9yZWNpcGVzL3JlY2lwZUZvcm0uZGlyLmpzIiwiY29yZS9yZWNpcGVzL3JlY2lwZXNMaXN0LmRpci5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9kaXZpZGVyLmRpci5qcyIsImNvcmUvdWkvbG9hZGluZy5kaXIuanMiLCJjb3JlL3VpL3RyaW1TdHIuZmlsdGVyLmpzIiwiY29yZS91aS90cnVzdEFzSFRNTC5maWx0ZXIuanMiLCJtb2R1bGVzL2hlYWRlci9IZWFkZXIuY3RybC5qcyIsIm1vZHVsZXMvaGVhZGVyL25hdkNvbnRyb2wuZGlyLmpzIiwicGFnZXMvYWNjb3VudC9BY2NvdW50LmN0cmwuanMiLCJwYWdlcy9hZG1pbi9BZG1pbi5jdHJsLmpzIiwicGFnZXMvaG9tZS9Ib21lLmN0cmwuanMiLCJwYWdlcy9sb2dpbi9Mb2dpbi5jdHJsLmpzIiwicGFnZXMvbXktcmVjaXBlcy9NeVJlY2lwZXMuY3RybC5qcyIsInBhZ2VzL3JlY2lwZS9FZGl0UmVjaXBlLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvUmVjaXBlLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvbWluVG9ILmZpbHRlci5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0F1dGhvci5jdHJsLmpzIiwicGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQ2F0ZWdvcnkuY3RybC5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc1RhZy5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJywgJ25nRmlsZVVwbG9hZCddKTsiLCIvLyBsb2dpbiBhY2NvdW50IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIID0ge1xuXHRcdExPR0lOUzogW1xuXHRcdFx0e1xuXHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0fVxuXHRcdF1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIE9BVVRIKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXHRcdHZhciBfbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnJlc29sdmUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZSAmJiBjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAnckJveCc7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdBbGwgUmVjaXBlcyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRUaXRsZSgpIHtcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cblx0VXNlci4kaW5qZWN0ID0gWydPQVVUSCddO1xuXG5cdGZ1bmN0aW9uIFVzZXIoT0FVVEgpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRVdGlscy4kaW5qZWN0ID0gWyckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIFV0aWxzKCRhdXRoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWQ6IGlzQXV0aGVudGljYXRlZFxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBsb2dpbi9PYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBPQVVUSENMSUVOVFMgPSB7XG5cdFx0TE9HSU5VUkw6ICdodHRwOi8vcmJveC5rbWFpZGEuaW8vYXV0aC9sb2dpbicsXG5cdFx0Ly9MT0dJTlVSTDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hdXRoL2xvZ2luJyxcblx0XHRDTElFTlQ6IHtcblx0XHRcdEZCOiAnMzYwMTczMTk3NTA1NjUwJyxcblx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRUV0lUVEVSOiAnL2F1dGgvdHdpdHRlcicsXG5cdFx0XHRHSVRIVUI6ICc5ZmYwOTcyOTljODZlNTI0YjEwZidcblx0XHR9XG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEhDTElFTlRTJywgT0FVVEhDTElFTlRTKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlcicsICdPQVVUSENMSUVOVFMnXTtcblxuXHRmdW5jdGlvbiBhdXRoQ29uZmlnKCRhdXRoUHJvdmlkZXIsIE9BVVRIQ0xJRU5UUykge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBPQVVUSENMSUVOVFMuTE9HSU5VUkw7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkZCXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HT09HTEVcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIudHdpdHRlcih7XG5cdFx0XHR1cmw6IE9BVVRIQ0xJRU5UUy5DTElFTlQuVFdJVFRFUlxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5naXRodWIoe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuR0lUSFVCXG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoUnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJ107XG5cblx0ZnVuY3Rpb24gYXV0aFJ1bigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRhdXRoKSB7XG5cdFx0LyoqXG5cdFx0ICogJG9uICRyb3V0ZUNoYW5nZVN0YXJ0XG5cdFx0ICogQ2hlY2sgYXV0aGVudGljYXRpb25cblx0XHQgKiBSZWRpcmVjdCBhcHByb3ByaWF0ZWx5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXZlbnRcblx0XHQgKiBAcGFyYW0gbmV4dFxuXHRcdCAqIEBwYXJhbSBjdXJyZW50XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHJvdXRlQ2hhbmdlU3RhcnQoZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHQkcm9vdFNjb3BlLmF1dGhQYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuXHRcdFx0XHQkcm9vdFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gc2VuZCB1c2VyIHRvIGxvZ2luXG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfJHJvdXRlQ2hhbmdlU3RhcnQpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGFuZ3VsYXIvb24td2F0Y2hcblx0fVxuXG59KCkpOyIsIi8vIHJvdXRlc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsb2dpbidcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1ZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlL1JlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JlY2lwZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvYXV0aG9yLzp1c2VySWQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzQXV0aG9yQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy90YWcvOnRhZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNUYWdDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL2NhdGVnb3J5LzpjYXRlZ29yeScsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL215LXJlY2lwZXMnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL215LXJlY2lwZXMvTXlSZWNpcGVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTXlSZWNpcGVzQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ215UmVjaXBlcydcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1Zy9lZGl0Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0VkaXRSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZWRpdCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FjY291bnQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FjY291bnQvQWNjb3VudC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FjY291bnRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWNjb3VudCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FkbWluJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9hZG1pbi9BZG1pbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBZG1pbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhZG1pbidcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy8nXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdSZXMnLCBSZXMpO1xuXG5cdGZ1bmN0aW9uIFJlcygpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN1Y2Nlc3M6IHN1Y2Nlc3MsXG5cdFx0XHRlcnJvcjogZXJyb3Jcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHRcdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdFx0ICogVXNlZnVsIGZvciBBUElzIChpZSwgd2l0aCBuZ2lueCkgd2hlcmUgc2VydmVyIGVycm9yIEhUTUwgcGFnZSBtYXkgYmUgcmV0dXJuZWQgaW4gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBSZWNpcGUgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3JlY2lwZURhdGEnLCByZWNpcGVEYXRhKTtcblxuXHRyZWNpcGVEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZURhdGEoJGh0dHAsIFJlcykge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0UmVjaXBlOiBnZXRSZWNpcGUsXG5cdFx0XHRjcmVhdGVSZWNpcGU6IGNyZWF0ZVJlY2lwZSxcblx0XHRcdHVwZGF0ZVJlY2lwZTogdXBkYXRlUmVjaXBlLFxuXHRcdFx0ZGVsZXRlUmVjaXBlOiBkZWxldGVSZWNpcGUsXG5cdFx0XHRnZXRQdWJsaWNSZWNpcGVzOiBnZXRQdWJsaWNSZWNpcGVzLFxuXHRcdFx0Z2V0TXlSZWNpcGVzOiBnZXRNeVJlY2lwZXMsXG5cdFx0XHRnZXRBdXRob3JSZWNpcGVzOiBnZXRBdXRob3JSZWNpcGVzLFxuXHRcdFx0ZmlsZVJlY2lwZTogZmlsZVJlY2lwZSxcblx0XHRcdGdldEZpbGVkUmVjaXBlczogZ2V0RmlsZWRSZWNpcGVzLFxuXHRcdFx0Y2xlYW5VcGxvYWRzOiBjbGVhblVwbG9hZHNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNsdWcge3N0cmluZ30gcmVjaXBlIHNsdWdcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRSZWNpcGUoc2x1Zykge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlLycgKyBzbHVnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYSByZWNpcGUgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNyZWF0ZVJlY2lwZShyZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL25ldycsIHJlY2lwZURhdGEpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBhIHJlY2lwZSAoUFVUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRCAoaW4gY2FzZSBzbHVnIGhhcyBjaGFuZ2VkKVxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlUmVjaXBlKGlkLCByZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIGlkLCByZWNpcGVEYXRhKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBEZWxldGUgYSByZWNpcGUgKERFTEVURSlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSByZWNpcGUgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBkZWxldGVSZWNpcGUocmVjaXBlSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZGVsZXRlKCcvYXBpL3JlY2lwZS8nICsgcmVjaXBlSWQpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgcHVibGljIHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFB1YmxpY1JlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldE15UmVjaXBlcygpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMvbWUnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYSBzcGVjaWZpYyB1c2VyJ3MgcHVibGljIHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VySWQge3N0cmluZ30gdXNlciBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEF1dGhvclJlY2lwZXModXNlcklkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL2F1dGhvci8nICsgdXNlcklkKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGaWxlL3VuZmlsZSB0aGlzIHJlY2lwZSBpbiB1c2VyIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGZpbGVSZWNpcGUocmVjaXBlSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL3JlY2lwZS8nICsgcmVjaXBlSWQgKyAnL2ZpbGUnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgbXkgZmlsZWQgcmVjaXBlcyAoUE9TVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZHMge0FycmF5fSBhcnJheSBvZiB1c2VyJ3MgZmlsZWQgcmVjaXBlIElEc1xuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEZpbGVkUmVjaXBlcyhyZWNpcGVJZHMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGVzL21lL2ZpbGVkJywgcmVjaXBlSWRzKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDbGVhbiB1cGxvYWQgZmlsZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZmlsZXNcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjbGVhblVwbG9hZHMoZmlsZXMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvY2xlYW4tdXBsb2FkcycsIGZpbGVzKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiLy8gVXNlciBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgndXNlckRhdGEnLCB1c2VyRGF0YSk7XG5cblx0dXNlckRhdGEuJGluamVjdCA9IFsnJGh0dHAnLCAnUmVzJ107XG5cblx0ZnVuY3Rpb24gdXNlckRhdGEoJGh0dHAsIFJlcykge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0QXV0aG9yOiBnZXRBdXRob3IsXG5cdFx0XHRnZXRVc2VyOiBnZXRVc2VyLFxuXHRcdFx0dXBkYXRlVXNlcjogdXBkYXRlVXNlcixcblx0XHRcdGdldEFsbFVzZXJzOiBnZXRBbGxVc2Vyc1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgcmVjaXBlIGF1dGhvcidzIGJhc2ljIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSBNb25nb0RCIElEIG9mIHVzZXJcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3IoaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXIvJyArIGlkKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgY3VycmVudCB1c2VyJ3MgZGF0YSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0VXNlcigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGN1cnJlbnQgdXNlcidzIHByb2ZpbGUgZGF0YSAoUFVUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByb2ZpbGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlVXNlcihwcm9maWxlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvbWUnLCBwcm9maWxlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGFsbCB1c2VycyAoYWRtaW4gYXV0aG9yaXplZCBvbmx5KSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QWxsVXNlcnMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VycycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgZGlldGFyeSA9IFtcblx0XHQnR2x1dGVuLWZyZWUnLFxuXHRcdCdWZWdhbicsXG5cdFx0J1ZlZ2V0YXJpYW4nXG5cdF07XG5cblx0dmFyIGluc2VydENoYXIgPSBbXG5cdFx0J+KFmycsXG5cdFx0J8K8Jyxcblx0XHQn4oWTJyxcblx0XHQnwr0nLFxuXHRcdCfihZQnLFxuXHRcdCfCvidcblx0XTtcblxuXHR2YXIgY2F0ZWdvcmllcyA9IFtcblx0XHQnQXBwZXRpemVyJyxcblx0XHQnQmV2ZXJhZ2UnLFxuXHRcdCdEZXNzZXJ0Jyxcblx0XHQnRW50cmVlJyxcblx0XHQnU2FsYWQnLFxuXHRcdCdTaWRlJyxcblx0XHQnU291cCdcblx0XTtcblxuXHR2YXIgdGFncyA9IFtcblx0XHQnYWxjb2hvbCcsXG5cdFx0J2Jha2VkJyxcblx0XHQnYmVlZicsXG5cdFx0J2NvbmZlY3Rpb24nLFxuXHRcdCdmYXN0Jyxcblx0XHQnZmlzaCcsXG5cdFx0J2xvdy1jYWxvcmllJyxcblx0XHQnb25lLXBvdCcsXG5cdFx0J3Bhc3RhJyxcblx0XHQncG9yaycsXG5cdFx0J3BvdWx0cnknLFxuXHRcdCdzbG93LWNvb2snLFxuXHRcdCdzdG9jaycsXG5cdFx0J3ZlZ2V0YWJsZSdcblx0XTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlY2lwZScsIFJlY2lwZSk7XG5cblx0ZnVuY3Rpb24gUmVjaXBlKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGlldGFyeTogZGlldGFyeSxcblx0XHRcdGluc2VydENoYXI6IGluc2VydENoYXIsXG5cdFx0XHRjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuXHRcdFx0dGFnczogdGFncyxcblx0XHRcdGdlbmVyYXRlSWQ6IGdlbmVyYXRlSWRcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGVzIGEgdW5pcXVlIDUtY2hhcmFjdGVyIElEO1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZW5lcmF0ZUlkKCkge1xuXHRcdFx0dmFyIF9pZCA9ICcnO1xuXHRcdFx0dmFyIF9jaGFyc2V0ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Jztcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG5cdFx0XHRcdF9pZCArPSBfY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2NoYXJzZXQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBfaWQ7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVGb3JtJywgcmVjaXBlRm9ybSk7XG5cblx0cmVjaXBlRm9ybS4kaW5qZWN0ID0gWyckdGltZW91dCcsICdSZWNpcGUnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVGb3JtKCR0aW1lb3V0LCBSZWNpcGUpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0cmVjaXBlOiAnPScsXG5cdFx0XHRcdHVzZXJJZDogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzL3JlY2lwZUZvcm0udHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlRm9ybUN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdyZicsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogcmVjaXBlRm9ybUxpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogcmVjaXBlRm9ybSBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XG5cdFx0ICogQHBhcmFtICRhdHRyc1xuXHRcdCAqIEBwYXJhbSByZiB7Y29udHJvbGxlckFzfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlY2lwZUZvcm1MaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgcmYpIHtcblx0XHRcdC8vIHNldCB1cCAkc2NvcGUgb2JqZWN0IGZvciBuYW1lc3BhY2luZ1xuXHRcdFx0JHNjb3BlLnJmbCA9IHt9O1xuXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBhZGRJdGVtO1xuXHRcdFx0JHNjb3BlLnJmbC5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcblx0XHRcdCRzY29wZS5yZmwubW92ZUl0ZW0gPSBtb3ZlSXRlbTtcblx0XHRcdCRzY29wZS5yZmwubW92ZUluZ3JlZGllbnRzID0gZmFsc2U7XG5cdFx0XHQkc2NvcGUucmZsLm1vdmVEaXJlY3Rpb25zID0gZmFsc2U7XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgbmV3IGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqIEZvY3VzIHRoZSBuZXdlc3QgaW5wdXQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9IGNsaWNrIGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIHR5cGUge3N0cmluZ30gaW5nIC1vci0gc3RlcFxuXHRcdFx0ICogQHBhcmFtIGlzSGVhZGluZyB7Ym9vbGVhbn1cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gYWRkSXRlbSgkZXZlbnQsIG1vZGVsLCB0eXBlLCBpc0hlYWRpbmcpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiBSZWNpcGUuZ2VuZXJhdGVJZCgpLFxuXHRcdFx0XHRcdHR5cGU6IHR5cGVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoaXNIZWFkaW5nKSB7XG5cdFx0XHRcdFx0X25ld0l0ZW0uaXNIZWFkaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1vZGVsLnB1c2goX25ld0l0ZW0pO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBfbmV3ZXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkucGFyZW50KCdwJykucHJldignLmxhc3QnKS5maW5kKCdpbnB1dCcpLmVxKDApO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5mb2N1cygpOyAgIC8vIFRPRE86IGZvY3VzIGlzbid0IGhpZ2hsaWdodGluZyBwcm9wZXJseVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZW1vdmUgaXRlbVxuXHRcdFx0ICogSW5ncmVkaWVudCBvciBEaXJlY3Rpb24gc3RlcFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gaSB7aW5kZXh9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHJlbW92ZUl0ZW0obW9kZWwsIGkpIHtcblx0XHRcdFx0bW9kZWwuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVudGVyIG1vYmlsZSAtIHVuc2V0IGxhcmdlIHZpZXdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHRcdCRzY29wZS5yZmwuaXNMYXJnZVZpZXcgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFeGl0IG1vYmlsZSAtIHNldCBsYXJnZSB2aWV3XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHRcdCRzY29wZS5yZmwuaXNMYXJnZVZpZXcgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE1vdmUgaXRlbSB1cCBvciBkb3duXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtICRldmVudFxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBvbGRJbmRleCB7aW5kZXh9IGN1cnJlbnQgaW5kZXhcblx0XHRcdCAqIEBwYXJhbSBuZXdJbmRleCB7bnVtYmVyfSBuZXcgaW5kZXhcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gbW92ZUl0ZW0oJGV2ZW50LCBtb2RlbCwgb2xkSW5kZXgsIG5ld0luZGV4KSB7XG5cdFx0XHRcdHZhciBfaXRlbSA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdsaScpO1xuXG5cdFx0XHRcdG1vZGVsLm1vdmUob2xkSW5kZXgsIG5ld0luZGV4KTtcblxuXHRcdFx0XHRfaXRlbS5hZGRDbGFzcygnbW92ZWQnKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfaXRlbS5yZW1vdmVDbGFzcygnbW92ZWQnKTtcblx0XHRcdFx0fSwgNzAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZWNpcGVGb3JtQ3RybC4kaW5qZWN0ID0gWydyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdTbHVnJywgJyRsb2NhdGlvbicsICckdGltZW91dCcsICdVcGxvYWQnXTtcblxuXHQvKipcblx0ICogcmVjaXBlRm9ybSBDT05UUk9MTEVSIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSByZWNpcGVEYXRhXG5cdCAqIEBwYXJhbSBSZWNpcGVcblx0ICogQHBhcmFtIFNsdWdcblx0ICogQHBhcmFtICRsb2NhdGlvblxuXHQgKiBAcGFyYW0gJHRpbWVvdXRcblx0ICogQHBhcmFtIFVwbG9hZFxuXHQgKi9cblx0ZnVuY3Rpb24gcmVjaXBlRm9ybUN0cmwocmVjaXBlRGF0YSwgUmVjaXBlLCBTbHVnLCAkbG9jYXRpb24sICR0aW1lb3V0LCBVcGxvYWQpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJmID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9pc0VkaXQgPSAhIXJmLnJlY2lwZTtcblx0XHR2YXIgX29yaWdpbmFsU2x1ZyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuc2x1ZyA6IG51bGw7XG5cdFx0dmFyIF9sYXN0SW5wdXQ7XG5cdFx0dmFyIF9pbmdJbmRleDtcblx0XHR2YXIgX2NhcmV0UG9zO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdHJmLnJlY2lwZURhdGEgPSBfaXNFZGl0ID8gcmYucmVjaXBlIDoge307XG5cdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnVzZXJJZCA6IHJmLnVzZXJJZDtcblx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5waG90byA6IG51bGw7XG5cdFx0cmYuaXNUb3VjaERldmljZSA9ICEhTW9kZXJuaXpyLnRvdWNoZXZlbnRzO1xuXHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmluZ3JlZGllbnRzIDogW3tpZDogUmVjaXBlLmdlbmVyYXRlSWQoKSwgdHlwZTogJ2luZyd9XTtcblx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiBbe2lkOiBSZWNpcGUuZ2VuZXJhdGVJZCgpLCB0eXBlOiAnc3RlcCd9XTtcblx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MgPSBfaXNFZGl0ID8gcmYucmVjaXBlRGF0YS50YWdzIDogW107XG5cdFx0cmYudGltZVJlZ2V4ID0gL15bK10/KFswLTldKyg/OltcXC5dWzAtOV0qKT98XFwuWzAtOV0rKSQvO1xuXHRcdHJmLnRpbWVFcnJvciA9ICdQbGVhc2UgZW50ZXIgYSBudW1iZXIgaW4gbWludXRlcy4gTXVsdGlwbHkgaG91cnMgYnkgNjAuJztcblx0XHRyZi5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XG5cdFx0cmYudGFncyA9IFJlY2lwZS50YWdzO1xuXHRcdHJmLmRpZXRhcnkgPSBSZWNpcGUuZGlldGFyeTtcblx0XHRyZi5jaGFycyA9IFJlY2lwZS5pbnNlcnRDaGFyO1xuXHRcdHJmLmluc2VydENoYXJJbnB1dCA9IGluc2VydENoYXJJbnB1dDtcblx0XHRyZi5pbnNlcnRDaGFyID0gaW5zZXJ0Q2hhcjtcblx0XHRyZi5jbGVhckNoYXIgPSBjbGVhckNoYXI7XG5cdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblx0XHRyZi51cGRhdGVGaWxlID0gdXBkYXRlRmlsZTtcblx0XHRyZi5yZW1vdmVQaG90byA9IHJlbW92ZVBob3RvO1xuXHRcdHJmLnRhZ01hcCA9IHt9O1xuXHRcdHJmLmFkZFJlbW92ZVRhZyA9IGFkZFJlbW92ZVRhZztcblx0XHRyZi5zYXZlUmVjaXBlID0gc2F2ZVJlY2lwZTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0Ly8gY3JlYXRlIG1hcCBvZiB0b3VjaGVkIHRhZ3Ncblx0XHRcdGlmIChfaXNFZGl0ICYmIHJmLnJlY2lwZURhdGEudGFncy5sZW5ndGgpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHJmLnJlY2lwZURhdGEudGFncywgZnVuY3Rpb24odGFnLCBpKSB7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0X3Jlc2V0U2F2ZUJ0bigpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25FbmQge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCkge1xuXHRcdFx0dmFyIHJhbmdlID0gaW5wdXQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cblx0XHRcdGlmIChpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSkge1xuXHRcdFx0XHRpbnB1dC5jbGljaygpO1xuXHRcdFx0XHRpbnB1dC5mb2N1cygpO1xuXHRcdFx0XHRpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcblxuXHRcdFx0fSBlbHNlIGlmIChpbnB1dC5jcmVhdGVUZXh0UmFuZ2UpIHtcblx0XHRcdFx0cmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG5cdFx0XHRcdHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHNlbGVjdGlvbkVuZCk7XG5cdFx0XHRcdHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uU3RhcnQpO1xuXHRcdFx0XHRyYW5nZS5zZWxlY3QoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgY2FyZXQgcG9zaXRpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdCAqIEBwYXJhbSBwb3Mge251bWJlcn0gaW50ZW5kZWQgY2FyZXQgcG9zaXRpb25cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zZXRDYXJldFRvUG9zKGlucHV0LCBwb3MpIHtcblx0XHRcdF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgcG9zLCBwb3MpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEtlZXAgdHJhY2sgb2YgY2FyZXQgcG9zaXRpb24gaW4gaW5ncmVkaWVudCBhbW91bnQgdGV4dCBmaWVsZFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBpbmRleCB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGluc2VydENoYXJJbnB1dCgkZXZlbnQsIGluZGV4KSB7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0X2luZ0luZGV4ID0gaW5kZXg7XG5cdFx0XHRcdF9sYXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJyMnICsgJGV2ZW50LnRhcmdldC5pZCk7XG5cdFx0XHRcdF9jYXJldFBvcyA9IF9sYXN0SW5wdXRbMF0uc2VsZWN0aW9uU3RhcnQ7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBJbnNlcnQgY2hhcmFjdGVyIGF0IGxhc3QgY2FyZXQgcG9zaXRpb25cblx0XHQgKiBJbiBzdXBwb3J0ZWQgZmllbGRcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBjaGFyIHtzdHJpbmd9IHNwZWNpYWwgY2hhcmFjdGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaW5zZXJ0Q2hhcihjaGFyKSB7XG5cdFx0XHR2YXIgX3RleHRWYWw7XG5cblx0XHRcdGlmIChfbGFzdElucHV0KSB7XG5cdFx0XHRcdF90ZXh0VmFsID0gYW5ndWxhci5pc1VuZGVmaW5lZChyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10KSA/ICcnIDogcmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdDtcblxuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10ID0gX3RleHRWYWwuc3Vic3RyaW5nKDAsIF9jYXJldFBvcykgKyBjaGFyICsgX3RleHRWYWwuc3Vic3RyaW5nKF9jYXJldFBvcyk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0X2NhcmV0UG9zID0gX2NhcmV0UG9zICsgMTtcblx0XHRcdFx0XHRfc2V0Q2FyZXRUb1BvcyhfbGFzdElucHV0WzBdLCBfY2FyZXRQb3MpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDbGVhciBjYXJldCBwb3NpdGlvbiBhbmQgbGFzdCBpbnB1dFxuXHRcdCAqIFNvIHRoYXQgc3BlY2lhbCBjaGFyYWN0ZXJzIGRvbid0IGVuZCB1cCBpbiB1bmRlc2lyZWQgZmllbGRzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYXJDaGFyKCkge1xuXHRcdFx0X2luZ0luZGV4ID0gbnVsbDtcblx0XHRcdF9sYXN0SW5wdXQgPSBudWxsO1xuXHRcdFx0X2NhcmV0UG9zID0gbnVsbDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGxvYWQgaW1hZ2UgZmlsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzIHtBcnJheX0gYXJyYXkgb2YgZmlsZXMgdG8gdXBsb2FkXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlRmlsZShmaWxlcykge1xuXHRcdFx0aWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoZmlsZXNbMF0uc2l6ZSA+IDMwMDAwMCkge1xuXHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gJ0ZpbGVzaXplIG92ZXIgNTAwa2IgLSBwaG90byB3YXMgbm90IHVwbG9hZGVkLic7XG5cdFx0XHRcdFx0cmYucmVtb3ZlUGhvdG8oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IGZpbGVzWzBdOyAgICAvLyBvbmx5IHNpbmdsZSB1cGxvYWQgYWxsb3dlZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVtb3ZlIHVwbG9hZGVkIHBob3RvIGZyb20gZnJvbnQtZW5kXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlUGhvdG8oKSB7XG5cdFx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gbnVsbDtcblx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IG51bGw7XG5cdFx0XHRhbmd1bGFyLmVsZW1lbnQoJyNyZWNpcGVQaG90bycpLnZhbCgnJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQWRkIC8gcmVtb3ZlIHRhZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHRhZyB7c3RyaW5nfSB0YWcgbmFtZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGFkZFJlbW92ZVRhZyh0YWcpIHtcblx0XHRcdHZhciBfYWN0aXZlVGFnSW5kZXggPSByZi5yZWNpcGVEYXRhLnRhZ3MuaW5kZXhPZih0YWcpO1xuXG5cdFx0XHRpZiAoX2FjdGl2ZVRhZ0luZGV4ID4gLTEpIHtcblx0XHRcdFx0Ly8gdGFnIGV4aXN0cyBpbiBtb2RlbCwgdHVybiBpdCBvZmZcblx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnNwbGljZShfYWN0aXZlVGFnSW5kZXgsIDEpO1xuXHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGFnIGRvZXMgbm90IGV4aXN0IGluIG1vZGVsLCB0dXJuIGl0IG9uXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEudGFncy5wdXNoKHRhZyk7XG5cdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDbGVhbiBlbXB0eSBpdGVtcyBvdXQgb2YgYXJyYXkgYmVmb3JlIHNhdmluZ1xuXHRcdCAqIEluZ3JlZGllbnRzIG9yIERpcmVjdGlvbnNcblx0XHQgKiBBbHNvIGNsZWFycyBvdXQgZW1wdHkgaGVhZGluZ3Ncblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBtb2RlbE5hbWUge3N0cmluZ30gaW5ncmVkaWVudHMgLyBkaXJlY3Rpb25zXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfY2xlYW5FbXB0aWVzKG1vZGVsTmFtZSkge1xuXHRcdFx0dmFyIF9hcnJheSA9IHJmLnJlY2lwZURhdGFbbW9kZWxOYW1lXTtcblx0XHRcdHZhciBfY2hlY2sgPSBtb2RlbE5hbWUgPT09ICdpbmdyZWRpZW50cycgPyAnaW5ncmVkaWVudCcgOiAnc3RlcCc7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChfYXJyYXksIGZ1bmN0aW9uKG9iaiwgaSkge1xuXHRcdFx0XHRpZiAoISFvYmpbX2NoZWNrXSA9PT0gZmFsc2UgJiYgIW9iai5pc0hlYWRpbmcgfHwgb2JqLmlzSGVhZGluZyAmJiAhIW9iai5oZWFkaW5nVGV4dCA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRfYXJyYXkuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBzYXZlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXRTYXZlQnRuKCkge1xuXHRcdFx0cmYuc2F2ZWQgPSBmYWxzZTtcblx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRlIFJlY2lwZScgOiAnU2F2ZSBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlY2lwZSBjcmVhdGVkIG9yIHNhdmVkIHN1Y2Nlc3NmdWxseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZSB7cHJvbWlzZX0gaWYgZWRpdGluZyBldmVudFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVkKHJlY2lwZSkge1xuXHRcdFx0cmYuc2F2ZWQgPSB0cnVlO1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZWQhJyA6ICdTYXZlZCEnO1xuXG5cdFx0XHRpZiAoIV9pc0VkaXQgfHwgX2lzRWRpdCAmJiBfb3JpZ2luYWxTbHVnICE9PSByZi5yZWNpcGVEYXRhLnNsdWcpIHtcblx0XHRcdFx0JHRpbWVvdXQoX2dvVG9OZXdTbHVnLCAxMDAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDIwMDApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdvIHRvIG5ldyBzbHVnIChpZiBuZXcpIG9yIHVwZGF0ZWQgc2x1ZyAoaWYgc2x1ZyBjaGFuZ2VkKVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ29Ub05ld1NsdWcoKSB7XG5cdFx0XHR2YXIgX3BhdGggPSAhX2lzRWRpdCA/IHJlY2lwZS5zbHVnIDogcmYucmVjaXBlRGF0YS5zbHVnICsgJy9lZGl0JztcblxuXHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9yZWNpcGUvJyArIF9wYXRoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZWNpcGUgbm90IHNhdmVkIC8gY3JlYXRlZCBkdWUgdG8gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnIge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZUVycm9yKGVycikge1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHRyZi5zYXZlZCA9ICdlcnJvcic7XG5cdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCA0MDAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmUgaWYgZWRpdC9uZXdcblx0XHQgKiBFaXRoZXIgY3JlYXRlIG9yIHVwZGF0ZSByZWNpcGUgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dvU2F2ZVJlY2lwZSgpIHtcblx0XHRcdGlmICghX2lzRWRpdCkge1xuXHRcdFx0XHRyZWNpcGVEYXRhLmNyZWF0ZVJlY2lwZShyZi5yZWNpcGVEYXRhKS50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWNpcGVEYXRhLnVwZGF0ZVJlY2lwZShyZi5yZWNpcGUuX2lkLCByZi5yZWNpcGVEYXRhKS50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2F2ZSByZWNpcGVcblx0XHQgKiBDbGljayBvbiBzdWJtaXRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzYXZlUmVjaXBlKCkge1xuXHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGluZy4uLicgOiAnU2F2aW5nLi4uJztcblxuXHRcdFx0Ly8gcHJlcCBkYXRhIGZvciBzYXZpbmdcblx0XHRcdHJmLnJlY2lwZURhdGEuc2x1ZyA9IFNsdWcuc2x1Z2lmeShyZi5yZWNpcGVEYXRhLm5hbWUpO1xuXHRcdFx0X2NsZWFuRW1wdGllcygnaW5ncmVkaWVudHMnKTtcblx0XHRcdF9jbGVhbkVtcHRpZXMoJ2RpcmVjdGlvbnMnKTtcblxuXHRcdFx0Ly8gc2F2ZSB1cGxvYWRlZCBmaWxlLCBpZiB0aGVyZSBpcyBvbmVcblx0XHRcdC8vIG9uY2Ugc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIGltYWdlLCBzYXZlIHJlY2lwZSB3aXRoIHJlZmVyZW5jZSB0byBzYXZlZCBpbWFnZVxuXHRcdFx0aWYgKHJmLnVwbG9hZGVkRmlsZSkge1xuXHRcdFx0XHRVcGxvYWRcblx0XHRcdFx0XHQudXBsb2FkKHtcblx0XHRcdFx0XHRcdHVybDogJy9hcGkvcmVjaXBlL3VwbG9hZCcsXG5cdFx0XHRcdFx0XHRmaWxlOiByZi51cGxvYWRlZEZpbGVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5wcm9ncmVzcyhfdXBsb2FkUHJvZ3Jlc3NDQilcblx0XHRcdFx0XHQuc3VjY2VzcyhfdXBsb2FkU3VjY2Vzc0NCKVxuXHRcdFx0XHRcdC5lcnJvcihfdXBsb2FkRXJyb3JDQik7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vIHVwbG9hZGVkIGZpbGUsIHNhdmUgcmVjaXBlXG5cdFx0XHRcdF9nb1NhdmVSZWNpcGUoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGxvYWQgcHJvZ3Jlc3MgY2FsbGJhY2tcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBldnQge2V2ZW50fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VwbG9hZFByb2dyZXNzQ0IoZXZ0KSB7XG5cdFx0XHR2YXIgcHJvZ3Jlc3NQZXJjZW50YWdlID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcblx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gdHJ1ZTtcblx0XHRcdHJmLnVwbG9hZFByb2dyZXNzID0gcHJvZ3Jlc3NQZXJjZW50YWdlICsgJyUgJyArIGV2dC5jb25maWcuZmlsZS5uYW1lO1xuXG5cdFx0XHRjb25zb2xlLmxvZyhyZi51cGxvYWRQcm9ncmVzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBsb2FkIHN1Y2Nlc3MgY2FsbGJhY2tcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHBhcmFtIHN0YXR1c1xuXHRcdCAqIEBwYXJhbSBoZWFkZXJzXG5cdFx0ICogQHBhcmFtIGNvbmZpZ1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VwbG9hZFN1Y2Nlc3NDQihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IGRhdGEuZmlsZW5hbWU7XG5cblx0XHRcdFx0X2dvU2F2ZVJlY2lwZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBsb2FkIGVycm9yIGNhbGxiYWNrXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfdXBsb2FkRXJyb3JDQihlcnIpIHtcblx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdHJmLnVwbG9hZEVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuXG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3IgdXBsb2FkaW5nIGZpbGU6JywgZXJyLm1lc3NhZ2UgfHwgZXJyKTtcblxuXHRcdFx0X3JlY2lwZVNhdmVFcnJvcigpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlc0xpc3QnLCByZWNpcGVzTGlzdCk7XG5cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3QoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZXM6ICc9Jyxcblx0XHRcdFx0b3BlbkZpbHRlcnM6ICdAJyxcblx0XHRcdFx0Y3VzdG9tTGFiZWxzOiAnQCcsXG5cdFx0XHRcdGNhdGVnb3J5RmlsdGVyOiAnQCcsXG5cdFx0XHRcdHRhZ0ZpbHRlcjogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzL3JlY2lwZXNMaXN0LnRwbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6IHJlY2lwZXNMaXN0Q3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JsJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVzTGlzdExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogcmVjaXBlc0xpc3QgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlY2lwZXNMaXN0TGluaygkc2NvcGUpIHtcblx0XHRcdCRzY29wZS5ybGwgPSB7fTtcblxuXHRcdFx0Ly8gd2F0Y2ggdGhlIGN1cnJlbnRseSB2aXNpYmxlIG51bWJlciBvZiByZWNpcGVzIHRvIGRpc3BsYXkgYSBjb3VudFxuXHRcdFx0JHNjb3BlLiR3YXRjaChcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFuZ3VsYXIuZWxlbWVudCgnLnJlY2lwZXNMaXN0LWxpc3QtaXRlbScpLmxlbmd0aDtcblx0XHRcdFx0fSxcblx0XHRcdFx0XyR3YXRjaFJlY2lwZXNMaXN0XG5cdFx0XHQpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqICR3YXRjaCByZWNpcGVzTGlzdCBsaXN0IGl0ZW1zXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbFxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbFxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaFJlY2lwZXNMaXN0KG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHQkc2NvcGUucmxsLmRpc3BsYXllZFJlc3VsdHMgPSBuZXdWYWw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZWNpcGVzTGlzdEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1JlY2lwZSddO1xuXG5cdC8qKlxuXHQgKiByZWNpcGVzTGlzdCBDT05UUk9MTEVSXG5cdCAqXG5cdCAqIEBwYXJhbSAkc2NvcGVcblx0ICogQHBhcmFtIFJlY2lwZVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RDdHJsKCRzY29wZSwgUmVjaXBlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIHZpZXcgbW9kZWxcblx0XHR2YXIgcmwgPSB0aGlzO1xuXG5cdFx0Ly8gYnVpbGQgb3V0IHRoZSB0b3RhbCB0aW1lIGFuZCBudW1iZXIgb2YgaW5ncmVkaWVudHMgZm9yIHNvcnRpbmdcblx0XHR2YXIgX3dhdGNoUmVjaXBlcyA9ICRzY29wZS4kd2F0Y2goJ3JsLnJlY2lwZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmwucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdFx0cmVjaXBlLnRvdGFsVGltZSA9IChyZWNpcGUuY29va1RpbWUgPyByZWNpcGUuY29va1RpbWUgOiAwKSArIChyZWNpcGUucHJlcFRpbWUgPyByZWNpcGUucHJlcFRpbWUgOiAwKTtcblx0XHRcdFx0XHRyZWNpcGUubkluZyA9IHJlY2lwZS5pbmdyZWRpZW50cy5sZW5ndGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvLyBkZXJlZ2lzdGVyIHRoZSB3YXRjaFxuXHRcdFx0XHRfd2F0Y2hSZWNpcGVzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dmFyIF9sYXN0U29ydGVkQnkgPSAnbmFtZSc7XG5cdFx0dmFyIF9yZXN1bHRzU2V0ID0gMTU7ICAgLy8gbnVtYmVyIG9mIHJlY2lwZXMgdG8gc2hvdy9hZGQgaW4gYSBzZXRcblxuXHRcdHZhciBfb3BlbkZpbHRlcnNPbmxvYWQgPSAkc2NvcGUuJHdhdGNoKCdybC5vcGVuRmlsdGVycycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAoYW5ndWxhci5pc0RlZmluZWQobmV3VmFsKSkge1xuXHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gbmV3VmFsID09PSAndHJ1ZSc7XG5cdFx0XHRcdF9vcGVuRmlsdGVyc09ubG9hZCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gY29uZGl0aW9uYWxseSBzaG93IGNhdGVnb3J5IC8gdGFnIGZpbHRlcnNcblx0XHQvLyBhbHdheXMgc2hvdyBzcGVjaWFsIGRpZXQgZmlsdGVyXG5cdFx0aWYgKHJsLmNhdGVnb3J5RmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdHJsLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblx0XHRcdHJsLnNob3dDYXRlZ29yeUZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdGlmIChybC50YWdGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0cmwudGFncyA9IFJlY2lwZS50YWdzO1xuXHRcdFx0cmwuc2hvd1RhZ0ZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdHJsLnNwZWNpYWxEaWV0ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHQvLyBzZXQgYWxsIGZpbHRlcnMgdG8gZW1wdHlcblx0XHRybC5maWx0ZXJQcmVkaWNhdGVzID0ge307XG5cblx0XHQvLyBzZXQgdXAgc29ydCBwcmVkaWNhdGUgYW5kIHJldmVyc2Fsc1xuXHRcdHJsLnNvcnRQcmVkaWNhdGUgPSAnbmFtZSc7XG5cblx0XHRybC5yZXZlcnNlT2JqID0ge1xuXHRcdFx0bmFtZTogZmFsc2UsXG5cdFx0XHR0b3RhbFRpbWU6IGZhbHNlLFxuXHRcdFx0bkluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0cmwudG9nZ2xlU29ydCA9IHRvZ2dsZVNvcnQ7XG5cdFx0cmwubG9hZE1vcmUgPSBsb2FkTW9yZTtcblx0XHRybC50b2dnbGVTZWFyY2hGaWx0ZXIgPSB0b2dnbGVTZWFyY2hGaWx0ZXI7XG5cdFx0cmwuY2xlYXJTZWFyY2hGaWx0ZXIgPSBjbGVhclNlYXJjaEZpbHRlcjtcblx0XHRybC5hY3RpdmVTZWFyY2hGaWx0ZXJzID0gYWN0aXZlU2VhcmNoRmlsdGVycztcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLnF1ZXJ5JywgXyR3YXRjaFF1ZXJ5KTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLmZpbHRlclByZWRpY2F0ZXMnLCBfJHdhdGNoUHJlZGljYXRlcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZmlsdGVyIHByZWRpY2F0ZXNcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpIHtcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuY2F0ID0gJyc7XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLnRhZyA9ICcnO1xuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5kaWV0ID0gJyc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVG9nZ2xlIHNvcnQgYXNjL2Rlc2Ncblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcmVkaWNhdGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGVTb3J0KHByZWRpY2F0ZSkge1xuXHRcdFx0aWYgKF9sYXN0U29ydGVkQnkgPT09IHByZWRpY2F0ZSkge1xuXHRcdFx0XHRybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV0gPSAhcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0fVxuXHRcdFx0cmwucmV2ZXJzZSA9IHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdF9sYXN0U29ydGVkQnkgPSBwcmVkaWNhdGU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcmVzdWx0cyBzaG93aW5nIHRvIGluaXRpYWwgZGVmYXVsdCBvbiBzZWFyY2gvZmlsdGVyXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldFJlc3VsdHNTaG93aW5nKCkge1xuXHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gX3Jlc3VsdHNTZXQ7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTG9hZCBNb3JlIHJlc3VsdHNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkTW9yZSgpIHtcblx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IHJsLm5SZXN1bHRzU2hvd2luZyArPSBfcmVzdWx0c1NldDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiAkd2F0Y2ggc2VhcmNoIHF1ZXJ5IGFuZCBpZiBpdCBleGlzdHMsIGNsZWFyIGZpbHRlcnMgYW5kIHJlc2V0IHJlc3VsdHMgc2hvd2luZ1xuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHdhdGNoUXVlcnkoKSB7XG5cdFx0XHRpZiAocmwucXVlcnkpIHtcblx0XHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqICR3YXRjaCBmaWx0ZXJQcmVkaWNhdGVzXG5cdFx0ICogd2F0Y2ggZmlsdGVycyBhbmQgaWYgYW55IG9mIHRoZW0gY2hhbmdlLCByZXNldCB0aGUgcmVzdWx0cyBzaG93aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsXG5cdFx0ICogQHBhcmFtIG9sZFZhbFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gXyR3YXRjaFByZWRpY2F0ZXMobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmICghIW5ld1ZhbCAmJiBuZXdWYWwgIT09IG9sZFZhbCkge1xuXHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRvZ2dsZSBzZWFyY2gvZmlsdGVyIHNlY3Rpb24gb3Blbi9jbG9zZWRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGVTZWFyY2hGaWx0ZXIoKSB7XG5cdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gIXJsLnNob3dTZWFyY2hGaWx0ZXI7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYXIgc2VhcmNoIHF1ZXJ5IGFuZCBhbGwgZmlsdGVyc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNsZWFyU2VhcmNoRmlsdGVyKCkge1xuXHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0cmwucXVlcnkgPSAnJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTaG93IG51bWJlciBvZiBjdXJyZW50bHkgYWN0aXZlIHNlYXJjaCArIGZpbHRlciBpdGVtc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9XG5cdFx0ICogQHBhcmFtIGZpbHRlcnNPYmoge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGFjdGl2ZVNlYXJjaEZpbHRlcnMocXVlcnksIGZpbHRlcnNPYmopIHtcblx0XHRcdHZhciB0b3RhbCA9IDA7XG5cblx0XHRcdGlmIChxdWVyeSkge1xuXHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZmlsdGVyc09iaiwgZnVuY3Rpb24oZmlsdGVyKSB7XG5cdFx0XHRcdGlmIChmaWx0ZXIpIHtcblx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdG90YWw7XG5cdFx0fVxuXHR9XG59KCkpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE1RID0ge1xuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdNUScsIE1RKTtcbn0oKSk7IiwiLy8gRm9yIHRvdWNoZW5kL21vdXNldXAgYmx1clxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2JsdXJPbkVuZCcsIGJsdXJPbkVuZCk7XG5cblx0ZnVuY3Rpb24gYmx1ck9uRW5kKCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBibHVyT25FbmRMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGJsdXJPbkVuZCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYmx1ck9uRW5kTGluaygkc2NvcGUsICRlbGVtKSB7XG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0JGVsZW0uYmluZCgndG91Y2hlbmQnLCBfYmx1ckVsZW0pO1xuXHRcdFx0XHQkZWxlbS5iaW5kKCdtb3VzZXVwJywgX2JsdXJFbGVtKTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIF9vbkRlc3Ryb3kpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZpcmUgYmx1ciBldmVudFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9ibHVyRWxlbSgpIHtcblx0XHRcdFx0JGVsZW0udHJpZ2dlcignYmx1cicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9uICRkZXN0cm95LCB1bmJpbmQgaGFuZGxlcnNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb25EZXN0cm95KCkge1xuXHRcdFx0XHQkZWxlbS51bmJpbmQoJ3RvdWNoZW5kJywgX2JsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCdtb3VzZXVwJywgX2JsdXJFbGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdkZXRlY3RBZGJsb2NrJywgZGV0ZWN0QWRibG9jayk7XG5cblx0ZGV0ZWN0QWRibG9jay4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrKCR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogZGV0ZWN0QWRibG9ja0xpbmssXG5cdFx0XHR0ZW1wbGF0ZTogICAnPGRpdiBjbGFzcz1cImFkLXRlc3QgZmEtZmFjZWJvb2sgZmEtdHdpdHRlclwiIHN0eWxlPVwiaGVpZ2h0OjFweDtcIj48L2Rpdj4nICtcblx0XHRcdFx0XHRcdCc8ZGl2IG5nLWlmPVwiYWIuYmxvY2tlZFwiIGNsYXNzPVwiYWItbWVzc2FnZSBhbGVydCBhbGVydC1kYW5nZXJcIj4nICtcblx0XHRcdFx0XHRcdCc8aSBjbGFzcz1cImZhIGZhLWJhblwiPjwvaT4gPHN0cm9uZz5BZEJsb2NrPC9zdHJvbmc+IGlzIHByb2hpYml0aW5nIGltcG9ydGFudCBmdW5jdGlvbmFsaXR5ISBQbGVhc2UgZGlzYWJsZSBhZCBibG9ja2luZyBvbiA8c3Ryb25nPnt7YWIuaG9zdH19PC9zdHJvbmc+LiBUaGlzIHNpdGUgaXMgYWQtZnJlZS4nICtcblx0XHRcdFx0XHRcdCc8L2Rpdj4nXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGRldGVjdEFkQmxvY2sgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0XHQkc2NvcGUuYWIgPSB7fTtcblxuXHRcdFx0XHQvLyBob3N0bmFtZSBmb3IgbWVzc2FnaW5nXG5cdFx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGl2aWRlcicsIGRpdmlkZXIpO1xuXG5cdGZ1bmN0aW9uIGRpdmlkZXIoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInJCb3gtZGl2aWRlclwiPjxpIGNsYXNzPVwiZmEgZmEtY3V0bGVyeVwiPjwvaT48L2Rpdj4nXG5cdFx0fTtcblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3VpL2xvYWRpbmcudHBsLmh0bWwnLFxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcblx0XHRcdGNvbnRyb2xsZXI6IGxvYWRpbmdDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogbG9hZGluZ0xpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbG9hZGluZyBMSU5LXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkaW5nTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIGxvYWRpbmcpIHtcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vICR3YXRjaCBhY3RpdmUgc3RhdGVcblx0XHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9hZGluZy5hY3RpdmUnLCBfJHdhdGNoQWN0aXZlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxuXHRcdFx0ICogdG8gcHJldmVudCBzY3JvbGxiYXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Ym9vbGVhbn1cblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEFjdGl2ZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0X29wZW4oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbG9hZGluZ1xuXHRcdFx0ICogRGlzYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3BlbigpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbG9hZGluZ1xuXHRcdFx0ICogRW5hYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZSgpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnYXV0bydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiBsb2FkaW5nIENPTlRST0xMRVJcblx0ICogVXBkYXRlIHRoZSBsb2FkaW5nIHN0YXR1cyBiYXNlZFxuXHQgKiBvbiByb3V0ZUNoYW5nZSBzdGF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbG9hZGluZ0N0cmwoJHNjb3BlKSB7XG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vbicsIF9sb2FkaW5nQWN0aXZlKTtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nQWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGluYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nSW5hY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cmltU3RyJywgdHJpbVN0cik7XG5cblx0ZnVuY3Rpb24gdHJpbVN0cigpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyLCBjaGFycykge1xuXHRcdFx0dmFyIHRyaW1tZWRTdHIgPSBzdHI7XG5cdFx0XHR2YXIgX2NoYXJzID0gYW5ndWxhci5pc1VuZGVmaW5lZChjaGFycykgPyA1MCA6IGNoYXJzO1xuXG5cdFx0XHRpZiAoc3RyLmxlbmd0aCA+IF9jaGFycykge1xuXHRcdFx0XHR0cmltbWVkU3RyID0gc3RyLnN1YnN0cigwLCBfY2hhcnMpICsgJy4uLic7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cmltbWVkU3RyO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnVXRpbHMnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgJGF1dGgsIHVzZXJEYXRhLCBVdGlscykge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGxvZ291dDtcclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGluZGV4SXNBY3RpdmU7XHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBuYXZJc0FjdGl2ZTtcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSU5JVFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRfY2hlY2tVc2VyQWRtaW4oKTtcclxuXHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9nb3V0KCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIGFuZCBhZG1pblVzZXIgaXMgdW5kZWZpbmVkLFxyXG5cdFx0ICogZ2V0IHRoZSB1c2VyIGFuZCBzZXQgYWRtaW5Vc2VyIGJvb2xlYW4uXHJcblx0XHQgKlxyXG5cdFx0ICogRG8gdGhpcyBvbiBmaXJzdCBjb250cm9sbGVyIGxvYWQgKGluaXQsIHJlZnJlc2gpXHJcblx0XHQgKiBhbmQgc3Vic2VxdWVudCBsb2NhdGlvbiBjaGFuZ2VzIChpZSwgY2F0Y2hpbmcgbG9nb3V0LCBsb2dpbiwgZXRjKS5cclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfY2hlY2tVc2VyQWRtaW4oKSB7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRcdGhlYWRlci51c2VyID0gZGF0YTtcclxuXHRcdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gZGF0YS5pc0FkbWluO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdFx0aWYgKFV0aWxzLmlzQXV0aGVudGljYXRlZCgpICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQoaGVhZGVyLnVzZXIpKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbmF2Q29udHJvbCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcblx0XHRcdHZhciBfbmF2T3BlbjtcblxuXHRcdFx0Ly8gZGF0YSBtb2RlbFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcblx0XHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcblx0XHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzaXplZCB3aW5kb3cgKGRlYm91bmNlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X2xheW91dENhbnZhcy5jc3Moe1xuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKF9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZShtcSkge1xuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ1V0aWxzJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCBQYWdlLCBVdGlscywgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0YWNjb3VudC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnVXNlciBJbmZvJyxcblx0XHRcdFx0cXVlcnk6ICd1c2VyLWluZm8nXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnTWFuYWdlIExvZ2lucycsXG5cdFx0XHRcdHF1ZXJ5OiAnbWFuYWdlLWxvZ2lucydcblx0XHRcdH1cblx0XHRdO1xuXHRcdGFjY291bnQuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3VzZXItaW5mbyc7XG5cdFx0YWNjb3VudC5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7ICAvLyBhbGwgYXZhaWxhYmxlIGxvZ2luIHNlcnZpY2VzXG5cdFx0YWNjb3VudC5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cdFx0YWNjb3VudC5jaGFuZ2VUYWIgPSBjaGFuZ2VUYWI7XG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZ2V0UHJvZmlsZTtcblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSB1cGRhdGVQcm9maWxlO1xuXHRcdGFjY291bnQubGluayA9IGxpbms7XG5cdFx0YWNjb3VudC51bmxpbmsgPSB1bmxpbms7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ015IEFjY291bnQnKTtcblx0XHRcdF9idG5TYXZlUmVzZXQoKTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF8kd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFDVElWQVRFXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xuXHRcdFx0cmV0dXJuIGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hhbmdlVGFiKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0YWNjb3VudC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UHJvZmlsZSgpIHtcblx0XHRcdHJldHVybiB1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICogU2hvdyBhbiBlcnJvciBhbGVydCBpbiB0aGUgVUlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0YWNjb3VudC5lcnJvckdldHRpbmdVc2VyID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHdhdGNoRGlzcGxheU5hbWUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmIChuZXdWYWwgPT09ICcnIHx8IG5ld1ZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0VudGVyIE5hbWUnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVByb2ZpbGUoKSB7XG5cdFx0XHR2YXIgX3Byb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdGlmIChhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUpIHtcblx0XHRcdFx0Ly8gU2V0IHN0YXR1cyB0byBTYXZpbmcuLi4gYW5kIHVwZGF0ZSB1cG9uIHN1Y2Nlc3Mgb3IgZXJyb3IgaW4gY2FsbGJhY2tzXG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHVzZXIsIHBhc3NpbmcgcHJvZmlsZSBkYXRhIGFuZCBhc3NpZ25pbmcgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzXG5cdFx0XHRcdHVzZXJEYXRhLnVwZGF0ZVVzZXIoX3Byb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3MgY2FsbGJhY2sgd2hlbiBwcm9maWxlIGhhcyBiZWVuIHVwZGF0ZWRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZWQhJztcblxuXHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsaW5rKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihhY2NvdW50LmdldFByb2ZpbGUpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVubGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdW5saW5rKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC51bmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGFjY291bnQuZ2V0UHJvZmlsZSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSA/IHJlc3BvbnNlLmRhdGEubWVzc2FnZSA6ICdDb3VsZCBub3QgdW5saW5rICcgKyBwcm92aWRlciArICcgYWNjb3VudCcpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdVdGlscycsICd1c2VyRGF0YScsICdVc2VyJ107XG5cblx0ZnVuY3Rpb24gQWRtaW5DdHJsKCRzY29wZSwgUGFnZSwgVXRpbHMsIHVzZXJEYXRhLCBVc2VyKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0YWRtaW4uaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXHRcdGFkbWluLnVzZXJzID0gbnVsbDtcblx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnQWRtaW4nKTtcblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFDVElWQVRFXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xuXG5cdFx0XHRyZXR1cm4gdXNlckRhdGEuZ2V0QWxsVXNlcnMoKS50aGVuKF9nZXRBbGxVc2Vyc1N1Y2Nlc3MsIF9nZXRBbGxVc2Vyc0Vycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgQWRtaW4gVUlcblx0XHQgKiBEaXNwbGF5IGxpc3Qgb2YgdXNlcnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFkbWluLnVzZXJzID0gZGF0YTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGFkbWluLnVzZXJzLCBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdHVzZXIubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKHVzZXIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IHRydWU7XG5cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgdW5zdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBVbmF1dGhvcml6ZWQgZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7ZXJyb3J9IHJlc3BvbnNlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNFcnJvcihlcnJvcikge1xuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdVdGlscycsICd1c2VyRGF0YScsICckbG9jYXRpb24nXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCBQYWdlLCByZWNpcGVEYXRhLCBSZWNpcGUsIFV0aWxzLCB1c2VyRGF0YSwgJGxvY2F0aW9uKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcclxuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XHJcblx0XHR2YXIgaTtcclxuXHRcdHZhciBuO1xyXG5cdFx0dmFyIHQ7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS50YWJzID0gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1JlY2lwZSBCb3hlcycsXHJcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94ZXMnXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnU2VhcmNoIC8gQnJvd3NlIEFsbCcsXHJcblx0XHRcdFx0cXVlcnk6ICdzZWFyY2gtYnJvd3NlLWFsbCdcclxuXHRcdFx0fVxyXG5cdFx0XTtcclxuXHRcdGhvbWUuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3JlY2lwZS1ib3hlcyc7XHJcblx0XHRob21lLmNoYW5nZVRhYiA9IGNoYW5nZVRhYjtcclxuXHRcdGhvbWUuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xyXG5cdFx0aG9tZS50YWdzID0gUmVjaXBlLnRhZ3M7XHJcblx0XHRob21lLm1hcENhdGVnb3JpZXMgPSB7fTtcclxuXHRcdGhvbWUubWFwVGFncyA9IHt9O1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0FsbCBSZWNpcGVzJyk7XHJcblxyXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHJcblx0XHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgY2F0ZWdvcmllc1xyXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgaG9tZS5jYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW2hvbWUuY2F0ZWdvcmllc1tpXV0gPSAwO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBidWlsZCBoYXNobWFwIG9mIHRhZ3NcclxuXHRcdFx0Zm9yIChuID0gMDsgbiA8IGhvbWUudGFncy5sZW5ndGg7IG4rKykge1xyXG5cdFx0XHRcdGhvbWUubWFwVGFnc1tob21lLnRhZ3Nbbl1dID0gMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblxyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdFx0aWYgKFV0aWxzLmlzQXV0aGVudGljYXRlZCgpICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQoaG9tZS51c2VyKSkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XHJcblx0XHRcdH0gZWxzZSBpZiAoIVV0aWxzLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcblx0XHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ1dlbGNvbWUgdG8gPHN0cm9uZz5yQm94PC9zdHJvbmc+ISBCcm93c2UgdGhyb3VnaCB0aGUgcHVibGljIHJlY2lwZSBib3ggb3IgPGEgaHJlZj1cIi9sb2dpblwiPkxvZ2luPC9hPiB0byBmaWxlIG9yIGNvbnRyaWJ1dGUgcmVjaXBlcy4nO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBQ1RJVkFURVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcclxuXHJcblx0XHRcdHJldHVybiByZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKS50aGVuKF9wdWJsaWNSZWNpcGVzU3VjY2VzcywgX3B1YmxpY1JlY2lwZXNGYWlsdXJlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVudGVyIG1vYmlsZSAtIHZpZXcgaXMgc21hbGxcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IG1vYmlsZSAtIHZpZXcgaXMgbGFyZ2VcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoYW5nZSB0YWJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBjaGFuZ2VUYWIocXVlcnkpIHtcclxuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcclxuXHRcdFx0aG9tZS5jdXJyZW50VGFiID0gcXVlcnk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnJlY2lwZXMgPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gY291bnQgbnVtYmVyIG9mIHJlY2lwZXMgcGVyIGNhdGVnb3J5IGFuZCB0YWdcclxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGhvbWUucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW3JlY2lwZS5jYXRlZ29yeV0gKz0gMTtcclxuXHJcblx0XHRcdFx0Zm9yICh0ID0gMDsgdCA8IHJlY2lwZS50YWdzLmxlbmd0aDsgdCsrKSB7XHJcblx0XHRcdFx0XHRob21lLm1hcFRhZ3NbcmVjaXBlLnRhZ3NbdF1dICs9IDE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZhaWx1cmUgdG8gcmV0dXJuIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGVycm9yXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc0ZhaWx1cmUoZXJyb3IpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1RoZXJlIHdhcyBhbiBlcnJvciByZXRyaWV2aW5nIHJlY2lwZXM6JywgZXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlclxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnVzZXIgPSBkYXRhO1xyXG5cdFx0XHRob21lLndlbGNvbWVNc2cgPSAnSGVsbG8sICcgKyBob21lLnVzZXIuZGlzcGxheU5hbWUgKyAnISBXYW50IHRvIDxhIGhyZWY9XCIvbXktcmVjaXBlcz92aWV3PW5ldy1yZWNpcGVcIj5hZGQgYSBuZXcgcmVjaXBlPC9hPj8nO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnVXRpbHMnLCAnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBMb2dpbkN0cmwoUGFnZSwgVXRpbHMsICRhdXRoLCBPQVVUSCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXHRcdGxvZ2luLmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBhdXRoZW50aWNhdGU7XG5cdFx0bG9naW4ubG9nb3V0ID0gbG9nb3V0O1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGF1dGhlbnRpY2F0ZShwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChfYXV0aENhdGNoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGF1dGhlbnRpY2F0aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aENhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRsb2dpbi5sb2dpbk1zZyA9ICcnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxvZ291dCgpIHtcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignTXlSZWNpcGVzQ3RybCcsIE15UmVjaXBlc0N0cmwpO1xuXG5cdE15UmVjaXBlc0N0cmwuJGluamVjdCA9IFsnUGFnZScsICdVdGlscycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICckc2NvcGUnXTtcblxuXHRmdW5jdGlvbiBNeVJlY2lwZXNDdHJsKFBhZ2UsIFV0aWxzLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCAkc2NvcGUpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIG15UmVjaXBlcyA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0bXlSZWNpcGVzLnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnZmlsZWQtcmVjaXBlcydcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnbmV3LXJlY2lwZSdcblx0XHRcdH1cblx0XHRdO1xuXHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveCc7XG5cdFx0bXlSZWNpcGVzLmNoYW5nZVRhYiA9IGNoYW5nZVRhYjtcblx0XHRteVJlY2lwZXMuaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdNeSBSZWNpcGVzJyk7XG5cblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblxuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQUNUSVZBVEVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0XHRyZWNpcGVEYXRhLmdldE15UmVjaXBlcygpLnRoZW4oX3JlY2lwZXNTdWNjZXNzLCBfcmVjaXBlc0Vycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgLSBzZXQgc2hvcnRlciB0YWIgbmFtZXNcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdSZWNpcGUgQm94Jztcblx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQnO1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdOZXcgUmVjaXBlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSAtIHNldCBsb25nZXIgdGFiIG5hbWVzXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMF0ubmFtZSA9ICdNeSBSZWNpcGUgQm94Jztcblx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQgUmVjaXBlcyc7XG5cdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ0FkZCBOZXcgUmVjaXBlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoYW5nZVRhYihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHNhdmVkUmVjaXBlc09iaiA9IHtzYXZlZFJlY2lwZXM6IGRhdGEuc2F2ZWRSZWNpcGVzfTtcblx0XHRcdG15UmVjaXBlcy51c2VyID0gZGF0YTtcblxuXHRcdFx0cmVjaXBlRGF0YS5nZXRGaWxlZFJlY2lwZXMoc2F2ZWRSZWNpcGVzT2JqKS50aGVuKF9maWxlZFN1Y2Nlc3MpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHNhdmVkIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVzIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZmlsZWRTdWNjZXNzKHJlY2lwZXMpIHtcblx0XHRcdG15UmVjaXBlcy5maWxlZFJlY2lwZXMgPSByZWNpcGVzO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdG15UmVjaXBlcy5yZWNpcGVzID0gZGF0YTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNFcnJvcihlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgcmVjaXBlcycsIGVycm9yKTtcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0UmVjaXBlQ3RybCcsIEVkaXRSZWNpcGVDdHJsKTtcblxuXHRFZGl0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdVdGlscycsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBFZGl0UmVjaXBlQ3RybCgkc2NvcGUsIFBhZ2UsIFV0aWxzLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBlZGl0ID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9yZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRlZGl0LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdFZGl0IFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZWRpdCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdEZWxldGUgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdkZWxldGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRlZGl0LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdlZGl0Jztcblx0XHRlZGl0LmNoYW5nZVRhYiA9IGNoYW5nZVRhYjtcblx0XHRlZGl0LmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblx0XHRlZGl0LmRlbGV0ZVJlY2lwZSA9IGRlbGV0ZVJlY2lwZTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCBSZWNpcGUnKTtcblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdFx0X3Jlc2V0RGVsZXRlQnRuKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1ZykudGhlbihfcmVjaXBlU3VjY2VzcywgX3JlY2lwZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoYW5nZVRhYihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGVkaXQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdXNlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnVzZXIgPSBkYXRhO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0ZWRpdC5vcmlnaW5hbE5hbWUgPSBlZGl0LnJlY2lwZS5uYW1lO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCAnICsgZWRpdC5vcmlnaW5hbE5hbWUpO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnIge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVFcnJvcihlcnIpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRlZGl0LmVycm9yTXNnID0gZXJyLmRhdGEubWVzc2FnZTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IGRlbGV0ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RGVsZXRlQnRuKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gZmFsc2U7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlIFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGFmdGVyIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSB0cnVlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZWQhJztcblxuXHRcdFx0ZnVuY3Rpb24gX2dvVG9SZWNpcGVzKCkge1xuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL215LXJlY2lwZXMnKTtcblx0XHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfZ29Ub1JlY2lwZXMsIDE1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlRXJyb3IoKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSAnZXJyb3InO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0Vycm9yIGRlbGV0aW5nISc7XG5cblx0XHRcdCR0aW1lb3V0KF9yZXNldERlbGV0ZUJ0biwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIHJlY2lwZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRlbGV0ZVJlY2lwZSgpIHtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGluZy4uLic7XG5cdFx0XHRyZWNpcGVEYXRhLmRlbGV0ZVJlY2lwZShlZGl0LnJlY2lwZS5faWQpLnRoZW4oX2RlbGV0ZVN1Y2Nlc3MsIF9kZWxldGVFcnJvcik7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlQ3RybCcsIFJlY2lwZUN0cmwpO1xuXG5cdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAnVXRpbHMnLCAnJHJvdXRlUGFyYW1zJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVDdHJsKCRzY29wZSwgUGFnZSwgVXRpbHMsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciByZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0cmVjaXBlLmluZ0NoZWNrZWQgPSBbXTtcblx0XHRyZWNpcGUuc3RlcENoZWNrZWQgPSBbXTtcblx0XHRyZWNpcGUudG9nZ2xlQ2hlY2sgPSB0b2dnbGVDaGVjaztcblx0XHRyZWNpcGUuZmlsZVJlY2lwZSA9IGZpbGVSZWNpcGU7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ1JlY2lwZScpO1xuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQUNUSVZBVEVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShyZWNpcGVTbHVnKS50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9IHVzZXIgaW5mb1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS51c2VyID0gZGF0YTtcblxuXHRcdFx0Ly8gbG9nZ2VkIGluIHVzZXJzIGNhbiBmaWxlIHJlY2lwZXNcblx0XHRcdHJlY2lwZS5maWxlVGV4dCA9ICdGaWxlIHRoaXMgcmVjaXBlJztcblx0XHRcdHJlY2lwZS51bmZpbGVUZXh0ID0gJ1JlbW92ZSBmcm9tIEZpbGVkIFJlY2lwZXMnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSByZWNpcGUgZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJlY2lwZS5yZWNpcGUubmFtZSk7XG5cblx0XHRcdHVzZXJEYXRhLmdldEF1dGhvcihyZWNpcGUucmVjaXBlLnVzZXJJZCkudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHRcdF9jcmVhdGVDaGVja2VkQXJyYXlzKHJlY2lwZS5pbmdDaGVja2VkLCByZWNpcGUucmVjaXBlLmluZ3JlZGllbnRzKTtcblx0XHRcdF9jcmVhdGVDaGVja2VkQXJyYXlzKHJlY2lwZS5zdGVwQ2hlY2tlZCwgcmVjaXBlLnJlY2lwZS5kaXJlY3Rpb25zKTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhcnJheSB0byBrZWVwIHRyYWNrIG9mIGNoZWNrZWQgLyB1bmNoZWNrZWQgaXRlbXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBjaGVja2VkQXJyXG5cdFx0ICogQHBhcmFtIHNvdXJjZUFyclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2NyZWF0ZUNoZWNrZWRBcnJheXMoY2hlY2tlZEFyciwgc291cmNlQXJyKSB7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHNvdXJjZUFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjaGVja2VkQXJyW2ldID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXMge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IocmVzKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRyZWNpcGUuZXJyb3JNc2cgPSByZXMuZGF0YS5tZXNzYWdlO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVG9nZ2xlIGNoZWNrbWFya1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHR5cGVcblx0XHQgKiBAcGFyYW0gaW5kZXhcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGVDaGVjayh0eXBlLCBpbmRleCkge1xuXHRcdFx0cmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XSA9ICFyZWNpcGVbdHlwZSArICdDaGVja2VkJ11baW5kZXhdO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgYXV0aG9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSBhdXRob3IgcGljdHVyZSwgZGlzcGxheU5hbWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS5hdXRob3IgPSBkYXRhO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZpbGUgb3IgdW5maWxlIHRoaXMgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmaWxlUmVjaXBlKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gcmVjaXBlRGF0YS5maWxlUmVjaXBlKHJlY2lwZUlkKS50aGVuKF9maWxlU3VjY2VzcywgX2ZpbGVFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZmlsZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0XHRcdHJlY2lwZS5hcGlNc2cgPSBkYXRhLmFkZGVkID8gJ1JlY2lwZSBzYXZlZCEnIDogJ1JlY2lwZSByZW1vdmVkISc7XG5cdFx0XHRyZWNpcGUuZmlsZWQgPSBkYXRhLmFkZGVkO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2ZpbGVFcnJvcihyZXNwb25zZSkge1xuXHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ21pblRvSCcsIG1pblRvSCk7XG5cblx0ZnVuY3Rpb24gbWluVG9IKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihtaW4pIHtcblx0XHRcdHZhciBfaG91ciA9IDYwO1xuXHRcdFx0dmFyIF9taW4gPSBtaW4gKiAxO1xuXHRcdFx0dmFyIF9ndEhvdXIgPSBfbWluIC8gX2hvdXIgPj0gMTtcblx0XHRcdHZhciBfaFBsdXNNaW4gPSBfbWluICUgX2hvdXI7XG5cdFx0XHR2YXIgX2hhc01pbnV0ZXMgPSBfaFBsdXNNaW4gIT09IDA7XG5cdFx0XHR2YXIgX2hvdXJzID0gTWF0aC5mbG9vcihfbWluIC8gX2hvdXIpO1xuXHRcdFx0dmFyIF9ob3Vyc1RleHQgPSBfaG91cnMgPT09IDEgPyAnIGhvdXInIDogJyBob3Vycyc7XG5cdFx0XHR2YXIgX21pbnV0ZXMgPSBfaGFzTWludXRlcyA/ICcsICcgKyBfaFBsdXNNaW4gKyBfbWluVGV4dChfaFBsdXNNaW4pIDogJyc7XG5cdFx0XHR2YXIgX25vSE1pblRleHQgPSBfbWluID09PSAxID8gJyBtaW51dGUnIDogJyBtaW51dGVzJztcblx0XHRcdHZhciB0aW1lU3RyID0gbnVsbDtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHZXQgbWludXRlL3MgdGV4dCBmcm9tIG1pbnV0ZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbWludXRlcyB7bnVtYmVyfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9taW5UZXh0KG1pbnV0ZXMpIHtcblx0XHRcdFx0aWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGUnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgIT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGVzJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX2d0SG91cikge1xuXHRcdFx0XHR0aW1lU3RyID0gX2hvdXJzICsgX2hvdXJzVGV4dCArIF9taW51dGVzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGltZVN0ciA9IF9taW4gKyBfbm9ITWluVGV4dDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRpbWVTdHI7XG5cdFx0fTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNBdXRob3JDdHJsJywgUmVjaXBlc0F1dGhvckN0cmwpO1xuXG5cdFJlY2lwZXNBdXRob3JDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc0F1dGhvckN0cmwoJHNjb3BlLCBQYWdlLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfYWlkID0gJHJvdXRlUGFyYW1zLnVzZXJJZDtcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0F1dGhvcic7XG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFDVElWQVRFXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xuXG5cdFx0XHR1c2VyRGF0YS5nZXRBdXRob3IoX2FpZCkudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cdFx0XHRyZWNpcGVEYXRhLmdldEF1dGhvclJlY2lwZXMoX2FpZCkudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIGJ5ICcgKyByYS5hdXRob3IuZGlzcGxheU5hbWU7XG5cdFx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEucmVjaXBlcyA9IGRhdGE7XG5cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzQ2F0ZWdvcnlDdHJsJywgUmVjaXBlc0NhdGVnb3J5Q3RybCk7XG5cblx0UmVjaXBlc0NhdGVnb3J5Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNDYXRlZ29yeUN0cmwoJHNjb3BlLCBQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9jYXQgPSAkcm91dGVQYXJhbXMuY2F0ZWdvcnk7XG5cdFx0dmFyIF9jYXRUaXRsZSA9IF9jYXQuc3Vic3RyaW5nKDAsMSkudG9Mb2NhbGVVcHBlckNhc2UoKSArIF9jYXQuc3Vic3RyaW5nKDEpO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQ2F0ZWdvcnknO1xuXHRcdHJhLmhlYWRpbmcgPSBfY2F0VGl0bGUgKyAncyc7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAnZmFsc2UnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBQ1RJVkFURVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblxuXHRcdFx0cmV0dXJuIHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpLnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgY2F0QXJyID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0aWYgKHJlY2lwZS5jYXRlZ29yeSA9PSBfY2F0VGl0bGUpIHtcblx0XHRcdFx0XHRjYXRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IGNhdEFycjtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNUYWdDdHJsJywgUmVjaXBlc1RhZ0N0cmwpO1xuXG5cdFJlY2lwZXNUYWdDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ3JlY2lwZURhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc1RhZ0N0cmwoJHNjb3BlLCBQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF90YWcgPSAkcm91dGVQYXJhbXMudGFnO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzVGFnJztcblx0XHRyYS5oZWFkaW5nID0gJ1JlY2lwZXMgdGFnZ2VkIFwiJyArIF90YWcgKyAnXCInO1xuXHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAnZmFsc2UnO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQUNUSVZBVEVcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdHJldHVybiByZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKS50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHRhZ2dlZEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUudGFncy5pbmRleE9mKF90YWcpID4gLTEpIHtcblx0XHRcdFx0XHR0YWdnZWRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IHRhZ2dlZEFycjtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblx0fVxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

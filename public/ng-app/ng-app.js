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
					id: rf.generateId(),
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

		// share generateId function with Link
		rf.generateId = generateId;

		// is this a touch device?
		rf.isTouchDevice = !!Modernizr.touchevents;

		// build lists
		rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients : [{id: generateId(), type: 'ing'}];
		rf.recipeData.directions = _isEdit ? rf.recipe.directions : [{id: generateId(), type: 'step'}];

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
		 * Generates a unique 5-character ID;
		 * On $scope to share between controller and link
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
		function saveRecipe() {
			rf.uploadError = false;
			rf.saveBtnText = _isEdit ? 'Updating...' : 'Saving...';

			// prep data for saving
			rf.recipeData.slug = Slug.slugify(rf.recipeData.name);
			_cleanEmpties('ingredients');
			_cleanEmpties('directions');

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

					_saveRecipe();
				});
			}

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
				_saveRecipe();
			}
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
			var profileData = { displayName: account.user.displayName };

			if (account.user.displayName) {
				// Set status to Saving... and update upon success or error in callbacks
				account.btnSaveText = 'Saving...';

				// Update the user, passing profile data and assigning success and error callbacks
				userData.updateUser(profileData).then(_updateSuccess, _updateError);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvT0FVVEhDTElFTlRTLlNBTVBMRS5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL09BVVRIQ0xJRU5UUy5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9kaXZpZGVyLmRpci5qcyIsImNvcmUvdWkvbG9hZGluZy5kaXIuanMiLCJjb3JlL3VpL3RyaW1TdHIuZmlsdGVyLmpzIiwiY29yZS91aS90cnVzdEFzSFRNTC5maWx0ZXIuanMiLCJjb3JlL2dldC1kYXRhL1Jlcy5mYWN0b3J5LmpzIiwiY29yZS9nZXQtZGF0YS9yZWNpcGVEYXRhLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL3VzZXJEYXRhLmZhY3RvcnkuanMiLCJjb3JlL3JlY2lwZXMvUmVjaXBlLmZhY3RvcnkuanMiLCJjb3JlL3JlY2lwZXMvcmVjaXBlRm9ybS5kaXIuanMiLCJjb3JlL3JlY2lwZXMvcmVjaXBlc0xpc3QuZGlyLmpzIiwibW9kdWxlcy9oZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZDb250cm9sLmRpci5qcyIsInBhZ2VzL2FjY291bnQvQWNjb3VudC5jdHJsLmpzIiwicGFnZXMvYWRtaW4vQWRtaW4uY3RybC5qcyIsInBhZ2VzL2hvbWUvSG9tZS5jdHJsLmpzIiwicGFnZXMvbXktcmVjaXBlcy9NeVJlY2lwZXMuY3RybC5qcyIsInBhZ2VzL2xvZ2luL0xvZ2luLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJywgJ25nRmlsZVVwbG9hZCddKTsiLCIvLyBsb2dpbiBhY2NvdW50IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIID0ge1xuXHRcdExPR0lOUzogW1xuXHRcdFx0e1xuXHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0fVxuXHRcdF1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIE9BVVRIKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXHRcdHZhciBfbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnJlc29sdmUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZSAmJiBjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAnckJveCc7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdBbGwgUmVjaXBlcyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRUaXRsZSgpIHtcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cblx0VXNlci4kaW5qZWN0ID0gWydPQVVUSCddO1xuXG5cdGZ1bmN0aW9uIFVzZXIoT0FVVEgpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRVdGlscy4kaW5qZWN0ID0gWyckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIFV0aWxzKCRhdXRoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWQ6IGlzQXV0aGVudGljYXRlZFxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBsb2dpbi9PYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBPQVVUSENMSUVOVFMgPSB7XG5cdFx0TE9HSU5VUkw6ICdodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9sb2dpbicsXG5cdFx0Q0xJRU5UOiB7XG5cdFx0XHRGQjogJ1t5b3VyIEZhY2Vib29rIGNsaWVudCBJRF0nLFxuXHRcdFx0R09PR0xFOiAnW3lvdXIgR29vZ2xlIGNsaWVudCBJRF0nLFxuXHRcdFx0VFdJVFRFUjogJy9hdXRoL3R3aXR0ZXInLFxuXHRcdFx0R0lUSFVCOiAnW3lvdXIgR2l0SHViIGNsaWVudCBJRF0nXG5cdFx0fVxuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ09BVVRIQ0xJRU5UUycsIE9BVVRIQ0xJRU5UUyk7XG59KCkpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIQ0xJRU5UUyA9IHtcblx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHQvL0xPR0lOVVJMOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwL2F1dGgvbG9naW4nLFxuXHRcdENMSUVOVDoge1xuXHRcdFx0RkI6ICczNjAxNzMxOTc1MDU2NTAnLFxuXHRcdFx0R09PR0xFOiAnMzYyMTM2MzIyOTQyLWs0NWg1MnEzdXE1NmRjMWdhczFmNTJjMHVsaGc1MTkwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcblx0XHRcdFRXSVRURVI6ICcvYXV0aC90d2l0dGVyJyxcblx0XHRcdEdJVEhVQjogJzlmZjA5NzI5OWM4NmU1MjRiMTBmJ1xuXHRcdH1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSENMSUVOVFMnLCBPQVVUSENMSUVOVFMpO1xufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ09BVVRIQ0xJRU5UUyddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlciwgT0FVVEhDTElFTlRTKSB7XG5cdFx0JGF1dGhQcm92aWRlci5sb2dpblVybCA9IE9BVVRIQ0xJRU5UUy5MT0dJTlVSTDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuRkJcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkdPT0dMRVxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogT0FVVEhDTElFTlRTLkNMSUVOVC5UV0lUVEVSXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblxuXHRmdW5jdGlvbiBhdXRoUnVuKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJGF1dGgpIHtcblx0XHQvKipcblx0XHQgKiAkb24gJHJvdXRlQ2hhbmdlU3RhcnRcblx0XHQgKiBDaGVjayBhdXRoZW50aWNhdGlvblxuXHRcdCAqIFJlZGlyZWN0IGFwcHJvcHJpYXRlbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBldmVudFxuXHRcdCAqIEBwYXJhbSBuZXh0XG5cdFx0ICogQHBhcmFtIGN1cnJlbnRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF8kcm91dGVDaGFuZ2VTdGFydChldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdFx0aWYgKG5leHQgJiYgbmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5zZWN1cmUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGFuZ3VsYXIvbm8tcHJpdmF0ZS1jYWxsXG5cdFx0XHRcdCRyb290U2NvcGUuYXV0aFBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG5cdFx0XHRcdCRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyBzZW5kIHVzZXIgdG8gbG9naW5cblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIF8kcm91dGVDaGFuZ2VTdGFydCk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9vbi13YXRjaFxuXHR9XG5cbn0oKSk7IiwiLy8gcm91dGVzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmVjaXBlJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9hdXRob3IvOnVzZXJJZCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNBdXRob3JDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL3RhZy86dGFnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc1RhZ0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvY2F0ZWdvcnkvOmNhdGVnb3J5Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0NhdGVnb3J5Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbXktcmVjaXBlcycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbXktcmVjaXBlcy9NeVJlY2lwZXMudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNeVJlY2lwZXNDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbXlSZWNpcGVzJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRWRpdFJlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlZGl0J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSgpKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KCkpOyIsIi8vIEZvciB0b3VjaGVuZC9tb3VzZXVwIGJsdXJcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdibHVyT25FbmQnLCBibHVyT25FbmQpO1xuXG5cdGZ1bmN0aW9uIGJsdXJPbkVuZCgpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogYmx1ck9uRW5kTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBibHVyT25FbmQgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGJsdXJPbkVuZExpbmsoJHNjb3BlLCAkZWxlbSkge1xuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdCRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgX2JsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0uYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBfb25EZXN0cm95KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGaXJlIGJsdXIgZXZlbnRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYmx1ckVsZW0oKSB7XG5cdFx0XHRcdCRlbGVtLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiAkZGVzdHJveSwgdW5iaW5kIGhhbmRsZXJzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29uRGVzdHJveSgpIHtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCd0b3VjaGVuZCcsIF9ibHVyRWxlbSk7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBkZXRlY3RBZEJsb2NrIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1cblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0XHQkc2NvcGUuYWIuaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RpdmlkZXInLCBkaXZpZGVyKTtcblxuXHRmdW5jdGlvbiBkaXZpZGVyKCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJyQm94LWRpdmlkZXJcIj48aSBjbGFzcz1cImZhIGZhLWN1dGxlcnlcIj48L2k+PC9kaXY+J1xuXHRcdH07XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnbG9hZGluZycsIGxvYWRpbmcpO1xuXG5cdGxvYWRpbmcuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBsb2FkaW5nKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS91aS9sb2FkaW5nLnRwbC5odG1sJyxcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXG5cdFx0XHRjb250cm9sbGVyOiBsb2FkaW5nQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ2xvYWRpbmcnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IGxvYWRpbmdMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGxvYWRpbmcgTElOS1xuXHRcdCAqIERpc2FibGVzIHBhZ2Ugc2Nyb2xsaW5nIHdoZW4gbG9hZGluZyBvdmVybGF5IGlzIG9wZW5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICogQHBhcmFtIGxvYWRpbmcge2NvbnRyb2xsZXJ9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbG9hZGluZ0xpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBsb2FkaW5nKSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXG5cdFx0XHRcdFx0ZGVib3VuY2U6IDIwMFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyAkd2F0Y2ggYWN0aXZlIHN0YXRlXG5cdFx0XHRcdCRzY29wZS4kd2F0Y2goJ2xvYWRpbmcuYWN0aXZlJywgXyR3YXRjaEFjdGl2ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogV2luZG93IHJlc2l6ZWRcblx0XHRcdCAqIElmIGxvYWRpbmcsIHJlYXBwbHkgYm9keSBoZWlnaHRcblx0XHRcdCAqIHRvIHByZXZlbnQgc2Nyb2xsYmFyXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0XHRpZiAobG9hZGluZy5hY3RpdmUpIHtcblx0XHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRcdGhlaWdodDogX3dpbkhlaWdodCxcblx0XHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqICR3YXRjaCBsb2FkaW5nLmFjdGl2ZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBuZXdWYWwge2Jvb2xlYW59XG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsIHt1bmRlZmluZWR8Ym9vbGVhbn1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hBY3RpdmUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdF9vcGVuKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIGxvYWRpbmdcblx0XHRcdCAqIERpc2FibGUgc2Nyb2xsXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW4oKSB7XG5cdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdGhlaWdodDogX3dpbkhlaWdodCxcblx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIGxvYWRpbmdcblx0XHRcdCAqIEVuYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2UoKSB7XG5cdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdGhlaWdodDogJ2F1dG8nLFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2F1dG8nXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGxvYWRpbmdDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXHQvKipcblx0ICogbG9hZGluZyBDT05UUk9MTEVSXG5cdCAqIFVwZGF0ZSB0aGUgbG9hZGluZyBzdGF0dXMgYmFzZWRcblx0ICogb24gcm91dGVDaGFuZ2Ugc3RhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGxvYWRpbmdDdHJsKCRzY29wZSkge1xuXHRcdHZhciBsb2FkaW5nID0gdGhpcztcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb24nLCBfbG9hZGluZ0FjdGl2ZSk7XG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9mZicsIF9sb2FkaW5nSW5hY3RpdmUpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0FjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBpbmFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0luYWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJpbVN0cicsIHRyaW1TdHIpO1xuXG5cdGZ1bmN0aW9uIHRyaW1TdHIoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHN0ciwgY2hhcnMpIHtcblx0XHRcdHZhciB0cmltbWVkU3RyID0gc3RyO1xuXHRcdFx0dmFyIF9jaGFycyA9IGFuZ3VsYXIuaXNVbmRlZmluZWQoY2hhcnMpID8gNTAgOiBjaGFycztcblxuXHRcdFx0aWYgKHN0ci5sZW5ndGggPiBfY2hhcnMpIHtcblx0XHRcdFx0dHJpbW1lZFN0ciA9IHN0ci5zdWJzdHIoMCwgX2NoYXJzKSArICcuLi4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJpbW1lZFN0cjtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUmVzJywgUmVzKTtcblxuXHRmdW5jdGlvbiBSZXMoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRzdWNjZXNzOiBzdWNjZXNzLFxuXHRcdFx0ZXJyb3I6IGVycm9yXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UuZGF0YSkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiLy8gUmVjaXBlIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdyZWNpcGVEYXRhJywgcmVjaXBlRGF0YSk7XG5cblx0cmVjaXBlRGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFJlY2lwZTogZ2V0UmVjaXBlLFxuXHRcdFx0Y3JlYXRlUmVjaXBlOiBjcmVhdGVSZWNpcGUsXG5cdFx0XHR1cGRhdGVSZWNpcGU6IHVwZGF0ZVJlY2lwZSxcblx0XHRcdGRlbGV0ZVJlY2lwZTogZGVsZXRlUmVjaXBlLFxuXHRcdFx0Z2V0UHVibGljUmVjaXBlczogZ2V0UHVibGljUmVjaXBlcyxcblx0XHRcdGdldE15UmVjaXBlczogZ2V0TXlSZWNpcGVzLFxuXHRcdFx0Z2V0QXV0aG9yUmVjaXBlczogZ2V0QXV0aG9yUmVjaXBlcyxcblx0XHRcdGZpbGVSZWNpcGU6IGZpbGVSZWNpcGUsXG5cdFx0XHRnZXRGaWxlZFJlY2lwZXM6IGdldEZpbGVkUmVjaXBlcyxcblx0XHRcdGNsZWFuVXBsb2FkczogY2xlYW5VcGxvYWRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGUgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBzbHVnIHtzdHJpbmd9IHJlY2lwZSBzbHVnXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UmVjaXBlKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgcmVjaXBlIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjcmVhdGVSZWNpcGUocmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZS9uZXcnLCByZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYSByZWNpcGUgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSUQgKGluIGNhc2Ugc2x1ZyBoYXMgY2hhbmdlZClcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVJlY2lwZShpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIGEgcmVjaXBlIChERUxFVEUpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGVsZXRlUmVjaXBlKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmRlbGV0ZSgnL2FwaS9yZWNpcGUvJyArIGlkKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRQdWJsaWNSZWNpcGVzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRNeVJlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGEgc3BlY2lmaWMgdXNlcidzIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlcklkIHtzdHJpbmd9IHVzZXIgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3JSZWNpcGVzKHVzZXJJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9hdXRob3IvJyArIHVzZXJJZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRmlsZS91bmZpbGUgdGhpcyByZWNpcGUgaW4gdXNlciBkYXRhIChQVVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmaWxlUmVjaXBlKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIHJlY2lwZUlkICsgJy9maWxlJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IGZpbGVkIHJlY2lwZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWRzIHtBcnJheX0gYXJyYXkgb2YgdXNlcidzIGZpbGVkIHJlY2lwZSBJRHNcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRGaWxlZFJlY2lwZXMocmVjaXBlSWRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlcy9tZS9maWxlZCcsIHJlY2lwZUlkcylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gdXBsb2FkIGZpbGVzIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYW5VcGxvYWRzKGZpbGVzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL2NsZWFuLXVwbG9hZHMnLCBmaWxlcyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldEF1dGhvcjogZ2V0QXV0aG9yLFxuXHRcdFx0Z2V0VXNlcjogZ2V0VXNlcixcblx0XHRcdHVwZGF0ZVVzZXI6IHVwZGF0ZVVzZXIsXG5cdFx0XHRnZXRBbGxVc2VyczogZ2V0QWxsVXNlcnNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QXV0aG9yKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VyLycgKyBpZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSkgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGRpZXRhcnkgPSBbXG5cdFx0J0dsdXRlbi1mcmVlJyxcblx0XHQnVmVnYW4nLFxuXHRcdCdWZWdldGFyaWFuJ1xuXHRdO1xuXG5cdHZhciBpbnNlcnRDaGFyID0gW1xuXHRcdCfihZsnLFxuXHRcdCfCvCcsXG5cdFx0J+KFkycsXG5cdFx0J8K9Jyxcblx0XHQn4oWUJyxcblx0XHQnwr4nXG5cdF07XG5cblx0dmFyIGNhdGVnb3JpZXMgPSBbXG5cdFx0J0FwcGV0aXplcicsXG5cdFx0J0JldmVyYWdlJyxcblx0XHQnRGVzc2VydCcsXG5cdFx0J0VudHJlZScsXG5cdFx0J1NhbGFkJyxcblx0XHQnU2lkZScsXG5cdFx0J1NvdXAnXG5cdF07XG5cblx0dmFyIHRhZ3MgPSBbXG5cdFx0J2FsY29ob2wnLFxuXHRcdCdiYWtlZCcsXG5cdFx0J2JlZWYnLFxuXHRcdCdmYXN0Jyxcblx0XHQnZmlzaCcsXG5cdFx0J2xvdy1jYWxvcmllJyxcblx0XHQnb25lLXBvdCcsXG5cdFx0J3Bhc3RhJyxcblx0XHQncG9yaycsXG5cdFx0J3BvdWx0cnknLFxuXHRcdCdzbG93LWNvb2snLFxuXHRcdCdzdG9jaycsXG5cdFx0J3ZlZ2V0YWJsZSdcblx0XTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlY2lwZScsIFJlY2lwZSk7XG5cblx0ZnVuY3Rpb24gUmVjaXBlKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGlldGFyeTogZGlldGFyeSxcblx0XHRcdGluc2VydENoYXI6IGluc2VydENoYXIsXG5cdFx0XHRjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuXHRcdFx0dGFnczogdGFnc1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZUZvcm0nLCByZWNpcGVGb3JtKTtcblxuXHRyZWNpcGVGb3JtLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gcmVjaXBlRm9ybSgkdGltZW91dCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGU6ICc9Jyxcblx0XHRcdFx0dXNlcklkOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZXMvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVGb3JtTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiByZWNpcGVGb3JtIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICogQHBhcmFtIHJmIHtjb250cm9sbGVyQXN9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVjaXBlRm9ybUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCByZikge1xuXHRcdFx0Ly8gc2V0IHVwICRzY29wZSBvYmplY3QgZm9yIG5hbWVzcGFjaW5nXG5cdFx0XHQkc2NvcGUucmZsID0ge307XG5cblx0XHRcdCRzY29wZS5yZmwuYWRkSXRlbSA9IGFkZEl0ZW07XG5cdFx0XHQkc2NvcGUucmZsLnJlbW92ZUl0ZW0gPSByZW1vdmVJdGVtO1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlSXRlbSA9IG1vdmVJdGVtO1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlSW5ncmVkaWVudHMgPSBmYWxzZTtcblx0XHRcdCRzY29wZS5yZmwubW92ZURpcmVjdGlvbnMgPSBmYWxzZTtcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZCBuZXcgaXRlbVxuXHRcdFx0ICogSW5ncmVkaWVudCBvciBEaXJlY3Rpb24gc3RlcFxuXHRcdFx0ICogRm9jdXMgdGhlIG5ld2VzdCBpbnB1dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH0gY2xpY2sgZXZlbnRcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSBpbmcgLW9yLSBzdGVwXG5cdFx0XHQgKiBAcGFyYW0gaXNIZWFkaW5nIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBhZGRJdGVtKCRldmVudCwgbW9kZWwsIHR5cGUsIGlzSGVhZGluZykge1xuXHRcdFx0XHR2YXIgX25ld0l0ZW0gPSB7XG5cdFx0XHRcdFx0aWQ6IHJmLmdlbmVyYXRlSWQoKSxcblx0XHRcdFx0XHR0eXBlOiB0eXBlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKGlzSGVhZGluZykge1xuXHRcdFx0XHRcdF9uZXdJdGVtLmlzSGVhZGluZyA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtb2RlbC5wdXNoKF9uZXdJdGVtKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgX25ld2VzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCRldmVudC50YXJnZXQpLnBhcmVudCgncCcpLnByZXYoJy5sYXN0JykuZmluZCgnaW5wdXQnKS5lcSgwKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuY2xpY2soKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuZm9jdXMoKTsgICAvLyBUT0RPOiBmb2N1cyBpc24ndCBoaWdobGlnaHRpbmcgcHJvcGVybHlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVtb3ZlIGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIGkge2luZGV4fVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiByZW1vdmVJdGVtKG1vZGVsLCBpKSB7XG5cdFx0XHRcdG1vZGVsLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFbnRlciBtb2JpbGUgLSB1bnNldCBsYXJnZSB2aWV3XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0XHQkc2NvcGUucmZsLmlzTGFyZ2VWaWV3ID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXhpdCBtb2JpbGUgLSBzZXQgbGFyZ2Ugdmlld1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0XHQkc2NvcGUucmZsLmlzTGFyZ2VWaWV3ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNb3ZlIGl0ZW0gdXAgb3IgZG93blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnRcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gb2xkSW5kZXgge2luZGV4fSBjdXJyZW50IGluZGV4XG5cdFx0XHQgKiBAcGFyYW0gbmV3SW5kZXgge251bWJlcn0gbmV3IGluZGV4XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIG1vdmVJdGVtKCRldmVudCwgbW9kZWwsIG9sZEluZGV4LCBuZXdJbmRleCkge1xuXHRcdFx0XHR2YXIgX2l0ZW0gPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnbGknKTtcblxuXHRcdFx0XHRtb2RlbC5tb3ZlKG9sZEluZGV4LCBuZXdJbmRleCk7XG5cblx0XHRcdFx0X2l0ZW0uYWRkQ2xhc3MoJ21vdmVkJyk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0X2l0ZW0ucmVtb3ZlQ2xhc3MoJ21vdmVkJyk7XG5cdFx0XHRcdH0sIDcwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVjaXBlRm9ybUN0cmwuJGluamVjdCA9IFsncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnU2x1ZycsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnLCAnVXBsb2FkJ107XG5cblx0LyoqXG5cdCAqIHJlY2lwZUZvcm0gQ09OVFJPTExFUiBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gcmVjaXBlRGF0YVxuXHQgKiBAcGFyYW0gUmVjaXBlXG5cdCAqIEBwYXJhbSBTbHVnXG5cdCAqIEBwYXJhbSAkbG9jYXRpb25cblx0ICogQHBhcmFtICR0aW1lb3V0XG5cdCAqIEBwYXJhbSBVcGxvYWRcblx0ICovXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm1DdHJsKHJlY2lwZURhdGEsIFJlY2lwZSwgU2x1ZywgJGxvY2F0aW9uLCAkdGltZW91dCwgVXBsb2FkKSB7XG5cdFx0dmFyIHJmID0gdGhpcztcblx0XHR2YXIgX2lzRWRpdCA9ICEhcmYucmVjaXBlO1xuXHRcdHZhciBfb3JpZ2luYWxTbHVnID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5zbHVnIDogbnVsbDtcblxuXHRcdC8vIHNldHVwIHNwZWNpYWwgY2hhcmFjdGVycyBwcml2YXRlIHZhcnNcblx0XHR2YXIgX2xhc3RJbnB1dDtcblx0XHR2YXIgX2luZ0luZGV4O1xuXHRcdHZhciBfY2FyZXRQb3M7XG5cblx0XHRyZi5yZWNpcGVEYXRhID0gX2lzRWRpdCA/IHJmLnJlY2lwZSA6IHt9O1xuXHRcdHJmLnJlY2lwZURhdGEudXNlcklkID0gX2lzRWRpdCA/IHJmLnJlY2lwZS51c2VySWQgOiByZi51c2VySWQ7XG5cdFx0cmYucmVjaXBlRGF0YS5waG90byA9IF9pc0VkaXQgPyByZi5yZWNpcGUucGhvdG8gOiBudWxsO1xuXG5cdFx0Ly8gc2hhcmUgZ2VuZXJhdGVJZCBmdW5jdGlvbiB3aXRoIExpbmtcblx0XHRyZi5nZW5lcmF0ZUlkID0gZ2VuZXJhdGVJZDtcblxuXHRcdC8vIGlzIHRoaXMgYSB0b3VjaCBkZXZpY2U/XG5cdFx0cmYuaXNUb3VjaERldmljZSA9ICEhTW9kZXJuaXpyLnRvdWNoZXZlbnRzO1xuXG5cdFx0Ly8gYnVpbGQgbGlzdHNcblx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5pbmdyZWRpZW50cyA6IFt7aWQ6IGdlbmVyYXRlSWQoKSwgdHlwZTogJ2luZyd9XTtcblx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiBbe2lkOiBnZW5lcmF0ZUlkKCksIHR5cGU6ICdzdGVwJ31dO1xuXG5cdFx0cmYucmVjaXBlRGF0YS50YWdzID0gX2lzRWRpdCA/IHJmLnJlY2lwZURhdGEudGFncyA6IFtdO1xuXG5cdFx0Ly8gbWFuYWdlIHRpbWUgZmllbGRzXG5cdFx0cmYudGltZVJlZ2V4ID0gL15bK10/KFswLTldKyg/OltcXC5dWzAtOV0qKT98XFwuWzAtOV0rKSQvO1xuXHRcdHJmLnRpbWVFcnJvciA9ICdQbGVhc2UgZW50ZXIgYSBudW1iZXIgaW4gbWludXRlcy4gTXVsdGlwbHkgaG91cnMgYnkgNjAuJztcblxuXHRcdC8vIGZldGNoIGNhdGVnb3JpZXMgb3B0aW9ucyBsaXN0XG5cdFx0cmYuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xuXG5cdFx0Ly8gZmV0Y2ggdGFncyBvcHRpb25zIGxpc3Rcblx0XHRyZi50YWdzID0gUmVjaXBlLnRhZ3M7XG5cblx0XHQvLyBmZXRjaCBkaWV0YXJ5IG9wdGlvbnMgbGlzdFxuXHRcdHJmLmRpZXRhcnkgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdC8vIGZldGNoIHNwZWNpYWwgY2hhcmFjdGVyc1xuXHRcdHJmLmNoYXJzID0gUmVjaXBlLmluc2VydENoYXI7XG5cblx0XHRyZi5pbnNlcnRDaGFySW5wdXQgPSBpbnNlcnRDaGFySW5wdXQ7XG5cdFx0cmYuaW5zZXJ0Q2hhciA9IGluc2VydENoYXI7XG5cdFx0cmYuY2xlYXJDaGFyID0gY2xlYXJDaGFyO1xuXG5cdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblx0XHRyZi51cGRhdGVGaWxlID0gdXBkYXRlRmlsZTtcblx0XHRyZi5yZW1vdmVQaG90byA9IHJlbW92ZVBob3RvO1xuXG5cdFx0cmYudGFnTWFwID0ge307XG5cdFx0cmYuYWRkUmVtb3ZlVGFnID0gYWRkUmVtb3ZlVGFnO1xuXG5cdFx0cmYuc2F2ZVJlY2lwZSA9IHNhdmVSZWNpcGU7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGNyZWF0ZSBtYXAgb2YgdG91Y2hlZCB0YWdzXG5cdFx0XHRpZiAoX2lzRWRpdCAmJiByZi5yZWNpcGVEYXRhLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChyZi5yZWNpcGVEYXRhLnRhZ3MsIGZ1bmN0aW9uKHRhZywgaSkge1xuXHRcdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdF9yZXNldFNhdmVCdG4oKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgNS1jaGFyYWN0ZXIgSUQ7XG5cdFx0ICogT24gJHNjb3BlIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlciBhbmQgbGlua1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZW5lcmF0ZUlkKCkge1xuXHRcdFx0dmFyIF9pZCA9ICcnO1xuXHRcdFx0dmFyIF9jaGFyc2V0ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Jztcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG5cdFx0XHRcdF9pZCArPSBfY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogX2NoYXJzZXQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBfaWQ7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IHNlbGVjdGlvbiByYW5nZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0ICogQHBhcmFtIHNlbGVjdGlvblN0YXJ0IHtudW1iZXJ9XG5cdFx0ICogQHBhcmFtIHNlbGVjdGlvbkVuZCB7bnVtYmVyfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKSB7XG5cdFx0XHR2YXIgcmFuZ2UgPSBpbnB1dC5jcmVhdGVUZXh0UmFuZ2UoKTtcblxuXHRcdFx0aWYgKGlucHV0LnNldFNlbGVjdGlvblJhbmdlKSB7XG5cdFx0XHRcdGlucHV0LmNsaWNrKCk7XG5cdFx0XHRcdGlucHV0LmZvY3VzKCk7XG5cdFx0XHRcdGlucHV0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaW5wdXQuY3JlYXRlVGV4dFJhbmdlKSB7XG5cdFx0XHRcdHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuXHRcdFx0XHRyYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0XHRyYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIHNlbGVjdGlvblN0YXJ0KTtcblx0XHRcdFx0cmFuZ2Uuc2VsZWN0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGNhcmV0IHBvc2l0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaW5wdXRcblx0XHQgKiBAcGFyYW0gcG9zIHtudW1iZXJ9IGludGVuZGVkIGNhcmV0IHBvc2l0aW9uXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc2V0Q2FyZXRUb1BvcyhpbnB1dCwgcG9zKSB7XG5cdFx0XHRfc2V0U2VsZWN0aW9uUmFuZ2UoaW5wdXQsIHBvcywgcG9zKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBLZWVwIHRyYWNrIG9mIGNhcmV0IHBvc2l0aW9uIGluIGluZ3JlZGllbnQgYW1vdW50IHRleHQgZmllbGRcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gaW5kZXgge251bWJlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpbnNlcnRDaGFySW5wdXQoJGV2ZW50LCBpbmRleCkge1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9pbmdJbmRleCA9IGluZGV4O1xuXHRcdFx0XHRfbGFzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCcjJyArICRldmVudC50YXJnZXQuaWQpO1xuXHRcdFx0XHRfY2FyZXRQb3MgPSBfbGFzdElucHV0WzBdLnNlbGVjdGlvblN0YXJ0O1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogSW5zZXJ0IGNoYXJhY3RlciBhdCBsYXN0IGNhcmV0IHBvc2l0aW9uXG5cdFx0ICogSW4gc3VwcG9ydGVkIGZpZWxkXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gY2hhciB7c3RyaW5nfSBzcGVjaWFsIGNoYXJhY3RlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGluc2VydENoYXIoY2hhcikge1xuXHRcdFx0dmFyIF90ZXh0VmFsO1xuXG5cdFx0XHRpZiAoX2xhc3RJbnB1dCkge1xuXHRcdFx0XHRfdGV4dFZhbCA9IGFuZ3VsYXIuaXNVbmRlZmluZWQocmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCkgPyAnJyA6IHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQ7XG5cblx0XHRcdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCA9IF90ZXh0VmFsLnN1YnN0cmluZygwLCBfY2FyZXRQb3MpICsgY2hhciArIF90ZXh0VmFsLnN1YnN0cmluZyhfY2FyZXRQb3MpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9jYXJldFBvcyA9IF9jYXJldFBvcyArIDE7XG5cdFx0XHRcdFx0X3NldENhcmV0VG9Qb3MoX2xhc3RJbnB1dFswXSwgX2NhcmV0UG9zKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYXIgY2FyZXQgcG9zaXRpb24gYW5kIGxhc3QgaW5wdXRcblx0XHQgKiBTbyB0aGF0IHNwZWNpYWwgY2hhcmFjdGVycyBkb24ndCBlbmQgdXAgaW4gdW5kZXNpcmVkIGZpZWxkc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNsZWFyQ2hhcigpIHtcblx0XHRcdF9pbmdJbmRleCA9IG51bGw7XG5cdFx0XHRfbGFzdElucHV0ID0gbnVsbDtcblx0XHRcdF9jYXJldFBvcyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBsb2FkIGltYWdlIGZpbGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBmaWxlcyB7QXJyYXl9IGFycmF5IG9mIGZpbGVzIHRvIHVwbG9hZFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZUZpbGUoZmlsZXMpIHtcblx0XHRcdGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGZpbGVzWzBdLnNpemUgPiAzMDAwMDApIHtcblx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9ICdGaWxlc2l6ZSBvdmVyIDUwMGtiIC0gcGhvdG8gd2FzIG5vdCB1cGxvYWRlZC4nO1xuXHRcdFx0XHRcdHJmLnJlbW92ZVBob3RvKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0XHRyZi51cGxvYWRlZEZpbGUgPSBmaWxlc1swXTsgICAgLy8gb25seSBzaW5nbGUgdXBsb2FkIGFsbG93ZWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZSB1cGxvYWRlZCBwaG90byBmcm9tIGZyb250LWVuZFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZVBob3RvKCkge1xuXHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IG51bGw7XG5cdFx0XHRyZi51cGxvYWRlZEZpbGUgPSBudWxsO1xuXHRcdFx0YW5ndWxhci5lbGVtZW50KCcjcmVjaXBlUGhvdG8nKS52YWwoJycpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFkZCAvIHJlbW92ZSB0YWdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB0YWcge3N0cmluZ30gdGFnIG5hbWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBhZGRSZW1vdmVUYWcodGFnKSB7XG5cdFx0XHR2YXIgX2FjdGl2ZVRhZ0luZGV4ID0gcmYucmVjaXBlRGF0YS50YWdzLmluZGV4T2YodGFnKTtcblxuXHRcdFx0aWYgKF9hY3RpdmVUYWdJbmRleCA+IC0xKSB7XG5cdFx0XHRcdC8vIHRhZyBleGlzdHMgaW4gbW9kZWwsIHR1cm4gaXQgb2ZmXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEudGFncy5zcGxpY2UoX2FjdGl2ZVRhZ0luZGV4LCAxKTtcblx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHRhZyBkb2VzIG5vdCBleGlzdCBpbiBtb2RlbCwgdHVybiBpdCBvblxuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MucHVzaCh0YWcpO1xuXHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gZW1wdHkgaXRlbXMgb3V0IG9mIGFycmF5IGJlZm9yZSBzYXZpbmdcblx0XHQgKiBJbmdyZWRpZW50cyBvciBEaXJlY3Rpb25zXG5cdFx0ICogQWxzbyBjbGVhcnMgb3V0IGVtcHR5IGhlYWRpbmdzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbW9kZWxOYW1lIHtzdHJpbmd9IGluZ3JlZGllbnRzIC8gZGlyZWN0aW9uc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2NsZWFuRW1wdGllcyhtb2RlbE5hbWUpIHtcblx0XHRcdHZhciBfYXJyYXkgPSByZi5yZWNpcGVEYXRhW21vZGVsTmFtZV07XG5cdFx0XHR2YXIgX2NoZWNrID0gbW9kZWxOYW1lID09PSAnaW5ncmVkaWVudHMnID8gJ2luZ3JlZGllbnQnIDogJ3N0ZXAnO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goX2FycmF5LCBmdW5jdGlvbihvYmosIGkpIHtcblx0XHRcdFx0aWYgKCEhb2JqW19jaGVja10gPT09IGZhbHNlICYmICFvYmouaXNIZWFkaW5nIHx8IG9iai5pc0hlYWRpbmcgJiYgISFvYmouaGVhZGluZ1RleHQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0X2FycmF5LnNwbGljZShpLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgc2F2ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0U2F2ZUJ0bigpIHtcblx0XHRcdHJmLnNhdmVkID0gZmFsc2U7XG5cdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZSBSZWNpcGUnIDogJ1NhdmUgUmVjaXBlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZWNpcGUgY3JlYXRlZCBvciBzYXZlZCBzdWNjZXNzZnVsbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGUge3Byb21pc2V9IGlmIGVkaXRpbmcgZXZlbnRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlZChyZWNpcGUpIHtcblx0XHRcdHJmLnNhdmVkID0gdHJ1ZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGVkIScgOiAnU2F2ZWQhJztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHbyB0byBuZXcgc2x1ZyAoaWYgbmV3KSBvciB1cGRhdGVkIHNsdWcgKGlmIHNsdWcgY2hhbmdlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ29Ub05ld1NsdWcoKSB7XG5cdFx0XHRcdHZhciBfcGF0aCA9ICFfaXNFZGl0ID8gcmVjaXBlLnNsdWcgOiByZi5yZWNpcGVEYXRhLnNsdWcgKyAnL2VkaXQnO1xuXG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvcmVjaXBlLycgKyBfcGF0aCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghX2lzRWRpdCB8fCBfaXNFZGl0ICYmIF9vcmlnaW5hbFNsdWcgIT09IHJmLnJlY2lwZURhdGEuc2x1Zykge1xuXHRcdFx0XHQkdGltZW91dChfZ29Ub05ld1NsdWcsIDEwMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgMjAwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVjaXBlIG5vdCBzYXZlZCAvIGNyZWF0ZWQgZHVlIHRvIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVFcnJvcihlcnIpIHtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0cmYuc2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgNDAwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2F2ZSByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc2F2ZVJlY2lwZSgpIHtcblx0XHRcdGlmICghX2lzRWRpdCkge1xuXHRcdFx0XHRyZWNpcGVEYXRhLmNyZWF0ZVJlY2lwZShyZi5yZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVjaXBlRGF0YS51cGRhdGVSZWNpcGUocmYucmVjaXBlLl9pZCwgcmYucmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX3JlY2lwZVNhdmVkLCBfcmVjaXBlU2F2ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTYXZlIHJlY2lwZVxuXHRcdCAqIENsaWNrIG9uIHN1Ym1pdFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNhdmVSZWNpcGUoKSB7XG5cdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0aW5nLi4uJyA6ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHQvLyBwcmVwIGRhdGEgZm9yIHNhdmluZ1xuXHRcdFx0cmYucmVjaXBlRGF0YS5zbHVnID0gU2x1Zy5zbHVnaWZ5KHJmLnJlY2lwZURhdGEubmFtZSk7XG5cdFx0XHRfY2xlYW5FbXB0aWVzKCdpbmdyZWRpZW50cycpO1xuXHRcdFx0X2NsZWFuRW1wdGllcygnZGlyZWN0aW9ucycpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFVwbG9hZCBwcm9ncmVzcyBjYWxsYmFja1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBldnQge2V2ZW50fVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwbG9hZFByb2dyZXNzQ0IoZXZ0KSB7XG5cdFx0XHRcdHZhciBwcm9ncmVzc1BlcmNlbnRhZ2UgPSBwYXJzZUludCgxMDAuMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWwpO1xuXHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gdHJ1ZTtcblx0XHRcdFx0cmYudXBsb2FkUHJvZ3Jlc3MgPSBwcm9ncmVzc1BlcmNlbnRhZ2UgKyAnJSAnICsgZXZ0LmNvbmZpZy5maWxlLm5hbWU7XG5cblx0XHRcdFx0Y29uc29sZS5sb2cocmYudXBsb2FkUHJvZ3Jlc3MpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFVwbG9hZCBlcnJvciBjYWxsYmFja1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnIge29iamVjdH1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGxvYWRFcnJvckNCKGVycikge1xuXHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdFcnJvciB1cGxvYWRpbmcgZmlsZTonLCBlcnIubWVzc2FnZSB8fCBlcnIpO1xuXG5cdFx0XHRcdF9yZWNpcGVTYXZlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVcGxvYWQgc3VjY2VzcyBjYWxsYmFja1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0XHQgKiBAcGFyYW0gc3RhdHVzXG5cdFx0XHQgKiBAcGFyYW0gaGVhZGVyc1xuXHRcdFx0ICogQHBhcmFtIGNvbmZpZ1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwbG9hZFN1Y2Nlc3NDQihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IGRhdGEuZmlsZW5hbWU7XG5cblx0XHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2F2ZSB1cGxvYWRlZCBmaWxlLCBpZiB0aGVyZSBpcyBvbmVcblx0XHRcdC8vIG9uY2Ugc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIGltYWdlLCBzYXZlIHJlY2lwZSB3aXRoIHJlZmVyZW5jZSB0byBzYXZlZCBpbWFnZVxuXHRcdFx0aWYgKHJmLnVwbG9hZGVkRmlsZSkge1xuXHRcdFx0XHRVcGxvYWRcblx0XHRcdFx0XHQudXBsb2FkKHtcblx0XHRcdFx0XHRcdHVybDogJy9hcGkvcmVjaXBlL3VwbG9hZCcsXG5cdFx0XHRcdFx0XHRmaWxlOiByZi51cGxvYWRlZEZpbGVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5wcm9ncmVzcyhfdXBsb2FkUHJvZ3Jlc3NDQilcblx0XHRcdFx0XHQuc3VjY2VzcyhfdXBsb2FkU3VjY2Vzc0NCKVxuXHRcdFx0XHRcdC5lcnJvcihfdXBsb2FkRXJyb3JDQik7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vIHVwbG9hZGVkIGZpbGUsIHNhdmUgcmVjaXBlXG5cdFx0XHRcdF9zYXZlUmVjaXBlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVzTGlzdCcsIHJlY2lwZXNMaXN0KTtcblxuXHRmdW5jdGlvbiByZWNpcGVzTGlzdCgpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0cmVjaXBlczogJz0nLFxuXHRcdFx0XHRvcGVuRmlsdGVyczogJ0AnLFxuXHRcdFx0XHRjdXN0b21MYWJlbHM6ICdAJyxcblx0XHRcdFx0Y2F0ZWdvcnlGaWx0ZXI6ICdAJyxcblx0XHRcdFx0dGFnRmlsdGVyOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZXMvcmVjaXBlc0xpc3QudHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlc0xpc3RDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAncmwnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IHJlY2lwZXNMaXN0TGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiByZWNpcGVzTGlzdCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RMaW5rKCRzY29wZSkge1xuXHRcdFx0JHNjb3BlLnJsbCA9IHt9O1xuXG5cdFx0XHQvLyB3YXRjaCB0aGUgY3VycmVudGx5IHZpc2libGUgbnVtYmVyIG9mIHJlY2lwZXMgdG8gZGlzcGxheSBhIGNvdW50XG5cdFx0XHQkc2NvcGUuJHdhdGNoKFxuXHRcdFx0XHRmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gYW5ndWxhci5lbGVtZW50KCcucmVjaXBlc0xpc3QtbGlzdC1pdGVtJykubGVuZ3RoO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRfJHdhdGNoUmVjaXBlc0xpc3Rcblx0XHRcdCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIHJlY2lwZXNMaXN0IGxpc3QgaXRlbXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsXG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJHdhdGNoUmVjaXBlc0xpc3QobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdCRzY29wZS5ybGwuZGlzcGxheWVkUmVzdWx0cyA9IG5ld1ZhbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlY2lwZXNMaXN0Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUmVjaXBlJ107XG5cblx0LyoqXG5cdCAqIHJlY2lwZXNMaXN0IENPTlRST0xMRVJcblx0ICpcblx0ICogQHBhcmFtICRzY29wZVxuXHQgKiBAcGFyYW0gUmVjaXBlXG5cdCAqL1xuXHRmdW5jdGlvbiByZWNpcGVzTGlzdEN0cmwoJHNjb3BlLCBSZWNpcGUpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgdmlldyBtb2RlbFxuXHRcdHZhciBybCA9IHRoaXM7XG5cblx0XHQvLyBidWlsZCBvdXQgdGhlIHRvdGFsIHRpbWUgYW5kIG51bWJlciBvZiBpbmdyZWRpZW50cyBmb3Igc29ydGluZ1xuXHRcdHZhciBfd2F0Y2hSZWNpcGVzID0gJHNjb3BlLiR3YXRjaCgncmwucmVjaXBlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChybC5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0XHRyZWNpcGUudG90YWxUaW1lID0gKHJlY2lwZS5jb29rVGltZSA/IHJlY2lwZS5jb29rVGltZSA6IDApICsgKHJlY2lwZS5wcmVwVGltZSA/IHJlY2lwZS5wcmVwVGltZSA6IDApO1xuXHRcdFx0XHRcdHJlY2lwZS5uSW5nID0gcmVjaXBlLmluZ3JlZGllbnRzLmxlbmd0aDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vIGRlcmVnaXN0ZXIgdGhlIHdhdGNoXG5cdFx0XHRcdF93YXRjaFJlY2lwZXMoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR2YXIgX2xhc3RTb3J0ZWRCeSA9ICduYW1lJztcblx0XHR2YXIgX3Jlc3VsdHNTZXQgPSAxNTsgICAvLyBudW1iZXIgb2YgcmVjaXBlcyB0byBzaG93L2FkZCBpbiBhIHNldFxuXG5cdFx0dmFyIF9vcGVuRmlsdGVyc09ubG9hZCA9ICRzY29wZS4kd2F0Y2goJ3JsLm9wZW5GaWx0ZXJzJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmIChhbmd1bGFyLmlzRGVmaW5lZChuZXdWYWwpKSB7XG5cdFx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSBuZXdWYWwgPT09ICd0cnVlJztcblx0XHRcdFx0X29wZW5GaWx0ZXJzT25sb2FkKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBjb25kaXRpb25hbGx5IHNob3cgY2F0ZWdvcnkgLyB0YWcgZmlsdGVyc1xuXHRcdC8vIGFsd2F5cyBzaG93IHNwZWNpYWwgZGlldCBmaWx0ZXJcblx0XHRpZiAocmwuY2F0ZWdvcnlGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0cmwuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xuXHRcdFx0cmwuc2hvd0NhdGVnb3J5RmlsdGVyID0gdHJ1ZTtcblx0XHR9XG5cdFx0aWYgKHJsLnRhZ0ZpbHRlciA9PT0gJ3RydWUnKSB7XG5cdFx0XHRybC50YWdzID0gUmVjaXBlLnRhZ3M7XG5cdFx0XHRybC5zaG93VGFnRmlsdGVyID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmwuc3BlY2lhbERpZXQgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdC8vIHNldCBhbGwgZmlsdGVycyB0byBlbXB0eVxuXHRcdHJsLmZpbHRlclByZWRpY2F0ZXMgPSB7fTtcblxuXHRcdC8vIHNldCB1cCBzb3J0IHByZWRpY2F0ZSBhbmQgcmV2ZXJzYWxzXG5cdFx0cmwuc29ydFByZWRpY2F0ZSA9ICduYW1lJztcblxuXHRcdHJsLnJldmVyc2VPYmogPSB7XG5cdFx0XHRuYW1lOiBmYWxzZSxcblx0XHRcdHRvdGFsVGltZTogZmFsc2UsXG5cdFx0XHRuSW5nOiBmYWxzZVxuXHRcdH07XG5cblx0XHRybC50b2dnbGVTb3J0ID0gdG9nZ2xlU29ydDtcblx0XHRybC5sb2FkTW9yZSA9IGxvYWRNb3JlO1xuXHRcdHJsLnRvZ2dsZVNlYXJjaEZpbHRlciA9IHRvZ2dsZVNlYXJjaEZpbHRlcjtcblx0XHRybC5jbGVhclNlYXJjaEZpbHRlciA9IGNsZWFyU2VhcmNoRmlsdGVyO1xuXHRcdHJsLmFjdGl2ZVNlYXJjaEZpbHRlcnMgPSBhY3RpdmVTZWFyY2hGaWx0ZXJzO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgncmwucXVlcnknLCBfJHdhdGNoUXVlcnkpO1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgncmwuZmlsdGVyUHJlZGljYXRlcycsIF8kd2F0Y2hQcmVkaWNhdGVzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBmaWx0ZXIgcHJlZGljYXRlc1xuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCkge1xuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5jYXQgPSAnJztcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMudGFnID0gJyc7XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLmRpZXQgPSAnJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUb2dnbGUgc29ydCBhc2MvZGVzY1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByZWRpY2F0ZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHRvZ2dsZVNvcnQocHJlZGljYXRlKSB7XG5cdFx0XHRpZiAoX2xhc3RTb3J0ZWRCeSA9PT0gcHJlZGljYXRlKSB7XG5cdFx0XHRcdHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXSA9ICFybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV07XG5cdFx0XHR9XG5cdFx0XHRybC5yZXZlcnNlID0gcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0X2xhc3RTb3J0ZWRCeSA9IHByZWRpY2F0ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCByZXN1bHRzIHNob3dpbmcgdG8gaW5pdGlhbCBkZWZhdWx0IG9uIHNlYXJjaC9maWx0ZXJcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0UmVzdWx0c1Nob3dpbmcoKSB7XG5cdFx0XHRybC5uUmVzdWx0c1Nob3dpbmcgPSBfcmVzdWx0c1NldDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBMb2FkIE1vcmUgcmVzdWx0c1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxvYWRNb3JlKCkge1xuXHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gcmwublJlc3VsdHNTaG93aW5nICs9IF9yZXN1bHRzU2V0O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqICR3YXRjaCBzZWFyY2ggcXVlcnkgYW5kIGlmIGl0IGV4aXN0cywgY2xlYXIgZmlsdGVycyBhbmQgcmVzZXQgcmVzdWx0cyBzaG93aW5nXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF8kd2F0Y2hRdWVyeSgpIHtcblx0XHRcdGlmIChybC5xdWVyeSkge1xuXHRcdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogJHdhdGNoIGZpbHRlclByZWRpY2F0ZXNcblx0XHQgKiB3YXRjaCBmaWx0ZXJzIGFuZCBpZiBhbnkgb2YgdGhlbSBjaGFuZ2UsIHJlc2V0IHRoZSByZXN1bHRzIHNob3dpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWxcblx0XHQgKiBAcGFyYW0gb2xkVmFsXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHdhdGNoUHJlZGljYXRlcyhuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKCEhbmV3VmFsICYmIG5ld1ZhbCAhPT0gb2xkVmFsKSB7XG5cdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVG9nZ2xlIHNlYXJjaC9maWx0ZXIgc2VjdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHRvZ2dsZVNlYXJjaEZpbHRlcigpIHtcblx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSAhcmwuc2hvd1NlYXJjaEZpbHRlcjtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDbGVhciBzZWFyY2ggcXVlcnkgYW5kIGFsbCBmaWx0ZXJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYXJTZWFyY2hGaWx0ZXIoKSB7XG5cdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRybC5xdWVyeSA9ICcnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNob3cgbnVtYmVyIG9mIGN1cnJlbnRseSBhY3RpdmUgc2VhcmNoICsgZmlsdGVyIGl0ZW1zXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ31cblx0XHQgKiBAcGFyYW0gZmlsdGVyc09iaiB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYWN0aXZlU2VhcmNoRmlsdGVycyhxdWVyeSwgZmlsdGVyc09iaikge1xuXHRcdFx0dmFyIHRvdGFsID0gMDtcblxuXHRcdFx0aWYgKHF1ZXJ5KSB7XG5cdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdH1cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzT2JqLCBmdW5jdGlvbihmaWx0ZXIpIHtcblx0XHRcdFx0aWYgKGZpbHRlcikge1xuXHRcdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0b3RhbDtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnVXRpbHMnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgJGF1dGgsIHVzZXJEYXRhLCBVdGlscykge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGxvZ291dDtcclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGluZGV4SXNBY3RpdmU7XHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBuYXZJc0FjdGl2ZTtcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSU5JVFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRfY2hlY2tVc2VyQWRtaW4oKTtcclxuXHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9nb3V0KCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIGFuZCBhZG1pblVzZXIgaXMgdW5kZWZpbmVkLFxyXG5cdFx0ICogZ2V0IHRoZSB1c2VyIGFuZCBzZXQgYWRtaW5Vc2VyIGJvb2xlYW4uXHJcblx0XHQgKlxyXG5cdFx0ICogRG8gdGhpcyBvbiBmaXJzdCBjb250cm9sbGVyIGxvYWQgKGluaXQsIHJlZnJlc2gpXHJcblx0XHQgKiBhbmQgc3Vic2VxdWVudCBsb2NhdGlvbiBjaGFuZ2VzIChpZSwgY2F0Y2hpbmcgbG9nb3V0LCBsb2dpbiwgZXRjKS5cclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfY2hlY2tVc2VyQWRtaW4oKSB7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRcdGhlYWRlci51c2VyID0gZGF0YTtcclxuXHRcdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gZGF0YS5pc0FkbWluO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdFx0aWYgKFV0aWxzLmlzQXV0aGVudGljYXRlZCgpICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQoaGVhZGVyLnVzZXIpKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbmF2Q29udHJvbCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcblx0XHRcdHZhciBfbmF2T3BlbjtcblxuXHRcdFx0Ly8gZGF0YSBtb2RlbFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcblx0XHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcblx0XHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzaXplZCB3aW5kb3cgKGRlYm91bmNlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X2xheW91dENhbnZhcy5jc3Moe1xuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKF9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZShtcSkge1xuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ1V0aWxzJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCBQYWdlLCBVdGlscywgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0YWNjb3VudC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnVXNlciBJbmZvJyxcblx0XHRcdFx0cXVlcnk6ICd1c2VyLWluZm8nXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnTWFuYWdlIExvZ2lucycsXG5cdFx0XHRcdHF1ZXJ5OiAnbWFuYWdlLWxvZ2lucydcblx0XHRcdH1cblx0XHRdO1xuXHRcdGFjY291bnQuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3VzZXItaW5mbyc7XG5cdFx0YWNjb3VudC5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7ICAvLyBhbGwgYXZhaWxhYmxlIGxvZ2luIHNlcnZpY2VzXG5cdFx0YWNjb3VudC5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cdFx0YWNjb3VudC5jaGFuZ2VUYWIgPSBjaGFuZ2VUYWI7XG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZ2V0UHJvZmlsZTtcblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSB1cGRhdGVQcm9maWxlO1xuXHRcdGFjY291bnQubGluayA9IGxpbms7XG5cdFx0YWNjb3VudC51bmxpbmsgPSB1bmxpbms7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ015IEFjY291bnQnKTtcblx0XHRcdF9idG5TYXZlUmVzZXQoKTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF8kd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFDVElWQVRFXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xuXHRcdFx0cmV0dXJuIGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hhbmdlVGFiKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0YWNjb3VudC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UHJvZmlsZSgpIHtcblx0XHRcdHJldHVybiB1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICogU2hvdyBhbiBlcnJvciBhbGVydCBpbiB0aGUgVUlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0YWNjb3VudC5lcnJvckdldHRpbmdVc2VyID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHdhdGNoRGlzcGxheU5hbWUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmIChuZXdWYWwgPT09ICcnIHx8IG5ld1ZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0VudGVyIE5hbWUnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVByb2ZpbGUoKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0aWYgKGFjY291bnQudXNlci5kaXNwbGF5TmFtZSkge1xuXHRcdFx0XHQvLyBTZXQgc3RhdHVzIHRvIFNhdmluZy4uLiBhbmQgdXBkYXRlIHVwb24gc3VjY2VzcyBvciBlcnJvciBpbiBjYWxsYmFja3Ncblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgdXNlciwgcGFzc2luZyBwcm9maWxlIGRhdGEgYW5kIGFzc2lnbmluZyBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3Ncblx0XHRcdFx0dXNlckRhdGEudXBkYXRlVXNlcihwcm9maWxlRGF0YSkudGhlbihfdXBkYXRlU3VjY2VzcywgX3VwZGF0ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IHRydWU7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfdXBkYXRlRXJyb3IoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbGluayhwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oYWNjb3VudC5nZXRQcm9maWxlKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVubGluayhwcm92aWRlcikge1xuXHRcdFx0JGF1dGgudW5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihhY2NvdW50LmdldFByb2ZpbGUpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWRtaW5DdHJsJywgQWRtaW5DdHJsKTtcblxuXHRBZG1pbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAnVXRpbHMnLCAndXNlckRhdGEnLCAnVXNlciddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybCgkc2NvcGUsIFBhZ2UsIFV0aWxzLCB1c2VyRGF0YSwgVXNlcikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWRtaW4gPSB0aGlzO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdGFkbWluLmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblx0XHRhZG1pbi51c2VycyA9IG51bGw7XG5cdFx0YWRtaW4uc2hvd0FkbWluID0gZmFsc2U7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0FkbWluJyk7XG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBQ1RJVkFURVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblxuXHRcdFx0cmV0dXJuIHVzZXJEYXRhLmdldEFsbFVzZXJzKCkudGhlbihfZ2V0QWxsVXNlcnNTdWNjZXNzLCBfZ2V0QWxsVXNlcnNFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnVXRpbHMnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKCRzY29wZSwgUGFnZSwgcmVjaXBlRGF0YSwgUmVjaXBlLCBVdGlscywgdXNlckRhdGEsICRsb2NhdGlvbikge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXHJcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xyXG5cdFx0dmFyIGk7XHJcblx0XHR2YXIgbjtcclxuXHRcdHZhciB0O1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUudGFicyA9IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdSZWNpcGUgQm94ZXMnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveGVzJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1NlYXJjaCAvIEJyb3dzZSBBbGwnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAnc2VhcmNoLWJyb3dzZS1hbGwnXHJcblx0XHRcdH1cclxuXHRcdF07XHJcblx0XHRob21lLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94ZXMnO1xyXG5cdFx0aG9tZS5jaGFuZ2VUYWIgPSBjaGFuZ2VUYWI7XHJcblx0XHRob21lLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcclxuXHRcdGhvbWUudGFncyA9IFJlY2lwZS50YWdzO1xyXG5cdFx0aG9tZS5tYXBDYXRlZ29yaWVzID0ge307XHJcblx0XHRob21lLm1hcFRhZ3MgPSB7fTtcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRQYWdlLnNldFRpdGxlKCdBbGwgUmVjaXBlcycpO1xyXG5cclxuXHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcclxuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XHJcblxyXG5cdFx0XHQvLyBidWlsZCBoYXNobWFwIG9mIGNhdGVnb3JpZXNcclxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGhvbWUuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGhvbWUubWFwQ2F0ZWdvcmllc1tob21lLmNhdGVnb3JpZXNbaV1dID0gMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gYnVpbGQgaGFzaG1hcCBvZiB0YWdzXHJcblx0XHRcdGZvciAobiA9IDA7IG4gPCBob21lLnRhZ3MubGVuZ3RoOyBuKyspIHtcclxuXHRcdFx0XHRob21lLm1hcFRhZ3NbaG9tZS50YWdzW25dXSA9IDA7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkLCBnZXQgdXNlciBkYXRhXHJcblx0XHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkKGhvbWUudXNlcikpIHtcclxuXHRcdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKCFVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSkge1xyXG5cdFx0XHRcdGhvbWUud2VsY29tZU1zZyA9ICdXZWxjb21lIHRvIDxzdHJvbmc+ckJveDwvc3Ryb25nPiEgQnJvd3NlIHRocm91Z2ggdGhlIHB1YmxpYyByZWNpcGUgYm94IG9yIDxhIGhyZWY9XCIvbG9naW5cIj5Mb2dpbjwvYT4gdG8gZmlsZSBvciBjb250cmlidXRlIHJlY2lwZXMuJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQUNUSVZBVEVcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKCkudGhlbihfcHVibGljUmVjaXBlc1N1Y2Nlc3MsIF9wdWJsaWNSZWNpcGVzRmFpbHVyZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBtb2JpbGUgLSB2aWV3IGlzIHNtYWxsXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnc21hbGwnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRXhpdCBtb2JpbGUgLSB2aWV3IGlzIGxhcmdlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdsYXJnZSc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGFuZ2UgdGFiXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gY2hhbmdlVGFiKHF1ZXJ5KSB7XHJcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XHJcblx0XHRcdGhvbWUuY3VycmVudFRhYiA9IHF1ZXJ5O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3B1YmxpY1JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5yZWNpcGVzID0gZGF0YTtcclxuXHJcblx0XHRcdC8vIGNvdW50IG51bWJlciBvZiByZWNpcGVzIHBlciBjYXRlZ29yeSBhbmQgdGFnXHJcblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChob21lLnJlY2lwZXMsIGZ1bmN0aW9uKHJlY2lwZSkge1xyXG5cdFx0XHRcdGhvbWUubWFwQ2F0ZWdvcmllc1tyZWNpcGUuY2F0ZWdvcnldICs9IDE7XHJcblxyXG5cdFx0XHRcdGZvciAodCA9IDA7IHQgPCByZWNpcGUudGFncy5sZW5ndGg7IHQrKykge1xyXG5cdFx0XHRcdFx0aG9tZS5tYXBUYWdzW3JlY2lwZS50YWdzW3RdXSArPSAxO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGYWlsdXJlIHRvIHJldHVybiBwdWJsaWMgcmVjaXBlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBlcnJvclxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3B1YmxpY1JlY2lwZXNGYWlsdXJlKGVycm9yKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdUaGVyZSB3YXMgYW4gZXJyb3IgcmV0cmlldmluZyByZWNpcGVzOicsIGVycm9yKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS51c2VyID0gZGF0YTtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ0hlbGxvLCAnICsgaG9tZS51c2VyLmRpc3BsYXlOYW1lICsgJyEgV2FudCB0byA8YSBocmVmPVwiL215LXJlY2lwZXM/dmlldz1uZXctcmVjaXBlXCI+YWRkIGEgbmV3IHJlY2lwZTwvYT4/JztcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdNeVJlY2lwZXNDdHJsJywgTXlSZWNpcGVzQ3RybCk7XG5cblx0TXlSZWNpcGVzQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ1V0aWxzJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJyRzY29wZSddO1xuXG5cdGZ1bmN0aW9uIE15UmVjaXBlc0N0cmwoUGFnZSwgVXRpbHMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICRzY29wZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbXlSZWNpcGVzID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRteVJlY2lwZXMudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdmaWxlZC1yZWNpcGVzJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICduZXctcmVjaXBlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94Jztcblx0XHRteVJlY2lwZXMuY2hhbmdlVGFiID0gY2hhbmdlVGFiO1xuXHRcdG15UmVjaXBlcy5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ015IFJlY2lwZXMnKTtcblxuXHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcblx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBQ1RJVkFURVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblxuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblx0XHRcdHJlY2lwZURhdGEuZ2V0TXlSZWNpcGVzKCkudGhlbihfcmVjaXBlc1N1Y2Nlc3MsIF9yZWNpcGVzRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVudGVyIG1vYmlsZSAtIHNldCBzaG9ydGVyIHRhYiBuYW1lc1xuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ1JlY2lwZSBCb3gnO1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCc7XG5cdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ05ldyBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEV4aXQgbW9iaWxlIC0gc2V0IGxvbmdlciB0YWIgbmFtZXNcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ015IFJlY2lwZSBCb3gnO1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCBSZWNpcGVzJztcblx0XHRcdG15UmVjaXBlcy50YWJzWzJdLm5hbWUgPSAnQWRkIE5ldyBSZWNpcGUnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hhbmdlVGFiKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgc2F2ZWRSZWNpcGVzT2JqID0ge3NhdmVkUmVjaXBlczogZGF0YS5zYXZlZFJlY2lwZXN9O1xuXHRcdFx0bXlSZWNpcGVzLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHRyZWNpcGVEYXRhLmdldEZpbGVkUmVjaXBlcyhzYXZlZFJlY2lwZXNPYmopLnRoZW4oX2ZpbGVkU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3Mgc2F2ZWQgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZXMge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9maWxlZFN1Y2Nlc3MocmVjaXBlcykge1xuXHRcdFx0bXlSZWNpcGVzLmZpbGVkUmVjaXBlcyA9IHJlY2lwZXM7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnJlY2lwZXMgPSBkYXRhO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyByZWNpcGVzJywgZXJyb3IpO1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnVXRpbHMnLCAnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBMb2dpbkN0cmwoUGFnZSwgVXRpbHMsICRhdXRoLCBPQVVUSCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXHRcdGxvZ2luLmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBhdXRoZW50aWNhdGU7XG5cdFx0bG9naW4ubG9nb3V0ID0gbG9nb3V0O1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGF1dGhlbnRpY2F0ZShwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChfYXV0aENhdGNoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGF1dGhlbnRpY2F0aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aENhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRsb2dpbi5sb2dpbk1zZyA9ICcnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxvZ291dCgpIHtcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignRWRpdFJlY2lwZUN0cmwnLCBFZGl0UmVjaXBlQ3RybCk7XG5cblx0RWRpdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAnVXRpbHMnLCAnJHJvdXRlUGFyYW1zJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gRWRpdFJlY2lwZUN0cmwoJHNjb3BlLCBQYWdlLCBVdGlscywgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgZWRpdCA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0ZWRpdC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRWRpdCBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2VkaXQnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRGVsZXRlIFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZGVsZXRlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0ZWRpdC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAnZWRpdCc7XG5cdFx0ZWRpdC5jaGFuZ2VUYWIgPSBjaGFuZ2VUYWI7XG5cdFx0ZWRpdC5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cdFx0ZWRpdC5kZWxldGVSZWNpcGUgPSBkZWxldGVSZWNpcGU7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgUmVjaXBlJyk7XG5cblx0XHRcdF9hY3RpdmF0ZSgpO1xuXHRcdFx0X3Jlc2V0RGVsZXRlQnRuKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1ZykudGhlbihfcmVjaXBlU3VjY2VzcywgX3JlY2lwZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoYW5nZVRhYihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGVkaXQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdXNlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnVzZXIgPSBkYXRhO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0ZWRpdC5vcmlnaW5hbE5hbWUgPSBlZGl0LnJlY2lwZS5uYW1lO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCAnICsgZWRpdC5vcmlnaW5hbE5hbWUpO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnIge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVFcnJvcihlcnIpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRlZGl0LmVycm9yTXNnID0gZXJyLmRhdGEubWVzc2FnZTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IGRlbGV0ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RGVsZXRlQnRuKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gZmFsc2U7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlIFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGFmdGVyIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSB0cnVlO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0ZWQhJztcblxuXHRcdFx0ZnVuY3Rpb24gX2dvVG9SZWNpcGVzKCkge1xuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL215LXJlY2lwZXMnKTtcblx0XHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfZ29Ub1JlY2lwZXMsIDE1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGRlbGV0aW5nIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZGVsZXRlRXJyb3IoKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSAnZXJyb3InO1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0Vycm9yIGRlbGV0aW5nISc7XG5cblx0XHRcdCR0aW1lb3V0KF9yZXNldERlbGV0ZUJ0biwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIHJlY2lwZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRlbGV0ZVJlY2lwZSgpIHtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGluZy4uLic7XG5cdFx0XHRyZWNpcGVEYXRhLmRlbGV0ZVJlY2lwZShlZGl0LnJlY2lwZS5faWQpLnRoZW4oX2RlbGV0ZVN1Y2Nlc3MsIF9kZWxldGVFcnJvcik7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlQ3RybCcsIFJlY2lwZUN0cmwpO1xuXG5cdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdVdGlscycsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZUN0cmwoUGFnZSwgVXRpbHMsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cdFx0dmFyIHJlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1ZztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ1JlY2lwZScpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gdXNlciBpbmZvXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHQvLyBsb2dnZWQgaW4gdXNlcnMgY2FuIGZpbGUgcmVjaXBlc1xuXHRcdFx0cmVjaXBlLmZpbGVUZXh0ID0gJ0ZpbGUgdGhpcyByZWNpcGUnO1xuXHRcdFx0cmVjaXBlLnVuZmlsZVRleHQgPSAnUmVtb3ZlIGZyb20gRmlsZWQgUmVjaXBlcyc7XG5cdFx0fVxuXHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IHJlY2lwZSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0cmVjaXBlLnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJlY2lwZS5yZWNpcGUubmFtZSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyBhdXRob3IgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSBhdXRob3IgcGljdHVyZSwgZGlzcGxheU5hbWVcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0cmVjaXBlLmF1dGhvciA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHR1c2VyRGF0YS5nZXRBdXRob3IocmVjaXBlLnJlY2lwZS51c2VySWQpXG5cdFx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblxuXHRcdFx0cmVjaXBlLmluZ0NoZWNrZWQgPSBbXTtcblx0XHRcdHJlY2lwZS5zdGVwQ2hlY2tlZCA9IFtdO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENyZWF0ZSBhcnJheSB0byBrZWVwIHRyYWNrIG9mIGNoZWNrZWQgLyB1bmNoZWNrZWQgaXRlbXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gY2hlY2tlZEFyclxuXHRcdFx0ICogQHBhcmFtIHNvdXJjZUFyclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NyZWF0ZUNoZWNrZWRBcnJheXMoY2hlY2tlZEFyciwgc291cmNlQXJyKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBzb3VyY2VBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjaGVja2VkQXJyW2ldID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLmluZ0NoZWNrZWQsIHJlY2lwZS5yZWNpcGUuaW5ncmVkaWVudHMpO1xuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLnN0ZXBDaGVja2VkLCByZWNpcGUucmVjaXBlLmRpcmVjdGlvbnMpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBjaGVja21hcmtcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gdHlwZVxuXHRcdFx0ICogQHBhcmFtIGluZGV4XG5cdFx0XHQgKi9cblx0XHRcdHJlY2lwZS50b2dnbGVDaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG5cdFx0XHRcdHJlY2lwZVt0eXBlICsgJ0NoZWNrZWQnXVtpbmRleF0gPSAhcmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKHJlcykge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0cmVjaXBlLmVycm9yTXNnID0gcmVzLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogRmlsZSBvciB1bmZpbGUgdGhpcyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqL1xuXHRcdHJlY2lwZS5maWxlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlSWQpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0cmVjaXBlLmFwaU1zZyA9IGRhdGEuYWRkZWQgPyAnUmVjaXBlIHNhdmVkIScgOiAnUmVjaXBlIHJlbW92ZWQhJztcblx0XHRcdFx0cmVjaXBlLmZpbGVkID0gZGF0YS5hZGRlZDtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZUVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmZpbGVSZWNpcGUocmVjaXBlSWQpXG5cdFx0XHRcdC50aGVuKF9maWxlU3VjY2VzcywgX2ZpbGVFcnJvcik7XG5cdFx0fTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcignbWluVG9IJywgbWluVG9IKTtcblxuXHRmdW5jdGlvbiBtaW5Ub0goKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1pbikge1xuXHRcdFx0dmFyIF9ob3VyID0gNjA7XG5cdFx0XHR2YXIgX21pbiA9IG1pbiAqIDE7XG5cdFx0XHR2YXIgX2d0SG91ciA9IF9taW4gLyBfaG91ciA+PSAxO1xuXHRcdFx0dmFyIF9oUGx1c01pbiA9IF9taW4gJSBfaG91cjtcblx0XHRcdHZhciBfaGFzTWludXRlcyA9IF9oUGx1c01pbiAhPT0gMDtcblx0XHRcdHZhciBfaG91cnMgPSBNYXRoLmZsb29yKF9taW4gLyBfaG91cik7XG5cdFx0XHR2YXIgX2hvdXJzVGV4dCA9IF9ob3VycyA9PT0gMSA/ICcgaG91cicgOiAnIGhvdXJzJztcblx0XHRcdHZhciBfbWludXRlcyA9IF9oYXNNaW51dGVzID8gJywgJyArIF9oUGx1c01pbiArIF9taW5UZXh0KF9oUGx1c01pbikgOiAnJztcblx0XHRcdHZhciBfbm9ITWluVGV4dCA9IF9taW4gPT09IDEgPyAnIG1pbnV0ZScgOiAnIG1pbnV0ZXMnO1xuXHRcdFx0dmFyIHRpbWVTdHIgPSBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdldCBtaW51dGUvcyB0ZXh0IGZyb20gbWludXRlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtaW51dGVzIHtudW1iZXJ9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX21pblRleHQobWludXRlcykge1xuXHRcdFx0XHRpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyA9PT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyAhPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZXMnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfZ3RIb3VyKSB7XG5cdFx0XHRcdHRpbWVTdHIgPSBfaG91cnMgKyBfaG91cnNUZXh0ICsgX21pbnV0ZXM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aW1lU3RyID0gX21pbiArIF9ub0hNaW5UZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGltZVN0cjtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0F1dGhvckN0cmwnLCBSZWNpcGVzQXV0aG9yQ3RybCk7XG5cblx0UmVjaXBlc0F1dGhvckN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNBdXRob3JDdHJsKFBhZ2UsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2FpZCA9ICRyb3V0ZVBhcmFtcy51c2VySWQ7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0F1dGhvcic7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIGJ5ICcgKyByYS5hdXRob3IuZGlzcGxheU5hbWU7XG5cdFx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0QXV0aG9yKF9haWQpXG5cdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0QXV0aG9yUmVjaXBlcyhfYWlkKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLCBSZWNpcGVzQ2F0ZWdvcnlDdHJsKTtcblxuXHRSZWNpcGVzQ2F0ZWdvcnlDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQ2F0ZWdvcnlDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfY2F0ID0gJHJvdXRlUGFyYW1zLmNhdGVnb3J5O1xuXHRcdHZhciBfY2F0VGl0bGUgPSBfY2F0LnN1YnN0cmluZygwLDEpLnRvTG9jYWxlVXBwZXJDYXNlKCkgKyBfY2F0LnN1YnN0cmluZygxKTtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQ2F0ZWdvcnknO1xuXHRcdHJhLmhlYWRpbmcgPSBfY2F0VGl0bGUgKyAncyc7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ2ZhbHNlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIGNhdEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUuY2F0ZWdvcnkgPT0gX2NhdFRpdGxlKSB7XG5cdFx0XHRcdFx0Y2F0QXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSBjYXRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc1RhZ0N0cmwnLCBSZWNpcGVzVGFnQ3RybCk7XG5cblx0UmVjaXBlc1RhZ0N0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNUYWdDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfdGFnID0gJHJvdXRlUGFyYW1zLnRhZztcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzVGFnJztcblxuXHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyB0YWdnZWQgXCInICsgX3RhZyArICdcIic7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAnZmFsc2UnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHRhZ2dlZEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUudGFncy5pbmRleE9mKF90YWcpID4gLTEpIHtcblx0XHRcdFx0XHR0YWdnZWRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IHRhZ2dlZEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0oKSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

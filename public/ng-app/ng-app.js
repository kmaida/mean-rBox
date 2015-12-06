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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvT0FVVEhDTElFTlRTLlNBTVBMRS5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL09BVVRIQ0xJRU5UUy5jb25zdGFudC5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvZ2V0LWRhdGEvUmVzLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL3JlY2lwZURhdGEuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvdXNlckRhdGEuZmFjdG9yeS5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9kaXZpZGVyLmRpci5qcyIsImNvcmUvdWkvbG9hZGluZy5kaXIuanMiLCJjb3JlL3VpL3RyaW1TdHIuZmlsdGVyLmpzIiwiY29yZS91aS90cnVzdEFzSFRNTC5maWx0ZXIuanMiLCJjb3JlL3JlY2lwZXMvUmVjaXBlLmZhY3RvcnkuanMiLCJjb3JlL3JlY2lwZXMvcmVjaXBlRm9ybS5kaXIuanMiLCJjb3JlL3JlY2lwZXMvcmVjaXBlc0xpc3QuZGlyLmpzIiwibW9kdWxlcy9oZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZDb250cm9sLmRpci5qcyIsInBhZ2VzL2FjY291bnQvQWNjb3VudC5jdHJsLmpzIiwicGFnZXMvYWRtaW4vQWRtaW4uY3RybC5qcyIsInBhZ2VzL2hvbWUvSG9tZS5jdHJsLmpzIiwicGFnZXMvbG9naW4vTG9naW4uY3RybC5qcyIsInBhZ2VzL215LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJywgJ25nRmlsZVVwbG9hZCddKTsiLCIvLyBsb2dpbiBhY2NvdW50IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIID0ge1xuXHRcdExPR0lOUzogW1xuXHRcdFx0e1xuXHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0fVxuXHRcdF1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIE9BVVRIKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXHRcdHZhciBfbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnJlc29sdmUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZSAmJiBjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAnckJveCc7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdBbGwgUmVjaXBlcyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRUaXRsZSgpIHtcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cblx0VXNlci4kaW5qZWN0ID0gWydPQVVUSCddO1xuXG5cdGZ1bmN0aW9uIFVzZXIoT0FVVEgpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRVdGlscy4kaW5qZWN0ID0gWyckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIFV0aWxzKCRhdXRoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWQ6IGlzQXV0aGVudGljYXRlZFxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBsb2dpbi9PYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBPQVVUSENMSUVOVFMgPSB7XG5cdFx0TE9HSU5VUkw6ICdodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9sb2dpbicsXG5cdFx0Q0xJRU5UOiB7XG5cdFx0XHRGQjogJ1t5b3VyIEZhY2Vib29rIGNsaWVudCBJRF0nLFxuXHRcdFx0R09PR0xFOiAnW3lvdXIgR29vZ2xlIGNsaWVudCBJRF0nLFxuXHRcdFx0VFdJVFRFUjogJy9hdXRoL3R3aXR0ZXInLFxuXHRcdFx0R0lUSFVCOiAnW3lvdXIgR2l0SHViIGNsaWVudCBJRF0nXG5cdFx0fVxuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ09BVVRIQ0xJRU5UUycsIE9BVVRIQ0xJRU5UUyk7XG59KCkpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIQ0xJRU5UUyA9IHtcblx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHRDTElFTlQ6IHtcblx0XHRcdEZCOiAnMzYwMTczMTk3NTA1NjUwJyxcblx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRUV0lUVEVSOiAnL2F1dGgvdHdpdHRlcicsXG5cdFx0XHRHSVRIVUI6ICc5ZmYwOTcyOTljODZlNTI0YjEwZidcblx0XHR9XG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEhDTElFTlRTJywgT0FVVEhDTElFTlRTKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlcicsICdPQVVUSENMSUVOVFMnXTtcblxuXHRmdW5jdGlvbiBhdXRoQ29uZmlnKCRhdXRoUHJvdmlkZXIsIE9BVVRIQ0xJRU5UUykge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBPQVVUSENMSUVOVFMuTE9HSU5VUkw7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkZCXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HT09HTEVcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIudHdpdHRlcih7XG5cdFx0XHR1cmw6IE9BVVRIQ0xJRU5UUy5DTElFTlQuVFdJVFRFUlxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5naXRodWIoe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuR0lUSFVCXG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoUnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJ107XG5cblx0ZnVuY3Rpb24gYXV0aFJ1bigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRhdXRoKSB7XG5cdFx0LyoqXG5cdFx0ICogJG9uICRyb3V0ZUNoYW5nZVN0YXJ0XG5cdFx0ICogQ2hlY2sgYXV0aGVudGljYXRpb25cblx0XHQgKiBSZWRpcmVjdCBhcHByb3ByaWF0ZWx5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXZlbnRcblx0XHQgKiBAcGFyYW0gbmV4dFxuXHRcdCAqIEBwYXJhbSBjdXJyZW50XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHJvdXRlQ2hhbmdlU3RhcnQoZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHQkcm9vdFNjb3BlLmF1dGhQYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuXHRcdFx0XHQkcm9vdFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gc2VuZCB1c2VyIHRvIGxvZ2luXG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfJHJvdXRlQ2hhbmdlU3RhcnQpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGFuZ3VsYXIvb24td2F0Y2hcblx0fVxuXG59KCkpOyIsIi8vIHJvdXRlc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsb2dpbidcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1ZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlL1JlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JlY2lwZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvYXV0aG9yLzp1c2VySWQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzQXV0aG9yQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy90YWcvOnRhZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNUYWdDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL2NhdGVnb3J5LzpjYXRlZ29yeScsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL215LXJlY2lwZXMnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL215LXJlY2lwZXMvTXlSZWNpcGVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTXlSZWNpcGVzQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ215UmVjaXBlcydcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1Zy9lZGl0Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0VkaXRSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZWRpdCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FjY291bnQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FjY291bnQvQWNjb3VudC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FjY291bnRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWNjb3VudCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FkbWluJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9hZG1pbi9BZG1pbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBZG1pbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhZG1pbidcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy8nXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdSZXMnLCBSZXMpO1xuXG5cdGZ1bmN0aW9uIFJlcygpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN1Y2Nlc3M6IHN1Y2Nlc3MsXG5cdFx0XHRlcnJvcjogZXJyb3Jcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHRcdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdFx0ICogVXNlZnVsIGZvciBBUElzIChpZSwgd2l0aCBuZ2lueCkgd2hlcmUgc2VydmVyIGVycm9yIEhUTUwgcGFnZSBtYXkgYmUgcmV0dXJuZWQgaW4gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBSZWNpcGUgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3JlY2lwZURhdGEnLCByZWNpcGVEYXRhKTtcblxuXHRyZWNpcGVEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZURhdGEoJGh0dHAsIFJlcykge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0UmVjaXBlOiBnZXRSZWNpcGUsXG5cdFx0XHRjcmVhdGVSZWNpcGU6IGNyZWF0ZVJlY2lwZSxcblx0XHRcdHVwZGF0ZVJlY2lwZTogdXBkYXRlUmVjaXBlLFxuXHRcdFx0ZGVsZXRlUmVjaXBlOiBkZWxldGVSZWNpcGUsXG5cdFx0XHRnZXRQdWJsaWNSZWNpcGVzOiBnZXRQdWJsaWNSZWNpcGVzLFxuXHRcdFx0Z2V0TXlSZWNpcGVzOiBnZXRNeVJlY2lwZXMsXG5cdFx0XHRnZXRBdXRob3JSZWNpcGVzOiBnZXRBdXRob3JSZWNpcGVzLFxuXHRcdFx0ZmlsZVJlY2lwZTogZmlsZVJlY2lwZSxcblx0XHRcdGdldEZpbGVkUmVjaXBlczogZ2V0RmlsZWRSZWNpcGVzLFxuXHRcdFx0Y2xlYW5VcGxvYWRzOiBjbGVhblVwbG9hZHNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNsdWcge3N0cmluZ30gcmVjaXBlIHNsdWdcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRSZWNpcGUoc2x1Zykge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlLycgKyBzbHVnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYSByZWNpcGUgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNyZWF0ZVJlY2lwZShyZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL25ldycsIHJlY2lwZURhdGEpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBhIHJlY2lwZSAoUFVUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRCAoaW4gY2FzZSBzbHVnIGhhcyBjaGFuZ2VkKVxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlUmVjaXBlKGlkLCByZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIGlkLCByZWNpcGVEYXRhKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBEZWxldGUgYSByZWNpcGUgKERFTEVURSlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBkZWxldGVSZWNpcGUoaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZGVsZXRlKCcvYXBpL3JlY2lwZS8nICsgaWQpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgcHVibGljIHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFB1YmxpY1JlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldE15UmVjaXBlcygpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMvbWUnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYSBzcGVjaWZpYyB1c2VyJ3MgcHVibGljIHJlY2lwZXMgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VySWQge3N0cmluZ30gdXNlciBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEF1dGhvclJlY2lwZXModXNlcklkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL2F1dGhvci8nICsgdXNlcklkKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGaWxlL3VuZmlsZSB0aGlzIHJlY2lwZSBpbiB1c2VyIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGZpbGVSZWNpcGUocmVjaXBlSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL3JlY2lwZS8nICsgcmVjaXBlSWQgKyAnL2ZpbGUnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgbXkgZmlsZWQgcmVjaXBlcyAoUE9TVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZHMge0FycmF5fSBhcnJheSBvZiB1c2VyJ3MgZmlsZWQgcmVjaXBlIElEc1xuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEZpbGVkUmVjaXBlcyhyZWNpcGVJZHMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGVzL21lL2ZpbGVkJywgcmVjaXBlSWRzKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDbGVhbiB1cGxvYWQgZmlsZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZmlsZXNcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjbGVhblVwbG9hZHMoZmlsZXMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvY2xlYW4tdXBsb2FkcycsIGZpbGVzKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiLy8gVXNlciBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgndXNlckRhdGEnLCB1c2VyRGF0YSk7XG5cblx0dXNlckRhdGEuJGluamVjdCA9IFsnJGh0dHAnLCAnUmVzJ107XG5cblx0ZnVuY3Rpb24gdXNlckRhdGEoJGh0dHAsIFJlcykge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0QXV0aG9yOiBnZXRBdXRob3IsXG5cdFx0XHRnZXRVc2VyOiBnZXRVc2VyLFxuXHRcdFx0dXBkYXRlVXNlcjogdXBkYXRlVXNlcixcblx0XHRcdGdldEFsbFVzZXJzOiBnZXRBbGxVc2Vyc1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgcmVjaXBlIGF1dGhvcidzIGJhc2ljIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSBNb25nb0RCIElEIG9mIHVzZXJcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3IoaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXIvJyArIGlkKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgY3VycmVudCB1c2VyJ3MgZGF0YSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0VXNlcigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGN1cnJlbnQgdXNlcidzIHByb2ZpbGUgZGF0YSAoUFVUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByb2ZpbGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlVXNlcihwcm9maWxlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvbWUnLCBwcm9maWxlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGFsbCB1c2VycyAoYWRtaW4gYXV0aG9yaXplZCBvbmx5KSAoR0VUKVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QWxsVXNlcnMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VycycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KCkpOyIsIi8vIEZvciB0b3VjaGVuZC9tb3VzZXVwIGJsdXJcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdibHVyT25FbmQnLCBibHVyT25FbmQpO1xuXG5cdGZ1bmN0aW9uIGJsdXJPbkVuZCgpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogYmx1ck9uRW5kTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBibHVyT25FbmQgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGJsdXJPbkVuZExpbmsoJHNjb3BlLCAkZWxlbSkge1xuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdCRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgX2JsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0uYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBfb25EZXN0cm95KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGaXJlIGJsdXIgZXZlbnRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYmx1ckVsZW0oKSB7XG5cdFx0XHRcdCRlbGVtLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiAkZGVzdHJveSwgdW5iaW5kIGhhbmRsZXJzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29uRGVzdHJveSgpIHtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCd0b3VjaGVuZCcsIF9ibHVyRWxlbSk7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgnbW91c2V1cCcsIF9ibHVyRWxlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBkZXRlY3RBZEJsb2NrIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1cblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0XHQkc2NvcGUuYWIuaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RpdmlkZXInLCBkaXZpZGVyKTtcblxuXHRmdW5jdGlvbiBkaXZpZGVyKCkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJyQm94LWRpdmlkZXJcIj48aSBjbGFzcz1cImZhIGZhLWN1dGxlcnlcIj48L2k+PC9kaXY+J1xuXHRcdH07XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnbG9hZGluZycsIGxvYWRpbmcpO1xuXG5cdGxvYWRpbmcuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBsb2FkaW5nKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS91aS9sb2FkaW5nLnRwbC5odG1sJyxcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXG5cdFx0XHRjb250cm9sbGVyOiBsb2FkaW5nQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ2xvYWRpbmcnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IGxvYWRpbmdMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGxvYWRpbmcgTElOS1xuXHRcdCAqIERpc2FibGVzIHBhZ2Ugc2Nyb2xsaW5nIHdoZW4gbG9hZGluZyBvdmVybGF5IGlzIG9wZW5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICogQHBhcmFtIGxvYWRpbmcge2NvbnRyb2xsZXJ9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbG9hZGluZ0xpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBsb2FkaW5nKSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXG5cdFx0XHRcdFx0ZGVib3VuY2U6IDIwMFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyAkd2F0Y2ggYWN0aXZlIHN0YXRlXG5cdFx0XHRcdCRzY29wZS4kd2F0Y2goJ2xvYWRpbmcuYWN0aXZlJywgXyR3YXRjaEFjdGl2ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogV2luZG93IHJlc2l6ZWRcblx0XHRcdCAqIElmIGxvYWRpbmcsIHJlYXBwbHkgYm9keSBoZWlnaHRcblx0XHRcdCAqIHRvIHByZXZlbnQgc2Nyb2xsYmFyXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0XHRpZiAobG9hZGluZy5hY3RpdmUpIHtcblx0XHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRcdGhlaWdodDogX3dpbkhlaWdodCxcblx0XHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqICR3YXRjaCBsb2FkaW5nLmFjdGl2ZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBuZXdWYWwge2Jvb2xlYW59XG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsIHt1bmRlZmluZWR8Ym9vbGVhbn1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hBY3RpdmUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdF9vcGVuKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIGxvYWRpbmdcblx0XHRcdCAqIERpc2FibGUgc2Nyb2xsXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW4oKSB7XG5cdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdGhlaWdodDogX3dpbkhlaWdodCxcblx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIGxvYWRpbmdcblx0XHRcdCAqIEVuYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2UoKSB7XG5cdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdGhlaWdodDogJ2F1dG8nLFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2F1dG8nXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGxvYWRpbmdDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXHQvKipcblx0ICogbG9hZGluZyBDT05UUk9MTEVSXG5cdCAqIFVwZGF0ZSB0aGUgbG9hZGluZyBzdGF0dXMgYmFzZWRcblx0ICogb24gcm91dGVDaGFuZ2Ugc3RhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGxvYWRpbmdDdHJsKCRzY29wZSkge1xuXHRcdHZhciBsb2FkaW5nID0gdGhpcztcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb24nLCBfbG9hZGluZ0FjdGl2ZSk7XG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9mZicsIF9sb2FkaW5nSW5hY3RpdmUpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0FjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBpbmFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0luYWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJpbVN0cicsIHRyaW1TdHIpO1xuXG5cdGZ1bmN0aW9uIHRyaW1TdHIoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHN0ciwgY2hhcnMpIHtcblx0XHRcdHZhciB0cmltbWVkU3RyID0gc3RyO1xuXHRcdFx0dmFyIF9jaGFycyA9IGFuZ3VsYXIuaXNVbmRlZmluZWQoY2hhcnMpID8gNTAgOiBjaGFycztcblxuXHRcdFx0aWYgKHN0ci5sZW5ndGggPiBfY2hhcnMpIHtcblx0XHRcdFx0dHJpbW1lZFN0ciA9IHN0ci5zdWJzdHIoMCwgX2NoYXJzKSArICcuLi4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJpbW1lZFN0cjtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBkaWV0YXJ5ID0gW1xuXHRcdCdHbHV0ZW4tZnJlZScsXG5cdFx0J1ZlZ2FuJyxcblx0XHQnVmVnZXRhcmlhbidcblx0XTtcblxuXHR2YXIgaW5zZXJ0Q2hhciA9IFtcblx0XHQn4oWbJyxcblx0XHQnwrwnLFxuXHRcdCfihZMnLFxuXHRcdCfCvScsXG5cdFx0J+KFlCcsXG5cdFx0J8K+J1xuXHRdO1xuXG5cdHZhciBjYXRlZ29yaWVzID0gW1xuXHRcdCdBcHBldGl6ZXInLFxuXHRcdCdCZXZlcmFnZScsXG5cdFx0J0Rlc3NlcnQnLFxuXHRcdCdFbnRyZWUnLFxuXHRcdCdTYWxhZCcsXG5cdFx0J1NpZGUnLFxuXHRcdCdTb3VwJ1xuXHRdO1xuXG5cdHZhciB0YWdzID0gW1xuXHRcdCdhbGNvaG9sJyxcblx0XHQnYmFrZWQnLFxuXHRcdCdiZWVmJyxcblx0XHQnZmFzdCcsXG5cdFx0J2Zpc2gnLFxuXHRcdCdsb3ctY2Fsb3JpZScsXG5cdFx0J29uZS1wb3QnLFxuXHRcdCdwYXN0YScsXG5cdFx0J3BvcmsnLFxuXHRcdCdwb3VsdHJ5Jyxcblx0XHQnc2xvdy1jb29rJyxcblx0XHQnc3RvY2snLFxuXHRcdCd2ZWdldGFibGUnXG5cdF07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdSZWNpcGUnLCBSZWNpcGUpO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZSgpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRpZXRhcnk6IGRpZXRhcnksXG5cdFx0XHRpbnNlcnRDaGFyOiBpbnNlcnRDaGFyLFxuXHRcdFx0Y2F0ZWdvcmllczogY2F0ZWdvcmllcyxcblx0XHRcdHRhZ3M6IHRhZ3Ncblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVGb3JtJywgcmVjaXBlRm9ybSk7XG5cblx0cmVjaXBlRm9ybS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm0oJHRpbWVvdXQpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0cmVjaXBlOiAnPScsXG5cdFx0XHRcdHVzZXJJZDogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzL3JlY2lwZUZvcm0udHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlRm9ybUN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdyZicsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogcmVjaXBlRm9ybUxpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogcmVjaXBlRm9ybSBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XG5cdFx0ICogQHBhcmFtICRhdHRyc1xuXHRcdCAqIEBwYXJhbSByZiB7Y29udHJvbGxlckFzfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlY2lwZUZvcm1MaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgcmYpIHtcblx0XHRcdC8vIHNldCB1cCAkc2NvcGUgb2JqZWN0IGZvciBuYW1lc3BhY2luZ1xuXHRcdFx0JHNjb3BlLnJmbCA9IHt9O1xuXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBhZGRJdGVtO1xuXHRcdFx0JHNjb3BlLnJmbC5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcblx0XHRcdCRzY29wZS5yZmwubW92ZUl0ZW0gPSBtb3ZlSXRlbTtcblx0XHRcdCRzY29wZS5yZmwubW92ZUluZ3JlZGllbnRzID0gZmFsc2U7XG5cdFx0XHQkc2NvcGUucmZsLm1vdmVEaXJlY3Rpb25zID0gZmFsc2U7XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgbmV3IGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqIEZvY3VzIHRoZSBuZXdlc3QgaW5wdXQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9IGNsaWNrIGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIHR5cGUge3N0cmluZ30gaW5nIC1vci0gc3RlcFxuXHRcdFx0ICogQHBhcmFtIGlzSGVhZGluZyB7Ym9vbGVhbn1cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gYWRkSXRlbSgkZXZlbnQsIG1vZGVsLCB0eXBlLCBpc0hlYWRpbmcpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiByZi5nZW5lcmF0ZUlkKCksXG5cdFx0XHRcdFx0dHlwZTogdHlwZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChpc0hlYWRpbmcpIHtcblx0XHRcdFx0XHRfbmV3SXRlbS5pc0hlYWRpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bW9kZWwucHVzaChfbmV3SXRlbSk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIF9uZXdlc3RJbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQudGFyZ2V0KS5wYXJlbnQoJ3AnKS5wcmV2KCcubGFzdCcpLmZpbmQoJ2lucHV0JykuZXEoMCk7XG5cdFx0XHRcdFx0X25ld2VzdElucHV0LmNsaWNrKCk7XG5cdFx0XHRcdFx0X25ld2VzdElucHV0LmZvY3VzKCk7ICAgLy8gVE9ETzogZm9jdXMgaXNuJ3QgaGlnaGxpZ2h0aW5nIHByb3Blcmx5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlbW92ZSBpdGVtXG5cdFx0XHQgKiBJbmdyZWRpZW50IG9yIERpcmVjdGlvbiBzdGVwXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBpIHtpbmRleH1cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gcmVtb3ZlSXRlbShtb2RlbCwgaSkge1xuXHRcdFx0XHRtb2RlbC5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRW50ZXIgbW9iaWxlIC0gdW5zZXQgbGFyZ2Ugdmlld1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdFx0JHNjb3BlLnJmbC5pc0xhcmdlVmlldyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEV4aXQgbW9iaWxlIC0gc2V0IGxhcmdlIHZpZXdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdFx0JHNjb3BlLnJmbC5pc0xhcmdlVmlldyA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogTW92ZSBpdGVtIHVwIG9yIGRvd25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIG9sZEluZGV4IHtpbmRleH0gY3VycmVudCBpbmRleFxuXHRcdFx0ICogQHBhcmFtIG5ld0luZGV4IHtudW1iZXJ9IG5ldyBpbmRleFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBtb3ZlSXRlbSgkZXZlbnQsIG1vZGVsLCBvbGRJbmRleCwgbmV3SW5kZXgpIHtcblx0XHRcdFx0dmFyIF9pdGVtID0gYW5ndWxhci5lbGVtZW50KCRldmVudC50YXJnZXQpLmNsb3Nlc3QoJ2xpJyk7XG5cblx0XHRcdFx0bW9kZWwubW92ZShvbGRJbmRleCwgbmV3SW5kZXgpO1xuXG5cdFx0XHRcdF9pdGVtLmFkZENsYXNzKCdtb3ZlZCcpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9pdGVtLnJlbW92ZUNsYXNzKCdtb3ZlZCcpO1xuXHRcdFx0XHR9LCA3MDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlY2lwZUZvcm1DdHJsLiRpbmplY3QgPSBbJ3JlY2lwZURhdGEnLCAnUmVjaXBlJywgJ1NsdWcnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0JywgJ1VwbG9hZCddO1xuXG5cdC8qKlxuXHQgKiByZWNpcGVGb3JtIENPTlRST0xMRVIgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHJlY2lwZURhdGFcblx0ICogQHBhcmFtIFJlY2lwZVxuXHQgKiBAcGFyYW0gU2x1Z1xuXHQgKiBAcGFyYW0gJGxvY2F0aW9uXG5cdCAqIEBwYXJhbSAkdGltZW91dFxuXHQgKiBAcGFyYW0gVXBsb2FkXG5cdCAqL1xuXHRmdW5jdGlvbiByZWNpcGVGb3JtQ3RybChyZWNpcGVEYXRhLCBSZWNpcGUsIFNsdWcsICRsb2NhdGlvbiwgJHRpbWVvdXQsIFVwbG9hZCkge1xuXHRcdHZhciByZiA9IHRoaXM7XG5cdFx0dmFyIF9pc0VkaXQgPSAhIXJmLnJlY2lwZTtcblx0XHR2YXIgX29yaWdpbmFsU2x1ZyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuc2x1ZyA6IG51bGw7XG5cblx0XHQvLyBzZXR1cCBzcGVjaWFsIGNoYXJhY3RlcnMgcHJpdmF0ZSB2YXJzXG5cdFx0dmFyIF9sYXN0SW5wdXQ7XG5cdFx0dmFyIF9pbmdJbmRleDtcblx0XHR2YXIgX2NhcmV0UG9zO1xuXG5cdFx0cmYucmVjaXBlRGF0YSA9IF9pc0VkaXQgPyByZi5yZWNpcGUgOiB7fTtcblx0XHRyZi5yZWNpcGVEYXRhLnVzZXJJZCA9IF9pc0VkaXQgPyByZi5yZWNpcGUudXNlcklkIDogcmYudXNlcklkO1xuXHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBfaXNFZGl0ID8gcmYucmVjaXBlLnBob3RvIDogbnVsbDtcblxuXHRcdC8vIHNoYXJlIGdlbmVyYXRlSWQgZnVuY3Rpb24gd2l0aCBMaW5rXG5cdFx0cmYuZ2VuZXJhdGVJZCA9IGdlbmVyYXRlSWQ7XG5cblx0XHQvLyBpcyB0aGlzIGEgdG91Y2ggZGV2aWNlP1xuXHRcdHJmLmlzVG91Y2hEZXZpY2UgPSAhIU1vZGVybml6ci50b3VjaGV2ZW50cztcblxuXHRcdC8vIGJ1aWxkIGxpc3RzXG5cdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50cyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuaW5ncmVkaWVudHMgOiBbe2lkOiBnZW5lcmF0ZUlkKCksIHR5cGU6ICdpbmcnfV07XG5cdFx0cmYucmVjaXBlRGF0YS5kaXJlY3Rpb25zID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5kaXJlY3Rpb25zIDogW3tpZDogZ2VuZXJhdGVJZCgpLCB0eXBlOiAnc3RlcCd9XTtcblxuXHRcdHJmLnJlY2lwZURhdGEudGFncyA9IF9pc0VkaXQgPyByZi5yZWNpcGVEYXRhLnRhZ3MgOiBbXTtcblxuXHRcdC8vIG1hbmFnZSB0aW1lIGZpZWxkc1xuXHRcdHJmLnRpbWVSZWdleCA9IC9eWytdPyhbMC05XSsoPzpbXFwuXVswLTldKik/fFxcLlswLTldKykkLztcblx0XHRyZi50aW1lRXJyb3IgPSAnUGxlYXNlIGVudGVyIGEgbnVtYmVyIGluIG1pbnV0ZXMuIE11bHRpcGx5IGhvdXJzIGJ5IDYwLic7XG5cblx0XHQvLyBmZXRjaCBjYXRlZ29yaWVzIG9wdGlvbnMgbGlzdFxuXHRcdHJmLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblxuXHRcdC8vIGZldGNoIHRhZ3Mgb3B0aW9ucyBsaXN0XG5cdFx0cmYudGFncyA9IFJlY2lwZS50YWdzO1xuXG5cdFx0Ly8gZmV0Y2ggZGlldGFyeSBvcHRpb25zIGxpc3Rcblx0XHRyZi5kaWV0YXJ5ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHQvLyBmZXRjaCBzcGVjaWFsIGNoYXJhY3RlcnNcblx0XHRyZi5jaGFycyA9IFJlY2lwZS5pbnNlcnRDaGFyO1xuXG5cdFx0cmYuaW5zZXJ0Q2hhcklucHV0ID0gaW5zZXJ0Q2hhcklucHV0O1xuXHRcdHJmLmluc2VydENoYXIgPSBpbnNlcnRDaGFyO1xuXHRcdHJmLmNsZWFyQ2hhciA9IGNsZWFyQ2hhcjtcblxuXHRcdHJmLnVwbG9hZGVkRmlsZSA9IG51bGw7XG5cdFx0cmYudXBkYXRlRmlsZSA9IHVwZGF0ZUZpbGU7XG5cdFx0cmYucmVtb3ZlUGhvdG8gPSByZW1vdmVQaG90bztcblxuXHRcdHJmLnRhZ01hcCA9IHt9O1xuXHRcdHJmLmFkZFJlbW92ZVRhZyA9IGFkZFJlbW92ZVRhZztcblxuXHRcdHJmLnNhdmVSZWNpcGUgPSBzYXZlUmVjaXBlO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBjcmVhdGUgbWFwIG9mIHRvdWNoZWQgdGFnc1xuXHRcdFx0aWYgKF9pc0VkaXQgJiYgcmYucmVjaXBlRGF0YS50YWdzLmxlbmd0aCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmYucmVjaXBlRGF0YS50YWdzLCBmdW5jdGlvbih0YWcsIGkpIHtcblx0XHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IHRydWU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRfcmVzZXRTYXZlQnRuKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGVzIGEgdW5pcXVlIDUtY2hhcmFjdGVyIElEO1xuXHRcdCAqIE9uICRzY29wZSB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXIgYW5kIGxpbmtcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2VuZXJhdGVJZCgpIHtcblx0XHRcdHZhciBfaWQgPSAnJztcblx0XHRcdHZhciBfY2hhcnNldCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuXHRcdFx0XHRfaWQgKz0gX2NoYXJzZXQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIF9jaGFyc2V0Lmxlbmd0aCkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gX2lkO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25FbmQge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCkge1xuXHRcdFx0dmFyIHJhbmdlID0gaW5wdXQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cblx0XHRcdGlmIChpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSkge1xuXHRcdFx0XHRpbnB1dC5jbGljaygpO1xuXHRcdFx0XHRpbnB1dC5mb2N1cygpO1xuXHRcdFx0XHRpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGlucHV0LmNyZWF0ZVRleHRSYW5nZSkge1xuXHRcdFx0XHRyYW5nZS5jb2xsYXBzZSh0cnVlKTtcblx0XHRcdFx0cmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0cmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25TdGFydCk7XG5cdFx0XHRcdHJhbmdlLnNlbGVjdCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBjYXJldCBwb3NpdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0ICogQHBhcmFtIHBvcyB7bnVtYmVyfSBpbnRlbmRlZCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3NldENhcmV0VG9Qb3MoaW5wdXQsIHBvcykge1xuXHRcdFx0X3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBwb3MsIHBvcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogS2VlcCB0cmFjayBvZiBjYXJldCBwb3NpdGlvbiBpbiBpbmdyZWRpZW50IGFtb3VudCB0ZXh0IGZpZWxkXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGluZGV4IHtudW1iZXJ9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaW5zZXJ0Q2hhcklucHV0KCRldmVudCwgaW5kZXgpIHtcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfaW5nSW5kZXggPSBpbmRleDtcblx0XHRcdFx0X2xhc3RJbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgnIycgKyAkZXZlbnQudGFyZ2V0LmlkKTtcblx0XHRcdFx0X2NhcmV0UG9zID0gX2xhc3RJbnB1dFswXS5zZWxlY3Rpb25TdGFydDtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEluc2VydCBjaGFyYWN0ZXIgYXQgbGFzdCBjYXJldCBwb3NpdGlvblxuXHRcdCAqIEluIHN1cHBvcnRlZCBmaWVsZFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGNoYXIge3N0cmluZ30gc3BlY2lhbCBjaGFyYWN0ZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpbnNlcnRDaGFyKGNoYXIpIHtcblx0XHRcdHZhciBfdGV4dFZhbDtcblxuXHRcdFx0aWYgKF9sYXN0SW5wdXQpIHtcblx0XHRcdFx0X3RleHRWYWwgPSBhbmd1bGFyLmlzVW5kZWZpbmVkKHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQpID8gJycgOiByZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10O1xuXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQgPSBfdGV4dFZhbC5zdWJzdHJpbmcoMCwgX2NhcmV0UG9zKSArIGNoYXIgKyBfdGV4dFZhbC5zdWJzdHJpbmcoX2NhcmV0UG9zKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfY2FyZXRQb3MgPSBfY2FyZXRQb3MgKyAxO1xuXHRcdFx0XHRcdF9zZXRDYXJldFRvUG9zKF9sYXN0SW5wdXRbMF0sIF9jYXJldFBvcyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENsZWFyIGNhcmV0IHBvc2l0aW9uIGFuZCBsYXN0IGlucHV0XG5cdFx0ICogU28gdGhhdCBzcGVjaWFsIGNoYXJhY3RlcnMgZG9uJ3QgZW5kIHVwIGluIHVuZGVzaXJlZCBmaWVsZHNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjbGVhckNoYXIoKSB7XG5cdFx0XHRfaW5nSW5kZXggPSBudWxsO1xuXHRcdFx0X2xhc3RJbnB1dCA9IG51bGw7XG5cdFx0XHRfY2FyZXRQb3MgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwbG9hZCBpbWFnZSBmaWxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZmlsZXMge0FycmF5fSBhcnJheSBvZiBmaWxlcyB0byB1cGxvYWRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1cGRhdGVGaWxlKGZpbGVzKSB7XG5cdFx0XHRpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChmaWxlc1swXS5zaXplID4gMzAwMDAwKSB7XG5cdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSAnRmlsZXNpemUgb3ZlciA1MDBrYiAtIHBob3RvIHdhcyBub3QgdXBsb2FkZWQuJztcblx0XHRcdFx0XHRyZi5yZW1vdmVQaG90bygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRcdFx0cmYudXBsb2FkZWRGaWxlID0gZmlsZXNbMF07ICAgIC8vIG9ubHkgc2luZ2xlIHVwbG9hZCBhbGxvd2VkXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZW1vdmUgdXBsb2FkZWQgcGhvdG8gZnJvbSBmcm9udC1lbmRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVQaG90bygpIHtcblx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBudWxsO1xuXHRcdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblx0XHRcdGFuZ3VsYXIuZWxlbWVudCgnI3JlY2lwZVBob3RvJykudmFsKCcnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBZGQgLyByZW1vdmUgdGFnXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdGFnIHtzdHJpbmd9IHRhZyBuYW1lXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYWRkUmVtb3ZlVGFnKHRhZykge1xuXHRcdFx0dmFyIF9hY3RpdmVUYWdJbmRleCA9IHJmLnJlY2lwZURhdGEudGFncy5pbmRleE9mKHRhZyk7XG5cblx0XHRcdGlmIChfYWN0aXZlVGFnSW5kZXggPiAtMSkge1xuXHRcdFx0XHQvLyB0YWcgZXhpc3RzIGluIG1vZGVsLCB0dXJuIGl0IG9mZlxuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3Muc3BsaWNlKF9hY3RpdmVUYWdJbmRleCwgMSk7XG5cdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB0YWcgZG9lcyBub3QgZXhpc3QgaW4gbW9kZWwsIHR1cm4gaXQgb25cblx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnB1c2godGFnKTtcblx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENsZWFuIGVtcHR5IGl0ZW1zIG91dCBvZiBhcnJheSBiZWZvcmUgc2F2aW5nXG5cdFx0ICogSW5ncmVkaWVudHMgb3IgRGlyZWN0aW9uc1xuXHRcdCAqIEFsc28gY2xlYXJzIG91dCBlbXB0eSBoZWFkaW5nc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG1vZGVsTmFtZSB7c3RyaW5nfSBpbmdyZWRpZW50cyAvIGRpcmVjdGlvbnNcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9jbGVhbkVtcHRpZXMobW9kZWxOYW1lKSB7XG5cdFx0XHR2YXIgX2FycmF5ID0gcmYucmVjaXBlRGF0YVttb2RlbE5hbWVdO1xuXHRcdFx0dmFyIF9jaGVjayA9IG1vZGVsTmFtZSA9PT0gJ2luZ3JlZGllbnRzJyA/ICdpbmdyZWRpZW50JyA6ICdzdGVwJztcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKF9hcnJheSwgZnVuY3Rpb24ob2JqLCBpKSB7XG5cdFx0XHRcdGlmICghIW9ialtfY2hlY2tdID09PSBmYWxzZSAmJiAhb2JqLmlzSGVhZGluZyB8fCBvYmouaXNIZWFkaW5nICYmICEhb2JqLmhlYWRpbmdUZXh0ID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdF9hcnJheS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHNhdmUgYnV0dG9uXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldFNhdmVCdG4oKSB7XG5cdFx0XHRyZi5zYXZlZCA9IGZhbHNlO1xuXHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGUgUmVjaXBlJyA6ICdTYXZlIFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVjaXBlIGNyZWF0ZWQgb3Igc2F2ZWQgc3VjY2Vzc2Z1bGx5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlIHtwcm9taXNlfSBpZiBlZGl0aW5nIGV2ZW50XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZWQocmVjaXBlKSB7XG5cdFx0XHRyZi5zYXZlZCA9IHRydWU7XG5cdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRlZCEnIDogJ1NhdmVkISc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR28gdG8gbmV3IHNsdWcgKGlmIG5ldykgb3IgdXBkYXRlZCBzbHVnIChpZiBzbHVnIGNoYW5nZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dvVG9OZXdTbHVnKCkge1xuXHRcdFx0XHR2YXIgX3BhdGggPSAhX2lzRWRpdCA/IHJlY2lwZS5zbHVnIDogcmYucmVjaXBlRGF0YS5zbHVnICsgJy9lZGl0JztcblxuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL3JlY2lwZS8nICsgX3BhdGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIV9pc0VkaXQgfHwgX2lzRWRpdCAmJiBfb3JpZ2luYWxTbHVnICE9PSByZi5yZWNpcGVEYXRhLnNsdWcpIHtcblx0XHRcdFx0JHRpbWVvdXQoX2dvVG9OZXdTbHVnLCAxMDAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDIwMDApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlY2lwZSBub3Qgc2F2ZWQgLyBjcmVhdGVkIGR1ZSB0byBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVyciB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlRXJyb3IoZXJyKSB7XG5cdFx0XHRyZi5zYXZlQnRuVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdHJmLnNhdmVkID0gJ2Vycm9yJztcblx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDQwMDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNhdmUgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3NhdmVSZWNpcGUoKSB7XG5cdFx0XHRpZiAoIV9pc0VkaXQpIHtcblx0XHRcdFx0cmVjaXBlRGF0YS5jcmVhdGVSZWNpcGUocmYucmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX3JlY2lwZVNhdmVkLCBfcmVjaXBlU2F2ZUVycm9yKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlY2lwZURhdGEudXBkYXRlUmVjaXBlKHJmLnJlY2lwZS5faWQsIHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2F2ZSByZWNpcGVcblx0XHQgKiBDbGljayBvbiBzdWJtaXRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzYXZlUmVjaXBlKCkge1xuXHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGluZy4uLicgOiAnU2F2aW5nLi4uJztcblxuXHRcdFx0Ly8gcHJlcCBkYXRhIGZvciBzYXZpbmdcblx0XHRcdHJmLnJlY2lwZURhdGEuc2x1ZyA9IFNsdWcuc2x1Z2lmeShyZi5yZWNpcGVEYXRhLm5hbWUpO1xuXHRcdFx0X2NsZWFuRW1wdGllcygnaW5ncmVkaWVudHMnKTtcblx0XHRcdF9jbGVhbkVtcHRpZXMoJ2RpcmVjdGlvbnMnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVcGxvYWQgcHJvZ3Jlc3MgY2FsbGJhY2tcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZXZ0IHtldmVudH1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGxvYWRQcm9ncmVzc0NCKGV2dCkge1xuXHRcdFx0XHR2YXIgcHJvZ3Jlc3NQZXJjZW50YWdlID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcblx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0XHRcdHJmLnVwbG9hZFByb2dyZXNzID0gcHJvZ3Jlc3NQZXJjZW50YWdlICsgJyUgJyArIGV2dC5jb25maWcuZmlsZS5uYW1lO1xuXG5cdFx0XHRcdGNvbnNvbGUubG9nKHJmLnVwbG9hZFByb2dyZXNzKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVcGxvYWQgZXJyb3IgY2FsbGJhY2tcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZXJyIHtvYmplY3R9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfdXBsb2FkRXJyb3JDQihlcnIpIHtcblx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGVyci5tZXNzYWdlIHx8IGVycjtcblxuXHRcdFx0XHRjb25zb2xlLmxvZygnRXJyb3IgdXBsb2FkaW5nIGZpbGU6JywgZXJyLm1lc3NhZ2UgfHwgZXJyKTtcblxuXHRcdFx0XHRfcmVjaXBlU2F2ZUVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVXBsb2FkIHN1Y2Nlc3MgY2FsbGJhY2tcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdFx0ICogQHBhcmFtIHN0YXR1c1xuXHRcdFx0ICogQHBhcmFtIGhlYWRlcnNcblx0XHRcdCAqIEBwYXJhbSBjb25maWdcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGxvYWRTdWNjZXNzQ0IoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBkYXRhLmZpbGVuYW1lO1xuXG5cdFx0XHRcdFx0X3NhdmVSZWNpcGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNhdmUgdXBsb2FkZWQgZmlsZSwgaWYgdGhlcmUgaXMgb25lXG5cdFx0XHQvLyBvbmNlIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZCBpbWFnZSwgc2F2ZSByZWNpcGUgd2l0aCByZWZlcmVuY2UgdG8gc2F2ZWQgaW1hZ2Vcblx0XHRcdGlmIChyZi51cGxvYWRlZEZpbGUpIHtcblx0XHRcdFx0VXBsb2FkXG5cdFx0XHRcdFx0LnVwbG9hZCh7XG5cdFx0XHRcdFx0XHR1cmw6ICcvYXBpL3JlY2lwZS91cGxvYWQnLFxuXHRcdFx0XHRcdFx0ZmlsZTogcmYudXBsb2FkZWRGaWxlXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucHJvZ3Jlc3MoX3VwbG9hZFByb2dyZXNzQ0IpXG5cdFx0XHRcdFx0LnN1Y2Nlc3MoX3VwbG9hZFN1Y2Nlc3NDQilcblx0XHRcdFx0XHQuZXJyb3IoX3VwbG9hZEVycm9yQ0IpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyB1cGxvYWRlZCBmaWxlLCBzYXZlIHJlY2lwZVxuXHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlc0xpc3QnLCByZWNpcGVzTGlzdCk7XG5cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3QoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZXM6ICc9Jyxcblx0XHRcdFx0b3BlbkZpbHRlcnM6ICdAJyxcblx0XHRcdFx0Y3VzdG9tTGFiZWxzOiAnQCcsXG5cdFx0XHRcdGNhdGVnb3J5RmlsdGVyOiAnQCcsXG5cdFx0XHRcdHRhZ0ZpbHRlcjogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzL3JlY2lwZXNMaXN0LnRwbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6IHJlY2lwZXNMaXN0Q3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JsJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVzTGlzdExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogcmVjaXBlc0xpc3QgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlY2lwZXNMaXN0TGluaygkc2NvcGUpIHtcblx0XHRcdCRzY29wZS5ybGwgPSB7fTtcblxuXHRcdFx0Ly8gd2F0Y2ggdGhlIGN1cnJlbnRseSB2aXNpYmxlIG51bWJlciBvZiByZWNpcGVzIHRvIGRpc3BsYXkgYSBjb3VudFxuXHRcdFx0JHNjb3BlLiR3YXRjaChcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFuZ3VsYXIuZWxlbWVudCgnLnJlY2lwZXNMaXN0LWxpc3QtaXRlbScpLmxlbmd0aDtcblx0XHRcdFx0fSxcblx0XHRcdFx0XyR3YXRjaFJlY2lwZXNMaXN0XG5cdFx0XHQpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqICR3YXRjaCByZWNpcGVzTGlzdCBsaXN0IGl0ZW1zXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbFxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbFxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaFJlY2lwZXNMaXN0KG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHQkc2NvcGUucmxsLmRpc3BsYXllZFJlc3VsdHMgPSBuZXdWYWw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZWNpcGVzTGlzdEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1JlY2lwZSddO1xuXG5cdC8qKlxuXHQgKiByZWNpcGVzTGlzdCBDT05UUk9MTEVSXG5cdCAqXG5cdCAqIEBwYXJhbSAkc2NvcGVcblx0ICogQHBhcmFtIFJlY2lwZVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RDdHJsKCRzY29wZSwgUmVjaXBlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIHZpZXcgbW9kZWxcblx0XHR2YXIgcmwgPSB0aGlzO1xuXG5cdFx0Ly8gYnVpbGQgb3V0IHRoZSB0b3RhbCB0aW1lIGFuZCBudW1iZXIgb2YgaW5ncmVkaWVudHMgZm9yIHNvcnRpbmdcblx0XHR2YXIgX3dhdGNoUmVjaXBlcyA9ICRzY29wZS4kd2F0Y2goJ3JsLnJlY2lwZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmwucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdFx0cmVjaXBlLnRvdGFsVGltZSA9IChyZWNpcGUuY29va1RpbWUgPyByZWNpcGUuY29va1RpbWUgOiAwKSArIChyZWNpcGUucHJlcFRpbWUgPyByZWNpcGUucHJlcFRpbWUgOiAwKTtcblx0XHRcdFx0XHRyZWNpcGUubkluZyA9IHJlY2lwZS5pbmdyZWRpZW50cy5sZW5ndGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvLyBkZXJlZ2lzdGVyIHRoZSB3YXRjaFxuXHRcdFx0XHRfd2F0Y2hSZWNpcGVzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dmFyIF9sYXN0U29ydGVkQnkgPSAnbmFtZSc7XG5cdFx0dmFyIF9yZXN1bHRzU2V0ID0gMTU7ICAgLy8gbnVtYmVyIG9mIHJlY2lwZXMgdG8gc2hvdy9hZGQgaW4gYSBzZXRcblxuXHRcdHZhciBfb3BlbkZpbHRlcnNPbmxvYWQgPSAkc2NvcGUuJHdhdGNoKCdybC5vcGVuRmlsdGVycycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAoYW5ndWxhci5pc0RlZmluZWQobmV3VmFsKSkge1xuXHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gbmV3VmFsID09PSAndHJ1ZSc7XG5cdFx0XHRcdF9vcGVuRmlsdGVyc09ubG9hZCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gY29uZGl0aW9uYWxseSBzaG93IGNhdGVnb3J5IC8gdGFnIGZpbHRlcnNcblx0XHQvLyBhbHdheXMgc2hvdyBzcGVjaWFsIGRpZXQgZmlsdGVyXG5cdFx0aWYgKHJsLmNhdGVnb3J5RmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdHJsLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblx0XHRcdHJsLnNob3dDYXRlZ29yeUZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdGlmIChybC50YWdGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0cmwudGFncyA9IFJlY2lwZS50YWdzO1xuXHRcdFx0cmwuc2hvd1RhZ0ZpbHRlciA9IHRydWU7XG5cdFx0fVxuXHRcdHJsLnNwZWNpYWxEaWV0ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHQvLyBzZXQgYWxsIGZpbHRlcnMgdG8gZW1wdHlcblx0XHRybC5maWx0ZXJQcmVkaWNhdGVzID0ge307XG5cblx0XHQvLyBzZXQgdXAgc29ydCBwcmVkaWNhdGUgYW5kIHJldmVyc2Fsc1xuXHRcdHJsLnNvcnRQcmVkaWNhdGUgPSAnbmFtZSc7XG5cblx0XHRybC5yZXZlcnNlT2JqID0ge1xuXHRcdFx0bmFtZTogZmFsc2UsXG5cdFx0XHR0b3RhbFRpbWU6IGZhbHNlLFxuXHRcdFx0bkluZzogZmFsc2Vcblx0XHR9O1xuXG5cdFx0cmwudG9nZ2xlU29ydCA9IHRvZ2dsZVNvcnQ7XG5cdFx0cmwubG9hZE1vcmUgPSBsb2FkTW9yZTtcblx0XHRybC50b2dnbGVTZWFyY2hGaWx0ZXIgPSB0b2dnbGVTZWFyY2hGaWx0ZXI7XG5cdFx0cmwuY2xlYXJTZWFyY2hGaWx0ZXIgPSBjbGVhclNlYXJjaEZpbHRlcjtcblx0XHRybC5hY3RpdmVTZWFyY2hGaWx0ZXJzID0gYWN0aXZlU2VhcmNoRmlsdGVycztcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLnF1ZXJ5JywgXyR3YXRjaFF1ZXJ5KTtcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLmZpbHRlclByZWRpY2F0ZXMnLCBfJHdhdGNoUHJlZGljYXRlcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZmlsdGVyIHByZWRpY2F0ZXNcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpIHtcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuY2F0ID0gJyc7XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLnRhZyA9ICcnO1xuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5kaWV0ID0gJyc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVG9nZ2xlIHNvcnQgYXNjL2Rlc2Ncblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcmVkaWNhdGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGVTb3J0KHByZWRpY2F0ZSkge1xuXHRcdFx0aWYgKF9sYXN0U29ydGVkQnkgPT09IHByZWRpY2F0ZSkge1xuXHRcdFx0XHRybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV0gPSAhcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0fVxuXHRcdFx0cmwucmV2ZXJzZSA9IHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdF9sYXN0U29ydGVkQnkgPSBwcmVkaWNhdGU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcmVzdWx0cyBzaG93aW5nIHRvIGluaXRpYWwgZGVmYXVsdCBvbiBzZWFyY2gvZmlsdGVyXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZXNldFJlc3VsdHNTaG93aW5nKCkge1xuXHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gX3Jlc3VsdHNTZXQ7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTG9hZCBNb3JlIHJlc3VsdHNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkTW9yZSgpIHtcblx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IHJsLm5SZXN1bHRzU2hvd2luZyArPSBfcmVzdWx0c1NldDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiAkd2F0Y2ggc2VhcmNoIHF1ZXJ5IGFuZCBpZiBpdCBleGlzdHMsIGNsZWFyIGZpbHRlcnMgYW5kIHJlc2V0IHJlc3VsdHMgc2hvd2luZ1xuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfJHdhdGNoUXVlcnkoKSB7XG5cdFx0XHRpZiAocmwucXVlcnkpIHtcblx0XHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqICR3YXRjaCBmaWx0ZXJQcmVkaWNhdGVzXG5cdFx0ICogd2F0Y2ggZmlsdGVycyBhbmQgaWYgYW55IG9mIHRoZW0gY2hhbmdlLCByZXNldCB0aGUgcmVzdWx0cyBzaG93aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsXG5cdFx0ICogQHBhcmFtIG9sZFZhbFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gXyR3YXRjaFByZWRpY2F0ZXMobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmICghIW5ld1ZhbCAmJiBuZXdWYWwgIT09IG9sZFZhbCkge1xuXHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRvZ2dsZSBzZWFyY2gvZmlsdGVyIHNlY3Rpb24gb3Blbi9jbG9zZWRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGVTZWFyY2hGaWx0ZXIoKSB7XG5cdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gIXJsLnNob3dTZWFyY2hGaWx0ZXI7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYXIgc2VhcmNoIHF1ZXJ5IGFuZCBhbGwgZmlsdGVyc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNsZWFyU2VhcmNoRmlsdGVyKCkge1xuXHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0cmwucXVlcnkgPSAnJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTaG93IG51bWJlciBvZiBjdXJyZW50bHkgYWN0aXZlIHNlYXJjaCArIGZpbHRlciBpdGVtc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9XG5cdFx0ICogQHBhcmFtIGZpbHRlcnNPYmoge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGFjdGl2ZVNlYXJjaEZpbHRlcnMocXVlcnksIGZpbHRlcnNPYmopIHtcblx0XHRcdHZhciB0b3RhbCA9IDA7XG5cblx0XHRcdGlmIChxdWVyeSkge1xuXHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZmlsdGVyc09iaiwgZnVuY3Rpb24oZmlsdGVyKSB7XG5cdFx0XHRcdGlmIChmaWx0ZXIpIHtcblx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdG90YWw7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBoZWFkZXJDdHJsKTtcclxuXHJcblx0aGVhZGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJ1V0aWxzJ107XHJcblxyXG5cdGZ1bmN0aW9uIGhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sICRhdXRoLCB1c2VyRGF0YSwgVXRpbHMpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhlYWRlci5sb2dvdXQgPSBsb2dvdXQ7XHJcblx0XHRoZWFkZXIuaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBpbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gbmF2SXNBY3RpdmU7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0X2NoZWNrVXNlckFkbWluKCk7XHJcblx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2hlY2tVc2VyQWRtaW4pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvZ291dCgpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlclxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0XHRoZWFkZXIudXNlciA9IGRhdGE7XHJcblx0XHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IGRhdGEuaXNBZG1pbjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkLCBnZXQgdXNlciBkYXRhXHJcblx0XHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkKGhlYWRlci51c2VyKSkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbSB3aGVuICcvJyBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG5hdklzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2woJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIG5hdkNvbnRyb2wgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfbGF5b3V0Q2FudmFzID0gXyRib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXG5cdFx0XHRcdFx0ZGVib3VuY2U6IDEwMFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIF8kbG9jYXRpb25DaGFuZ2VTdGFydCk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKHtcblx0XHRcdFx0XHRtaW5IZWlnaHQ6ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdC5hZGRDbGFzcygnbmF2LW9wZW4nKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2VOYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1vcGVuJylcblx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQoKSB7XG5cdFx0XHRcdGlmIChfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIEFjY291bnRDdHJsKTtcblxuXHRBY2NvdW50Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICdVdGlscycsICckYXV0aCcsICd1c2VyRGF0YScsICckdGltZW91dCcsICdPQVVUSCcsICdVc2VyJywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIEFjY291bnRDdHJsKCRzY29wZSwgUGFnZSwgVXRpbHMsICRhdXRoLCB1c2VyRGF0YSwgJHRpbWVvdXQsIE9BVVRILCBVc2VyLCAkbG9jYXRpb24pIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFjY291bnQgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdGFjY291bnQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ1VzZXIgSW5mbycsXG5cdFx0XHRcdHF1ZXJ5OiAndXNlci1pbmZvJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ01hbmFnZSBMb2dpbnMnLFxuXHRcdFx0XHRxdWVyeTogJ21hbmFnZS1sb2dpbnMnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICd1c2VyLWluZm8nO1xuXHRcdGFjY291bnQubG9naW5zID0gT0FVVEguTE9HSU5TOyAgLy8gYWxsIGF2YWlsYWJsZSBsb2dpbiBzZXJ2aWNlc1xuXHRcdGFjY291bnQuaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXHRcdGFjY291bnQuY2hhbmdlVGFiID0gY2hhbmdlVGFiO1xuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSA9IGdldFByb2ZpbGU7XG5cdFx0YWNjb3VudC51cGRhdGVQcm9maWxlID0gdXBkYXRlUHJvZmlsZTtcblx0XHRhY2NvdW50LmxpbmsgPSBsaW5rO1xuXHRcdGFjY291bnQudW5saW5rID0gdW5saW5rO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdNeSBBY2NvdW50Jyk7XG5cdFx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfJHdhdGNoRGlzcGxheU5hbWUpO1xuXG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBQ1RJVkFURVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblx0XHRcdHJldHVybiBhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoYW5nZVRhYihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGFjY291bnQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFByb2ZpbGUoKSB7XG5cdFx0XHRyZXR1cm4gdXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX2dldFVzZXJTdWNjZXNzLCBfZ2V0VXNlckVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHQgKiBTaG93IEFjY291bnQgVUlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFjY291bnQudXNlciA9IGRhdGE7XG5cdFx0XHRhY2NvdW50LmFkbWluaXN0cmF0b3IgPSBhY2NvdW50LnVzZXIuaXNBZG1pbjtcblx0XHRcdGFjY291bnQubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKGFjY291bnQudXNlciwgJ2FjY291bnQnKTtcblx0XHRcdGFjY291bnQuc2hvd0FjY291bnQgPSB0cnVlO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIGVycm9yIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Jcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcHJvZmlsZSBzYXZlIGJ1dHRvbiB0byBpbml0aWFsIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9idG5TYXZlUmVzZXQoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gZmFsc2U7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFdhdGNoIGRpc3BsYXkgbmFtZSBjaGFuZ2VzIHRvIGNoZWNrIGZvciBlbXB0eSBvciBudWxsIHN0cmluZ1xuXHRcdCAqIFNldCBidXR0b24gdGV4dCBhY2NvcmRpbmdseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB1cGRhdGVkIGRpc3BsYXlOYW1lIHZhbHVlIGZyb20gaW5wdXQgZmllbGRcblx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfSBwcmV2aW91cyBkaXNwbGF5TmFtZSB2YWx1ZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gXyR3YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICogQ2FsbGVkIG9uIHN1Ym1pc3Npb24gb2YgdXBkYXRlIGZvcm1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1cGRhdGVQcm9maWxlKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdGlmIChhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUpIHtcblx0XHRcdFx0Ly8gU2V0IHN0YXR1cyB0byBTYXZpbmcuLi4gYW5kIHVwZGF0ZSB1cG9uIHN1Y2Nlc3Mgb3IgZXJyb3IgaW4gY2FsbGJhY2tzXG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHVzZXIsIHBhc3NpbmcgcHJvZmlsZSBkYXRhIGFuZCBhc3NpZ25pbmcgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzXG5cdFx0XHRcdHVzZXJEYXRhLnVwZGF0ZVVzZXIocHJvZmlsZURhdGEpLnRoZW4oX3VwZGF0ZVN1Y2Nlc3MsIF91cGRhdGVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2VzcyBjYWxsYmFjayB3aGVuIHByb2ZpbGUgaGFzIGJlZW4gdXBkYXRlZFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfdXBkYXRlU3VjY2VzcygpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSB0cnVlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlZCEnO1xuXG5cdFx0XHQkdGltZW91dChfYnRuU2F2ZVJlc2V0LCAyNTAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciBjYWxsYmFjayB3aGVuIHByb2ZpbGUgdXBkYXRlIGhhcyBmYWlsZWRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VwZGF0ZUVycm9yKCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIExpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxpbmsocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGFjY291bnQuZ2V0UHJvZmlsZSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVW5saW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1bmxpbmsocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oYWNjb3VudC5nZXRQcm9maWxlKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5tZXNzYWdlIDogJ0NvdWxkIG5vdCB1bmxpbmsgJyArIHByb3ZpZGVyICsgJyBhY2NvdW50Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FkbWluQ3RybCcsIEFkbWluQ3RybCk7XG5cblx0QWRtaW5DdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ1V0aWxzJywgJ3VzZXJEYXRhJywgJ1VzZXInXTtcblxuXHRmdW5jdGlvbiBBZG1pbkN0cmwoJHNjb3BlLCBQYWdlLCBVdGlscywgdXNlckRhdGEsIFVzZXIpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRhZG1pbi5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cdFx0YWRtaW4udXNlcnMgPSBudWxsO1xuXHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdBZG1pbicpO1xuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQUNUSVZBVEVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdHJldHVybiB1c2VyRGF0YS5nZXRBbGxVc2VycygpLnRoZW4oX2dldEFsbFVzZXJzU3VjY2VzcywgX2dldEFsbFVzZXJzRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBBZG1pbiBVSVxuXHRcdCAqIERpc3BsYXkgbGlzdCBvZiB1c2Vyc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWRtaW4udXNlcnMgPSBkYXRhO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goYWRtaW4udXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0dXNlci5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHModXNlcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gdHJ1ZTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciB1bnN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IFVuYXV0aG9yaXplZCBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtlcnJvcn0gcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJ3JlY2lwZURhdGEnLCAnUmVjaXBlJywgJ1V0aWxzJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbiddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybCgkc2NvcGUsIFBhZ2UsIHJlY2lwZURhdGEsIFJlY2lwZSwgVXRpbHMsIHVzZXJEYXRhLCAkbG9jYXRpb24pIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xyXG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcclxuXHRcdHZhciBpO1xyXG5cdFx0dmFyIG47XHJcblx0XHR2YXIgdDtcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRob21lLnRhYnMgPSBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUmVjaXBlIEJveGVzJyxcclxuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3hlcydcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdTZWFyY2ggLyBCcm93c2UgQWxsJyxcclxuXHRcdFx0XHRxdWVyeTogJ3NlYXJjaC1icm93c2UtYWxsJ1xyXG5cdFx0XHR9XHJcblx0XHRdO1xyXG5cdFx0aG9tZS5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveGVzJztcclxuXHRcdGhvbWUuY2hhbmdlVGFiID0gY2hhbmdlVGFiO1xyXG5cdFx0aG9tZS5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XHJcblx0XHRob21lLnRhZ3MgPSBSZWNpcGUudGFncztcclxuXHRcdGhvbWUubWFwQ2F0ZWdvcmllcyA9IHt9O1xyXG5cdFx0aG9tZS5tYXBUYWdzID0ge307XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0UGFnZS5zZXRUaXRsZSgnQWxsIFJlY2lwZXMnKTtcclxuXHJcblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xyXG5cclxuXHRcdFx0Ly8gYnVpbGQgaGFzaG1hcCBvZiBjYXRlZ29yaWVzXHJcblx0XHRcdGZvciAoaSA9IDA7IGkgPCBob21lLmNhdGVnb3JpZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRob21lLm1hcENhdGVnb3JpZXNbaG9tZS5jYXRlZ29yaWVzW2ldXSA9IDA7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgdGFnc1xyXG5cdFx0XHRmb3IgKG4gPSAwOyBuIDwgaG9tZS50YWdzLmxlbmd0aDsgbisrKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBUYWdzW2hvbWUudGFnc1tuXV0gPSAwO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfYWN0aXZhdGUoKTtcclxuXHJcblx0XHRcdC8vIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgZ2V0IHVzZXIgZGF0YVxyXG5cdFx0XHRpZiAoVXRpbHMuaXNBdXRoZW50aWNhdGVkKCkgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChob21lLnVzZXIpKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdFx0fSBlbHNlIGlmICghVXRpbHMuaXNBdXRoZW50aWNhdGVkKCkpIHtcclxuXHRcdFx0XHRob21lLndlbGNvbWVNc2cgPSAnV2VsY29tZSB0byA8c3Ryb25nPnJCb3g8L3N0cm9uZz4hIEJyb3dzZSB0aHJvdWdoIHRoZSBwdWJsaWMgcmVjaXBlIGJveCBvciA8YSBocmVmPVwiL2xvZ2luXCI+TG9naW48L2E+IHRvIGZpbGUgb3IgY29udHJpYnV0ZSByZWNpcGVzLic7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFDVElWQVRFXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpLnRoZW4oX3B1YmxpY1JlY2lwZXNTdWNjZXNzLCBfcHVibGljUmVjaXBlc0ZhaWx1cmUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW50ZXIgbW9iaWxlIC0gdmlldyBpcyBzbWFsbFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgbW9iaWxlIC0gdmlldyBpcyBsYXJnZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhbmdlIHRhYlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGNoYW5nZVRhYihxdWVyeSkge1xyXG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xyXG5cdFx0XHRob21lLmN1cnJlbnRUYWIgPSBxdWVyeTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9wdWJsaWNSZWNpcGVzU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUucmVjaXBlcyA9IGRhdGE7XHJcblxyXG5cdFx0XHQvLyBjb3VudCBudW1iZXIgb2YgcmVjaXBlcyBwZXIgY2F0ZWdvcnkgYW5kIHRhZ1xyXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goaG9tZS5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcclxuXHRcdFx0XHRob21lLm1hcENhdGVnb3JpZXNbcmVjaXBlLmNhdGVnb3J5XSArPSAxO1xyXG5cclxuXHRcdFx0XHRmb3IgKHQgPSAwOyB0IDwgcmVjaXBlLnRhZ3MubGVuZ3RoOyB0KyspIHtcclxuXHRcdFx0XHRcdGhvbWUubWFwVGFnc1tyZWNpcGUudGFnc1t0XV0gKz0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmFpbHVyZSB0byByZXR1cm4gcHVibGljIHJlY2lwZXNcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZXJyb3JcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9wdWJsaWNSZWNpcGVzRmFpbHVyZShlcnJvcikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnVGhlcmUgd2FzIGFuIGVycm9yIHJldHJpZXZpbmcgcmVjaXBlczonLCBlcnJvcik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUudXNlciA9IGRhdGE7XHJcblx0XHRcdGhvbWUud2VsY29tZU1zZyA9ICdIZWxsbywgJyArIGhvbWUudXNlci5kaXNwbGF5TmFtZSArICchIFdhbnQgdG8gPGEgaHJlZj1cIi9teS1yZWNpcGVzP3ZpZXc9bmV3LXJlY2lwZVwiPmFkZCBhIG5ldyByZWNpcGU8L2E+Pyc7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuXHRMb2dpbkN0cmwuJGluamVjdCA9IFsnUGFnZScsICdVdGlscycsICckYXV0aCcsICdPQVVUSCcsICckcm9vdFNjb3BlJywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIExvZ2luQ3RybChQYWdlLCBVdGlscywgJGF1dGgsIE9BVVRILCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGxvZ2luID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0xvZ2luJyk7XG5cblx0XHRsb2dpbi5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cdFx0bG9naW4uaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0LyoqXG5cdFx0ICogQXV0aGVudGljYXRlIHRoZSB1c2VyIHZpYSBPYXV0aCB3aXRoIHRoZSBzcGVjaWZpZWQgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlciAtICh0d2l0dGVyLCBmYWNlYm9vaywgZ2l0aHViLCBnb29nbGUpXG5cdFx0ICovXG5cdFx0bG9naW4uYXV0aGVudGljYXRlID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IHRydWU7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcblx0XHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aFN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCRyb290U2NvcGUuYXV0aFBhdGgpIHtcblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgkcm9vdFNjb3BlLmF1dGhQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGF1dGhlbnRpY2F0aW5nXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhDYXRjaChyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gJ2Vycm9yJztcblx0XHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChfYXV0aENhdGNoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXG5cdFx0ICovXG5cdFx0bG9naW4ubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdNeVJlY2lwZXNDdHJsJywgTXlSZWNpcGVzQ3RybCk7XG5cblx0TXlSZWNpcGVzQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ1V0aWxzJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJyRzY29wZSddO1xuXG5cdGZ1bmN0aW9uIE15UmVjaXBlc0N0cmwoUGFnZSwgVXRpbHMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICRzY29wZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbXlSZWNpcGVzID0gdGhpcztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTXkgUmVjaXBlcycpO1xuXG5cdFx0bXlSZWNpcGVzLnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnZmlsZWQtcmVjaXBlcydcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHF1ZXJ5OiAnbmV3LXJlY2lwZSdcblx0XHRcdH1cblx0XHRdO1xuXHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveCc7XG5cblx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIC0gc2V0IHNob3J0ZXIgdGFiIG5hbWVzXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnUmVjaXBlIEJveCc7XG5cdFx0XHRteVJlY2lwZXMudGFic1sxXS5uYW1lID0gJ0ZpbGVkJztcblx0XHRcdG15UmVjaXBlcy50YWJzWzJdLm5hbWUgPSAnTmV3IFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgLSBzZXQgbG9uZ2VyIHRhYiBuYW1lc1xuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnTXkgUmVjaXBlIEJveCc7XG5cdFx0XHRteVJlY2lwZXMudGFic1sxXS5uYW1lID0gJ0ZpbGVkIFJlY2lwZXMnO1xuXHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdBZGQgTmV3IFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRteVJlY2lwZXMuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHRteVJlY2lwZXMuaXNBdXRoZW50aWNhdGVkID0gVXRpbHMuaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHNhdmVkUmVjaXBlc09iaiA9IHtzYXZlZFJlY2lwZXM6IGRhdGEuc2F2ZWRSZWNpcGVzfTtcblx0XHRcdG15UmVjaXBlcy51c2VyID0gZGF0YTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBzYXZlZCByZWNpcGVzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlY2lwZXMge3Byb21pc2V9LmRhdGFcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlZFN1Y2Nlc3MocmVjaXBlcykge1xuXHRcdFx0XHRteVJlY2lwZXMuZmlsZWRSZWNpcGVzID0gcmVjaXBlcztcblx0XHRcdH1cblx0XHRcdHJlY2lwZURhdGEuZ2V0RmlsZWRSZWNpcGVzKHNhdmVkUmVjaXBlc09iailcblx0XHRcdFx0LnRoZW4oX2ZpbGVkU3VjY2Vzcyk7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKVxuXHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdG15UmVjaXBlcy5yZWNpcGVzID0gZGF0YTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRNeVJlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0VkaXRSZWNpcGVDdHJsJywgRWRpdFJlY2lwZUN0cmwpO1xuXG5cdEVkaXRSZWNpcGVDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnVXRpbHMnLCAnJHJvdXRlUGFyYW1zJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gRWRpdFJlY2lwZUN0cmwoUGFnZSwgVXRpbHMsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGVkaXQgPSB0aGlzO1xuXHRcdHZhciBfcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdFZGl0IFJlY2lwZScpO1xuXG5cdFx0ZWRpdC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRWRpdCBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2VkaXQnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnRGVsZXRlIFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZGVsZXRlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0ZWRpdC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAnZWRpdCc7XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGVkaXQuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRlZGl0LmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9O1xuXG5cdFx0ZWRpdC5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC51c2VyID0gZGF0YTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRlZGl0Lm9yaWdpbmFsTmFtZSA9IGVkaXQucmVjaXBlLm5hbWU7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFZGl0ICcgKyBlZGl0Lm9yaWdpbmFsTmFtZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKGVycikge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSAnZXJyb3InO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRXJyb3InKTtcblx0XHRcdGVkaXQuZXJyb3JNc2cgPSBlcnIuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZGVsZXRlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXREZWxldGVCdG4oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSBmYWxzZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGUgUmVjaXBlJztcblx0XHR9XG5cblx0XHRfcmVzZXREZWxldGVCdG4oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBhZnRlciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gdHJ1ZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGVkISc7XG5cblx0XHRcdGZ1bmN0aW9uIF9nb1RvUmVjaXBlcygpIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9teS1yZWNpcGVzJyk7XG5cdFx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2dvVG9SZWNpcGVzLCAxNTAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZUVycm9yKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gJ2Vycm9yJztcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdFcnJvciBkZWxldGluZyEnO1xuXG5cdFx0XHQkdGltZW91dChfcmVzZXREZWxldGVCdG4sIDI1MDApO1xuXHRcdH1cblxuXHRcdGVkaXQuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRpbmcuLi4nO1xuXHRcdFx0cmVjaXBlRGF0YS5kZWxldGVSZWNpcGUoZWRpdC5yZWNpcGUuX2lkKVxuXHRcdFx0XHQudGhlbihfZGVsZXRlU3VjY2VzcywgX2RlbGV0ZUVycm9yKTtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlQ3RybCcsIFJlY2lwZUN0cmwpO1xuXG5cdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdVdGlscycsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZUN0cmwoUGFnZSwgVXRpbHMsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cdFx0dmFyIHJlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1ZztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ1JlY2lwZScpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gdXNlciBpbmZvXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHQvLyBsb2dnZWQgaW4gdXNlcnMgY2FuIGZpbGUgcmVjaXBlc1xuXHRcdFx0cmVjaXBlLmZpbGVUZXh0ID0gJ0ZpbGUgdGhpcyByZWNpcGUnO1xuXHRcdFx0cmVjaXBlLnVuZmlsZVRleHQgPSAnUmVtb3ZlIGZyb20gRmlsZWQgUmVjaXBlcyc7XG5cdFx0fVxuXHRcdGlmIChVdGlscy5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IHJlY2lwZSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0cmVjaXBlLnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRQYWdlLnNldFRpdGxlKHJlY2lwZS5yZWNpcGUubmFtZSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyBhdXRob3IgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSBhdXRob3IgcGljdHVyZSwgZGlzcGxheU5hbWVcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0cmVjaXBlLmF1dGhvciA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHR1c2VyRGF0YS5nZXRBdXRob3IocmVjaXBlLnJlY2lwZS51c2VySWQpXG5cdFx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblxuXHRcdFx0cmVjaXBlLmluZ0NoZWNrZWQgPSBbXTtcblx0XHRcdHJlY2lwZS5zdGVwQ2hlY2tlZCA9IFtdO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENyZWF0ZSBhcnJheSB0byBrZWVwIHRyYWNrIG9mIGNoZWNrZWQgLyB1bmNoZWNrZWQgaXRlbXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gY2hlY2tlZEFyclxuXHRcdFx0ICogQHBhcmFtIHNvdXJjZUFyclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NyZWF0ZUNoZWNrZWRBcnJheXMoY2hlY2tlZEFyciwgc291cmNlQXJyKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBzb3VyY2VBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjaGVja2VkQXJyW2ldID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLmluZ0NoZWNrZWQsIHJlY2lwZS5yZWNpcGUuaW5ncmVkaWVudHMpO1xuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLnN0ZXBDaGVja2VkLCByZWNpcGUucmVjaXBlLmRpcmVjdGlvbnMpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBjaGVja21hcmtcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gdHlwZVxuXHRcdFx0ICogQHBhcmFtIGluZGV4XG5cdFx0XHQgKi9cblx0XHRcdHJlY2lwZS50b2dnbGVDaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG5cdFx0XHRcdHJlY2lwZVt0eXBlICsgJ0NoZWNrZWQnXVtpbmRleF0gPSAhcmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKHJlcykge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0cmVjaXBlLmVycm9yTXNnID0gcmVzLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogRmlsZSBvciB1bmZpbGUgdGhpcyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqL1xuXHRcdHJlY2lwZS5maWxlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlSWQpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0cmVjaXBlLmFwaU1zZyA9IGRhdGEuYWRkZWQgPyAnUmVjaXBlIHNhdmVkIScgOiAnUmVjaXBlIHJlbW92ZWQhJztcblx0XHRcdFx0cmVjaXBlLmZpbGVkID0gZGF0YS5hZGRlZDtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZUVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmZpbGVSZWNpcGUocmVjaXBlSWQpXG5cdFx0XHRcdC50aGVuKF9maWxlU3VjY2VzcywgX2ZpbGVFcnJvcik7XG5cdFx0fTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcignbWluVG9IJywgbWluVG9IKTtcblxuXHRmdW5jdGlvbiBtaW5Ub0goKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1pbikge1xuXHRcdFx0dmFyIF9ob3VyID0gNjA7XG5cdFx0XHR2YXIgX21pbiA9IG1pbiAqIDE7XG5cdFx0XHR2YXIgX2d0SG91ciA9IF9taW4gLyBfaG91ciA+PSAxO1xuXHRcdFx0dmFyIF9oUGx1c01pbiA9IF9taW4gJSBfaG91cjtcblx0XHRcdHZhciBfaGFzTWludXRlcyA9IF9oUGx1c01pbiAhPT0gMDtcblx0XHRcdHZhciBfaG91cnMgPSBNYXRoLmZsb29yKF9taW4gLyBfaG91cik7XG5cdFx0XHR2YXIgX2hvdXJzVGV4dCA9IF9ob3VycyA9PT0gMSA/ICcgaG91cicgOiAnIGhvdXJzJztcblx0XHRcdHZhciBfbWludXRlcyA9IF9oYXNNaW51dGVzID8gJywgJyArIF9oUGx1c01pbiArIF9taW5UZXh0KF9oUGx1c01pbikgOiAnJztcblx0XHRcdHZhciBfbm9ITWluVGV4dCA9IF9taW4gPT09IDEgPyAnIG1pbnV0ZScgOiAnIG1pbnV0ZXMnO1xuXHRcdFx0dmFyIHRpbWVTdHIgPSBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdldCBtaW51dGUvcyB0ZXh0IGZyb20gbWludXRlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtaW51dGVzIHtudW1iZXJ9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX21pblRleHQobWludXRlcykge1xuXHRcdFx0XHRpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyA9PT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyAhPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZXMnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfZ3RIb3VyKSB7XG5cdFx0XHRcdHRpbWVTdHIgPSBfaG91cnMgKyBfaG91cnNUZXh0ICsgX21pbnV0ZXM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aW1lU3RyID0gX21pbiArIF9ub0hNaW5UZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGltZVN0cjtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0F1dGhvckN0cmwnLCBSZWNpcGVzQXV0aG9yQ3RybCk7XG5cblx0UmVjaXBlc0F1dGhvckN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNBdXRob3JDdHJsKFBhZ2UsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2FpZCA9ICRyb3V0ZVBhcmFtcy51c2VySWQ7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0F1dGhvcic7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIGJ5ICcgKyByYS5hdXRob3IuZGlzcGxheU5hbWU7XG5cdFx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0QXV0aG9yKF9haWQpXG5cdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0QXV0aG9yUmVjaXBlcyhfYWlkKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLCBSZWNpcGVzQ2F0ZWdvcnlDdHJsKTtcblxuXHRSZWNpcGVzQ2F0ZWdvcnlDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQ2F0ZWdvcnlDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfY2F0ID0gJHJvdXRlUGFyYW1zLmNhdGVnb3J5O1xuXHRcdHZhciBfY2F0VGl0bGUgPSBfY2F0LnN1YnN0cmluZygwLDEpLnRvTG9jYWxlVXBwZXJDYXNlKCkgKyBfY2F0LnN1YnN0cmluZygxKTtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQ2F0ZWdvcnknO1xuXHRcdHJhLmhlYWRpbmcgPSBfY2F0VGl0bGUgKyAncyc7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ2ZhbHNlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIGNhdEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUuY2F0ZWdvcnkgPT0gX2NhdFRpdGxlKSB7XG5cdFx0XHRcdFx0Y2F0QXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSBjYXRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc1RhZ0N0cmwnLCBSZWNpcGVzVGFnQ3RybCk7XG5cblx0UmVjaXBlc1RhZ0N0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNUYWdDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfdGFnID0gJHJvdXRlUGFyYW1zLnRhZztcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzVGFnJztcblxuXHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyB0YWdnZWQgXCInICsgX3RhZyArICdcIic7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAnZmFsc2UnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHRhZ2dlZEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUudGFncy5pbmRleE9mKF90YWcpID4gLTEpIHtcblx0XHRcdFx0XHR0YWdnZWRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IHRhZ2dlZEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0oKSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

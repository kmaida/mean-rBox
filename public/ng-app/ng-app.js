angular
	.module('rBox', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'satellizer', 'slugifier']);
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', '$auth', 'userData', '$timeout', 'OAUTH', 'User'];

	function AccountCtrl($scope, $auth, userData, $timeout, OAUTH, User) {
		// controllerAs ViewModel
		var account = this;

		// All available login services
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

	AdminCtrl.$inject = ['$auth', 'userData', 'User'];

	function AdminCtrl($auth, userData, User) {
		// controllerAs ViewModel
		var admin = this;

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
// media query constants
(function() {
	'use strict';

	angular
		.module('rBox')
		.constant('MQ', {
			SMALL: '(max-width: 767px)',
			LARGE: '(min-width: 768px)'
		});
})();
// login/Oauth constants
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
// User functions
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('User', User);

	User.$inject = ['OAUTH'];

	function User(OAUTH) {

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

		return {
			getLinkedAccounts: getLinkedAccounts
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.config(authConfig)
		.run(authRun);

	authConfig.$inject = ['$authProvider'];

	function authConfig($authProvider) {
		$authProvider.loginUrl = 'http://rbox.kmaida.io/auth/login';

		$authProvider.facebook({
			clientId: '360173197505650'
		});

		$authProvider.google({
			clientId: '362136322942-k45h52q3uq56dc1gas1f52c0ulhg5190.apps.googleusercontent.com'
		});

		$authProvider.twitter({
			url: '/auth/twitter'
		});

		$authProvider.github({
			clientId: '9ff097299c86e524b10f'
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
				templateUrl: 'ng-app/home/Home.view.html',
				secure: true
			})
			.when('/login', {
				templateUrl: 'ng-app/login/Login.view.html'
			})
			.when('/my-recipes', {
				templateUrl: 'ng-app/my-recipes/MyRecipes.view.html',
				secure: true
			})
			.when('/recipe/:slug', {
				templateUrl: 'ng-app/recipe/Recipe.view.html',
				secure: true
			})
			.when('/recipe/:slug/edit', {
				templateUrl: 'ng-app/recipe/EditRecipe.view.html',
				secure: true
			})
			.when('/account', {
				templateUrl: 'ng-app/account/Account.view.html',
				secure: true
			})
			.when('/admin', {
				templateUrl: 'ng-app/admin/Admin.view.html',
				secure: true
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

	angular
		.module('rBox')
		.directive('detectAdblock', detectAdblock);

	detectAdblock.$inject = ['$timeout', '$location'];

	function detectAdblock($timeout, $location) {

		detectAdblockLink.$inject = ['$scope', '$elem', '$attrs'];

		function detectAdblockLink($scope, $elem, $attrs) {
			// data object
			$scope.ab = {};

			// hostname for messaging
			$scope.ab.host = $location.host();

			/**
			 * Check if ads are blocked - called in $timeout to let AdBlockers run
			 *
			 * @private
			 */
			function _areAdsBlocked() {
				var _a = $elem.find('.ad-test');

				$scope.ab.blocked = _a.height() <= 0 || !$elem.find('.ad-test:visible').length;
			}

			$timeout(_areAdsBlocked, 200);
		}

		return {
			restrict: 'EA',
			link: detectAdblockLink,
			template:   '<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div>' +
						'<div ng-if="ab.blocked" class="ab-message alert alert-danger">' +
							'<i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.' +
						'</div>'
		}
	}

})();
// Fetch local JSON data
(function() {
	'use strict';

	angular
		.module('rBox')
		.service('localData', localData);

	/**
	 * GET promise response function
	 * Checks typeof data returned and succeeds if JS object, throws error if not
	 *
	 * @param response {*} data from $http
	 * @returns {*} object, array
	 * @private
	 */
	function _getRes(response) {
		if (typeof response.data === 'object') {
			return response.data;
		} else {
			throw new Error('retrieved data is not typeof object.');
		}
	}

	localData.$inject = ['$http'];

	function localData($http) {
		/**
		 * Get local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		this.getJSON = function() {
			return $http
				.get('/ng-app/data/data.json')
				.then(_getRes);
		}
	}
})();
(function() {
	'use strict';

	var angularMediaCheck = angular.module('mediaCheck', []);

	angularMediaCheck.service('mediaCheck', ['$window', '$timeout', function ($window, $timeout) {
		this.init = function (options) {
			var $scope = options['scope'],
				query = options['mq'],
				debounce = options['debounce'],
				$win = angular.element($window),
				breakpoints,
				createListener = void 0,
				hasMatchMedia = $window.matchMedia !== undefined && !!$window.matchMedia('!').addListener,
				mqListListener,
				mmListener,
				debounceResize,
				mq = void 0,
				mqChange = void 0,
				debounceSpeed = !!debounce ? debounce : 250;

			if (hasMatchMedia) {
				mqChange = function (mq) {
					if (mq.matches && typeof options.enter === 'function') {
						options.enter(mq);
					} else {
						if (typeof options.exit === 'function') {
							options.exit(mq);
						}
					}
					if (typeof options.change === 'function') {
						options.change(mq);
					}
				};

				createListener = function () {
					mq = $window.matchMedia(query);
					mqListListener = function () {
						return mqChange(mq)
					};

					mq.addListener(mqListListener);

					// bind to the orientationchange event and fire mqChange
					$win.bind('orientationchange', mqListListener);

					// cleanup listeners when $scope is $destroyed
					$scope.$on('$destroy', function () {
						mq.removeListener(mqListListener);
						$win.unbind('orientationchange', mqListListener);
					});

					return mqChange(mq);
				};

				return createListener();

			} else {
				breakpoints = {};

				mqChange = function (mq) {
					if (mq.matches) {
						if (!!breakpoints[query] === false && (typeof options.enter === 'function')) {
							options.enter(mq);
						}
					} else {
						if (breakpoints[query] === true || breakpoints[query] == null) {
							if (typeof options.exit === 'function') {
								options.exit(mq);
							}
						}
					}

					if ((mq.matches && (!breakpoints[query]) || (!mq.matches && (breakpoints[query] === true || breakpoints[query] == null)))) {
						if (typeof options.change === 'function') {
							options.change(mq);
						}
					}

					return breakpoints[query] = mq.matches;
				};

				var convertEmToPx = function (value) {
					var emElement = document.createElement('div');

					emElement.style.width = '1em';
					emElement.style.position = 'absolute';
					document.body.appendChild(emElement);
					px = value * emElement.offsetWidth;
					document.body.removeChild(emElement);

					return px;
				};

				var getPXValue = function (width, unit) {
					var value;
					value = void 0;
					switch (unit) {
						case 'em':
							value = convertEmToPx(width);
							break;
						default:
							value = width;
					}
					return value;
				};

				breakpoints[query] = null;

				mmListener = function () {
					var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/),
						constraint = parts[1],
						value = getPXValue(parseInt(parts[2], 10), parts[3]),
						fakeMatchMedia = {},
						windowWidth = $window.innerWidth || document.documentElement.clientWidth;

					fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

					return mqChange(fakeMatchMedia);
				};

				var fakeMatchMediaResize = function () {
					clearTimeout(debounceResize);
					debounceResize = $timeout(mmListener, debounceSpeed);
				};

				$win.bind('resize', fakeMatchMediaResize);

				$scope.$on('$destroy', function () {
					$win.unbind('resize', fakeMatchMediaResize);
				});

				return mmListener();
			}
		};
	}]);
})();
// Recipe API $http calls
(function() {
	'use strict';

	angular
		.module('rBox')
		.service('recipeData', recipeData);

	/**
	 * GET promise response function
	 * Checks typeof data returned and succeeds if JS object, throws error if not
	 *
	 * @param response {*} data from $http
	 * @returns {*} object, array
	 * @private
	 */
	function _getRes(response) {
		if (typeof response.data === 'object') {
			return response.data;
		} else {
			throw new Error('retrieved data is not typeof object.');
		}
	}

	recipeData.$inject = ['$http'];

	function recipeData($http) {
		/**
		 * Get recipe
		 *
		 * @param slug {string} recipe slug
		 * @returns {promise}
		 */
		this.getRecipe = function(slug) {
			return $http
				.get('/api/recipe/' + slug)
				.then(_getRes);
		};

		/**
		 * Create a recipe
		 *
		 * @param recipeData {object}
		 * @returns {promise}
		 */
		this.createRecipe = function(recipeData) {
			return $http
				.post('/api/recipe/new', recipeData)
				.then(_getRes);
		};

		/**
		 * Update a recipe
		 *
		 * @param id {string} recipe ID (in case slug has changed)
		 * @param recipeData {object}
		 * @returns {promise}
		 */
		this.updateRecipe = function(id, recipeData) {
			return $http
				.put('/api/recipe/' + id, recipeData);
		};

		/**
		 * Delete a recipe
		 *
		 * @param id {string} recipe ID
		 * @returns {promise}
		 */
		this.deleteRecipe = function(id) {
			return $http
				.delete('/api/recipe/' + id);
		};

		/**
		 * Get all public recipes
		 *
		 * @returns {promise}
		 */
		this.getPublicRecipes = function() {
			return $http
				.get('/api/recipes')
				.then(_getRes);
		};

		/**
		 * Get my recipes
		 *
		 * @returns {promise}
		 */
		this.getMyRecipes = function() {
			return $http
				.get('/api/recipes/me')
				.then(_getRes);
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
// User directive
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('user', user);

	user.$inject = ['userData', '$auth'];

	function user(userData, $auth) {

		/**
		 * User directive controller
		 */
		function userCtrl() {
			// controllerAs ViewModel
			var u = this;

			/**
			 * Check if the current user is authenticated
			 *
			 * @returns {boolean}
			 */
			u.isAuthenticated = function() {
				return $auth.isAuthenticated();
			};

			// API request to get the user, passing success callback function that sets the user's info
			userData.getUser().then(function(data) {
				u.user = data;
			});
		}

		return {
			restrict: 'EA',
			controller: userCtrl,
			controllerAs: 'u',
			template: '<div ng-if="u.isAuthenticated() && !!u.user" class="user clearfix"><img ng-if="!!u.user.picture" ng-src="{{u.user.picture}}" class="user-picture" /><span class="user-displayName">{{u.user.displayName}}</span></div>'
		};
	}
})();
// User API $http calls
(function() {
	'use strict';

	angular
		.module('rBox')
		.service('userData', userData);

	/**
	 * GET promise response function
	 * Checks typeof data returned and succeeds if JS object, throws error if not
	 *
	 * @param response {*} data from $http
	 * @returns {*} object, array
	 * @private
	 */
	function _getRes(response) {
		if (typeof response.data === 'object') {
			return response.data;
		} else {
			throw new Error('retrieved data is not typeof object.');
		}
	}

	userData.$inject = ['$http'];

	function userData($http) {
		/**
		 * Get current user's data
		 *
		 * @returns {promise}
		 */
		this.getUser = function() {
			return $http
				.get('/api/me')
				.then(_getRes);
		};

		/**
		 * Update current user's profile data
		 *
		 * @param profileData {object}
		 * @returns {promise}
		 */
		this.updateUser = function(profileData) {
			return $http
				.put('/api/me', profileData);
		};

		/**
		 * Get all users (admin authorized only)
		 *
		 * @returns {promise}
		 */
		this.getAllUsers = function() {
			return $http
				.get('/api/users')
				.then(_getRes);
		};
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
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'localData', '$auth', 'userData'];

	function headerCtrl($scope, $location, localData, $auth, userData) {
		// controllerAs ViewModel
		var header = this;

		function _localDataSuccess(data) {
			header.localData = data;
		}

		localData.getJSON().then(_localDataSuccess);

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
			// if user is authenticated and not defined yet, check if they're an admin
			if ($auth.isAuthenticated() && header.adminUser === undefined) {
				userData.getUser()
					.then(function(data) {
						header.adminUser = data.isAdmin;
					});
			}
		}
		_checkUserAdmin();
		$scope.$on('$locationChangeSuccess', _checkUserAdmin);

		/**
		 * Is the user authenticated?
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

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function navControl(mediaCheck, MQ, $timeout) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _body = angular.element('body'),
				_navOpen;

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
					/**
					 * Toggle mobile navigation open/closed
					 */
					$scope.nav.toggleNav = function () {
						if (!_navOpen) {
							_openNav();
						} else {
							_closeNav();
						}
					};
				});

				$scope.$on('$locationChangeSuccess', _closeNav);
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
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$auth', 'localData', 'recipeData'];

	function HomeCtrl($auth, localData, recipeData) {
		// controllerAs ViewModel
		var home = this;

		/**
		 * Determines if the user is authenticated
		 *
		 * @returns {boolean}
		 */
		home.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Get local data from static JSON
		 *
		 * @param data (successful promise returns)
		 * @returns {object} data
		 */
		function _localDataSuccess(data) {
			home.localData = data;
		}
		localData.getJSON().then(_localDataSuccess);

		function _publicRecipesSuccess(data) {
			home.publicRecipes = data;
		}
		recipeData.getPublicRecipes().then(_publicRecipesSuccess);
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('LoginCtrl', LoginCtrl);

	LoginCtrl.$inject = ['$auth', 'OAUTH', '$rootScope', '$location', 'localData'];

	function LoginCtrl($auth, OAUTH, $rootScope, $location, localData) {
		// controllerAs ViewModel
		var login = this;

		/**
		 * Function to run when local data successful
		 *
		 * @param data {JSON}
		 * @private
		 */
		function _localDataSuccess(data) {
			login.localData = data;
		}

		localData.getJSON().then(_localDataSuccess);

		login.logins = OAUTH.LOGINS;

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
			 * @param response {object} promise response
			 * @private
			 */
			function _authSuccess(response) {
				login.loggingIn = false;

				if ($rootScope.authPath) {
					$location.path($rootScope.authPath);
				}
			}

			$auth.authenticate(provider)
				.then(_authSuccess)
				.catch(function(response) {
					console.log(response.data);
					login.loggingIn = 'error';
					login.loginMsg = ''
				});
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['$auth', 'recipeData', 'userData'];

	function MyRecipesCtrl($auth, recipeData, userData) {
		// controllerAs ViewModel
		var myRecipes = this;

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		myRecipes.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		function _getUserSuccess(data) {
			myRecipes.user = data;
		}
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipesSuccess(data) {
			myRecipes.recipes = data;
		}
		recipeData.getMyRecipes().then(_recipesSuccess);
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Slug', '$location', '$timeout'];

	function recipeForm(recipeData, Slug, $location, $timeout) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;

			if (_isEdit) {
				rf.recipeData = rf.recipe;
			} else {
				rf.recipeData = {};
				rf.recipeData.userId = rf.userId;
			}

			/**
			 * Recipe created or saved successfully
			 *
			 * @param recipe {data} if editing event
			 * @private
			 */
			function _recipeSaved(recipe) {
				console.log('saved');

				if (!_isEdit) {
					var recipeId = recipe._id;

					console.log('new recipe ID:', recipeId);
				}
			}

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				rf.recipeData.slug = Slug.slugify(rf.recipeData.name);

				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData).then(_recipeSaved);
				} else {
					recipeData.updateRecipe(rf.recipe._id, rf.recipeData).then(_recipeSaved);
				}
			};
		}

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/my-recipes/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function EditRecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var edit = this;

		var recipeSlug = $routeParams.slug;

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
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipeSuccess(data) {
			edit.recipe = data;
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess);

		/**
		 * Successful promise after deleting recipe
		 *
		 * @param data
		 * @private
		 */
		function _deleteSuccess(data) {
			console.log('recipe deleted!');
		}
		edit.deleteRecipe = function() {
			recipeData.deleteRecipe(edit.recipe._id).then(_deleteSuccess);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;

		// TODO: use slugify for URLs instead of MongoDB IDs
		var recipeSlug = $routeParams.slug;

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		recipe.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		function _getUserSuccess(data) {
			recipe.user = data;
		}
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipeSuccess(data) {
			recipe.recipe = data;
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess);
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9hcHAuYXV0aC5qcyIsImNvcmUvYXBwLmNvbmZpZy5qcyIsImNvcmUvZGV0ZWN0QWRCbG9jay5kaXIuanMiLCJjb3JlL2xvY2FsRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9tZWRpYUNoZWNrLnNlcnZpY2UuanMiLCJjb3JlL3JlY2lwZURhdGEuc2VydmljZS5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91c2VyLmRpci5qcyIsImNvcmUvdXNlckRhdGEuc2VydmljZS5qcyIsImNvcmUvdmlld1N3aXRjaC5kaXIuanMiLCJoZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJoZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJob21lL0hvbWUuY3RybC5qcyIsImxvZ2luL0xvZ2luLmN0cmwuanMiLCJteS1yZWNpcGVzL015UmVjaXBlcy5jdHJsLmpzIiwibXktcmVjaXBlcy9yZWNpcGVGb3JtLmRpci5qcyIsInJlY2lwZS9FZGl0UmVjaXBlLmN0cmwuanMiLCJyZWNpcGUvUmVjaXBlLmN0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im5nLWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcblx0Lm1vZHVsZSgnckJveCcsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbmdNZXNzYWdlcycsICdtZWRpYUNoZWNrJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJ10pOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBBY2NvdW50Q3RybCk7XG5cblx0QWNjb3VudEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInXTtcblxuXHRmdW5jdGlvbiBBY2NvdW50Q3RybCgkc2NvcGUsICRhdXRoLCB1c2VyRGF0YSwgJHRpbWVvdXQsIE9BVVRILCBVc2VyKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhY2NvdW50ID0gdGhpcztcblxuXHRcdC8vIEFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhY2NvdW50LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKi9cblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IEFjY291bnQgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdGFjY291bnQudXNlciA9IGRhdGE7XG5cdFx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0XHRhY2NvdW50LmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyhhY2NvdW50LnVzZXIsICdhY2NvdW50Jyk7XG5cdFx0XHRcdGFjY291bnQuc2hvd0FjY291bnQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBlcnJvciBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVycm9yXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlckVycm9yKGVycm9yKSB7XG5cdFx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2VzcywgX2dldFVzZXJFcnJvcik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHByb2ZpbGUgc2F2ZSBidXR0b24gdG8gaW5pdGlhbCBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYnRuU2F2ZVJlc2V0KCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IGZhbHNlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHR9XG5cblx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cblx0XHQvKipcblx0XHQgKiBXYXRjaCBkaXNwbGF5IG5hbWUgY2hhbmdlcyB0byBjaGVjayBmb3IgZW1wdHkgb3IgbnVsbCBzdHJpbmdcblx0XHQgKiBTZXQgYnV0dG9uIHRleHQgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdXBkYXRlZCBkaXNwbGF5TmFtZSB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkXG5cdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn0gcHJldmlvdXMgZGlzcGxheU5hbWUgdmFsdWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF93YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF93YXRjaERpc3BsYXlOYW1lKTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqIENhbGxlZCBvbiBzdWJtaXNzaW9uIG9mIHVwZGF0ZSBmb3JtXG5cdFx0ICovXG5cdFx0YWNjb3VudC51cGRhdGVQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSB0cnVlO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZUVycm9yKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCEhYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lKSB7XG5cdFx0XHRcdC8vIFNldCBzdGF0dXMgdG8gU2F2aW5nLi4uIGFuZCB1cGRhdGUgdXBvbiBzdWNjZXNzIG9yIGVycm9yIGluIGNhbGxiYWNrc1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB1c2VyLCBwYXNzaW5nIHByb2ZpbGUgZGF0YSBhbmQgYXNzaWduaW5nIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrc1xuXHRcdFx0XHR1c2VyRGF0YS51cGRhdGVVc2VyKHByb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQudW5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWRtaW5DdHJsJywgQWRtaW5DdHJsKTtcblxuXHRBZG1pbkN0cmwuJGluamVjdCA9IFsnJGF1dGgnLCAndXNlckRhdGEnLCAnVXNlciddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybCgkYXV0aCwgdXNlckRhdGEsIFVzZXIpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZXMgaWYgdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWRtaW4uaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBBZG1pbiBVSVxuXHRcdCAqIERpc3BsYXkgbGlzdCBvZiB1c2Vyc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWRtaW4udXNlcnMgPSBkYXRhO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goYWRtaW4udXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0dXNlci5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHModXNlcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgdW5zdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBVbmF1dGhvcml6ZWQgZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7ZXJyb3J9IHJlc3BvbnNlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNFcnJvcihlcnJvcikge1xuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dXNlckRhdGEuZ2V0QWxsVXNlcnMoKS50aGVuKF9nZXRBbGxVc2Vyc1N1Y2Nlc3MsIF9nZXRBbGxVc2Vyc0Vycm9yKTtcblx0fVxufSkoKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ01RJywge1xuXHRcdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxuXHRcdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdFx0fSk7XG59KSgpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEgnLCB7XG5cdFx0XHRMT0dJTlM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnb29nbGUnLFxuXHRcdFx0XHRcdG5hbWU6ICdHb29nbGUnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ3R3aXR0ZXInLFxuXHRcdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vdHdpdHRlci5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRcdG5hbWU6ICdGYWNlYm9vaycsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2ZhY2Vib29rLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnaXRodWInLFxuXHRcdFx0XHRcdG5hbWU6ICdHaXRIdWInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlcikge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSAnaHR0cDovL3Jib3gua21haWRhLmlvL2F1dGgvbG9naW4nO1xuXG5cdFx0JGF1dGhQcm92aWRlci5mYWNlYm9vayh7XG5cdFx0XHRjbGllbnRJZDogJzM2MDE3MzE5NzUwNTY1MCdcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiAnMzYyMTM2MzIyOTQyLWs0NWg1MnEzdXE1NmRjMWdhczFmNTJjMHVsaGc1MTkwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJ1xuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogJy9hdXRoL3R3aXR0ZXInXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogJzlmZjA5NzI5OWM4NmU1MjRiMTBmJ1xuXHRcdH0pO1xuXHR9XG5cblx0YXV0aFJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIGF1dGhSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dCAmJiBuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnNlY3VyZSAmJiAhJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL215LXJlY2lwZXMnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL215LXJlY2lwZXMvTXlSZWNpcGVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RldGVjdEFkYmxvY2snLCBkZXRlY3RBZGJsb2NrKTtcblxuXHRkZXRlY3RBZGJsb2NrLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2soJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXG5cdFx0ZGV0ZWN0QWRibG9ja0xpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdC8vIGhvc3RuYW1lIGZvciBtZXNzYWdpbmdcblx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBkZXRlY3RBZGJsb2NrTGluayxcblx0XHRcdHRlbXBsYXRlOiAgICc8ZGl2IGNsYXNzPVwiYWQtdGVzdCBmYS1mYWNlYm9vayBmYS10d2l0dGVyXCIgc3R5bGU9XCJoZWlnaHQ6MXB4O1wiPjwvZGl2PicgK1xuXHRcdFx0XHRcdFx0JzxkaXYgbmctaWY9XCJhYi5ibG9ja2VkXCIgY2xhc3M9XCJhYi1tZXNzYWdlIGFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgK1xuXHRcdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH1cblx0fVxuXG59KSgpOyIsIi8vIEZldGNoIGxvY2FsIEpTT04gZGF0YVxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCdsb2NhbERhdGEnLCBsb2NhbERhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdGxvY2FsRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIGxvY2FsRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0SlNPTiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9uZy1hcHAvZGF0YS9kYXRhLmpzb24nKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGFuZ3VsYXJNZWRpYUNoZWNrID0gYW5ndWxhci5tb2R1bGUoJ21lZGlhQ2hlY2snLCBbXSk7XG5cblx0YW5ndWxhck1lZGlhQ2hlY2suc2VydmljZSgnbWVkaWFDaGVjaycsIFsnJHdpbmRvdycsICckdGltZW91dCcsIGZ1bmN0aW9uICgkd2luZG93LCAkdGltZW91dCkge1xuXHRcdHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHR2YXIgJHNjb3BlID0gb3B0aW9uc1snc2NvcGUnXSxcblx0XHRcdFx0cXVlcnkgPSBvcHRpb25zWydtcSddLFxuXHRcdFx0XHRkZWJvdW5jZSA9IG9wdGlvbnNbJ2RlYm91bmNlJ10sXG5cdFx0XHRcdCR3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyksXG5cdFx0XHRcdGJyZWFrcG9pbnRzLFxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IHZvaWQgMCxcblx0XHRcdFx0aGFzTWF0Y2hNZWRpYSA9ICR3aW5kb3cubWF0Y2hNZWRpYSAhPT0gdW5kZWZpbmVkICYmICEhJHdpbmRvdy5tYXRjaE1lZGlhKCchJykuYWRkTGlzdGVuZXIsXG5cdFx0XHRcdG1xTGlzdExpc3RlbmVyLFxuXHRcdFx0XHRtbUxpc3RlbmVyLFxuXHRcdFx0XHRkZWJvdW5jZVJlc2l6ZSxcblx0XHRcdFx0bXEgPSB2b2lkIDAsXG5cdFx0XHRcdG1xQ2hhbmdlID0gdm9pZCAwLFxuXHRcdFx0XHRkZWJvdW5jZVNwZWVkID0gISFkZWJvdW5jZSA/IGRlYm91bmNlIDogMjUwO1xuXG5cdFx0XHRpZiAoaGFzTWF0Y2hNZWRpYSkge1xuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzICYmIHR5cGVvZiBvcHRpb25zLmVudGVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmVudGVyKG1xKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRtcSA9ICR3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSk7XG5cdFx0XHRcdFx0bXFMaXN0TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UobXEpXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1xLmFkZExpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGJpbmQgdG8gdGhlIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50IGFuZCBmaXJlIG1xQ2hhbmdlXG5cdFx0XHRcdFx0JHdpbi5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGNsZWFudXAgbGlzdGVuZXJzIHdoZW4gJHNjb3BlIGlzICRkZXN0cm95ZWRcblx0XHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG1xLnJlbW92ZUxpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHRcdCR3aW4udW5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUxpc3RlbmVyKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrcG9pbnRzID0ge307XG5cblx0XHRcdFx0bXFDaGFuZ2UgPSBmdW5jdGlvbiAobXEpIHtcblx0XHRcdFx0XHRpZiAobXEubWF0Y2hlcykge1xuXHRcdFx0XHRcdFx0aWYgKCEhYnJlYWtwb2ludHNbcXVlcnldID09PSBmYWxzZSAmJiAodHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoYnJlYWtwb2ludHNbcXVlcnldID09PSB0cnVlIHx8IGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5leGl0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgobXEubWF0Y2hlcyAmJiAoIWJyZWFrcG9pbnRzW3F1ZXJ5XSkgfHwgKCFtcS5tYXRjaGVzICYmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpKSkpIHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBicmVha3BvaW50c1txdWVyeV0gPSBtcS5tYXRjaGVzO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBjb252ZXJ0RW1Ub1B4ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0dmFyIGVtRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLndpZHRoID0gJzFlbSc7XG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVtRWxlbWVudCk7XG5cdFx0XHRcdFx0cHggPSB2YWx1ZSAqIGVtRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVtRWxlbWVudCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gcHg7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGdldFBYVmFsdWUgPSBmdW5jdGlvbiAod2lkdGgsIHVuaXQpIHtcblx0XHRcdFx0XHR2YXIgdmFsdWU7XG5cdFx0XHRcdFx0dmFsdWUgPSB2b2lkIDA7XG5cdFx0XHRcdFx0c3dpdGNoICh1bml0KSB7XG5cdFx0XHRcdFx0XHRjYXNlICdlbSc6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gY29udmVydEVtVG9QeCh3aWR0aCk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSB3aWR0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG51bGw7XG5cblx0XHRcdFx0bW1MaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgcGFydHMgPSBxdWVyeS5tYXRjaCgvXFwoKC4qKS0uKjpcXHMqKFtcXGRcXC5dKikoLiopXFwpLyksXG5cdFx0XHRcdFx0XHRjb25zdHJhaW50ID0gcGFydHNbMV0sXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGdldFBYVmFsdWUocGFyc2VJbnQocGFydHNbMl0sIDEwKSwgcGFydHNbM10pLFxuXHRcdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEgPSB7fSxcblx0XHRcdFx0XHRcdHdpbmRvd1dpZHRoID0gJHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuXHRcdFx0XHRcdGZha2VNYXRjaE1lZGlhLm1hdGNoZXMgPSBjb25zdHJhaW50ID09PSAnbWF4JyAmJiB2YWx1ZSA+IHdpbmRvd1dpZHRoIHx8IGNvbnN0cmFpbnQgPT09ICdtaW4nICYmIHZhbHVlIDwgd2luZG93V2lkdGg7XG5cblx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UoZmFrZU1hdGNoTWVkaWEpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoZGVib3VuY2VSZXNpemUpO1xuXHRcdFx0XHRcdGRlYm91bmNlUmVzaXplID0gJHRpbWVvdXQobW1MaXN0ZW5lciwgZGVib3VuY2VTcGVlZCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JHdpbi5iaW5kKCdyZXNpemUnLCBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHdpbi51bmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIG1tTGlzdGVuZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XSk7XG59KSgpOyIsIi8vIFJlY2lwZSBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuc2VydmljZSgncmVjaXBlRGF0YScsIHJlY2lwZURhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdHJlY2lwZURhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNsdWcge3N0cmluZ30gcmVjaXBlIHNsdWdcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFJlY2lwZSA9IGZ1bmN0aW9uKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmNyZWF0ZVJlY2lwZSA9IGZ1bmN0aW9uKHJlY2lwZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvbmV3JywgcmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRCAoaW4gY2FzZSBzbHVnIGhhcyBjaGFuZ2VkKVxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy51cGRhdGVSZWNpcGUgPSBmdW5jdGlvbihpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERlbGV0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZGVsZXRlKCcvYXBpL3JlY2lwZS8nICsgaWQpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFB1YmxpY1JlY2lwZXMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0TXlSZWNpcGVzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJ1c3RBc0hUTUwnLCB0cnVzdEFzSFRNTCk7XG5cblx0dHJ1c3RBc0hUTUwuJGluamVjdCA9IFsnJHNjZSddO1xuXG5cdGZ1bmN0aW9uIHRydXN0QXNIVE1MKCRzY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBkaXJlY3RpdmVcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCd1c2VyJywgdXNlcik7XG5cblx0dXNlci4kaW5qZWN0ID0gWyd1c2VyRGF0YScsICckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIHVzZXIodXNlckRhdGEsICRhdXRoKSB7XG5cblx0XHQvKipcblx0XHQgKiBVc2VyIGRpcmVjdGl2ZSBjb250cm9sbGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXNlckN0cmwoKSB7XG5cdFx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0XHR2YXIgdSA9IHRoaXM7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0XHQgKi9cblx0XHRcdHUuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHRcdH07XG5cblx0XHRcdC8vIEFQSSByZXF1ZXN0IHRvIGdldCB0aGUgdXNlciwgcGFzc2luZyBzdWNjZXNzIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgc2V0cyB0aGUgdXNlcidzIGluZm9cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dS51c2VyID0gZGF0YTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGNvbnRyb2xsZXI6IHVzZXJDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAndScsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaWY9XCJ1LmlzQXV0aGVudGljYXRlZCgpICYmICEhdS51c2VyXCIgY2xhc3M9XCJ1c2VyIGNsZWFyZml4XCI+PGltZyBuZy1pZj1cIiEhdS51c2VyLnBpY3R1cmVcIiBuZy1zcmM9XCJ7e3UudXNlci5waWN0dXJlfX1cIiBjbGFzcz1cInVzZXItcGljdHVyZVwiIC8+PHNwYW4gY2xhc3M9XCJ1c2VyLWRpc3BsYXlOYW1lXCI+e3t1LnVzZXIuZGlzcGxheU5hbWV9fTwvc3Bhbj48L2Rpdj4nXG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBVc2VyIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCd1c2VyRGF0YScsIHVzZXJEYXRhKTtcblxuXHQvKipcblx0ICogR0VUIHByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0ICpcblx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRSZXMocmVzcG9uc2UpIHtcblx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHR9XG5cdH1cblxuXHR1c2VyRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvbWUnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGN1cnJlbnQgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByb2ZpbGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy51cGRhdGVVc2VyID0gZnVuY3Rpb24ocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHVzZXJzIChhZG1pbiBhdXRob3JpemVkIG9ubHkpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEFsbFVzZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VycycpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gRm9yIGV2ZW50cyBiYXNlZCBvbiB2aWV3cG9ydCBzaXplIC0gdXBkYXRlcyBhcyB2aWV3cG9ydCBpcyByZXNpemVkXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgndmlld1N3aXRjaCcsIHZpZXdTd2l0Y2gpO1xuXG5cdHZpZXdTd2l0Y2guJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHZpZXdTd2l0Y2gobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHR2aWV3U3dpdGNoTGluay4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblxuXHRcdC8qKlxuXHRcdCAqIHZpZXdTd2l0Y2ggZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB2aWV3U3dpdGNoTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUudnMgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGVudGVyIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyRm4oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdzbWFsbCc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZXhpdCBtZWRpYSBxdWVyeVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0Rm4oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdsYXJnZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbml0aWFsaXplIG1lZGlhQ2hlY2tcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlckZuLFxuXHRcdFx0XHRleGl0OiBfZXhpdEZuXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiB2aWV3U3dpdGNoTGlua1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJywgJyRhdXRoJywgJ3VzZXJEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIGhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sIGxvY2FsRGF0YSwgJGF1dGgsIHVzZXJEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaGVhZGVyID0gdGhpcztcclxuXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5sb2NhbERhdGEgPSBkYXRhO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIG5vdCBkZWZpbmVkIHlldCwgY2hlY2sgaWYgdGhleSdyZSBhbiBhZG1pblxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLmFkbWluVXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0X2NoZWNrVXNlckFkbWluKCk7XHJcblx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2NoZWNrVXNlckFkbWluKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdG5hdkNvbnRyb2xMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnXTtcblxuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0dmFyIF9ib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5JyksXG5cdFx0XHRcdF9uYXZPcGVuO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQnKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LW9wZW4nKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2VOYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBUb2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmICghX25hdk9wZW4pIHtcblx0XHRcdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2xvc2VOYXYpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdF9ib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJNb2JpbGUsXG5cdFx0XHRcdGV4aXQ6IF9leGl0TW9iaWxlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cdH1cblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICdsb2NhbERhdGEnLCAncmVjaXBlRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybCgkYXV0aCwgbG9jYWxEYXRhLCByZWNpcGVEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aG9tZS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBsb2NhbCBkYXRhIGZyb20gc3RhdGljIEpTT05cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSAoc3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybnMpXHJcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBkYXRhXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5sb2NhbERhdGEgPSBkYXRhO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnB1YmxpY1JlY2lwZXMgPSBkYXRhO1xyXG5cdFx0fVxyXG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKCkudGhlbihfcHVibGljUmVjaXBlc1N1Y2Nlc3MpO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJyRhdXRoJywgJ09BVVRIJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJ2xvY2FsRGF0YSddO1xuXG5cdGZ1bmN0aW9uIExvZ2luQ3RybCgkYXV0aCwgT0FVVEgsICRyb290U2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBsb2NhbCBkYXRhIHN1Y2Nlc3NmdWxcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtKU09OfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bG9naW4ubG9jYWxEYXRhID0gZGF0YTtcblx0XHR9XG5cblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xuXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXG5cdFx0LyoqXG5cdFx0ICogQXV0aGVudGljYXRlIHRoZSB1c2VyIHZpYSBPYXV0aCB3aXRoIHRoZSBzcGVjaWZpZWQgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlciAtICh0d2l0dGVyLCBmYWNlYm9vaywgZ2l0aHViLCBnb29nbGUpXG5cdFx0ICovXG5cdFx0bG9naW4uYXV0aGVudGljYXRlID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IHRydWU7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcblx0XHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge29iamVjdH0gcHJvbWlzZSByZXNwb25zZVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhTdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJHJvb3RTY29wZS5hdXRoUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJ1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdNeVJlY2lwZXNDdHJsJywgTXlSZWNpcGVzQ3RybCk7XG5cblx0TXlSZWNpcGVzQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJ107XG5cblx0ZnVuY3Rpb24gTXlSZWNpcGVzQ3RybCgkYXV0aCwgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIG15UmVjaXBlcyA9IHRoaXM7XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0bXlSZWNpcGVzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnVzZXIgPSBkYXRhO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldE15UmVjaXBlcygpLnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlRm9ybScsIHJlY2lwZUZvcm0pO1xuXG5cdHJlY2lwZUZvcm0uJGluamVjdCA9IFsncmVjaXBlRGF0YScsICdTbHVnJywgJyRsb2NhdGlvbicsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm0ocmVjaXBlRGF0YSwgU2x1ZywgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlRm9ybUN0cmwoKSB7XG5cdFx0XHR2YXIgcmYgPSB0aGlzO1xuXHRcdFx0dmFyIF9pc0VkaXQgPSAhIXJmLnJlY2lwZTtcblxuXHRcdFx0aWYgKF9pc0VkaXQpIHtcblx0XHRcdFx0cmYucmVjaXBlRGF0YSA9IHJmLnJlY2lwZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJmLnJlY2lwZURhdGEgPSB7fTtcblx0XHRcdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSByZi51c2VySWQ7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVjaXBlIGNyZWF0ZWQgb3Igc2F2ZWQgc3VjY2Vzc2Z1bGx5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlY2lwZSB7ZGF0YX0gaWYgZWRpdGluZyBldmVudFxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVkKHJlY2lwZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnc2F2ZWQnKTtcblxuXHRcdFx0XHRpZiAoIV9pc0VkaXQpIHtcblx0XHRcdFx0XHR2YXIgcmVjaXBlSWQgPSByZWNpcGUuX2lkO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ25ldyByZWNpcGUgSUQ6JywgcmVjaXBlSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2F2ZSByZWNpcGVcblx0XHRcdCAqL1xuXHRcdFx0cmYuc2F2ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnNsdWcgPSBTbHVnLnNsdWdpZnkocmYucmVjaXBlRGF0YS5uYW1lKTtcblxuXHRcdFx0XHRpZiAoIV9pc0VkaXQpIHtcblx0XHRcdFx0XHRyZWNpcGVEYXRhLmNyZWF0ZVJlY2lwZShyZi5yZWNpcGVEYXRhKS50aGVuKF9yZWNpcGVTYXZlZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVjaXBlRGF0YS51cGRhdGVSZWNpcGUocmYucmVjaXBlLl9pZCwgcmYucmVjaXBlRGF0YSkudGhlbihfcmVjaXBlU2F2ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZTogJz0nLFxuXHRcdFx0XHR1c2VySWQ6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL215LXJlY2lwZXMvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0UmVjaXBlQ3RybCcsIEVkaXRSZWNpcGVDdHJsKTtcblxuXHRFZGl0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIEVkaXRSZWNpcGVDdHJsKCRhdXRoLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBlZGl0ID0gdGhpcztcblxuXHRcdHZhciByZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZWRpdC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQudXNlciA9IGRhdGE7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gZGF0YTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1ZykudGhlbihfcmVjaXBlU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgYWZ0ZXIgZGVsZXRpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3JlY2lwZSBkZWxldGVkIScpO1xuXHRcdH1cblx0XHRlZGl0LmRlbGV0ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVjaXBlRGF0YS5kZWxldGVSZWNpcGUoZWRpdC5yZWNpcGUuX2lkKS50aGVuKF9kZWxldGVTdWNjZXNzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVDdHJsJywgUmVjaXBlQ3RybCk7XG5cblx0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZUN0cmwoJGF1dGgsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cblx0XHQvLyBUT0RPOiB1c2Ugc2x1Z2lmeSBmb3IgVVJMcyBpbnN0ZWFkIG9mIE1vbmdvREIgSURzXG5cdFx0dmFyIHJlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1ZztcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRyZWNpcGUuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUudXNlciA9IGRhdGE7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS5yZWNpcGUgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShyZWNpcGVTbHVnKS50aGVuKF9yZWNpcGVTdWNjZXNzKTtcblx0fVxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
angular
	.module('rBox', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'satellizer', 'slugifier', 'ngFileUpload']);
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

	PageCtrl.$inject = ['Page'];

	function PageCtrl(Page) {
		var page = this;

		page.pageTitle = Page;
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Page', Page);

	function Page() {
		var pageTitle = 'All Recipes';

		function title() {
			return pageTitle;
		}

		function setTitle(newTitle) {
			pageTitle = newTitle;
		}

		return {
			title: title,
			setTitle: setTitle
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
				templateUrl: 'ng-app/home/Home.view.html',
				reloadOnSearch: false,
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/login', {
				templateUrl: 'ng-app/login/Login.view.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.when('/recipe/:slug', {
				templateUrl: 'ng-app/recipe/Recipe.view.html',
				controller: 'RecipeCtrl',
				controllerAs: 'recipe'
			})
			.when('/recipes/author/:userId', {
				templateUrl: 'ng-app/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesAuthorCtrl',
				controllerAs: 'ra'
			})
			.when('/recipes/tag/:tag', {
				templateUrl: 'ng-app/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesTagCtrl',
				controllerAs: 'ra'
			})
			.when('/recipes/category/:category', {
				templateUrl: 'ng-app/recipes-archives/RecipesArchives.view.html',
				controller: 'RecipesCategoryCtrl',
				controllerAs: 'ra'
			})
			.when('/my-recipes', {
				templateUrl: 'ng-app/my-recipes/MyRecipes.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'MyRecipesCtrl',
				controllerAs: 'myRecipes'
			})
			.when('/recipe/:slug/edit', {
				templateUrl: 'ng-app/recipe/EditRecipe.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'EditRecipeCtrl',
				controllerAs: 'edit'
			})
			.when('/account', {
				templateUrl: 'ng-app/account/Account.view.html',
				secure: true,
				reloadOnSearch: false,
				controller: 'AccountCtrl',
				controllerAs: 'account'
			})
			.when('/admin', {
				templateUrl: 'ng-app/admin/Admin.view.html',
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
// For touchend/mouseup blur
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('blurOnEnd', blurOnEnd);

	blurOnEnd.$inject = [];

	function blurOnEnd() {

		blurOnEndLink.$inject = ['$scope', '$elem'];

		function blurOnEndLink($scope, $elem) {
			$elem.bind('touchend', blurElem);
			$elem.bind('mouseup', blurElem);

			function blurElem() {
				$elem.trigger('blur');
			}

			$scope.$on('$destroy', function() {
				$elem.unbind('touchend', blurElem);
				$elem.unbind('mouseup', blurElem)
			});
		}

		return {
			restrict: 'EA',
			link: blurOnEndLink
		};
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
(function() {

	angular
		.module('rBox')
		.directive('divider', divider);

	function divider() {
		return {
			restrict: 'EA',
			template: '<div class="rBox-divider"><i class="fa fa-cutlery"></i></div>'
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
		console.log(response);

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

		/**
		 * Get a specific user's public recipes
		 *
		 * @param userId {string} user ID
		 * @returns {promise}
		 */
		this.getAuthorRecipes = function(userId) {
			return $http
				.get('/api/recipes/author/' + userId)
				.then(_getRes);
		};

		/**
		 * File/unfile this recipe in user data
		 *
		 * @param recipeId {string} ID of recipe to save
		 * @returns {promise}
		 */
		this.fileRecipe = function(recipeId) {
			return $http
				.put('/api/recipe/' + recipeId + '/file')
				.then(_getRes);
		};

		/**
		 * Get my filed recipes
		 *
		 * @param recipeIds {Array} array of user's filed recipe IDs
		 * @returns {promise}
		 */
		this.getFiledRecipes = function(recipeIds) {
			return $http
				.post('/api/recipes/me/filed', recipeIds)
				.then(_getRes);
		};

		this.cleanUploads = function(files) {
			return $http
				.post('/api/recipe/clean-uploads', files);
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout', 'Upload', 'mediaCheck', 'MQ'];

	function recipeForm(recipeData, Recipe, Slug, $location, $timeout, Upload, mediaCheck, MQ) {

		recipeFormCtrl.$inject = ['$scope'];

		function recipeFormCtrl($scope) {
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

		recipeFormLink.$inject = ['$scope', '$elem', '$attrs'];

		function recipeFormLink($scope, $elem, $attrs) {
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

			mediaCheck.init({
				scope: $scope,
				mq: MQ.LARGE,
				enter: function(mq) {
					$scope.rfl.isLargeView = true;
				},
				exit: function(mq) {
					$scope.rfl.isLargeView = false;
				}
			});

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

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/core/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true,
			link: recipeFormLink
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipesList', recipesList);

	recipesList.$inject = ['Recipe'];

	function recipesList(Recipe) {

		recipesListCtrl.$inject = ['$scope'];

		function recipesListCtrl($scope) {
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

		recipesListLink.$inject = ['$scope', '$attrs', '$elem'];

		function recipesListLink($scope, $attrs, $elem) {
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

		return {
			restrict: 'EA',
			scope: {
				recipes: '=',
				openFilters: '@',
				customLabels: '@',
				categoryFilter: '@',
				tagFilter: '@'
			},
			templateUrl: 'ng-app/core/recipesList.tpl.html',
			controller: recipesListCtrl,
			controllerAs: 'rl',
			bindToController: true,
			link: recipesListLink
		}
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
		 * Get recipe author's basic data
		 *
		 * @param id {string} MongoDB ID of user
		 * @returns {promise}
		 */
		this.getAuthor = function(id) {
			return $http
				.get('/api/user/' + id)
				.then(_getRes);
		};

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

	HomeCtrl.$inject = ['Page', 'localData', 'recipeData', 'Recipe', '$auth', 'userData', '$location'];

	function HomeCtrl(Page, localData, recipeData, Recipe, $auth, userData, $location) {
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
		 * Get local data from static JSON
		 *
		 * @param data (successful promise returns)
		 * @returns {object} data
		 */
		function _localDataSuccess(data) {
			home.localData = data;

			console.log('fetched local data');
		}
		localData.getJSON().then(_localDataSuccess);

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

	LoginCtrl.$inject = ['Page', '$auth', 'OAUTH', '$rootScope', '$location', 'localData'];

	function LoginCtrl(Page, $auth, OAUTH, $rootScope, $location, localData) {
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
		 * Function to run when local data successful
		 *
		 * @param data {JSON}
		 * @private
		 */
		function _localDataSuccess(data) {
			login.localData = data;
		}
		localData.getJSON().then(_localDataSuccess);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvT0FVVEhDTElFTlRTLmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvUmVjaXBlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLmF1dGguanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS9kaXZpZGVyLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLnNlcnZpY2UuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvcmVjaXBlRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvcmVjaXBlc0xpc3QuZGlyLmpzIiwiY29yZS90cmltU3RyLmZpbHRlci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91c2VyRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwibG9naW4vTG9naW4uY3RybC5qcyIsIm15LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJyZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInJlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAnc2F0ZWxsaXplcicsICdzbHVnaWZpZXInLCAnbmdGaWxlVXBsb2FkJ10pOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBBY2NvdW50Q3RybCk7XG5cblx0QWNjb3VudEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnJHRpbWVvdXQnLCAnT0FVVEgnLCAnVXNlcicsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBBY2NvdW50Q3RybCgkc2NvcGUsIFBhZ2UsICRhdXRoLCB1c2VyRGF0YSwgJHRpbWVvdXQsIE9BVVRILCBVc2VyLCAkbG9jYXRpb24pIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFjY291bnQgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBBY2NvdW50Jyk7XG5cblx0XHRhY2NvdW50LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdVc2VyIEluZm8nLFxuXHRcdFx0XHRxdWVyeTogJ3VzZXItaW5mbydcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdNYW5hZ2UgTG9naW5zJyxcblx0XHRcdFx0cXVlcnk6ICdtYW5hZ2UtbG9naW5zJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0YWNjb3VudC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAndXNlci1pbmZvJztcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0YWNjb3VudC5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGFjY291bnQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvLyBhbGwgYXZhaWxhYmxlIGxvZ2luIHNlcnZpY2VzXG5cdFx0YWNjb3VudC5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWNjb3VudC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBBY2NvdW50IFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRhY2NvdW50LnVzZXIgPSBkYXRhO1xuXHRcdFx0XHRhY2NvdW50LmFkbWluaXN0cmF0b3IgPSBhY2NvdW50LnVzZXIuaXNBZG1pbjtcblx0XHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0XHRhY2NvdW50LnNob3dBY2NvdW50ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IGFuIGVycm9yIGFsZXJ0IGluIHRoZSBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0XHRhY2NvdW50LmVycm9yR2V0dGluZ1VzZXIgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0X2J0blNhdmVSZXNldCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfd2F0Y2hEaXNwbGF5TmFtZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCA9PT0gJycgfHwgbmV3VmFsID09PSBudWxsKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRW50ZXIgTmFtZSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGFjY291bnQudXBkYXRlUHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2VzcyBjYWxsYmFjayB3aGVuIHByb2ZpbGUgaGFzIGJlZW4gdXBkYXRlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlZCEnO1xuXG5cdFx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghIWFjY291bnQudXNlci5kaXNwbGF5TmFtZSkge1xuXHRcdFx0XHQvLyBTZXQgc3RhdHVzIHRvIFNhdmluZy4uLiBhbmQgdXBkYXRlIHVwb24gc3VjY2VzcyBvciBlcnJvciBpbiBjYWxsYmFja3Ncblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgdXNlciwgcGFzc2luZyBwcm9maWxlIGRhdGEgYW5kIGFzc2lnbmluZyBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3Ncblx0XHRcdFx0dXNlckRhdGEudXBkYXRlVXNlcihwcm9maWxlRGF0YSkudGhlbihfdXBkYXRlU3VjY2VzcywgX3VwZGF0ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVW5saW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LnVubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC51bmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5tZXNzYWdlIDogJ0NvdWxkIG5vdCB1bmxpbmsgJyArIHByb3ZpZGVyICsgJyBhY2NvdW50Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FkbWluQ3RybCcsIEFkbWluQ3RybCk7XG5cblx0QWRtaW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnVXNlciddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybChQYWdlLCAkYXV0aCwgdXNlckRhdGEsIFVzZXIpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FkbWluJyk7XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGFkbWluLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgQWRtaW4gVUlcblx0XHQgKiBEaXNwbGF5IGxpc3Qgb2YgdXNlcnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFkbWluLnVzZXJzID0gZGF0YTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGFkbWluLnVzZXJzLCBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdHVzZXIubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKHVzZXIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHVzZXJEYXRhLmdldEFsbFVzZXJzKCkudGhlbihfZ2V0QWxsVXNlcnNTdWNjZXNzLCBfZ2V0QWxsVXNlcnNFcnJvcik7XG5cdH1cbn0pKCk7IiwiLy8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdNUScsIHtcblx0XHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRcdExBUkdFOiAnKG1pbi13aWR0aDogNzY4cHgpJ1xuXHRcdH0pO1xufSkoKTsiLCIvLyBsb2dpbiBhY2NvdW50IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEgnLCB7XG5cdFx0XHRMT0dJTlM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnb29nbGUnLFxuXHRcdFx0XHRcdG5hbWU6ICdHb29nbGUnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ3R3aXR0ZXInLFxuXHRcdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vdHdpdHRlci5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRcdG5hbWU6ICdGYWNlYm9vaycsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2ZhY2Vib29rLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnaXRodWInLFxuXHRcdFx0XHRcdG5hbWU6ICdHaXRIdWInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG59KSgpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnT0FVVEhDTElFTlRTJywge1xuXHRcdFx0TE9HSU5VUkw6ICdodHRwOi8vcmJveC5rbWFpZGEuaW8vYXV0aC9sb2dpbicsXG5cdFx0XHRDTElFTlQ6IHtcblx0XHRcdFx0RkI6ICczNjAxNzMxOTc1MDU2NTAnLFxuXHRcdFx0XHRHT09HTEU6ICczNjIxMzYzMjI5NDItazQ1aDUycTN1cTU2ZGMxZ2FzMWY1MmMwdWxoZzUxOTAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxuXHRcdFx0XHRUV0lUVEVSOiAnL2F1dGgvdHdpdHRlcicsXG5cdFx0XHRcdEdJVEhVQjogJzlmZjA5NzI5OWM4NmU1MjRiMTBmJ1xuXHRcdFx0fVxuXHRcdH0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDdHJsJywgUGFnZUN0cmwpO1xuXG5cdFBhZ2VDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0cGFnZS5wYWdlVGl0bGUgPSBQYWdlO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xuXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdBbGwgUmVjaXBlcyc7XG5cblx0XHRmdW5jdGlvbiB0aXRsZSgpIHtcblx0XHRcdHJldHVybiBwYWdlVGl0bGU7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdSZWNpcGUnLCBSZWNpcGUpO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZSgpIHtcblx0XHR2YXIgZGlldGFyeSA9IFtcblx0XHRcdCdHbHV0ZW4tZnJlZScsXG5cdFx0XHQnVmVnYW4nLFxuXHRcdFx0J1ZlZ2V0YXJpYW4nXG5cdFx0XTtcblxuXHRcdHZhciBpbnNlcnRDaGFyID0gW1xuXHRcdFx0J+KFmycsXG5cdFx0XHQnwrwnLFxuXHRcdFx0J+KFkycsXG5cdFx0XHQnwr0nLFxuXHRcdFx0J+KFlCcsXG5cdFx0XHQnwr4nXG5cdFx0XTtcblxuXHRcdHZhciBjYXRlZ29yaWVzID0gW1xuXHRcdFx0J0FwcGV0aXplcicsXG5cdFx0XHQnQmV2ZXJhZ2UnLFxuXHRcdFx0J0Rlc3NlcnQnLFxuXHRcdFx0J0VudHJlZScsXG5cdFx0XHQnU2FsYWQnLFxuXHRcdFx0J1NpZGUnLFxuXHRcdFx0J1NvdXAnXG5cdFx0XTtcblxuXHRcdHZhciB0YWdzID0gW1xuXHRcdFx0J2FsY29ob2wnLFxuXHRcdFx0J2Jha2VkJyxcblx0XHRcdCdiZWVmJyxcblx0XHRcdCdmYXN0Jyxcblx0XHRcdCdmaXNoJyxcblx0XHRcdCdsb3ctY2Fsb3JpZScsXG5cdFx0XHQnb25lLXBvdCcsXG5cdFx0XHQncGFzdGEnLFxuXHRcdFx0J3BvcmsnLFxuXHRcdFx0J3BvdWx0cnknLFxuXHRcdFx0J3Nsb3ctY29vaycsXG5cdFx0XHQnc3RvY2snLFxuXHRcdFx0J3ZlZ2V0YWJsZSdcblx0XHRdO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRpZXRhcnk6IGRpZXRhcnksXG5cdFx0XHRpbnNlcnRDaGFyOiBpbnNlcnRDaGFyLFxuXHRcdFx0Y2F0ZWdvcmllczogY2F0ZWdvcmllcyxcblx0XHRcdHRhZ3M6IHRhZ3Ncblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBmdW5jdGlvbnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG5cdFVzZXIuJGluamVjdCA9IFsnT0FVVEgnXTtcblxuXHRmdW5jdGlvbiBVc2VyKE9BVVRIKSB7XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TGlua2VkQWNjb3VudHM6IGdldExpbmtlZEFjY291bnRzXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ09BVVRIQ0xJRU5UUyddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlciwgT0FVVEhDTElFTlRTKSB7XG5cdFx0JGF1dGhQcm92aWRlci5sb2dpblVybCA9IE9BVVRIQ0xJRU5UUy5MT0dJTlVSTDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuRkJcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkdPT0dMRVxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogT0FVVEhDTElFTlRTLkNMSUVOVC5UV0lUVEVSXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblxuXHRmdW5jdGlvbiBhdXRoUnVuKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJGF1dGgpIHtcblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdFx0aWYgKG5leHQgJiYgbmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5zZWN1cmUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuYXV0aFBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG5cdFx0XHRcdCRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyBzZW5kIHVzZXIgdG8gbG9naW5cblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cbn0pKCk7IiwiLy8gcm91dGVzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmVjaXBlJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9hdXRob3IvOnVzZXJJZCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNBdXRob3JDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL3RhZy86dGFnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc1RhZ0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvY2F0ZWdvcnkvOmNhdGVnb3J5Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0NhdGVnb3J5Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbXktcmVjaXBlcycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvbXktcmVjaXBlcy9NeVJlY2lwZXMudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNeVJlY2lwZXNDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbXlSZWNpcGVzJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRWRpdFJlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlZGl0J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIvLyBGb3IgdG91Y2hlbmQvbW91c2V1cCBibHVyXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnYmx1ck9uRW5kJywgYmx1ck9uRW5kKTtcblxuXHRibHVyT25FbmQuJGluamVjdCA9IFtdO1xuXG5cdGZ1bmN0aW9uIGJsdXJPbkVuZCgpIHtcblxuXHRcdGJsdXJPbkVuZExpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJ107XG5cblx0XHRmdW5jdGlvbiBibHVyT25FbmRMaW5rKCRzY29wZSwgJGVsZW0pIHtcblx0XHRcdCRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgYmx1ckVsZW0pO1xuXHRcdFx0JGVsZW0uYmluZCgnbW91c2V1cCcsIGJsdXJFbGVtKTtcblxuXHRcdFx0ZnVuY3Rpb24gYmx1ckVsZW0oKSB7XG5cdFx0XHRcdCRlbGVtLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdH1cblxuXHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCd0b3VjaGVuZCcsIGJsdXJFbGVtKTtcblx0XHRcdFx0JGVsZW0udW5iaW5kKCdtb3VzZXVwJywgYmx1ckVsZW0pXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBibHVyT25FbmRMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RldGVjdEFkYmxvY2snLCBkZXRlY3RBZGJsb2NrKTtcblxuXHRkZXRlY3RBZGJsb2NrLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2soJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXG5cdFx0ZGV0ZWN0QWRibG9ja0xpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdC8vIGhvc3RuYW1lIGZvciBtZXNzYWdpbmdcblx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBkZXRlY3RBZGJsb2NrTGluayxcblx0XHRcdHRlbXBsYXRlOiAgICc8ZGl2IGNsYXNzPVwiYWQtdGVzdCBmYS1mYWNlYm9vayBmYS10d2l0dGVyXCIgc3R5bGU9XCJoZWlnaHQ6MXB4O1wiPjwvZGl2PicgK1xuXHRcdFx0XHRcdFx0JzxkaXYgbmctaWY9XCJhYi5ibG9ja2VkXCIgY2xhc3M9XCJhYi1tZXNzYWdlIGFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgK1xuXHRcdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH1cblx0fVxuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGl2aWRlcicsIGRpdmlkZXIpO1xuXG5cdGZ1bmN0aW9uIGRpdmlkZXIoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwickJveC1kaXZpZGVyXCI+PGkgY2xhc3M9XCJmYSBmYS1jdXRsZXJ5XCI+PC9pPjwvZGl2Pidcblx0XHR9XG5cdH1cblxufSkoKTsiLCIvLyBGZXRjaCBsb2NhbCBKU09OIGRhdGFcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuc2VydmljZSgnbG9jYWxEYXRhJywgbG9jYWxEYXRhKTtcblxuXHQvKipcblx0ICogR0VUIHByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0ICpcblx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRSZXMocmVzcG9uc2UpIHtcblx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHR9XG5cdH1cblxuXHRsb2NhbERhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiBsb2NhbERhdGEoJGh0dHApIHtcblx0XHQvKipcblx0XHQgKiBHZXQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEpTT04gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvbmctYXBwL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBhbmd1bGFyTWVkaWFDaGVjayA9IGFuZ3VsYXIubW9kdWxlKCdtZWRpYUNoZWNrJywgW10pO1xuXG5cdGFuZ3VsYXJNZWRpYUNoZWNrLnNlcnZpY2UoJ21lZGlhQ2hlY2snLCBbJyR3aW5kb3cnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHdpbmRvdywgJHRpbWVvdXQpIHtcblx0XHR0aGlzLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0dmFyICRzY29wZSA9IG9wdGlvbnNbJ3Njb3BlJ10sXG5cdFx0XHRcdHF1ZXJ5ID0gb3B0aW9uc1snbXEnXSxcblx0XHRcdFx0ZGVib3VuY2UgPSBvcHRpb25zWydkZWJvdW5jZSddLFxuXHRcdFx0XHQkd2luID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLFxuXHRcdFx0XHRicmVha3BvaW50cyxcblx0XHRcdFx0Y3JlYXRlTGlzdGVuZXIgPSB2b2lkIDAsXG5cdFx0XHRcdGhhc01hdGNoTWVkaWEgPSAkd2luZG93Lm1hdGNoTWVkaWEgIT09IHVuZGVmaW5lZCAmJiAhISR3aW5kb3cubWF0Y2hNZWRpYSgnIScpLmFkZExpc3RlbmVyLFxuXHRcdFx0XHRtcUxpc3RMaXN0ZW5lcixcblx0XHRcdFx0bW1MaXN0ZW5lcixcblx0XHRcdFx0ZGVib3VuY2VSZXNpemUsXG5cdFx0XHRcdG1xID0gdm9pZCAwLFxuXHRcdFx0XHRtcUNoYW5nZSA9IHZvaWQgMCxcblx0XHRcdFx0ZGVib3VuY2VTcGVlZCA9ICEhZGVib3VuY2UgPyBkZWJvdW5jZSA6IDI1MDtcblxuXHRcdFx0aWYgKGhhc01hdGNoTWVkaWEpIHtcblx0XHRcdFx0bXFDaGFuZ2UgPSBmdW5jdGlvbiAobXEpIHtcblx0XHRcdFx0XHRpZiAobXEubWF0Y2hlcyAmJiB0eXBlb2Ygb3B0aW9ucy5lbnRlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5lbnRlcihtcSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5leGl0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuZXhpdChtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuY2hhbmdlKG1xKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y3JlYXRlTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0bXEgPSAkd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpO1xuXHRcdFx0XHRcdG1xTGlzdExpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1xQ2hhbmdlKG1xKVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtcS5hZGRMaXN0ZW5lcihtcUxpc3RMaXN0ZW5lcik7XG5cblx0XHRcdFx0XHQvLyBiaW5kIHRvIHRoZSBvcmllbnRhdGlvbmNoYW5nZSBldmVudCBhbmQgZmlyZSBtcUNoYW5nZVxuXHRcdFx0XHRcdCR3aW4uYmluZCgnb3JpZW50YXRpb25jaGFuZ2UnLCBtcUxpc3RMaXN0ZW5lcik7XG5cblx0XHRcdFx0XHQvLyBjbGVhbnVwIGxpc3RlbmVycyB3aGVuICRzY29wZSBpcyAkZGVzdHJveWVkXG5cdFx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRtcS5yZW1vdmVMaXN0ZW5lcihtcUxpc3RMaXN0ZW5lcik7XG5cdFx0XHRcdFx0XHQkd2luLnVuYmluZCgnb3JpZW50YXRpb25jaGFuZ2UnLCBtcUxpc3RMaXN0ZW5lcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UobXEpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJldHVybiBjcmVhdGVMaXN0ZW5lcigpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRicmVha3BvaW50cyA9IHt9O1xuXG5cdFx0XHRcdG1xQ2hhbmdlID0gZnVuY3Rpb24gKG1xKSB7XG5cdFx0XHRcdFx0aWYgKG1xLm1hdGNoZXMpIHtcblx0XHRcdFx0XHRcdGlmICghIWJyZWFrcG9pbnRzW3F1ZXJ5XSA9PT0gZmFsc2UgJiYgKHR5cGVvZiBvcHRpb25zLmVudGVyID09PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmVudGVyKG1xKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PT0gdHJ1ZSB8fCBicmVha3BvaW50c1txdWVyeV0gPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhpdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnMuZXhpdChtcSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoKG1xLm1hdGNoZXMgJiYgKCFicmVha3BvaW50c1txdWVyeV0pIHx8ICghbXEubWF0Y2hlcyAmJiAoYnJlYWtwb2ludHNbcXVlcnldID09PSB0cnVlIHx8IGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PSBudWxsKSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuY2hhbmdlKG1xKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYnJlYWtwb2ludHNbcXVlcnldID0gbXEubWF0Y2hlcztcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgY29udmVydEVtVG9QeCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdHZhciBlbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuXHRcdFx0XHRcdGVtRWxlbWVudC5zdHlsZS53aWR0aCA9ICcxZW0nO1xuXHRcdFx0XHRcdGVtRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbUVsZW1lbnQpO1xuXHRcdFx0XHRcdHB4ID0gdmFsdWUgKiBlbUVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbUVsZW1lbnQpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHB4O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBnZXRQWFZhbHVlID0gZnVuY3Rpb24gKHdpZHRoLCB1bml0KSB7XG5cdFx0XHRcdFx0dmFyIHZhbHVlO1xuXHRcdFx0XHRcdHZhbHVlID0gdm9pZCAwO1xuXHRcdFx0XHRcdHN3aXRjaCAodW5pdCkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnZW0nOlxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRFbVRvUHgod2lkdGgpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gd2lkdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRicmVha3BvaW50c1txdWVyeV0gPSBudWxsO1xuXG5cdFx0XHRcdG1tTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dmFyIHBhcnRzID0gcXVlcnkubWF0Y2goL1xcKCguKiktLio6XFxzKihbXFxkXFwuXSopKC4qKVxcKS8pLFxuXHRcdFx0XHRcdFx0Y29uc3RyYWludCA9IHBhcnRzWzFdLFxuXHRcdFx0XHRcdFx0dmFsdWUgPSBnZXRQWFZhbHVlKHBhcnNlSW50KHBhcnRzWzJdLCAxMCksIHBhcnRzWzNdKSxcblx0XHRcdFx0XHRcdGZha2VNYXRjaE1lZGlhID0ge30sXG5cdFx0XHRcdFx0XHR3aW5kb3dXaWR0aCA9ICR3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cblx0XHRcdFx0XHRmYWtlTWF0Y2hNZWRpYS5tYXRjaGVzID0gY29uc3RyYWludCA9PT0gJ21heCcgJiYgdmFsdWUgPiB3aW5kb3dXaWR0aCB8fCBjb25zdHJhaW50ID09PSAnbWluJyAmJiB2YWx1ZSA8IHdpbmRvd1dpZHRoO1xuXG5cdFx0XHRcdFx0cmV0dXJuIG1xQ2hhbmdlKGZha2VNYXRjaE1lZGlhKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZmFrZU1hdGNoTWVkaWFSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KGRlYm91bmNlUmVzaXplKTtcblx0XHRcdFx0XHRkZWJvdW5jZVJlc2l6ZSA9ICR0aW1lb3V0KG1tTGlzdGVuZXIsIGRlYm91bmNlU3BlZWQpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCR3aW4uYmluZCgncmVzaXplJywgZmFrZU1hdGNoTWVkaWFSZXNpemUpO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCR3aW4udW5iaW5kKCdyZXNpemUnLCBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBtbUxpc3RlbmVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fV0pO1xufSkoKTsiLCIvLyBSZWNpcGUgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LnNlcnZpY2UoJ3JlY2lwZURhdGEnLCByZWNpcGVEYXRhKTtcblxuXHQvKipcblx0ICogR0VUIHByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0ICpcblx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRSZXMocmVzcG9uc2UpIHtcblx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cblx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHR9XG5cdH1cblxuXHRyZWNpcGVEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gcmVjaXBlRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBzbHVnIHtzdHJpbmd9IHJlY2lwZSBzbHVnXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRSZWNpcGUgPSBmdW5jdGlvbihzbHVnKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGUvJyArIHNsdWcpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYSByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5jcmVhdGVSZWNpcGUgPSBmdW5jdGlvbihyZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL25ldycsIHJlY2lwZURhdGEpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYSByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSUQgKGluIGNhc2Ugc2x1ZyBoYXMgY2hhbmdlZClcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMudXBkYXRlUmVjaXBlID0gZnVuY3Rpb24oaWQsIHJlY2lwZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL3JlY2lwZS8nICsgaWQsIHJlY2lwZURhdGEpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZWxldGUgYSByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmRlbGV0ZVJlY2lwZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmRlbGV0ZSgnL2FwaS9yZWNpcGUvJyArIGlkKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGFsbCBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRQdWJsaWNSZWNpcGVzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldE15UmVjaXBlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9tZScpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYSBzcGVjaWZpYyB1c2VyJ3MgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VySWQge3N0cmluZ30gdXNlciBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0QXV0aG9yUmVjaXBlcyA9IGZ1bmN0aW9uKHVzZXJJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9hdXRob3IvJyArIHVzZXJJZClcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEZpbGUvdW5maWxlIHRoaXMgcmVjaXBlIGluIHVzZXIgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZUlkIHtzdHJpbmd9IElEIG9mIHJlY2lwZSB0byBzYXZlXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5maWxlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlSWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL3JlY2lwZS8nICsgcmVjaXBlSWQgKyAnL2ZpbGUnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IGZpbGVkIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZHMge0FycmF5fSBhcnJheSBvZiB1c2VyJ3MgZmlsZWQgcmVjaXBlIElEc1xuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0RmlsZWRSZWNpcGVzID0gZnVuY3Rpb24ocmVjaXBlSWRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlcy9tZS9maWxlZCcsIHJlY2lwZUlkcylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdHRoaXMuY2xlYW5VcGxvYWRzID0gZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvY2xlYW4tdXBsb2FkcycsIGZpbGVzKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVGb3JtJywgcmVjaXBlRm9ybSk7XG5cblx0cmVjaXBlRm9ybS4kaW5qZWN0ID0gWydyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdTbHVnJywgJyRsb2NhdGlvbicsICckdGltZW91dCcsICdVcGxvYWQnLCAnbWVkaWFDaGVjaycsICdNUSddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm0ocmVjaXBlRGF0YSwgUmVjaXBlLCBTbHVnLCAkbG9jYXRpb24sICR0aW1lb3V0LCBVcGxvYWQsIG1lZGlhQ2hlY2ssIE1RKSB7XG5cblx0XHRyZWNpcGVGb3JtQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblxuXHRcdGZ1bmN0aW9uIHJlY2lwZUZvcm1DdHJsKCRzY29wZSkge1xuXHRcdFx0dmFyIHJmID0gdGhpcztcblx0XHRcdHZhciBfaXNFZGl0ID0gISFyZi5yZWNpcGU7XG5cdFx0XHR2YXIgX29yaWdpbmFsU2x1ZyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuc2x1ZyA6IG51bGw7XG5cblx0XHRcdHJmLnJlY2lwZURhdGEgPSBfaXNFZGl0ID8gcmYucmVjaXBlIDoge307XG5cdFx0XHRyZi5yZWNpcGVEYXRhLnVzZXJJZCA9IF9pc0VkaXQgPyByZi5yZWNpcGUudXNlcklkIDogcmYudXNlcklkO1xuXHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IF9pc0VkaXQgPyByZi5yZWNpcGUucGhvdG8gOiBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdlbmVyYXRlcyBhIHVuaXF1ZSA1LWNoYXJhY3RlciBJRDtcblx0XHRcdCAqIE9uICRzY29wZSB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXIgYW5kIGxpbmtcblx0XHRcdCAqXG5cdFx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUuZ2VuZXJhdGVJZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgX2lkID0gJyc7XG5cdFx0XHRcdHZhciBfY2hhcnNldCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcblx0XHRcdFx0XHRfaWQgKz0gX2NoYXJzZXQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIF9jaGFyc2V0Lmxlbmd0aCkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIF9pZDtcblx0XHRcdH07XG5cblx0XHRcdC8vIGlzIHRoaXMgYSB0b3VjaCBkZXZpY2U/XG5cdFx0XHRyZi5pc1RvdWNoRGV2aWNlID0gISFNb2Rlcm5penIudG91Y2hldmVudHM7XG5cblx0XHRcdC8vIGJ1aWxkIGxpc3RzXG5cdFx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5pbmdyZWRpZW50cyA6IFt7aWQ6ICRzY29wZS5nZW5lcmF0ZUlkKCksIHR5cGU6ICdpbmcnfV07XG5cdFx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiBbe2lkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLCB0eXBlOiAnc3RlcCd9XTtcblxuXHRcdFx0cmYucmVjaXBlRGF0YS50YWdzID0gX2lzRWRpdCA/IHJmLnJlY2lwZURhdGEudGFncyA6IFtdO1xuXG5cdFx0XHQvLyBtYW5hZ2UgdGltZSBmaWVsZHNcblx0XHRcdHJmLnRpbWVSZWdleCA9IC9eWytdPyhbMC05XSsoPzpbXFwuXVswLTldKik/fFxcLlswLTldKykkLztcblx0XHRcdHJmLnRpbWVFcnJvciA9ICdQbGVhc2UgZW50ZXIgYSBudW1iZXIgaW4gbWludXRlcy4gTXVsdGlwbHkgaG91cnMgYnkgNjAuJztcblxuXHRcdFx0Ly8gZmV0Y2ggY2F0ZWdvcmllcyBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblxuXHRcdFx0Ly8gZmV0Y2ggdGFncyBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLnRhZ3MgPSBSZWNpcGUudGFncztcblxuXHRcdFx0Ly8gZmV0Y2ggZGlldGFyeSBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLmRpZXRhcnkgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdFx0Ly8gZmV0Y2ggc3BlY2lhbCBjaGFyYWN0ZXJzXG5cdFx0XHRyZi5jaGFycyA9IFJlY2lwZS5pbnNlcnRDaGFyO1xuXG5cdFx0XHQvLyBzZXR1cCBzcGVjaWFsIGNoYXJhY3RlcnMgcHJpdmF0ZSB2YXJzXG5cdFx0XHR2YXIgX2xhc3RJbnB1dDtcblx0XHRcdHZhciBfaW5nSW5kZXg7XG5cdFx0XHR2YXIgX2NhcmV0UG9zO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gaW5wdXRcblx0XHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdFx0ICogQHBhcmFtIHNlbGVjdGlvbkVuZCB7bnVtYmVyfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKSB7XG5cdFx0XHRcdGlmIChpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSkge1xuXHRcdFx0XHRcdGlucHV0LmNsaWNrKCk7XG5cdFx0XHRcdFx0aW5wdXQuZm9jdXMoKTtcblx0XHRcdFx0XHRpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChpbnB1dC5jcmVhdGVUZXh0UmFuZ2UpIHtcblx0XHRcdFx0XHR2YXIgcmFuZ2UgPSBpbnB1dC5jcmVhdGVUZXh0UmFuZ2UoKTtcblx0XHRcdFx0XHRyYW5nZS5jb2xsYXBzZSh0cnVlKTtcblx0XHRcdFx0XHRyYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0XHRcdHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uU3RhcnQpO1xuXHRcdFx0XHRcdHJhbmdlLnNlbGVjdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IGNhcmV0IHBvc2l0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0XHQgKiBAcGFyYW0gcG9zIHtudW1iZXJ9IGludGVuZGVkIGNhcmV0IHBvc2l0aW9uXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfc2V0Q2FyZXRUb1BvcyhpbnB1dCwgcG9zKSB7XG5cdFx0XHRcdF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgcG9zLCBwb3MpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEtlZXAgdHJhY2sgb2YgY2FyZXQgcG9zaXRpb24gaW4gaW5ncmVkaWVudCBhbW91bnQgdGV4dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHRcdCAqIEBwYXJhbSBpbmRleCB7bnVtYmVyfVxuXHRcdFx0ICovXG5cdFx0XHRyZi5pbnNlcnRDaGFySW5wdXQgPSBmdW5jdGlvbigkZXZlbnQsIGluZGV4KSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9pbmdJbmRleCA9IGluZGV4O1xuXHRcdFx0XHRcdF9sYXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJyMnICsgJGV2ZW50LnRhcmdldC5pZCk7XG5cdFx0XHRcdFx0X2NhcmV0UG9zID0gX2xhc3RJbnB1dFswXS5zZWxlY3Rpb25TdGFydDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEluc2VydCBjaGFyYWN0ZXIgYXQgbGFzdCBjYXJldCBwb3NpdGlvblxuXHRcdFx0ICogSW4gc3VwcG9ydGVkIGZpZWxkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGNoYXIge3N0cmluZ30gc3BlY2lhbCBjaGFyYWN0ZXJcblx0XHRcdCAqL1xuXHRcdFx0cmYuaW5zZXJ0Q2hhciA9IGZ1bmN0aW9uKGNoYXIpIHtcblx0XHRcdFx0aWYgKF9sYXN0SW5wdXQpIHtcblx0XHRcdFx0XHR2YXIgX3RleHRWYWwgPSByZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10ID09PSB1bmRlZmluZWQgPyAnJyA6IHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQ7XG5cblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10ID0gX3RleHRWYWwuc3Vic3RyaW5nKDAsIF9jYXJldFBvcykgKyBjaGFyICsgX3RleHRWYWwuc3Vic3RyaW5nKF9jYXJldFBvcyk7XG5cblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdF9jYXJldFBvcyA9IF9jYXJldFBvcyArIDE7XG5cdFx0XHRcdFx0XHRfc2V0Q2FyZXRUb1BvcyhfbGFzdElucHV0WzBdLCBfY2FyZXRQb3MpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsZWFyIGNhcmV0IHBvc2l0aW9uIGFuZCBsYXN0IGlucHV0XG5cdFx0XHQgKiBTbyB0aGF0IHNwZWNpYWwgY2hhcmFjdGVycyBkb24ndCBlbmQgdXAgaW4gdW5kZXNpcmVkIGZpZWxkc1xuXHRcdFx0ICovXG5cdFx0XHRyZi5jbGVhckNoYXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0X2luZ0luZGV4ID0gbnVsbDtcblx0XHRcdFx0X2xhc3RJbnB1dCA9IG51bGw7XG5cdFx0XHRcdF9jYXJldFBvcyA9IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZi51cGxvYWRlZEZpbGUgPSBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFVwbG9hZCBpbWFnZSBmaWxlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGZpbGVzIHtBcnJheX0gYXJyYXkgb2YgZmlsZXMgdG8gdXBsb2FkXG5cdFx0XHQgKi9cblx0XHRcdHJmLnVwZGF0ZUZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0XHRpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0aWYgKGZpbGVzWzBdLnNpemUgPiAzMDAwMDApIHtcblx0XHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gJ0ZpbGVzaXplIG92ZXIgNTAwa2IgLSBwaG90byB3YXMgbm90IHVwbG9hZGVkLic7XG5cdFx0XHRcdFx0XHRyZi5yZW1vdmVQaG90bygpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0cmYudXBsb2FkZWRGaWxlID0gZmlsZXNbMF07ICAgIC8vIG9ubHkgc2luZ2xlIHVwbG9hZCBhbGxvd2VkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlbW92ZSB1cGxvYWRlZCBwaG90byBmcm9tIGZyb250LWVuZFxuXHRcdFx0ICovXG5cdFx0XHRyZi5yZW1vdmVQaG90byA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnBob3RvID0gbnVsbDtcblx0XHRcdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblx0XHRcdFx0YW5ndWxhci5lbGVtZW50KCcjcmVjaXBlUGhvdG8nKS52YWwoJycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gY3JlYXRlIG1hcCBvZiB0b3VjaGVkIHRhZ3Ncblx0XHRcdHJmLnRhZ01hcCA9IHt9O1xuXHRcdFx0aWYgKF9pc0VkaXQgJiYgcmYucmVjaXBlRGF0YS50YWdzLmxlbmd0aCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmYucmVjaXBlRGF0YS50YWdzLCBmdW5jdGlvbih0YWcsIGkpIHtcblx0XHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IHRydWU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZCAvIHJlbW92ZSB0YWdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gdGFnIHtzdHJpbmd9IHRhZyBuYW1lXG5cdFx0XHQgKi9cblx0XHRcdHJmLmFkZFJlbW92ZVRhZyA9IGZ1bmN0aW9uKHRhZykge1xuXHRcdFx0XHR2YXIgX2FjdGl2ZVRhZ0luZGV4ID0gcmYucmVjaXBlRGF0YS50YWdzLmluZGV4T2YodGFnKTtcblxuXHRcdFx0XHRpZiAoX2FjdGl2ZVRhZ0luZGV4ID4gLTEpIHtcblx0XHRcdFx0XHQvLyB0YWcgZXhpc3RzIGluIG1vZGVsLCB0dXJuIGl0IG9mZlxuXHRcdFx0XHRcdHJmLnJlY2lwZURhdGEudGFncy5zcGxpY2UoX2FjdGl2ZVRhZ0luZGV4LCAxKTtcblx0XHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHRhZyBkb2VzIG5vdCBleGlzdCBpbiBtb2RlbCwgdHVybiBpdCBvblxuXHRcdFx0XHRcdHJmLnJlY2lwZURhdGEudGFncy5wdXNoKHRhZyk7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsZWFuIGVtcHR5IGl0ZW1zIG91dCBvZiBhcnJheSBiZWZvcmUgc2F2aW5nXG5cdFx0XHQgKiBJbmdyZWRpZW50cyBvciBEaXJlY3Rpb25zXG5cdFx0XHQgKiBBbHNvIGNsZWFycyBvdXQgZW1wdHkgaGVhZGluZ3Ncblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWxOYW1lIHtzdHJpbmd9IGluZ3JlZGllbnRzIC8gZGlyZWN0aW9uc1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NsZWFuRW1wdGllcyhtb2RlbE5hbWUpIHtcblx0XHRcdFx0dmFyIF9hcnJheSA9IHJmLnJlY2lwZURhdGFbbW9kZWxOYW1lXTtcblx0XHRcdFx0dmFyIF9jaGVjayA9IG1vZGVsTmFtZSA9PT0gJ2luZ3JlZGllbnRzJyA/ICdpbmdyZWRpZW50JyA6ICdzdGVwJztcblxuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goX2FycmF5LCBmdW5jdGlvbihvYmosIGkpIHtcblx0XHRcdFx0XHRpZiAoISFvYmpbX2NoZWNrXSA9PT0gZmFsc2UgJiYgIW9iai5pc0hlYWRpbmcgfHwgb2JqLmlzSGVhZGluZyAmJiAhIW9iai5oZWFkaW5nVGV4dCA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdF9hcnJheS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNldCBzYXZlIGJ1dHRvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNldFNhdmVCdG4oKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gZmFsc2U7XG5cdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGUgUmVjaXBlJyA6ICdTYXZlIFJlY2lwZSc7XG5cdFx0XHR9XG5cblx0XHRcdF9yZXNldFNhdmVCdG4oKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZWNpcGUgY3JlYXRlZCBvciBzYXZlZCBzdWNjZXNzZnVsbHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlIHtwcm9taXNlfSBpZiBlZGl0aW5nIGV2ZW50XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZWQocmVjaXBlKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZWQhJyA6ICdTYXZlZCEnO1xuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBHbyB0byBuZXcgc2x1ZyAoaWYgbmV3KSBvciB1cGRhdGVkIHNsdWcgKGlmIHNsdWcgY2hhbmdlZClcblx0XHRcdFx0ICpcblx0XHRcdFx0ICogQHByaXZhdGVcblx0XHRcdFx0ICovXG5cdFx0XHRcdGZ1bmN0aW9uIF9nb1RvTmV3U2x1ZygpIHtcblx0XHRcdFx0XHR2YXIgX3BhdGggPSAhX2lzRWRpdCA/IHJlY2lwZS5zbHVnIDogcmYucmVjaXBlRGF0YS5zbHVnICsgJy9lZGl0JztcblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvcmVjaXBlLycgKyBfcGF0aCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIV9pc0VkaXQgfHwgX2lzRWRpdCAmJiBfb3JpZ2luYWxTbHVnICE9PSByZi5yZWNpcGVEYXRhLnNsdWcpIHtcblx0XHRcdFx0XHQkdGltZW91dChfZ29Ub05ld1NsdWcsIDEwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDIwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVjaXBlIG5vdCBzYXZlZCAvIGNyZWF0ZWQgZHVlIHRvIGVycm9yXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVyciB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlRXJyb3IoZXJyKSB7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0XHRyZi5zYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDQwMDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNhdmUgcmVjaXBlIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfc2F2ZVJlY2lwZSgpIHtcblx0XHRcdFx0aWYgKCFfaXNFZGl0KSB7XG5cdFx0XHRcdFx0cmVjaXBlRGF0YS5jcmVhdGVSZWNpcGUocmYucmVjaXBlRGF0YSlcblx0XHRcdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVjaXBlRGF0YS51cGRhdGVSZWNpcGUocmYucmVjaXBlLl9pZCwgcmYucmVjaXBlRGF0YSlcblx0XHRcdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTYXZlIHJlY2lwZVxuXHRcdFx0ICogQ2xpY2sgb24gc3VibWl0XG5cdFx0XHQgKi9cblx0XHRcdHJmLnNhdmVSZWNpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0aW5nLi4uJyA6ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIHByZXAgZGF0YSBmb3Igc2F2aW5nXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEuc2x1ZyA9IFNsdWcuc2x1Z2lmeShyZi5yZWNpcGVEYXRhLm5hbWUpO1xuXHRcdFx0XHRfY2xlYW5FbXB0aWVzKCdpbmdyZWRpZW50cycpO1xuXHRcdFx0XHRfY2xlYW5FbXB0aWVzKCdkaXJlY3Rpb25zJyk7XG5cblx0XHRcdFx0Ly8gc2F2ZSB1cGxvYWRlZCBmaWxlLCBpZiB0aGVyZSBpcyBvbmVcblx0XHRcdFx0Ly8gb25jZSBzdWNjZXNzZnVsbHkgdXBsb2FkZWQgaW1hZ2UsIHNhdmUgcmVjaXBlIHdpdGggcmVmZXJlbmNlIHRvIHNhdmVkIGltYWdlXG5cdFx0XHRcdGlmIChyZi51cGxvYWRlZEZpbGUpIHtcblx0XHRcdFx0XHRVcGxvYWRcblx0XHRcdFx0XHRcdC51cGxvYWQoe1xuXHRcdFx0XHRcdFx0XHR1cmw6ICcvYXBpL3JlY2lwZS91cGxvYWQnLFxuXHRcdFx0XHRcdFx0XHRmaWxlOiByZi51cGxvYWRlZEZpbGVcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQucHJvZ3Jlc3MoZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwcm9ncmVzc1BlcmNlbnRhZ2UgPSBwYXJzZUludCgxMDAuMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWwpO1xuXHRcdFx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0cmYudXBsb2FkUHJvZ3Jlc3MgPSBwcm9ncmVzc1BlcmNlbnRhZ2UgKyAnJSAnICsgZXZ0LmNvbmZpZy5maWxlLm5hbWU7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmYudXBsb2FkUHJvZ3Jlc3MpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IGRhdGEuZmlsZW5hbWU7XG5cblx0XHRcdFx0XHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuZXJyb3IoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBlcnIubWVzc2FnZSB8fCBlcnI7XG5cblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yIHVwbG9hZGluZyBmaWxlOicsIGVyci5tZXNzYWdlIHx8IGVycik7XG5cblx0XHRcdFx0XHRcdFx0X3JlY2lwZVNhdmVFcnJvcigpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBubyB1cGxvYWRlZCBmaWxlLCBzYXZlIHJlY2lwZVxuXHRcdFx0XHRcdF9zYXZlUmVjaXBlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRyZWNpcGVGb3JtTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW0nLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVGb3JtTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdC8vIHNldCB1cCAkc2NvcGUgb2JqZWN0IGZvciBuYW1lc3BhY2luZ1xuXHRcdFx0JHNjb3BlLnJmbCA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZCBuZXcgaXRlbVxuXHRcdFx0ICogSW5ncmVkaWVudCBvciBEaXJlY3Rpb24gc3RlcFxuXHRcdFx0ICogRm9jdXMgdGhlIG5ld2VzdCBpbnB1dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH0gY2xpY2sgZXZlbnRcblx0XHRcdCAqIEBwYXJhbSBtb2RlbCB7b2JqZWN0fSByZi5yZWNpcGVEYXRhIG1vZGVsXG5cdFx0XHQgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSBpbmcgLW9yLSBzdGVwXG5cdFx0XHQgKiBAcGFyYW0gaXNIZWFkaW5nIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBmdW5jdGlvbigkZXZlbnQsIG1vZGVsLCB0eXBlLCBpc0hlYWRpbmcpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLFxuXHRcdFx0XHRcdHR5cGU6IHR5cGVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoaXNIZWFkaW5nKSB7XG5cdFx0XHRcdFx0X25ld0l0ZW0uaXNIZWFkaW5nID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1vZGVsLnB1c2goX25ld0l0ZW0pO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBfbmV3ZXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkucGFyZW50KCdwJykucHJldignLmxhc3QnKS5maW5kKCdpbnB1dCcpLmVxKDApO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5mb2N1cygpOyAgIC8vIFRPRE86IGZvY3VzIGlzbid0IGhpZ2hsaWdodGluZyBwcm9wZXJseVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVtb3ZlIGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIGkge2luZGV4fVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihtb2RlbCwgaSkge1xuXHRcdFx0XHRtb2RlbC5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRtcTogTVEuTEFSR0UsXG5cdFx0XHRcdGVudGVyOiBmdW5jdGlvbihtcSkge1xuXHRcdFx0XHRcdCRzY29wZS5yZmwuaXNMYXJnZVZpZXcgPSB0cnVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRleGl0OiBmdW5jdGlvbihtcSkge1xuXHRcdFx0XHRcdCRzY29wZS5yZmwuaXNMYXJnZVZpZXcgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogTW92ZSBpdGVtIHVwIG9yIGRvd25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIG9sZEluZGV4IHtpbmRleH0gY3VycmVudCBpbmRleFxuXHRcdFx0ICogQHBhcmFtIG5ld0luZGV4IHtudW1iZXJ9IG5ldyBpbmRleFxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLm1vdmVJdGVtID0gZnVuY3Rpb24oJGV2ZW50LCBtb2RlbCwgb2xkSW5kZXgsIG5ld0luZGV4KSB7XG5cdFx0XHRcdHZhciBfaXRlbSA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdsaScpO1xuXG5cdFx0XHRcdG1vZGVsLm1vdmUob2xkSW5kZXgsIG5ld0luZGV4KTtcblxuXHRcdFx0XHRfaXRlbS5hZGRDbGFzcygnbW92ZWQnKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfaXRlbS5yZW1vdmVDbGFzcygnbW92ZWQnKTtcblx0XHRcdFx0fSwgNzAwKTtcblx0XHRcdH07XG5cblx0XHRcdCRzY29wZS5yZmwubW92ZUluZ3JlZGllbnRzID0gZmFsc2U7XG5cdFx0XHQkc2NvcGUucmZsLm1vdmVEaXJlY3Rpb25zID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0cmVjaXBlOiAnPScsXG5cdFx0XHRcdHVzZXJJZDogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVGb3JtLnRwbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6IHJlY2lwZUZvcm1DdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAncmYnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IHJlY2lwZUZvcm1MaW5rXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVzTGlzdCcsIHJlY2lwZXNMaXN0KTtcblxuXHRyZWNpcGVzTGlzdC4kaW5qZWN0ID0gWydSZWNpcGUnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVzTGlzdChSZWNpcGUpIHtcblxuXHRcdHJlY2lwZXNMaXN0Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblxuXHRcdGZ1bmN0aW9uIHJlY2lwZXNMaXN0Q3RybCgkc2NvcGUpIHtcblx0XHRcdC8vIGNvbnRyb2xsZXJBcyB2aWV3IG1vZGVsXG5cdFx0XHR2YXIgcmwgPSB0aGlzO1xuXG5cdFx0XHQvLyBidWlsZCBvdXQgdGhlIHRvdGFsIHRpbWUgYW5kIG51bWJlciBvZiBpbmdyZWRpZW50cyBmb3Igc29ydGluZ1xuXHRcdFx0dmFyIF93YXRjaFJlY2lwZXMgPSAkc2NvcGUuJHdhdGNoKCdybC5yZWNpcGVzJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChybC5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcblx0XHRcdFx0XHRcdHJlY2lwZS50b3RhbFRpbWUgPSAocmVjaXBlLmNvb2tUaW1lID8gcmVjaXBlLmNvb2tUaW1lIDogMCkgKyAocmVjaXBlLnByZXBUaW1lID8gcmVjaXBlLnByZXBUaW1lIDogMCk7XG5cdFx0XHRcdFx0XHRyZWNpcGUubkluZyA9IHJlY2lwZS5pbmdyZWRpZW50cy5sZW5ndGg7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gZGVyZWdpc3RlciB0aGUgd2F0Y2hcblx0XHRcdFx0XHRfd2F0Y2hSZWNpcGVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBjb25kaXRpb25hbGx5IHNob3cgY2F0ZWdvcnkgLyB0YWcgZmlsdGVyc1xuXHRcdFx0Ly8gYWx3YXlzIHNob3cgc3BlY2lhbCBkaWV0IGZpbHRlclxuXHRcdFx0aWYgKHJsLmNhdGVnb3J5RmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdFx0cmwuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xuXHRcdFx0XHRybC5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJsLnRhZ0ZpbHRlciA9PT0gJ3RydWUnKSB7XG5cdFx0XHRcdHJsLnRhZ3MgPSBSZWNpcGUudGFncztcblx0XHRcdFx0cmwuc2hvd1RhZ0ZpbHRlciA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRybC5zcGVjaWFsRGlldCA9IFJlY2lwZS5kaWV0YXJ5O1xuXG5cdFx0XHQvLyBzZXQgYWxsIGZpbHRlcnMgdG8gZW1wdHlcblx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMgPSB7fTtcblxuXHRcdFx0ZnVuY3Rpb24gX3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpIHtcblx0XHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5jYXQgPSAnJztcblx0XHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy50YWcgPSAnJztcblx0XHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcy5kaWV0ID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNldCB1cCBzb3J0IHByZWRpY2F0ZSBhbmQgcmV2ZXJzYWxzXG5cdFx0XHRybC5zb3J0UHJlZGljYXRlID0gJ25hbWUnO1xuXG5cdFx0XHRybC5yZXZlcnNlT2JqID0ge1xuXHRcdFx0XHRuYW1lOiBmYWxzZSxcblx0XHRcdFx0dG90YWxUaW1lOiBmYWxzZSxcblx0XHRcdFx0bkluZzogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHR2YXIgX2xhc3RTb3J0ZWRCeSA9ICduYW1lJztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgc29ydCBhc2MvZGVzY1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBwcmVkaWNhdGUge3N0cmluZ31cblx0XHRcdCAqL1xuXHRcdFx0cmwudG9nZ2xlU29ydCA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuXHRcdFx0XHRpZiAoX2xhc3RTb3J0ZWRCeSA9PT0gcHJlZGljYXRlKSB7XG5cdFx0XHRcdFx0cmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdID0gIXJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRybC5yZXZlcnNlID0gcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0XHRfbGFzdFNvcnRlZEJ5ID0gcHJlZGljYXRlO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gbnVtYmVyIG9mIHJlY2lwZXMgdG8gc2hvdy9hZGQgaW4gYSBzZXRcblx0XHRcdHZhciBfcmVzdWx0c1NldCA9IDE1O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2V0IHJlc3VsdHMgc2hvd2luZyB0byBpbml0aWFsIGRlZmF1bHQgb24gc2VhcmNoL2ZpbHRlclxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNldFJlc3VsdHNTaG93aW5nKCkge1xuXHRcdFx0XHRybC5uUmVzdWx0c1Nob3dpbmcgPSBfcmVzdWx0c1NldDtcblx0XHRcdH1cblx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogTG9hZCBNb3JlIHJlc3VsdHNcblx0XHRcdCAqL1xuXHRcdFx0cmwubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gcmwublJlc3VsdHNTaG93aW5nICs9IF9yZXN1bHRzU2V0O1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gd2F0Y2ggc2VhcmNoIHF1ZXJ5IGFuZCBpZiBpdCBleGlzdHMsIGNsZWFyIGZpbHRlcnMgYW5kIHJlc2V0IHJlc3VsdHMgc2hvd2luZ1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgncmwucXVlcnknLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAoISFybC5xdWVyeSkge1xuXHRcdFx0XHRcdF9yZXNldEZpbHRlclByZWRpY2F0ZXMoKTtcblx0XHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gd2F0Y2ggZmlsdGVycyBhbmQgaWYgYW55IG9mIHRoZW0gY2hhbmdlLCByZXNldCB0aGUgcmVzdWx0cyBzaG93aW5nXG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdybC5maWx0ZXJQcmVkaWNhdGVzJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKCEhbmV3VmFsICYmIG5ld1ZhbCAhPT0gb2xkVmFsKSB7XG5cdFx0XHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBfb3BlbkZpbHRlcnNPbmxvYWQgPSAkc2NvcGUuJHdhdGNoKCdybC5vcGVuRmlsdGVycycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSBuZXdWYWwgPT09ICd0cnVlJztcblx0XHRcdFx0XHRfb3BlbkZpbHRlcnNPbmxvYWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIHNlYXJjaC9maWx0ZXIgc2VjdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0ICovXG5cdFx0XHRybC50b2dnbGVTZWFyY2hGaWx0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmwuc2hvd1NlYXJjaEZpbHRlciA9ICFybC5zaG93U2VhcmNoRmlsdGVyO1xuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbGVhciBzZWFyY2ggcXVlcnkgYW5kIGFsbCBmaWx0ZXJzXG5cdFx0XHQgKi9cblx0XHRcdHJsLmNsZWFyU2VhcmNoRmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9yZXNldEZpbHRlclByZWRpY2F0ZXMoKTtcblx0XHRcdFx0cmwucXVlcnkgPSAnJztcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2hvdyBudW1iZXIgb2YgY3VycmVudGx5IGFjdGl2ZSBzZWFyY2ggKyBmaWx0ZXIgaXRlbXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ31cblx0XHRcdCAqIEBwYXJhbSBmaWx0ZXJzT2JqIHtvYmplY3R9XG5cdFx0XHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHRcdFx0ICovXG5cdFx0XHRybC5hY3RpdmVTZWFyY2hGaWx0ZXJzID0gZnVuY3Rpb24ocXVlcnksIGZpbHRlcnNPYmopIHtcblx0XHRcdFx0dmFyIHRvdGFsID0gMDtcblxuXHRcdFx0XHRpZiAocXVlcnkpIHtcblx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdH1cblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKGZpbHRlcnNPYmosIGZ1bmN0aW9uKGZpbHRlcikge1xuXHRcdFx0XHRcdGlmIChmaWx0ZXIpIHtcblx0XHRcdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiB0b3RhbDtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmVjaXBlc0xpc3RMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckYXR0cnMnLCAnJGVsZW0nXTtcblxuXHRcdGZ1bmN0aW9uIHJlY2lwZXNMaXN0TGluaygkc2NvcGUsICRhdHRycywgJGVsZW0pIHtcblx0XHRcdCRzY29wZS5ybGwgPSB7fTtcblxuXHRcdFx0Ly8gd2F0Y2ggdGhlIGN1cnJlbnRseSB2aXNpYmxlIG51bWJlciBvZiByZWNpcGVzIHRvIGRpc3BsYXkgYSBjb3VudFxuXHRcdFx0JHNjb3BlLiR3YXRjaChcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFuZ3VsYXIuZWxlbWVudCgnLnJlY2lwZXNMaXN0LWxpc3QtaXRlbScpLmxlbmd0aDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0XHQkc2NvcGUucmxsLmRpc3BsYXllZFJlc3VsdHMgPSBuZXdWYWw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZXM6ICc9Jyxcblx0XHRcdFx0b3BlbkZpbHRlcnM6ICdAJyxcblx0XHRcdFx0Y3VzdG9tTGFiZWxzOiAnQCcsXG5cdFx0XHRcdGNhdGVnb3J5RmlsdGVyOiAnQCcsXG5cdFx0XHRcdHRhZ0ZpbHRlcjogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yZWNpcGVzTGlzdC50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVzTGlzdEN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdybCcsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogcmVjaXBlc0xpc3RMaW5rXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cmltU3RyJywgdHJpbVN0cik7XG5cblx0ZnVuY3Rpb24gdHJpbVN0cigpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyLCBjaGFycykge1xuXHRcdFx0dmFyIHRyaW1tZWRTdHIgPSBzdHI7XG5cdFx0XHR2YXIgX2NoYXJzID0gY2hhcnMgPT09IHVuZGVmaW5lZCA/IDUwIDogY2hhcnM7XG5cblx0XHRcdGlmIChzdHIubGVuZ3RoID4gX2NoYXJzKSB7XG5cdFx0XHRcdHRyaW1tZWRTdHIgPSBzdHIuc3Vic3RyKDAsIF9jaGFycykgKyAnLi4uJztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRyaW1tZWRTdHI7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJ1c3RBc0hUTUwnLCB0cnVzdEFzSFRNTCk7XG5cblx0dHJ1c3RBc0hUTUwuJGluamVjdCA9IFsnJHNjZSddO1xuXG5cdGZ1bmN0aW9uIHRydXN0QXNIVE1MKCRzY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuc2VydmljZSgndXNlckRhdGEnLCB1c2VyRGF0YSk7XG5cblx0LyoqXG5cdCAqIEdFVCBwcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0UmVzKHJlc3BvbnNlKSB7XG5cdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0fVxuXHR9XG5cblx0dXNlckRhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiB1c2VyRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGUgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IE1vbmdvREIgSUQgb2YgdXNlclxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0QXV0aG9yID0gZnVuY3Rpb24oaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXIvJyArIGlkKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvbWUnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGN1cnJlbnQgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByb2ZpbGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy51cGRhdGVVc2VyID0gZnVuY3Rpb24ocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHVzZXJzIChhZG1pbiBhdXRob3JpemVkIG9ubHkpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEFsbFVzZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VycycpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gRm9yIGV2ZW50cyBiYXNlZCBvbiB2aWV3cG9ydCBzaXplIC0gdXBkYXRlcyBhcyB2aWV3cG9ydCBpcyByZXNpemVkXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgndmlld1N3aXRjaCcsIHZpZXdTd2l0Y2gpO1xuXG5cdHZpZXdTd2l0Y2guJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHZpZXdTd2l0Y2gobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHR2aWV3U3dpdGNoTGluay4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblxuXHRcdC8qKlxuXHRcdCAqIHZpZXdTd2l0Y2ggZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB2aWV3U3dpdGNoTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUudnMgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGVudGVyIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyRm4oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdzbWFsbCc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZXhpdCBtZWRpYSBxdWVyeVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0Rm4oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdsYXJnZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbml0aWFsaXplIG1lZGlhQ2hlY2tcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlckZuLFxuXHRcdFx0XHRleGl0OiBfZXhpdEZuXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiB2aWV3U3dpdGNoTGlua1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJywgJyRhdXRoJywgJ3VzZXJEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIGhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sIGxvY2FsRGF0YSwgJGF1dGgsIHVzZXJEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaGVhZGVyID0gdGhpcztcclxuXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5sb2NhbERhdGEgPSBkYXRhO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSB1bmRlZmluZWQ7XHJcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIGFuZCBhZG1pblVzZXIgaXMgdW5kZWZpbmVkLFxyXG5cdFx0ICogZ2V0IHRoZSB1c2VyIGFuZCBzZXQgYWRtaW5Vc2VyIGJvb2xlYW4uXHJcblx0XHQgKlxyXG5cdFx0ICogRG8gdGhpcyBvbiBmaXJzdCBjb250cm9sbGVyIGxvYWQgKGluaXQsIHJlZnJlc2gpXHJcblx0XHQgKiBhbmQgc3Vic2VxdWVudCBsb2NhdGlvbiBjaGFuZ2VzIChpZSwgY2F0Y2hpbmcgbG9nb3V0LCBsb2dpbiwgZXRjKS5cclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfY2hlY2tVc2VyQWRtaW4oKSB7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRcdGhlYWRlci51c2VyID0gZGF0YTtcclxuXHRcdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gZGF0YS5pc0FkbWluO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpICYmIGhlYWRlci51c2VyID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcclxuXHRcdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdF9jaGVja1VzZXJBZG1pbigpO1xyXG5cdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xyXG5cdFx0ICogTmVlZHMgdG8gYmUgYSBmdW5jdGlvbiBzbyBpdCBpcyByZS1leGVjdXRlZFxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH07XHJcblx0fVxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2wobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdHZhciBfYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpLFxuXHRcdFx0XHRfbmF2T3BlbjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LWNsb3NlZCcpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0XHRfY2xvc2VOYXYoKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogVG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2Nsb3NlTmF2KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZXhpdGluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfYm9keS5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCBuYXYtb3BlbicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXHR9XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdsb2NhbERhdGEnLCAncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKFBhZ2UsIGxvY2FsRGF0YSwgcmVjaXBlRGF0YSwgUmVjaXBlLCAkYXV0aCwgdXNlckRhdGEsICRsb2NhdGlvbikge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FsbCBSZWNpcGVzJyk7XHJcblxyXG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcclxuXHJcblx0XHRob21lLnRhYnMgPSBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUmVjaXBlIEJveGVzJyxcclxuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3hlcydcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdTZWFyY2ggLyBCcm93c2UgQWxsJyxcclxuXHRcdFx0XHRxdWVyeTogJ3NlYXJjaC1icm93c2UtYWxsJ1xyXG5cdFx0XHR9XHJcblx0XHRdO1xyXG5cdFx0aG9tZS5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveGVzJztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoYW5nZSB0YWJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xyXG5cdFx0ICovXHJcblx0XHRob21lLmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XHJcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XHJcblx0XHRcdGhvbWUuY3VycmVudFRhYiA9IHF1ZXJ5O1xyXG5cdFx0fTtcclxuXHJcblx0XHRob21lLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcclxuXHRcdGhvbWUudGFncyA9IFJlY2lwZS50YWdzO1xyXG5cclxuXHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgY2F0ZWdvcmllc1xyXG5cdFx0aG9tZS5tYXBDYXRlZ29yaWVzID0ge307XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGhvbWUuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRob21lLm1hcENhdGVnb3JpZXNbaG9tZS5jYXRlZ29yaWVzW2ldXSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gYnVpbGQgaGFzaG1hcCBvZiB0YWdzXHJcblx0XHRob21lLm1hcFRhZ3MgPSB7fTtcclxuXHRcdGZvciAodmFyIG4gPSAwOyBuIDwgaG9tZS50YWdzLmxlbmd0aDsgbisrKSB7XHJcblx0XHRcdGhvbWUubWFwVGFnc1tob21lLnRhZ3Nbbl1dID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBsb2NhbCBkYXRhIGZyb20gc3RhdGljIEpTT05cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSAoc3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybnMpXHJcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBkYXRhXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5sb2NhbERhdGEgPSBkYXRhO1xyXG5cclxuXHRcdFx0Y29uc29sZS5sb2coJ2ZldGNoZWQgbG9jYWwgZGF0YScpO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHJlY2lwZXMgYXJyYXlcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9wdWJsaWNSZWNpcGVzU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUucmVjaXBlcyA9IGRhdGE7XHJcblxyXG5cdFx0XHQvLyBjb3VudCBudW1iZXIgb2YgcmVjaXBlcyBwZXIgY2F0ZWdvcnkgYW5kIHRhZ1xyXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goaG9tZS5yZWNpcGVzLCBmdW5jdGlvbihyZWNpcGUpIHtcclxuXHRcdFx0XHRob21lLm1hcENhdGVnb3JpZXNbcmVjaXBlLmNhdGVnb3J5XSArPSAxO1xyXG5cclxuXHRcdFx0XHRmb3IgKHZhciB0ID0gMDsgdCA8IHJlY2lwZS50YWdzLmxlbmd0aDsgdCsrKSB7XHJcblx0XHRcdFx0XHRob21lLm1hcFRhZ3NbcmVjaXBlLnRhZ3NbdF1dICs9IDE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZhaWx1cmUgdG8gcmV0dXJuIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGVycm9yXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc0ZhaWx1cmUoZXJyb3IpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1RoZXJlIHdhcyBhbiBlcnJvciByZXRyaWV2aW5nIHJlY2lwZXM6JywgZXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXHJcblx0XHRcdC50aGVuKF9wdWJsaWNSZWNpcGVzU3VjY2VzcywgX3B1YmxpY1JlY2lwZXNGYWlsdXJlKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS51c2VyID0gZGF0YTtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ0hlbGxvLCAnICsgaG9tZS51c2VyLmRpc3BsYXlOYW1lICsgJyEgV2FudCB0byA8YSBocmVmPVwiL215LXJlY2lwZXM/dmlldz1uZXctcmVjaXBlXCI+YWRkIGEgbmV3IHJlY2lwZTwvYT4/JztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBob21lLnVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcclxuXHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0fSBlbHNlIGlmICghJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ1dlbGNvbWUgdG8gPHN0cm9uZz5yQm94PC9zdHJvbmc+ISBCcm93c2UgdGhyb3VnaCB0aGUgcHVibGljIHJlY2lwZSBib3ggb3IgPGEgaHJlZj1cIi9sb2dpblwiPkxvZ2luPC9hPiB0byBmaWxlIG9yIGNvbnRyaWJ1dGUgcmVjaXBlcy4nO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJ107XG5cblx0ZnVuY3Rpb24gTG9naW5DdHJsKFBhZ2UsICRhdXRoLCBPQVVUSCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBsb2NhbERhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGxvZ2luID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0xvZ2luJyk7XG5cblx0XHRsb2dpbi5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGxvZ2luLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBsb2NhbCBkYXRhIHN1Y2Nlc3NmdWxcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtKU09OfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bG9naW4ubG9jYWxEYXRhID0gZGF0YTtcblx0XHR9XG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGxvZ2luLmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSB0cnVlO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWxseSBhdXRoZW50aWNhdGVkXG5cdFx0XHQgKiBHbyB0byBpbml0aWFsbHkgaW50ZW5kZWQgYXV0aGVudGljYXRlZCBwYXRoXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhTdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJHJvb3RTY29wZS5hdXRoUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBhdXRoZW50aWNhdGluZ1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoQ2F0Y2gocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRcdGxvZ2luLmxvZ2luTXNnID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdCRhdXRoLmF1dGhlbnRpY2F0ZShwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oX2F1dGhTdWNjZXNzKVxuXHRcdFx0XHQuY2F0Y2goX2F1dGhDYXRjaCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxuXHRcdCAqL1xuXHRcdGxvZ2luLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignTXlSZWNpcGVzQ3RybCcsIE15UmVjaXBlc0N0cmwpO1xuXG5cdE15UmVjaXBlc0N0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICdtZWRpYUNoZWNrJywgJyRzY29wZScsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIE15UmVjaXBlc0N0cmwoUGFnZSwgJGF1dGgsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sIG1lZGlhQ2hlY2ssICRzY29wZSwgTVEsICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBteVJlY2lwZXMgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBSZWNpcGVzJyk7XG5cblx0XHRteVJlY2lwZXMudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdmaWxlZC1yZWNpcGVzJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICduZXctcmVjaXBlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94JztcblxuXHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0ZW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ1JlY2lwZSBCb3gnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzJdLm5hbWUgPSAnTmV3IFJlY2lwZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ015IFJlY2lwZSBCb3gnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQgUmVjaXBlcyc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdBZGQgTmV3IFJlY2lwZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRteVJlY2lwZXMuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0bXlSZWNpcGVzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRteVJlY2lwZXMudXNlciA9IGRhdGE7XG5cdFx0XHR2YXIgc2F2ZWRSZWNpcGVzT2JqID0ge3NhdmVkUmVjaXBlczogZGF0YS5zYXZlZFJlY2lwZXN9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHNhdmVkIHJlY2lwZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlcyB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVkU3VjY2VzcyhyZWNpcGVzKSB7XG5cdFx0XHRcdG15UmVjaXBlcy5maWxlZFJlY2lwZXMgPSByZWNpcGVzO1xuXHRcdFx0fVxuXHRcdFx0cmVjaXBlRGF0YS5nZXRGaWxlZFJlY2lwZXMoc2F2ZWRSZWNpcGVzT2JqKVxuXHRcdFx0XHQudGhlbihfZmlsZWRTdWNjZXNzKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldE15UmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignRWRpdFJlY2lwZUN0cmwnLCBFZGl0UmVjaXBlQ3RybCk7XG5cblx0RWRpdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBFZGl0UmVjaXBlQ3RybChQYWdlLCAkYXV0aCwgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgZWRpdCA9IHRoaXM7XG5cdFx0dmFyIF9yZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgUmVjaXBlJyk7XG5cblx0XHRlZGl0LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdFZGl0IFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZWRpdCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdEZWxldGUgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdkZWxldGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRlZGl0LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdlZGl0JztcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZWRpdC5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGVkaXQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZWRpdC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQudXNlciA9IGRhdGE7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKVxuXHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0ZWRpdC5vcmlnaW5hbE5hbWUgPSBlZGl0LnJlY2lwZS5uYW1lO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCAnICsgZWRpdC5vcmlnaW5hbE5hbWUpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVFcnJvcihlcnIpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRlZGl0LmVycm9yTXNnID0gZXJyLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUoX3JlY2lwZVNsdWcpXG5cdFx0XHQudGhlbihfcmVjaXBlU3VjY2VzcywgX3JlY2lwZUVycm9yKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IGRlbGV0ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RGVsZXRlQnRuKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gZmFsc2U7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlIFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0X3Jlc2V0RGVsZXRlQnRuKCk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgYWZ0ZXIgZGVsZXRpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9kZWxldGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9IHRydWU7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlZCEnO1xuXG5cdFx0XHRmdW5jdGlvbiBfZ29Ub1JlY2lwZXMoKSB7XG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbXktcmVjaXBlcycpO1xuXHRcdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgbnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdCR0aW1lb3V0KF9nb1RvUmVjaXBlcywgMTUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgZGVsZXRpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9kZWxldGVFcnJvcigpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9ICdlcnJvcic7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRXJyb3IgZGVsZXRpbmchJztcblxuXHRcdFx0JHRpbWVvdXQoX3Jlc2V0RGVsZXRlQnRuLCAyNTAwKTtcblx0XHR9XG5cblx0XHRlZGl0LmRlbGV0ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0aW5nLi4uJztcblx0XHRcdHJlY2lwZURhdGEuZGVsZXRlUmVjaXBlKGVkaXQucmVjaXBlLl9pZClcblx0XHRcdFx0LnRoZW4oX2RlbGV0ZVN1Y2Nlc3MsIF9kZWxldGVFcnJvcik7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlQ3RybCcsIFJlY2lwZUN0cmwpO1xuXG5cdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZUN0cmwoUGFnZSwgJGF1dGgsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cdFx0dmFyIHJlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1ZztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ1JlY2lwZScpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gdXNlciBpbmZvXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHQvLyBsb2dnZWQgaW4gdXNlcnMgY2FuIGZpbGUgcmVjaXBlc1xuXHRcdFx0cmVjaXBlLmZpbGVUZXh0ID0gJ0ZpbGUgdGhpcyByZWNpcGUnO1xuXHRcdFx0cmVjaXBlLnVuZmlsZVRleHQgPSAnUmVtb3ZlIGZyb20gRmlsZWQgUmVjaXBlcyc7XG5cdFx0fVxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IHJlY2lwZSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gZGF0YTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmVjaXBlLnJlY2lwZS5uYW1lKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIGF1dGhvciBkYXRhXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IGF1dGhvciBwaWN0dXJlLCBkaXNwbGF5TmFtZVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhvclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRyZWNpcGUuYXV0aG9yID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdHVzZXJEYXRhLmdldEF1dGhvcihyZWNpcGUucmVjaXBlLnVzZXJJZClcblx0XHRcdFx0LnRoZW4oX2F1dGhvclN1Y2Nlc3MpO1xuXG5cdFx0XHRyZWNpcGUuaW5nQ2hlY2tlZCA9IFtdO1xuXHRcdFx0cmVjaXBlLnN0ZXBDaGVja2VkID0gW107XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ3JlYXRlIGFycmF5IHRvIGtlZXAgdHJhY2sgb2YgY2hlY2tlZCAvIHVuY2hlY2tlZCBpdGVtc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBjaGVja2VkQXJyXG5cdFx0XHQgKiBAcGFyYW0gc291cmNlQXJyXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY3JlYXRlQ2hlY2tlZEFycmF5cyhjaGVja2VkQXJyLCBzb3VyY2VBcnIpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjaGVja2VkQXJyW2ldID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLmluZ0NoZWNrZWQsIHJlY2lwZS5yZWNpcGUuaW5ncmVkaWVudHMpO1xuXHRcdFx0X2NyZWF0ZUNoZWNrZWRBcnJheXMocmVjaXBlLnN0ZXBDaGVja2VkLCByZWNpcGUucmVjaXBlLmRpcmVjdGlvbnMpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBjaGVja21hcmtcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gdHlwZVxuXHRcdFx0ICogQHBhcmFtIGluZGV4XG5cdFx0XHQgKi9cblx0XHRcdHJlY2lwZS50b2dnbGVDaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG5cdFx0XHRcdHJlY2lwZVt0eXBlICsgJ0NoZWNrZWQnXVtpbmRleF0gPSAhcmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKHJlcykge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0cmVjaXBlLmVycm9yTXNnID0gcmVzLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogRmlsZSBvciB1bmZpbGUgdGhpcyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqL1xuXHRcdHJlY2lwZS5maWxlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlSWQpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0cmVjaXBlLmFwaU1zZyA9IGRhdGEuYWRkZWQgPyAnUmVjaXBlIHNhdmVkIScgOiAnUmVjaXBlIHJlbW92ZWQhJztcblx0XHRcdFx0cmVjaXBlLmZpbGVkID0gZGF0YS5hZGRlZDtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZUVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmZpbGVSZWNpcGUocmVjaXBlSWQpXG5cdFx0XHRcdC50aGVuKF9maWxlU3VjY2VzcywgX2ZpbGVFcnJvcik7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcignbWluVG9IJywgbWluVG9IKTtcblxuXHRmdW5jdGlvbiBtaW5Ub0goKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1pbikge1xuXHRcdFx0dmFyIF9ob3VyID0gNjA7XG5cdFx0XHR2YXIgX21pbiA9IG1pbiAqIDE7XG5cdFx0XHR2YXIgX2d0SG91ciA9IF9taW4gLyBfaG91ciA+PSAxO1xuXHRcdFx0dmFyIHRpbWVTdHIgPSBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdldCBtaW51dGUvcyB0ZXh0IGZyb20gbWludXRlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtaW51dGVzIHtudW1iZXJ9XG5cdFx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBtaW5UZXh0KG1pbnV0ZXMpIHtcblx0XHRcdFx0aWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGUnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgIT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGVzJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX2d0SG91cikge1xuXHRcdFx0XHR2YXIgaFBsdXNNaW4gPSBfbWluICUgX2hvdXI7XG5cdFx0XHRcdHZhciBfaGFzTWludXRlcyA9IGhQbHVzTWluICE9PSAwO1xuXHRcdFx0XHR2YXIgaG91cnMgPSBNYXRoLmZsb29yKF9taW4gLyBfaG91cik7XG5cdFx0XHRcdHZhciBob3Vyc1RleHQgPSBob3VycyA9PT0gMSA/ICcgaG91cicgOiAnIGhvdXJzJztcblx0XHRcdFx0dmFyIG1pbnV0ZXMgPSBfaGFzTWludXRlcyA/ICcsICcgKyBoUGx1c01pbiArIG1pblRleHQoaFBsdXNNaW4pIDogJyc7XG5cblx0XHRcdFx0dGltZVN0ciA9IGhvdXJzICsgaG91cnNUZXh0ICsgbWludXRlcztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBub0hNaW5UZXh0ID0gX21pbiA9PT0gMSA/ICcgbWludXRlJyA6ICcgbWludXRlcyc7XG5cdFx0XHRcdHRpbWVTdHIgPSBfbWluICsgbm9ITWluVGV4dDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRpbWVTdHI7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNBdXRob3JDdHJsJywgUmVjaXBlc0F1dGhvckN0cmwpO1xuXG5cdFJlY2lwZXNBdXRob3JDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQXV0aG9yQ3RybChQYWdlLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF9haWQgPSAkcm91dGVQYXJhbXMudXNlcklkO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNBdXRob3InO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIGF1dGhvcidzIGJhc2ljIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2F1dGhvclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEuYXV0aG9yID0gZGF0YTtcblx0XHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyBieSAnICsgcmEuYXV0aG9yLmRpc3BsYXlOYW1lO1xuXHRcdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldEF1dGhvcihfYWlkKVxuXHRcdFx0LnRoZW4oX2F1dGhvclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyB1c2VyJ3MgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJhLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldEF1dGhvclJlY2lwZXMoX2FpZClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzQ2F0ZWdvcnlDdHJsJywgUmVjaXBlc0NhdGVnb3J5Q3RybCk7XG5cblx0UmVjaXBlc0NhdGVnb3J5Q3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc0NhdGVnb3J5Q3RybChQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2NhdCA9ICRyb3V0ZVBhcmFtcy5jYXRlZ29yeTtcblx0XHR2YXIgX2NhdFRpdGxlID0gX2NhdC5zdWJzdHJpbmcoMCwxKS50b0xvY2FsZVVwcGVyQ2FzZSgpICsgX2NhdC5zdWJzdHJpbmcoMSk7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0NhdGVnb3J5Jztcblx0XHRyYS5oZWFkaW5nID0gX2NhdFRpdGxlICsgJ3MnO1xuXHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICdmYWxzZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHZhciBjYXRBcnIgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHJlY2lwZSkge1xuXHRcdFx0XHRpZiAocmVjaXBlLmNhdGVnb3J5ID09IF9jYXRUaXRsZSkge1xuXHRcdFx0XHRcdGNhdEFyci5wdXNoKHJlY2lwZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyYS5yZWNpcGVzID0gY2F0QXJyO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNUYWdDdHJsJywgUmVjaXBlc1RhZ0N0cmwpO1xuXG5cdFJlY2lwZXNUYWdDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzVGFnQ3RybChQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX3RhZyA9ICRyb3V0ZVBhcmFtcy50YWc7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc1RhZyc7XG5cblx0XHRyYS5oZWFkaW5nID0gJ1JlY2lwZXMgdGFnZ2VkIFwiJyArIF90YWcgKyAnXCInO1xuXHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICd0cnVlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ2ZhbHNlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHZhciB0YWdnZWRBcnIgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHJlY2lwZSkge1xuXHRcdFx0XHRpZiAocmVjaXBlLnRhZ3MuaW5kZXhPZihfdGFnKSA+IC0xKSB7XG5cdFx0XHRcdFx0dGFnZ2VkQXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSB0YWdnZWRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
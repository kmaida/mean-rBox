angular
	.module('rBox', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'satellizer', 'slugifier']);
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
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout'];

	function recipeForm(recipeData, Recipe, Slug, $location, $timeout) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;
			var _originalSlug = _isEdit ? rf.recipe.slug : null;

			rf.recipeData = _isEdit ? rf.recipe : {};
			rf.recipeData.userId = _isEdit ? rf.recipe.userId : rf.userId;
			rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients : [{id: 1}];
			rf.recipeData.directions = _isEdit ? rf.recipe.directions : [{id: 1}];
			rf.recipeData.tags = _isEdit ? rf.recipeData.tags : [];
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
			 *
			 * @param modelName {string} ingredients / directions
			 * @private
			 */
			function _cleanEmpties(modelName) {
				var _array = rf.recipeData[modelName];
				var _check = modelName === 'ingredients' ? 'ingredient' : 'step';

				angular.forEach(_array, function(obj, i) {
					if (!!obj[_check] === false) {
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
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				rf.saveBtnText = _isEdit ? 'Updating...' : 'Saving...';

				// prep data for saving
				rf.recipeData.slug = Slug.slugify(rf.recipeData.name);
				_cleanEmpties('ingredients');
				_cleanEmpties('directions');

				// call API
				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData)
						.then(_recipeSaved, _recipeSaveError);
				} else {
					recipeData.updateRecipe(rf.recipe._id, rf.recipeData)
						.then(_recipeSaved, _recipeSaveError);
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
			 */
			$scope.rfl.addItem = function($event, model) {
				var _newItem = {
					id: model.length + 1
				};

				model.push(_newItem);

				$timeout(function() {
					var _newestInput = angular.element($event.target).parent('p').prev('.last').find('input').eq(0);
					_newestInput.click();
					_newestInput.focus();
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

			//rl.catPredicate = '';
			//rl.tagPredicate = '';
			//rl.dietPredicate = '';

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
		recipeData.getPublicRecipes()
			.then(_publicRecipesSuccess);

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
			console.log(recipe.recipe);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvT0FVVEhDTElFTlRTLmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvUmVjaXBlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLmF1dGguanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS9kaXZpZGVyLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLnNlcnZpY2UuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvcmVjaXBlRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvcmVjaXBlc0xpc3QuZGlyLmpzIiwiY29yZS90cmltU3RyLmZpbHRlci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91c2VyRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwibG9naW4vTG9naW4uY3RybC5qcyIsIm15LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJyZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInJlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAnc2F0ZWxsaXplcicsICdzbHVnaWZpZXInXSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIEFjY291bnRDdHJsKTtcblxuXHRBY2NvdW50Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZScsICckYXV0aCcsICd1c2VyRGF0YScsICckdGltZW91dCcsICdPQVVUSCcsICdVc2VyJywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIEFjY291bnRDdHJsKCRzY29wZSwgUGFnZSwgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsICRsb2NhdGlvbikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ015IEFjY291bnQnKTtcblxuXHRcdGFjY291bnQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ1VzZXIgSW5mbycsXG5cdFx0XHRcdHF1ZXJ5OiAndXNlci1pbmZvJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ01hbmFnZSBMb2dpbnMnLFxuXHRcdFx0XHRxdWVyeTogJ21hbmFnZS1sb2dpbnMnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICd1c2VyLWluZm8nO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRhY2NvdW50LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0YWNjb3VudC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8vIGFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhY2NvdW50LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKi9cblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IEFjY291bnQgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdGFjY291bnQudXNlciA9IGRhdGE7XG5cdFx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0XHRhY2NvdW50LmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyhhY2NvdW50LnVzZXIsICdhY2NvdW50Jyk7XG5cdFx0XHRcdGFjY291bnQuc2hvd0FjY291bnQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBlcnJvciBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVycm9yXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlckVycm9yKGVycm9yKSB7XG5cdFx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2VzcywgX2dldFVzZXJFcnJvcik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHByb2ZpbGUgc2F2ZSBidXR0b24gdG8gaW5pdGlhbCBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYnRuU2F2ZVJlc2V0KCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IGZhbHNlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHR9XG5cblx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cblx0XHQvKipcblx0XHQgKiBXYXRjaCBkaXNwbGF5IG5hbWUgY2hhbmdlcyB0byBjaGVjayBmb3IgZW1wdHkgb3IgbnVsbCBzdHJpbmdcblx0XHQgKiBTZXQgYnV0dG9uIHRleHQgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdXBkYXRlZCBkaXNwbGF5TmFtZSB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkXG5cdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn0gcHJldmlvdXMgZGlzcGxheU5hbWUgdmFsdWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF93YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF93YXRjaERpc3BsYXlOYW1lKTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqIENhbGxlZCBvbiBzdWJtaXNzaW9uIG9mIHVwZGF0ZSBmb3JtXG5cdFx0ICovXG5cdFx0YWNjb3VudC51cGRhdGVQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSB0cnVlO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZUVycm9yKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCEhYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lKSB7XG5cdFx0XHRcdC8vIFNldCBzdGF0dXMgdG8gU2F2aW5nLi4uIGFuZCB1cGRhdGUgdXBvbiBzdWNjZXNzIG9yIGVycm9yIGluIGNhbGxiYWNrc1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB1c2VyLCBwYXNzaW5nIHByb2ZpbGUgZGF0YSBhbmQgYXNzaWduaW5nIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrc1xuXHRcdFx0XHR1c2VyRGF0YS51cGRhdGVVc2VyKHByb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQudW5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWRtaW5DdHJsJywgQWRtaW5DdHJsKTtcblxuXHRBZG1pbkN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICd1c2VyRGF0YScsICdVc2VyJ107XG5cblx0ZnVuY3Rpb24gQWRtaW5DdHJsKFBhZ2UsICRhdXRoLCB1c2VyRGF0YSwgVXNlcikge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWRtaW4gPSB0aGlzO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnQWRtaW4nKTtcblxuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZXMgaWYgdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWRtaW4uaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBBZG1pbiBVSVxuXHRcdCAqIERpc3BsYXkgbGlzdCBvZiB1c2Vyc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWRtaW4udXNlcnMgPSBkYXRhO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goYWRtaW4udXNlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0dXNlci5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHModXNlcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgdW5zdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlciBsaXN0XG5cdFx0ICogU2hvdyBVbmF1dGhvcml6ZWQgZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7ZXJyb3J9IHJlc3BvbnNlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNFcnJvcihlcnJvcikge1xuXHRcdFx0YWRtaW4uc2hvd0FkbWluID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dXNlckRhdGEuZ2V0QWxsVXNlcnMoKS50aGVuKF9nZXRBbGxVc2Vyc1N1Y2Nlc3MsIF9nZXRBbGxVc2Vyc0Vycm9yKTtcblx0fVxufSkoKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ01RJywge1xuXHRcdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxuXHRcdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdFx0fSk7XG59KSgpOyIsIi8vIGxvZ2luIGFjY291bnQgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIHtcblx0XHRcdExPR0lOUzogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dvb2dsZScsXG5cdFx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2FjY291bnRzLmdvb2dsZS5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdFx0bmFtZTogJ1R3aXR0ZXInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly90d2l0dGVyLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdmYWNlYm9vaycsXG5cdFx0XHRcdFx0bmFtZTogJ0ZhY2Vib29rJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dpdGh1YicsXG5cdFx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2dpdGh1Yi5jb20nXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSENMSUVOVFMnLCB7XG5cdFx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHRcdENMSUVOVDoge1xuXHRcdFx0XHRGQjogJzM2MDE3MzE5NzUwNTY1MCcsXG5cdFx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRcdFRXSVRURVI6ICcvYXV0aC90d2l0dGVyJyxcblx0XHRcdFx0R0lUSFVCOiAnOWZmMDk3Mjk5Yzg2ZTUyNGIxMGYnXG5cdFx0XHR9XG5cdFx0fSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UpIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XG5cblx0ZnVuY3Rpb24gUGFnZSgpIHtcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0FsbCBSZWNpcGVzJztcblxuXHRcdGZ1bmN0aW9uIHRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlY2lwZScsIFJlY2lwZSk7XG5cblx0ZnVuY3Rpb24gUmVjaXBlKCkge1xuXHRcdHZhciBkaWV0YXJ5ID0gW1xuXHRcdFx0J0dsdXRlbi1mcmVlJyxcblx0XHRcdCdWZWdhbicsXG5cdFx0XHQnVmVnZXRhcmlhbidcblx0XHRdO1xuXG5cdFx0dmFyIGluc2VydENoYXIgPSBbXG5cdFx0XHQn4oWbJyxcblx0XHRcdCfCvCcsXG5cdFx0XHQn4oWTJyxcblx0XHRcdCfCvScsXG5cdFx0XHQn4oWUJyxcblx0XHRcdCfCvidcblx0XHRdO1xuXG5cdFx0dmFyIGNhdGVnb3JpZXMgPSBbXG5cdFx0XHQnQXBwZXRpemVyJyxcblx0XHRcdCdCZXZlcmFnZScsXG5cdFx0XHQnRGVzc2VydCcsXG5cdFx0XHQnRW50cmVlJyxcblx0XHRcdCdTYWxhZCcsXG5cdFx0XHQnU2lkZScsXG5cdFx0XHQnU291cCdcblx0XHRdO1xuXG5cdFx0dmFyIHRhZ3MgPSBbXG5cdFx0XHQnYWxjb2hvbCcsXG5cdFx0XHQnYmFrZWQnLFxuXHRcdFx0J2JlZWYnLFxuXHRcdFx0J2Zhc3QnLFxuXHRcdFx0J2Zpc2gnLFxuXHRcdFx0J2xvdy1jYWxvcmllJyxcblx0XHRcdCdvbmUtcG90Jyxcblx0XHRcdCdwYXN0YScsXG5cdFx0XHQncG9yaycsXG5cdFx0XHQncG91bHRyeScsXG5cdFx0XHQnc2xvdy1jb29rJyxcblx0XHRcdCdzdG9jaycsXG5cdFx0XHQndmVnZXRhYmxlJ1xuXHRcdF07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGlldGFyeTogZGlldGFyeSxcblx0XHRcdGluc2VydENoYXI6IGluc2VydENoYXIsXG5cdFx0XHRjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuXHRcdFx0dGFnczogdGFnc1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cblx0VXNlci4kaW5qZWN0ID0gWydPQVVUSCddO1xuXG5cdGZ1bmN0aW9uIFVzZXIoT0FVVEgpIHtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhcnJheSBvZiBhIHVzZXIncyBjdXJyZW50bHktbGlua2VkIGFjY291bnQgbG9naW5zXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlck9ialxuXHRcdCAqIEByZXR1cm5zIHtBcnJheX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMaW5rZWRBY2NvdW50cyh1c2VyT2JqKSB7XG5cdFx0XHR2YXIgbGlua2VkQWNjb3VudHMgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKE9BVVRILkxPR0lOUywgZnVuY3Rpb24oYWN0T2JqKSB7XG5cdFx0XHRcdHZhciBhY3QgPSBhY3RPYmouYWNjb3VudDtcblxuXHRcdFx0XHRpZiAodXNlck9ialthY3RdKSB7XG5cdFx0XHRcdFx0bGlua2VkQWNjb3VudHMucHVzaChhY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGxpbmtlZEFjY291bnRzO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMaW5rZWRBY2NvdW50czogZ2V0TGlua2VkQWNjb3VudHNcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uZmlnKGF1dGhDb25maWcpXG5cdFx0LnJ1bihhdXRoUnVuKTtcblxuXHRhdXRoQ29uZmlnLiRpbmplY3QgPSBbJyRhdXRoUHJvdmlkZXInLCAnT0FVVEhDTElFTlRTJ107XG5cblx0ZnVuY3Rpb24gYXV0aENvbmZpZygkYXV0aFByb3ZpZGVyLCBPQVVUSENMSUVOVFMpIHtcblx0XHQkYXV0aFByb3ZpZGVyLmxvZ2luVXJsID0gT0FVVEhDTElFTlRTLkxPR0lOVVJMO1xuXG5cdFx0JGF1dGhQcm92aWRlci5mYWNlYm9vayh7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5GQlxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5nb29nbGUoe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuR09PR0xFXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLnR3aXR0ZXIoe1xuXHRcdFx0dXJsOiBPQVVUSENMSUVOVFMuQ0xJRU5ULlRXSVRURVJcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ2l0aHViKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkdJVEhVQlxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aFJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIGF1dGhSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dCAmJiBuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnNlY3VyZSAmJiAhJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2xvZ2luJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9sb2dpbi9Mb2dpbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTG9naW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbG9naW4nXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGUvOnNsdWcnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZS9SZWNpcGUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyZWNpcGUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL2F1dGhvci86dXNlcklkJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0F1dGhvckN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvdGFnLzp0YWcnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzVGFnQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9jYXRlZ29yeS86Y2F0ZWdvcnknLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzQ2F0ZWdvcnlDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9teS1yZWNpcGVzJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9teS1yZWNpcGVzL015UmVjaXBlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ015UmVjaXBlc0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdteVJlY2lwZXMnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGUvOnNsdWcvZWRpdCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcmVjaXBlL0VkaXRSZWNpcGUudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdFZGl0UmVjaXBlQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2VkaXQnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hY2NvdW50Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9hY2NvdW50L0FjY291bnQudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBY2NvdW50Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FjY291bnQnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hZG1pbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvYWRtaW4vQWRtaW4udmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWRtaW4nXG5cdFx0XHR9KVxuXHRcdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRcdHJlZGlyZWN0VG86ICcvJ1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cblx0XHRkZXRlY3RBZGJsb2NrTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW0nLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUuYWIgPSB7fTtcblxuXHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0JHNjb3BlLmFiLmhvc3QgPSAkbG9jYXRpb24uaG9zdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENoZWNrIGlmIGFkcyBhcmUgYmxvY2tlZCAtIGNhbGxlZCBpbiAkdGltZW91dCB0byBsZXQgQWRCbG9ja2VycyBydW5cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXJlQWRzQmxvY2tlZCgpIHtcblx0XHRcdFx0dmFyIF9hID0gJGVsZW0uZmluZCgnLmFkLXRlc3QnKTtcblxuXHRcdFx0XHQkc2NvcGUuYWIuYmxvY2tlZCA9IF9hLmhlaWdodCgpIDw9IDAgfHwgISRlbGVtLmZpbmQoJy5hZC10ZXN0OnZpc2libGUnKS5sZW5ndGg7XG5cdFx0XHR9XG5cblx0XHRcdCR0aW1lb3V0KF9hcmVBZHNCbG9ja2VkLCAyMDApO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHRcdCc8aSBjbGFzcz1cImZhIGZhLWJhblwiPjwvaT4gPHN0cm9uZz5BZEJsb2NrPC9zdHJvbmc+IGlzIHByb2hpYml0aW5nIGltcG9ydGFudCBmdW5jdGlvbmFsaXR5ISBQbGVhc2UgZGlzYWJsZSBhZCBibG9ja2luZyBvbiA8c3Ryb25nPnt7YWIuaG9zdH19PC9zdHJvbmc+LiBUaGlzIHNpdGUgaXMgYWQtZnJlZS4nICtcblx0XHRcdFx0XHRcdCc8L2Rpdj4nXG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdkaXZpZGVyJywgZGl2aWRlcik7XG5cblx0ZnVuY3Rpb24gZGl2aWRlcigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJyQm94LWRpdmlkZXJcIj48aSBjbGFzcz1cImZhIGZhLWN1dGxlcnlcIj48L2k+PC9kaXY+J1xuXHRcdH1cblx0fVxuXG59KSgpOyIsIi8vIEZldGNoIGxvY2FsIEpTT04gZGF0YVxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCdsb2NhbERhdGEnLCBsb2NhbERhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdGxvY2FsRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIGxvY2FsRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0SlNPTiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9uZy1hcHAvZGF0YS9kYXRhLmpzb24nKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGFuZ3VsYXJNZWRpYUNoZWNrID0gYW5ndWxhci5tb2R1bGUoJ21lZGlhQ2hlY2snLCBbXSk7XG5cblx0YW5ndWxhck1lZGlhQ2hlY2suc2VydmljZSgnbWVkaWFDaGVjaycsIFsnJHdpbmRvdycsICckdGltZW91dCcsIGZ1bmN0aW9uICgkd2luZG93LCAkdGltZW91dCkge1xuXHRcdHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHR2YXIgJHNjb3BlID0gb3B0aW9uc1snc2NvcGUnXSxcblx0XHRcdFx0cXVlcnkgPSBvcHRpb25zWydtcSddLFxuXHRcdFx0XHRkZWJvdW5jZSA9IG9wdGlvbnNbJ2RlYm91bmNlJ10sXG5cdFx0XHRcdCR3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyksXG5cdFx0XHRcdGJyZWFrcG9pbnRzLFxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IHZvaWQgMCxcblx0XHRcdFx0aGFzTWF0Y2hNZWRpYSA9ICR3aW5kb3cubWF0Y2hNZWRpYSAhPT0gdW5kZWZpbmVkICYmICEhJHdpbmRvdy5tYXRjaE1lZGlhKCchJykuYWRkTGlzdGVuZXIsXG5cdFx0XHRcdG1xTGlzdExpc3RlbmVyLFxuXHRcdFx0XHRtbUxpc3RlbmVyLFxuXHRcdFx0XHRkZWJvdW5jZVJlc2l6ZSxcblx0XHRcdFx0bXEgPSB2b2lkIDAsXG5cdFx0XHRcdG1xQ2hhbmdlID0gdm9pZCAwLFxuXHRcdFx0XHRkZWJvdW5jZVNwZWVkID0gISFkZWJvdW5jZSA/IGRlYm91bmNlIDogMjUwO1xuXG5cdFx0XHRpZiAoaGFzTWF0Y2hNZWRpYSkge1xuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzICYmIHR5cGVvZiBvcHRpb25zLmVudGVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmVudGVyKG1xKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRtcSA9ICR3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSk7XG5cdFx0XHRcdFx0bXFMaXN0TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UobXEpXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1xLmFkZExpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGJpbmQgdG8gdGhlIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50IGFuZCBmaXJlIG1xQ2hhbmdlXG5cdFx0XHRcdFx0JHdpbi5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGNsZWFudXAgbGlzdGVuZXJzIHdoZW4gJHNjb3BlIGlzICRkZXN0cm95ZWRcblx0XHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG1xLnJlbW92ZUxpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHRcdCR3aW4udW5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUxpc3RlbmVyKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrcG9pbnRzID0ge307XG5cblx0XHRcdFx0bXFDaGFuZ2UgPSBmdW5jdGlvbiAobXEpIHtcblx0XHRcdFx0XHRpZiAobXEubWF0Y2hlcykge1xuXHRcdFx0XHRcdFx0aWYgKCEhYnJlYWtwb2ludHNbcXVlcnldID09PSBmYWxzZSAmJiAodHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoYnJlYWtwb2ludHNbcXVlcnldID09PSB0cnVlIHx8IGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5leGl0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgobXEubWF0Y2hlcyAmJiAoIWJyZWFrcG9pbnRzW3F1ZXJ5XSkgfHwgKCFtcS5tYXRjaGVzICYmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpKSkpIHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBicmVha3BvaW50c1txdWVyeV0gPSBtcS5tYXRjaGVzO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBjb252ZXJ0RW1Ub1B4ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0dmFyIGVtRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLndpZHRoID0gJzFlbSc7XG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVtRWxlbWVudCk7XG5cdFx0XHRcdFx0cHggPSB2YWx1ZSAqIGVtRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVtRWxlbWVudCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gcHg7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGdldFBYVmFsdWUgPSBmdW5jdGlvbiAod2lkdGgsIHVuaXQpIHtcblx0XHRcdFx0XHR2YXIgdmFsdWU7XG5cdFx0XHRcdFx0dmFsdWUgPSB2b2lkIDA7XG5cdFx0XHRcdFx0c3dpdGNoICh1bml0KSB7XG5cdFx0XHRcdFx0XHRjYXNlICdlbSc6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gY29udmVydEVtVG9QeCh3aWR0aCk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSB3aWR0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG51bGw7XG5cblx0XHRcdFx0bW1MaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgcGFydHMgPSBxdWVyeS5tYXRjaCgvXFwoKC4qKS0uKjpcXHMqKFtcXGRcXC5dKikoLiopXFwpLyksXG5cdFx0XHRcdFx0XHRjb25zdHJhaW50ID0gcGFydHNbMV0sXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGdldFBYVmFsdWUocGFyc2VJbnQocGFydHNbMl0sIDEwKSwgcGFydHNbM10pLFxuXHRcdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEgPSB7fSxcblx0XHRcdFx0XHRcdHdpbmRvd1dpZHRoID0gJHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuXHRcdFx0XHRcdGZha2VNYXRjaE1lZGlhLm1hdGNoZXMgPSBjb25zdHJhaW50ID09PSAnbWF4JyAmJiB2YWx1ZSA+IHdpbmRvd1dpZHRoIHx8IGNvbnN0cmFpbnQgPT09ICdtaW4nICYmIHZhbHVlIDwgd2luZG93V2lkdGg7XG5cblx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UoZmFrZU1hdGNoTWVkaWEpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoZGVib3VuY2VSZXNpemUpO1xuXHRcdFx0XHRcdGRlYm91bmNlUmVzaXplID0gJHRpbWVvdXQobW1MaXN0ZW5lciwgZGVib3VuY2VTcGVlZCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JHdpbi5iaW5kKCdyZXNpemUnLCBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHdpbi51bmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIG1tTGlzdGVuZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XSk7XG59KSgpOyIsIi8vIFJlY2lwZSBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuc2VydmljZSgncmVjaXBlRGF0YScsIHJlY2lwZURhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdHJlY2lwZURhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNsdWcge3N0cmluZ30gcmVjaXBlIHNsdWdcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFJlY2lwZSA9IGZ1bmN0aW9uKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmNyZWF0ZVJlY2lwZSA9IGZ1bmN0aW9uKHJlY2lwZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvbmV3JywgcmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRCAoaW4gY2FzZSBzbHVnIGhhcyBjaGFuZ2VkKVxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy51cGRhdGVSZWNpcGUgPSBmdW5jdGlvbihpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERlbGV0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZGVsZXRlKCcvYXBpL3JlY2lwZS8nICsgaWQpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFB1YmxpY1JlY2lwZXMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0TXlSZWNpcGVzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhIHNwZWNpZmljIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJJZCB7c3RyaW5nfSB1c2VyIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRBdXRob3JSZWNpcGVzID0gZnVuY3Rpb24odXNlcklkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL2F1dGhvci8nICsgdXNlcklkKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRmlsZS91bmZpbGUgdGhpcyByZWNpcGUgaW4gdXNlciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmZpbGVSZWNpcGUgPSBmdW5jdGlvbihyZWNpcGVJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyByZWNpcGVJZCArICcvZmlsZScpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgbXkgZmlsZWQgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZUlkcyB7QXJyYXl9IGFycmF5IG9mIHVzZXIncyBmaWxlZCByZWNpcGUgSURzXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRGaWxlZFJlY2lwZXMgPSBmdW5jdGlvbihyZWNpcGVJZHMpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGVzL21lL2ZpbGVkJywgcmVjaXBlSWRzKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdyZWNpcGVGb3JtJywgcmVjaXBlRm9ybSk7XG5cblx0cmVjaXBlRm9ybS4kaW5qZWN0ID0gWydyZWNpcGVEYXRhJywgJ1JlY2lwZScsICdTbHVnJywgJyRsb2NhdGlvbicsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm0ocmVjaXBlRGF0YSwgUmVjaXBlLCBTbHVnLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG5cblx0XHRmdW5jdGlvbiByZWNpcGVGb3JtQ3RybCgpIHtcblx0XHRcdHZhciByZiA9IHRoaXM7XG5cdFx0XHR2YXIgX2lzRWRpdCA9ICEhcmYucmVjaXBlO1xuXHRcdFx0dmFyIF9vcmlnaW5hbFNsdWcgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnNsdWcgOiBudWxsO1xuXG5cdFx0XHRyZi5yZWNpcGVEYXRhID0gX2lzRWRpdCA/IHJmLnJlY2lwZSA6IHt9O1xuXHRcdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnVzZXJJZCA6IHJmLnVzZXJJZDtcblx0XHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmluZ3JlZGllbnRzIDogW3tpZDogMX1dO1xuXHRcdFx0cmYucmVjaXBlRGF0YS5kaXJlY3Rpb25zID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5kaXJlY3Rpb25zIDogW3tpZDogMX1dO1xuXHRcdFx0cmYucmVjaXBlRGF0YS50YWdzID0gX2lzRWRpdCA/IHJmLnJlY2lwZURhdGEudGFncyA6IFtdO1xuXHRcdFx0cmYudGltZVJlZ2V4ID0gL15bK10/KFswLTldKyg/OltcXC5dWzAtOV0qKT98XFwuWzAtOV0rKSQvO1xuXHRcdFx0cmYudGltZUVycm9yID0gJ1BsZWFzZSBlbnRlciBhIG51bWJlciBpbiBtaW51dGVzLiBNdWx0aXBseSBob3VycyBieSA2MC4nO1xuXG5cdFx0XHQvLyBmZXRjaCBjYXRlZ29yaWVzIG9wdGlvbnMgbGlzdFxuXHRcdFx0cmYuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xuXG5cdFx0XHQvLyBmZXRjaCB0YWdzIG9wdGlvbnMgbGlzdFxuXHRcdFx0cmYudGFncyA9IFJlY2lwZS50YWdzO1xuXG5cdFx0XHQvLyBmZXRjaCBkaWV0YXJ5IG9wdGlvbnMgbGlzdFxuXHRcdFx0cmYuZGlldGFyeSA9IFJlY2lwZS5kaWV0YXJ5O1xuXG5cdFx0XHQvLyBmZXRjaCBzcGVjaWFsIGNoYXJhY3RlcnNcblx0XHRcdHJmLmNoYXJzID0gUmVjaXBlLmluc2VydENoYXI7XG5cblx0XHRcdC8vIHNldHVwIHNwZWNpYWwgY2hhcmFjdGVycyBwcml2YXRlIHZhcnNcblx0XHRcdHZhciBfbGFzdElucHV0O1xuXHRcdFx0dmFyIF9pbmdJbmRleDtcblx0XHRcdHZhciBfY2FyZXRQb3M7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IHNlbGVjdGlvbiByYW5nZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdFx0ICogQHBhcmFtIHNlbGVjdGlvblN0YXJ0IHtudW1iZXJ9XG5cdFx0XHQgKiBAcGFyYW0gc2VsZWN0aW9uRW5kIHtudW1iZXJ9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfc2V0U2VsZWN0aW9uUmFuZ2UoaW5wdXQsIHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpIHtcblx0XHRcdFx0aWYgKGlucHV0LnNldFNlbGVjdGlvblJhbmdlKSB7XG5cdFx0XHRcdFx0aW5wdXQuY2xpY2soKTtcblx0XHRcdFx0XHRpbnB1dC5mb2N1cygpO1xuXHRcdFx0XHRcdGlucHV0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGlucHV0LmNyZWF0ZVRleHRSYW5nZSkge1xuXHRcdFx0XHRcdHZhciByYW5nZSA9IGlucHV0LmNyZWF0ZVRleHRSYW5nZSgpO1xuXHRcdFx0XHRcdHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuXHRcdFx0XHRcdHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHNlbGVjdGlvbkVuZCk7XG5cdFx0XHRcdFx0cmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25TdGFydCk7XG5cdFx0XHRcdFx0cmFuZ2Uuc2VsZWN0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZXQgY2FyZXQgcG9zaXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gaW5wdXRcblx0XHRcdCAqIEBwYXJhbSBwb3Mge251bWJlcn0gaW50ZW5kZWQgY2FyZXQgcG9zaXRpb25cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9zZXRDYXJldFRvUG9zKGlucHV0LCBwb3MpIHtcblx0XHRcdFx0X3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBwb3MsIHBvcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogS2VlcCB0cmFjayBvZiBjYXJldCBwb3NpdGlvbiBpbiBpbmdyZWRpZW50IGFtb3VudCB0ZXh0IGZpZWxkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdFx0ICogQHBhcmFtIGluZGV4IHtudW1iZXJ9XG5cdFx0XHQgKi9cblx0XHRcdHJmLmluc2VydENoYXJJbnB1dCA9IGZ1bmN0aW9uKCRldmVudCwgaW5kZXgpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0X2luZ0luZGV4ID0gaW5kZXg7XG5cdFx0XHRcdFx0X2xhc3RJbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgnIycgKyAkZXZlbnQudGFyZ2V0LmlkKTtcblx0XHRcdFx0XHRfY2FyZXRQb3MgPSBfbGFzdElucHV0WzBdLnNlbGVjdGlvblN0YXJ0O1xuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSW5zZXJ0IGNoYXJhY3RlciBhdCBsYXN0IGNhcmV0IHBvc2l0aW9uXG5cdFx0XHQgKiBJbiBzdXBwb3J0ZWQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gY2hhciB7c3RyaW5nfSBzcGVjaWFsIGNoYXJhY3RlclxuXHRcdFx0ICovXG5cdFx0XHRyZi5pbnNlcnRDaGFyID0gZnVuY3Rpb24oY2hhcikge1xuXHRcdFx0XHRpZiAoX2xhc3RJbnB1dCkge1xuXHRcdFx0XHRcdHZhciBfdGV4dFZhbCA9IHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQgPT09IHVuZGVmaW5lZCA/ICcnIDogcmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdDtcblxuXHRcdFx0XHRcdHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQgPSBfdGV4dFZhbC5zdWJzdHJpbmcoMCwgX2NhcmV0UG9zKSArIGNoYXIgKyBfdGV4dFZhbC5zdWJzdHJpbmcoX2NhcmV0UG9zKTtcblxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0X2NhcmV0UG9zID0gX2NhcmV0UG9zICsgMTtcblx0XHRcdFx0XHRcdF9zZXRDYXJldFRvUG9zKF9sYXN0SW5wdXRbMF0sIF9jYXJldFBvcyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xlYXIgY2FyZXQgcG9zaXRpb24gYW5kIGxhc3QgaW5wdXRcblx0XHRcdCAqIFNvIHRoYXQgc3BlY2lhbCBjaGFyYWN0ZXJzIGRvbid0IGVuZCB1cCBpbiB1bmRlc2lyZWQgZmllbGRzXG5cdFx0XHQgKi9cblx0XHRcdHJmLmNsZWFyQ2hhciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfaW5nSW5kZXggPSBudWxsO1xuXHRcdFx0XHRfbGFzdElucHV0ID0gbnVsbDtcblx0XHRcdFx0X2NhcmV0UG9zID0gbnVsbDtcblx0XHRcdH07XG5cblx0XHRcdC8vIGNyZWF0ZSBtYXAgb2YgdG91Y2hlZCB0YWdzXG5cdFx0XHRyZi50YWdNYXAgPSB7fTtcblx0XHRcdGlmIChfaXNFZGl0ICYmIHJmLnJlY2lwZURhdGEudGFncy5sZW5ndGgpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHJmLnJlY2lwZURhdGEudGFncywgZnVuY3Rpb24odGFnLCBpKSB7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgLyByZW1vdmUgdGFnXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHRhZyB7c3RyaW5nfSB0YWcgbmFtZVxuXHRcdFx0ICovXG5cdFx0XHRyZi5hZGRSZW1vdmVUYWcgPSBmdW5jdGlvbih0YWcpIHtcblx0XHRcdFx0dmFyIF9hY3RpdmVUYWdJbmRleCA9IHJmLnJlY2lwZURhdGEudGFncy5pbmRleE9mKHRhZyk7XG5cblx0XHRcdFx0aWYgKF9hY3RpdmVUYWdJbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0Ly8gdGFnIGV4aXN0cyBpbiBtb2RlbCwgdHVybiBpdCBvZmZcblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3Muc3BsaWNlKF9hY3RpdmVUYWdJbmRleCwgMSk7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB0YWcgZG9lcyBub3QgZXhpc3QgaW4gbW9kZWwsIHR1cm4gaXQgb25cblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MucHVzaCh0YWcpO1xuXHRcdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbGVhbiBlbXB0eSBpdGVtcyBvdXQgb2YgYXJyYXkgYmVmb3JlIHNhdmluZ1xuXHRcdFx0ICogSW5ncmVkaWVudHMgb3IgRGlyZWN0aW9uc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtb2RlbE5hbWUge3N0cmluZ30gaW5ncmVkaWVudHMgLyBkaXJlY3Rpb25zXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xlYW5FbXB0aWVzKG1vZGVsTmFtZSkge1xuXHRcdFx0XHR2YXIgX2FycmF5ID0gcmYucmVjaXBlRGF0YVttb2RlbE5hbWVdO1xuXHRcdFx0XHR2YXIgX2NoZWNrID0gbW9kZWxOYW1lID09PSAnaW5ncmVkaWVudHMnID8gJ2luZ3JlZGllbnQnIDogJ3N0ZXAnO1xuXG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChfYXJyYXksIGZ1bmN0aW9uKG9iaiwgaSkge1xuXHRcdFx0XHRcdGlmICghIW9ialtfY2hlY2tdID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0X2FycmF5LnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2V0IHNhdmUgYnV0dG9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2V0U2F2ZUJ0bigpIHtcblx0XHRcdFx0cmYuc2F2ZWQgPSBmYWxzZTtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZSBSZWNpcGUnIDogJ1NhdmUgUmVjaXBlJztcblx0XHRcdH1cblxuXHRcdFx0X3Jlc2V0U2F2ZUJ0bigpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlY2lwZSBjcmVhdGVkIG9yIHNhdmVkIHN1Y2Nlc3NmdWxseVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZWNpcGUge3Byb21pc2V9IGlmIGVkaXRpbmcgZXZlbnRcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlZChyZWNpcGUpIHtcblx0XHRcdFx0cmYuc2F2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRlZCEnIDogJ1NhdmVkISc7XG5cblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIEdvIHRvIG5ldyBzbHVnIChpZiBuZXcpIG9yIHVwZGF0ZWQgc2x1ZyAoaWYgc2x1ZyBjaGFuZ2VkKVxuXHRcdFx0XHQgKlxuXHRcdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0ZnVuY3Rpb24gX2dvVG9OZXdTbHVnKCkge1xuXHRcdFx0XHRcdHZhciBfcGF0aCA9ICFfaXNFZGl0ID8gcmVjaXBlLnNsdWcgOiByZi5yZWNpcGVEYXRhLnNsdWcgKyAnL2VkaXQnO1xuXG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9yZWNpcGUvJyArIF9wYXRoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghX2lzRWRpdCB8fCBfaXNFZGl0ICYmIF9vcmlnaW5hbFNsdWcgIT09IHJmLnJlY2lwZURhdGEuc2x1Zykge1xuXHRcdFx0XHRcdCR0aW1lb3V0KF9nb1RvTmV3U2x1ZywgMTAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgMjAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZWNpcGUgbm90IHNhdmVkIC8gY3JlYXRlZCBkdWUgdG8gZXJyb3Jcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZXJyIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVFcnJvcihlcnIpIHtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHRcdHJmLnNhdmVkID0gJ2Vycm9yJztcblxuXHRcdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCA0MDAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTYXZlIHJlY2lwZVxuXHRcdFx0ICovXG5cdFx0XHRyZi5zYXZlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGluZy4uLicgOiAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBwcmVwIGRhdGEgZm9yIHNhdmluZ1xuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnNsdWcgPSBTbHVnLnNsdWdpZnkocmYucmVjaXBlRGF0YS5uYW1lKTtcblx0XHRcdFx0X2NsZWFuRW1wdGllcygnaW5ncmVkaWVudHMnKTtcblx0XHRcdFx0X2NsZWFuRW1wdGllcygnZGlyZWN0aW9ucycpO1xuXG5cdFx0XHRcdC8vIGNhbGwgQVBJXG5cdFx0XHRcdGlmICghX2lzRWRpdCkge1xuXHRcdFx0XHRcdHJlY2lwZURhdGEuY3JlYXRlUmVjaXBlKHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlY2lwZURhdGEudXBkYXRlUmVjaXBlKHJmLnJlY2lwZS5faWQsIHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJlY2lwZUZvcm1MaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbScsICckYXR0cnMnXTtcblxuXHRcdGZ1bmN0aW9uIHJlY2lwZUZvcm1MaW5rKCRzY29wZSwgJGVsZW0sICRhdHRycykge1xuXHRcdFx0Ly8gc2V0IHVwICRzY29wZSBvYmplY3QgZm9yIG5hbWVzcGFjaW5nXG5cdFx0XHQkc2NvcGUucmZsID0ge307XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQWRkIG5ldyBpdGVtXG5cdFx0XHQgKiBJbmdyZWRpZW50IG9yIERpcmVjdGlvbiBzdGVwXG5cdFx0XHQgKiBGb2N1cyB0aGUgbmV3ZXN0IGlucHV0IGZpZWxkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fSBjbGljayBldmVudFxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5hZGRJdGVtID0gZnVuY3Rpb24oJGV2ZW50LCBtb2RlbCkge1xuXHRcdFx0XHR2YXIgX25ld0l0ZW0gPSB7XG5cdFx0XHRcdFx0aWQ6IG1vZGVsLmxlbmd0aCArIDFcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRtb2RlbC5wdXNoKF9uZXdJdGVtKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgX25ld2VzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCRldmVudC50YXJnZXQpLnBhcmVudCgncCcpLnByZXYoJy5sYXN0JykuZmluZCgnaW5wdXQnKS5lcSgwKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuY2xpY2soKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuZm9jdXMoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlbW92ZSBpdGVtXG5cdFx0XHQgKiBJbmdyZWRpZW50IG9yIERpcmVjdGlvbiBzdGVwXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBpIHtpbmRleH1cblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5yZW1vdmVJdGVtID0gZnVuY3Rpb24obW9kZWwsIGkpIHtcblx0XHRcdFx0bW9kZWwuc3BsaWNlKGksIDEpO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGU6ICc9Jyxcblx0XHRcdFx0dXNlcklkOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZUZvcm0udHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlRm9ybUN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdyZicsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogcmVjaXBlRm9ybUxpbmtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZXNMaXN0JywgcmVjaXBlc0xpc3QpO1xuXG5cdHJlY2lwZXNMaXN0LiRpbmplY3QgPSBbJ1JlY2lwZSddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZXNMaXN0KFJlY2lwZSkge1xuXG5cdFx0cmVjaXBlc0xpc3RDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RDdHJsKCRzY29wZSkge1xuXHRcdFx0Ly8gY29udHJvbGxlckFzIHZpZXcgbW9kZWxcblx0XHRcdHZhciBybCA9IHRoaXM7XG5cblx0XHRcdC8vIGJ1aWxkIG91dCB0aGUgdG90YWwgdGltZSBhbmQgbnVtYmVyIG9mIGluZ3JlZGllbnRzIGZvciBzb3J0aW5nXG5cdFx0XHR2YXIgX3dhdGNoUmVjaXBlcyA9ICRzY29wZS4kd2F0Y2goJ3JsLnJlY2lwZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHJsLnJlY2lwZXMsIGZ1bmN0aW9uKHJlY2lwZSkge1xuXHRcdFx0XHRcdFx0cmVjaXBlLnRvdGFsVGltZSA9IChyZWNpcGUuY29va1RpbWUgPyByZWNpcGUuY29va1RpbWUgOiAwKSArIChyZWNpcGUucHJlcFRpbWUgPyByZWNpcGUucHJlcFRpbWUgOiAwKTtcblx0XHRcdFx0XHRcdHJlY2lwZS5uSW5nID0gcmVjaXBlLmluZ3JlZGllbnRzLmxlbmd0aDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBkZXJlZ2lzdGVyIHRoZSB3YXRjaFxuXHRcdFx0XHRcdF93YXRjaFJlY2lwZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGNvbmRpdGlvbmFsbHkgc2hvdyBjYXRlZ29yeSAvIHRhZyBmaWx0ZXJzXG5cdFx0XHQvLyBhbHdheXMgc2hvdyBzcGVjaWFsIGRpZXQgZmlsdGVyXG5cdFx0XHRpZiAocmwuY2F0ZWdvcnlGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0XHRybC5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XG5cdFx0XHRcdHJsLnNob3dDYXRlZ29yeUZpbHRlciA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmwudGFnRmlsdGVyID09PSAndHJ1ZScpIHtcblx0XHRcdFx0cmwudGFncyA9IFJlY2lwZS50YWdzO1xuXHRcdFx0XHRybC5zaG93VGFnRmlsdGVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJsLnNwZWNpYWxEaWV0ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHRcdC8vIHNldCBhbGwgZmlsdGVycyB0byBlbXB0eVxuXHRcdFx0cmwuZmlsdGVyUHJlZGljYXRlcyA9IHt9O1xuXG5cdFx0XHRmdW5jdGlvbiBfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCkge1xuXHRcdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLmNhdCA9ICcnO1xuXHRcdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLnRhZyA9ICcnO1xuXHRcdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzLmRpZXQgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0Ly9ybC5jYXRQcmVkaWNhdGUgPSAnJztcblx0XHRcdC8vcmwudGFnUHJlZGljYXRlID0gJyc7XG5cdFx0XHQvL3JsLmRpZXRQcmVkaWNhdGUgPSAnJztcblxuXHRcdFx0Ly8gc2V0IHVwIHNvcnQgcHJlZGljYXRlIGFuZCByZXZlcnNhbHNcblx0XHRcdHJsLnNvcnRQcmVkaWNhdGUgPSAnbmFtZSc7XG5cblx0XHRcdHJsLnJldmVyc2VPYmogPSB7XG5cdFx0XHRcdG5hbWU6IGZhbHNlLFxuXHRcdFx0XHR0b3RhbFRpbWU6IGZhbHNlLFxuXHRcdFx0XHRuSW5nOiBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdHZhciBfbGFzdFNvcnRlZEJ5ID0gJ25hbWUnO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBzb3J0IGFzYy9kZXNjXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHByZWRpY2F0ZSB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHRybC50b2dnbGVTb3J0ID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG5cdFx0XHRcdGlmIChfbGFzdFNvcnRlZEJ5ID09PSBwcmVkaWNhdGUpIHtcblx0XHRcdFx0XHRybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV0gPSAhcmwucmV2ZXJzZU9ialtwcmVkaWNhdGVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJsLnJldmVyc2UgPSBybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV07XG5cdFx0XHRcdF9sYXN0U29ydGVkQnkgPSBwcmVkaWNhdGU7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBudW1iZXIgb2YgcmVjaXBlcyB0byBzaG93L2FkZCBpbiBhIHNldFxuXHRcdFx0dmFyIF9yZXN1bHRzU2V0ID0gMTU7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzZXQgcmVzdWx0cyBzaG93aW5nIHRvIGluaXRpYWwgZGVmYXVsdCBvbiBzZWFyY2gvZmlsdGVyXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2V0UmVzdWx0c1Nob3dpbmcoKSB7XG5cdFx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IF9yZXN1bHRzU2V0O1xuXHRcdFx0fVxuXHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBMb2FkIE1vcmUgcmVzdWx0c1xuXHRcdFx0ICovXG5cdFx0XHRybC5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRybC5uUmVzdWx0c1Nob3dpbmcgPSBybC5uUmVzdWx0c1Nob3dpbmcgKz0gX3Jlc3VsdHNTZXQ7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyB3YXRjaCBzZWFyY2ggcXVlcnkgYW5kIGlmIGl0IGV4aXN0cywgY2xlYXIgZmlsdGVycyBhbmQgcmVzZXQgcmVzdWx0cyBzaG93aW5nXG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdybC5xdWVyeScsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmICghIXJsLnF1ZXJ5KSB7XG5cdFx0XHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyB3YXRjaCBmaWx0ZXJzIGFuZCBpZiBhbnkgb2YgdGhlbSBjaGFuZ2UsIHJlc2V0IHRoZSByZXN1bHRzIHNob3dpbmdcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLmZpbHRlclByZWRpY2F0ZXMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAoISFuZXdWYWwgJiYgbmV3VmFsICE9PSBvbGRWYWwpIHtcblx0XHRcdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIF9vcGVuRmlsdGVyc09ubG9hZCA9ICRzY29wZS4kd2F0Y2goJ3JsLm9wZW5GaWx0ZXJzJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmwuc2hvd1NlYXJjaEZpbHRlciA9IG5ld1ZhbCA9PT0gJ3RydWUnO1xuXHRcdFx0XHRcdF9vcGVuRmlsdGVyc09ubG9hZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgc2VhcmNoL2ZpbHRlciBzZWN0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdHJsLnRvZ2dsZVNlYXJjaEZpbHRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gIXJsLnNob3dTZWFyY2hGaWx0ZXI7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsZWFyIHNlYXJjaCBxdWVyeSBhbmQgYWxsIGZpbHRlcnNcblx0XHRcdCAqL1xuXHRcdFx0cmwuY2xlYXJTZWFyY2hGaWx0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0X3Jlc2V0RmlsdGVyUHJlZGljYXRlcygpO1xuXHRcdFx0XHRybC5xdWVyeSA9ICcnO1xuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTaG93IG51bWJlciBvZiBjdXJyZW50bHkgYWN0aXZlIHNlYXJjaCArIGZpbHRlciBpdGVtc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfVxuXHRcdFx0ICogQHBhcmFtIGZpbHRlcnNPYmoge29iamVjdH1cblx0XHRcdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdFx0XHQgKi9cblx0XHRcdHJsLmFjdGl2ZVNlYXJjaEZpbHRlcnMgPSBmdW5jdGlvbihxdWVyeSwgZmlsdGVyc09iaikge1xuXHRcdFx0XHR2YXIgdG90YWwgPSAwO1xuXG5cdFx0XHRcdGlmIChxdWVyeSkge1xuXHRcdFx0XHRcdHRvdGFsID0gdG90YWwgKz0gMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goZmlsdGVyc09iaiwgZnVuY3Rpb24oZmlsdGVyKSB7XG5cdFx0XHRcdFx0aWYgKGZpbHRlcikge1xuXHRcdFx0XHRcdFx0dG90YWwgPSB0b3RhbCArPSAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIHRvdGFsO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRyZWNpcGVzTGlzdExpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRhdHRycycsICckZWxlbSddO1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlc0xpc3RMaW5rKCRzY29wZSwgJGF0dHJzLCAkZWxlbSkge1xuXHRcdFx0JHNjb3BlLnJsbCA9IHt9O1xuXG5cdFx0XHQvLyB3YXRjaCB0aGUgY3VycmVudGx5IHZpc2libGUgbnVtYmVyIG9mIHJlY2lwZXMgdG8gZGlzcGxheSBhIGNvdW50XG5cdFx0XHQkc2NvcGUuJHdhdGNoKFxuXHRcdFx0XHRmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gYW5ndWxhci5lbGVtZW50KCcucmVjaXBlc0xpc3QtbGlzdC1pdGVtJykubGVuZ3RoO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRcdCRzY29wZS5ybGwuZGlzcGxheWVkUmVzdWx0cyA9IG5ld1ZhbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0cmVjaXBlczogJz0nLFxuXHRcdFx0XHRvcGVuRmlsdGVyczogJ0AnLFxuXHRcdFx0XHRjdXN0b21MYWJlbHM6ICdAJyxcblx0XHRcdFx0Y2F0ZWdvcnlGaWx0ZXI6ICdAJyxcblx0XHRcdFx0dGFnRmlsdGVyOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZXNMaXN0LnRwbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6IHJlY2lwZXNMaXN0Q3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JsJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVzTGlzdExpbmtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RyaW1TdHInLCB0cmltU3RyKTtcblxuXHRmdW5jdGlvbiB0cmltU3RyKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihzdHIsIGNoYXJzKSB7XG5cdFx0XHR2YXIgdHJpbW1lZFN0ciA9IHN0cjtcblx0XHRcdHZhciBfY2hhcnMgPSBjaGFycyA9PT0gdW5kZWZpbmVkID8gNTAgOiBjaGFycztcblxuXHRcdFx0aWYgKHN0ci5sZW5ndGggPiBfY2hhcnMpIHtcblx0XHRcdFx0dHJpbW1lZFN0ciA9IHN0ci5zdWJzdHIoMCwgX2NoYXJzKSArICcuLi4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJpbW1lZFN0cjtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBVc2VyIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCd1c2VyRGF0YScsIHVzZXJEYXRhKTtcblxuXHQvKipcblx0ICogR0VUIHByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0ICpcblx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRSZXMocmVzcG9uc2UpIHtcblx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHR9XG5cdH1cblxuXHR1c2VyRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRBdXRob3IgPSBmdW5jdGlvbihpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlci8nICsgaWQpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgY3VycmVudCB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRVc2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgY3VycmVudCB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcHJvZmlsZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLnVwZGF0ZVVzZXIgPSBmdW5jdGlvbihwcm9maWxlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvbWUnLCBwcm9maWxlRGF0YSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSlcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0QWxsVXNlcnMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXJzJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBGb3IgZXZlbnRzIGJhc2VkIG9uIHZpZXdwb3J0IHNpemUgLSB1cGRhdGVzIGFzIHZpZXdwb3J0IGlzIHJlc2l6ZWRcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCd2aWV3U3dpdGNoJywgdmlld1N3aXRjaCk7XG5cblx0dmlld1N3aXRjaC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gdmlld1N3aXRjaChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdHZpZXdTd2l0Y2hMaW5rLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0LyoqXG5cdFx0ICogdmlld1N3aXRjaCBkaXJlY3RpdmUgbGluayBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHZpZXdTd2l0Y2hMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS52cyA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBleGl0IG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluaXRpYWxpemUgbWVkaWFDaGVja1xuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyRm4sXG5cdFx0XHRcdGV4aXQ6IF9leGl0Rm5cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IHZpZXdTd2l0Y2hMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgaGVhZGVyQ3RybCk7XHJcblxyXG5cdGhlYWRlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnLCAnJGF1dGgnLCAndXNlckRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhLCAkYXV0aCwgdXNlckRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIGFkbWluVXNlciBpcyB1bmRlZmluZWQsXHJcblx0XHQgKiBnZXQgdGhlIHVzZXIgYW5kIHNldCBhZG1pblVzZXIgYm9vbGVhbi5cclxuXHRcdCAqXHJcblx0XHQgKiBEbyB0aGlzIG9uIGZpcnN0IGNvbnRyb2xsZXIgbG9hZCAoaW5pdCwgcmVmcmVzaClcclxuXHRcdCAqIGFuZCBzdWJzZXF1ZW50IGxvY2F0aW9uIGNoYW5nZXMgKGllLCBjYXRjaGluZyBsb2dvdXQsIGxvZ2luLCBldGMpLlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9jaGVja1VzZXJBZG1pbigpIHtcclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdFx0aGVhZGVyLnVzZXIgPSBkYXRhO1xyXG5cdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgZ2V0IHVzZXIgZGF0YVxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLnVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0X2NoZWNrVXNlckFkbWluKCk7XHJcblx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2NoZWNrVXNlckFkbWluKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XHJcblx0XHQgKiBOZWVkcyB0byBiZSBhIGZ1bmN0aW9uIHNvIGl0IGlzIHJlLWV4ZWN1dGVkXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdG5hdkNvbnRyb2xMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnXTtcblxuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0dmFyIF9ib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5JyksXG5cdFx0XHRcdF9uYXZPcGVuO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQnKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LW9wZW4nKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2VOYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBUb2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmICghX25hdk9wZW4pIHtcblx0XHRcdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2xvc2VOYXYpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdF9ib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJNb2JpbGUsXG5cdFx0XHRcdGV4aXQ6IF9leGl0TW9iaWxlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cdH1cblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ2xvY2FsRGF0YScsICdyZWNpcGVEYXRhJywgJ1JlY2lwZScsICckYXV0aCcsICd1c2VyRGF0YScsICckbG9jYXRpb24nXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoUGFnZSwgbG9jYWxEYXRhLCByZWNpcGVEYXRhLCBSZWNpcGUsICRhdXRoLCB1c2VyRGF0YSwgJGxvY2F0aW9uKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0UGFnZS5zZXRUaXRsZSgnQWxsIFJlY2lwZXMnKTtcclxuXHJcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xyXG5cclxuXHRcdGhvbWUudGFicyA9IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdSZWNpcGUgQm94ZXMnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAncmVjaXBlLWJveGVzJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1NlYXJjaCAvIEJyb3dzZSBBbGwnLFxyXG5cdFx0XHRcdHF1ZXJ5OiAnc2VhcmNoLWJyb3dzZS1hbGwnXHJcblx0XHRcdH1cclxuXHRcdF07XHJcblx0XHRob21lLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94ZXMnO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhbmdlIHRhYlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXHJcblx0XHQgKi9cclxuXHRcdGhvbWUuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcclxuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcclxuXHRcdFx0aG9tZS5jdXJyZW50VGFiID0gcXVlcnk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGhvbWUuY2F0ZWdvcmllcyA9IFJlY2lwZS5jYXRlZ29yaWVzO1xyXG5cdFx0aG9tZS50YWdzID0gUmVjaXBlLnRhZ3M7XHJcblxyXG5cdFx0Ly8gYnVpbGQgaGFzaG1hcCBvZiBjYXRlZ29yaWVzXHJcblx0XHRob21lLm1hcENhdGVnb3JpZXMgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaG9tZS5jYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGhvbWUubWFwQ2F0ZWdvcmllc1tob21lLmNhdGVnb3JpZXNbaV1dID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBidWlsZCBoYXNobWFwIG9mIHRhZ3NcclxuXHRcdGhvbWUubWFwVGFncyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgbiA9IDA7IG4gPCBob21lLnRhZ3MubGVuZ3RoOyBuKyspIHtcclxuXHRcdFx0aG9tZS5tYXBUYWdzW2hvbWUudGFnc1tuXV0gPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGxvY2FsIGRhdGEgZnJvbSBzdGF0aWMgSlNPTlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIChzdWNjZXNzZnVsIHByb21pc2UgcmV0dXJucylcclxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R9IGRhdGFcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3B1YmxpY1JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5yZWNpcGVzID0gZGF0YTtcclxuXHJcblx0XHRcdC8vIGNvdW50IG51bWJlciBvZiByZWNpcGVzIHBlciBjYXRlZ29yeSBhbmQgdGFnXHJcblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChob21lLnJlY2lwZXMsIGZ1bmN0aW9uKHJlY2lwZSkge1xyXG5cdFx0XHRcdGhvbWUubWFwQ2F0ZWdvcmllc1tyZWNpcGUuY2F0ZWdvcnldICs9IDE7XHJcblxyXG5cdFx0XHRcdGZvciAodmFyIHQgPSAwOyB0IDwgcmVjaXBlLnRhZ3MubGVuZ3RoOyB0KyspIHtcclxuXHRcdFx0XHRcdGhvbWUubWFwVGFnc1tyZWNpcGUudGFnc1t0XV0gKz0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcclxuXHRcdFx0LnRoZW4oX3B1YmxpY1JlY2lwZXNTdWNjZXNzKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS51c2VyID0gZGF0YTtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ0hlbGxvLCAnICsgaG9tZS51c2VyLmRpc3BsYXlOYW1lICsgJyEgV2FudCB0byA8YSBocmVmPVwiL215LXJlY2lwZXM/dmlldz1uZXctcmVjaXBlXCI+YWRkIGEgbmV3IHJlY2lwZTwvYT4/JztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIGdldCB1c2VyIGRhdGFcclxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBob21lLnVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcclxuXHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0fSBlbHNlIGlmICghJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcclxuXHRcdFx0aG9tZS53ZWxjb21lTXNnID0gJ1dlbGNvbWUgdG8gPHN0cm9uZz5yQm94PC9zdHJvbmc+ISBCcm93c2UgdGhyb3VnaCB0aGUgcHVibGljIHJlY2lwZSBib3ggb3IgPGEgaHJlZj1cIi9sb2dpblwiPkxvZ2luPC9hPiB0byBmaWxlIG9yIGNvbnRyaWJ1dGUgcmVjaXBlcy4nO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cblx0TG9naW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJ107XG5cblx0ZnVuY3Rpb24gTG9naW5DdHJsKFBhZ2UsICRhdXRoLCBPQVVUSCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBsb2NhbERhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGxvZ2luID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0xvZ2luJyk7XG5cblx0XHRsb2dpbi5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGxvZ2luLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBsb2NhbCBkYXRhIHN1Y2Nlc3NmdWxcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtKU09OfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bG9naW4ubG9jYWxEYXRhID0gZGF0YTtcblx0XHR9XG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGxvZ2luLmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSB0cnVlO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWxseSBhdXRoZW50aWNhdGVkXG5cdFx0XHQgKiBHbyB0byBpbml0aWFsbHkgaW50ZW5kZWQgYXV0aGVudGljYXRlZCBwYXRoXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhTdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJHJvb3RTY29wZS5hdXRoUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBhdXRoZW50aWNhdGluZ1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoQ2F0Y2gocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRcdGxvZ2luLmxvZ2luTXNnID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdCRhdXRoLmF1dGhlbnRpY2F0ZShwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oX2F1dGhTdWNjZXNzKVxuXHRcdFx0XHQuY2F0Y2goX2F1dGhDYXRjaCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIExvZyB0aGUgdXNlciBvdXQgb2Ygd2hhdGV2ZXIgYXV0aGVudGljYXRpb24gdGhleSd2ZSBzaWduZWQgaW4gd2l0aFxuXHRcdCAqL1xuXHRcdGxvZ2luLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignTXlSZWNpcGVzQ3RybCcsIE15UmVjaXBlc0N0cmwpO1xuXG5cdE15UmVjaXBlc0N0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICdtZWRpYUNoZWNrJywgJyRzY29wZScsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIE15UmVjaXBlc0N0cmwoUGFnZSwgJGF1dGgsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sIG1lZGlhQ2hlY2ssICRzY29wZSwgTVEsICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBteVJlY2lwZXMgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBSZWNpcGVzJyk7XG5cblx0XHRteVJlY2lwZXMudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICdmaWxlZC1yZWNpcGVzJ1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cXVlcnk6ICduZXctcmVjaXBlJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0bXlSZWNpcGVzLmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdyZWNpcGUtYm94JztcblxuXHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0ZW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ1JlY2lwZSBCb3gnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzJdLm5hbWUgPSAnTmV3IFJlY2lwZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1swXS5uYW1lID0gJ015IFJlY2lwZSBCb3gnO1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzFdLm5hbWUgPSAnRmlsZWQgUmVjaXBlcyc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdBZGQgTmV3IFJlY2lwZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRteVJlY2lwZXMuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0bXlSZWNpcGVzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRteVJlY2lwZXMudXNlciA9IGRhdGE7XG5cdFx0XHR2YXIgc2F2ZWRSZWNpcGVzT2JqID0ge3NhdmVkUmVjaXBlczogZGF0YS5zYXZlZFJlY2lwZXN9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHNhdmVkIHJlY2lwZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlcyB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVkU3VjY2VzcyhyZWNpcGVzKSB7XG5cdFx0XHRcdG15UmVjaXBlcy5maWxlZFJlY2lwZXMgPSByZWNpcGVzO1xuXHRcdFx0fVxuXHRcdFx0cmVjaXBlRGF0YS5nZXRGaWxlZFJlY2lwZXMoc2F2ZWRSZWNpcGVzT2JqKVxuXHRcdFx0XHQudGhlbihfZmlsZWRTdWNjZXNzKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldE15UmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignRWRpdFJlY2lwZUN0cmwnLCBFZGl0UmVjaXBlQ3RybCk7XG5cblx0RWRpdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBFZGl0UmVjaXBlQ3RybChQYWdlLCAkYXV0aCwgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgZWRpdCA9IHRoaXM7XG5cdFx0dmFyIF9yZWNpcGVTbHVnID0gJHJvdXRlUGFyYW1zLnNsdWc7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0VkaXQgUmVjaXBlJyk7XG5cblx0XHRlZGl0LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdFZGl0IFJlY2lwZScsXG5cdFx0XHRcdHF1ZXJ5OiAnZWRpdCdcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdEZWxldGUgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdkZWxldGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRlZGl0LmN1cnJlbnRUYWIgPSBfdGFiID8gX3RhYiA6ICdlZGl0JztcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0ZWRpdC5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGVkaXQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZWRpdC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQudXNlciA9IGRhdGE7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldFVzZXIoKVxuXHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgdXNlcidzIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0ZWRpdC5vcmlnaW5hbE5hbWUgPSBlZGl0LnJlY2lwZS5uYW1lO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCAnICsgZWRpdC5vcmlnaW5hbE5hbWUpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVFcnJvcihlcnIpIHtcblx0XHRcdGVkaXQucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRlZGl0LmVycm9yTXNnID0gZXJyLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUoX3JlY2lwZVNsdWcpXG5cdFx0XHQudGhlbihfcmVjaXBlU3VjY2VzcywgX3JlY2lwZUVycm9yKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IGRlbGV0ZSBidXR0b25cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3Jlc2V0RGVsZXRlQnRuKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gZmFsc2U7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlIFJlY2lwZSc7XG5cdFx0fVxuXG5cdFx0X3Jlc2V0RGVsZXRlQnRuKCk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgYWZ0ZXIgZGVsZXRpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9kZWxldGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9IHRydWU7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRlZCEnO1xuXG5cdFx0XHRmdW5jdGlvbiBfZ29Ub1JlY2lwZXMoKSB7XG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbXktcmVjaXBlcycpO1xuXHRcdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgbnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdCR0aW1lb3V0KF9nb1RvUmVjaXBlcywgMTUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgZGVsZXRpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9kZWxldGVFcnJvcigpIHtcblx0XHRcdGVkaXQuZGVsZXRlZCA9ICdlcnJvcic7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRXJyb3IgZGVsZXRpbmchJztcblxuXHRcdFx0JHRpbWVvdXQoX3Jlc2V0RGVsZXRlQnRuLCAyNTAwKTtcblx0XHR9XG5cblx0XHRlZGl0LmRlbGV0ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVCdG5UZXh0ID0gJ0RlbGV0aW5nLi4uJztcblx0XHRcdHJlY2lwZURhdGEuZGVsZXRlUmVjaXBlKGVkaXQucmVjaXBlLl9pZClcblx0XHRcdFx0LnRoZW4oX2RlbGV0ZVN1Y2Nlc3MsIF9kZWxldGVFcnJvcik7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlQ3RybCcsIFJlY2lwZUN0cmwpO1xuXG5cdFJlY2lwZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICckcm91dGVQYXJhbXMnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YSddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZUN0cmwoUGFnZSwgJGF1dGgsICRyb3V0ZVBhcmFtcywgcmVjaXBlRGF0YSwgdXNlckRhdGEpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJlY2lwZSA9IHRoaXM7XG5cdFx0dmFyIHJlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1ZztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ1JlY2lwZScpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gdXNlciBpbmZvXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmVjaXBlLnVzZXIgPSBkYXRhO1xuXG5cdFx0XHQvLyBsb2dnZWQgaW4gdXNlcnMgY2FuIGZpbGUgcmVjaXBlc1xuXHRcdFx0cmVjaXBlLmZpbGVUZXh0ID0gJ0ZpbGUgdGhpcyByZWNpcGUnO1xuXHRcdFx0cmVjaXBlLnVuZmlsZVRleHQgPSAnUmVtb3ZlIGZyb20gRmlsZWQgUmVjaXBlcyc7XG5cdFx0fVxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IHJlY2lwZSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gZGF0YTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmVjaXBlLnJlY2lwZS5uYW1lKTtcblx0XHRcdGNvbnNvbGUubG9nKHJlY2lwZS5yZWNpcGUpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgYXV0aG9yIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gYXV0aG9yIHBpY3R1cmUsIGRpc3BsYXlOYW1lXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdHJlY2lwZS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0dXNlckRhdGEuZ2V0QXV0aG9yKHJlY2lwZS5yZWNpcGUudXNlcklkKVxuXHRcdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKHJlcykge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0cmVjaXBlLmVycm9yTXNnID0gcmVzLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogRmlsZSBvciB1bmZpbGUgdGhpcyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqL1xuXHRcdHJlY2lwZS5maWxlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlSWQpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2ZpbGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0cmVjaXBlLmFwaU1zZyA9IGRhdGEuYWRkZWQgPyAnUmVjaXBlIHNhdmVkIScgOiAnUmVjaXBlIHJlbW92ZWQhJztcblx0XHRcdFx0cmVjaXBlLmZpbGVkID0gZGF0YS5hZGRlZDtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBwcm9taXNlIGZyb20gc2F2aW5nIHJlY2lwZSB0byB1c2VyIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZUVycm9yKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmZpbGVSZWNpcGUocmVjaXBlSWQpXG5cdFx0XHRcdC50aGVuKF9maWxlU3VjY2VzcywgX2ZpbGVFcnJvcik7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcignbWluVG9IJywgbWluVG9IKTtcblxuXHRmdW5jdGlvbiBtaW5Ub0goKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1pbikge1xuXHRcdFx0dmFyIF9ob3VyID0gNjA7XG5cdFx0XHR2YXIgX21pbiA9IG1pbiAqIDE7XG5cdFx0XHR2YXIgX2d0SG91ciA9IF9taW4gLyBfaG91ciA+PSAxO1xuXHRcdFx0dmFyIHRpbWVTdHIgPSBudWxsO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdldCBtaW51dGUvcyB0ZXh0IGZyb20gbWludXRlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBtaW51dGVzIHtudW1iZXJ9XG5cdFx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBtaW5UZXh0KG1pbnV0ZXMpIHtcblx0XHRcdFx0aWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGUnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKF9oYXNNaW51dGVzICYmIG1pbnV0ZXMgIT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyBtaW51dGVzJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX2d0SG91cikge1xuXHRcdFx0XHR2YXIgaFBsdXNNaW4gPSBfbWluICUgX2hvdXI7XG5cdFx0XHRcdHZhciBfaGFzTWludXRlcyA9IGhQbHVzTWluICE9PSAwO1xuXHRcdFx0XHR2YXIgaG91cnMgPSBNYXRoLmZsb29yKF9taW4gLyBfaG91cik7XG5cdFx0XHRcdHZhciBob3Vyc1RleHQgPSBob3VycyA9PT0gMSA/ICcgaG91cicgOiAnIGhvdXJzJztcblx0XHRcdFx0dmFyIG1pbnV0ZXMgPSBfaGFzTWludXRlcyA/ICcsICcgKyBoUGx1c01pbiArIG1pblRleHQoaFBsdXNNaW4pIDogJyc7XG5cblx0XHRcdFx0dGltZVN0ciA9IGhvdXJzICsgaG91cnNUZXh0ICsgbWludXRlcztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBub0hNaW5UZXh0ID0gX21pbiA9PT0gMSA/ICcgbWludXRlJyA6ICcgbWludXRlcyc7XG5cdFx0XHRcdHRpbWVTdHIgPSBfbWluICsgbm9ITWluVGV4dDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRpbWVTdHI7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNBdXRob3JDdHJsJywgUmVjaXBlc0F1dGhvckN0cmwpO1xuXG5cdFJlY2lwZXNBdXRob3JDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQXV0aG9yQ3RybChQYWdlLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJHJvdXRlUGFyYW1zKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciByYSA9IHRoaXM7XG5cdFx0dmFyIF9haWQgPSAkcm91dGVQYXJhbXMudXNlcklkO1xuXG5cdFx0cmEuY2xhc3NOYW1lID0gJ3JlY2lwZXNBdXRob3InO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAndHJ1ZSc7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIGF1dGhvcidzIGJhc2ljIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2F1dGhvclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEuYXV0aG9yID0gZGF0YTtcblx0XHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyBieSAnICsgcmEuYXV0aG9yLmRpc3BsYXlOYW1lO1xuXHRcdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmEuaGVhZGluZyk7XG5cdFx0fVxuXHRcdHVzZXJEYXRhLmdldEF1dGhvcihfYWlkKVxuXHRcdFx0LnRoZW4oX2F1dGhvclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyB1c2VyJ3MgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJhLnJlY2lwZXMgPSBkYXRhO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldEF1dGhvclJlY2lwZXMoX2FpZClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVzQ2F0ZWdvcnlDdHJsJywgUmVjaXBlc0NhdGVnb3J5Q3RybCk7XG5cblx0UmVjaXBlc0NhdGVnb3J5Q3RybC4kaW5qZWN0ID0gWydQYWdlJywgJ3JlY2lwZURhdGEnLCAnJHJvdXRlUGFyYW1zJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlc0NhdGVnb3J5Q3RybChQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2NhdCA9ICRyb3V0ZVBhcmFtcy5jYXRlZ29yeTtcblx0XHR2YXIgX2NhdFRpdGxlID0gX2NhdC5zdWJzdHJpbmcoMCwxKS50b0xvY2FsZVVwcGVyQ2FzZSgpICsgX2NhdC5zdWJzdHJpbmcoMSk7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0NhdGVnb3J5Jztcblx0XHRyYS5oZWFkaW5nID0gX2NhdFRpdGxlICsgJ3MnO1xuXHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICdmYWxzZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHZhciBjYXRBcnIgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHJlY2lwZSkge1xuXHRcdFx0XHRpZiAocmVjaXBlLmNhdGVnb3J5ID09IF9jYXRUaXRsZSkge1xuXHRcdFx0XHRcdGNhdEFyci5wdXNoKHJlY2lwZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyYS5yZWNpcGVzID0gY2F0QXJyO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNUYWdDdHJsJywgUmVjaXBlc1RhZ0N0cmwpO1xuXG5cdFJlY2lwZXNUYWdDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzVGFnQ3RybChQYWdlLCByZWNpcGVEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX3RhZyA9ICRyb3V0ZVBhcmFtcy50YWc7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc1RhZyc7XG5cblx0XHRyYS5oZWFkaW5nID0gJ1JlY2lwZXMgdGFnZ2VkIFwiJyArIF90YWcgKyAnXCInO1xuXHRcdHJhLmN1c3RvbUxhYmVscyA9IHJhLmhlYWRpbmc7XG5cdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblxuXHRcdHJhLnNob3dDYXRlZ29yeUZpbHRlciA9ICd0cnVlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ2ZhbHNlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHZhciB0YWdnZWRBcnIgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHJlY2lwZSkge1xuXHRcdFx0XHRpZiAocmVjaXBlLnRhZ3MuaW5kZXhPZihfdGFnKSA+IC0xKSB7XG5cdFx0XHRcdFx0dGFnZ2VkQXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSB0YWdnZWRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
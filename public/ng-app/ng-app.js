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

	recipeForm.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout', 'Upload'];

	function recipeForm(recipeData, Recipe, Slug, $location, $timeout, Upload) {

		recipeFormCtrl.$inject = ['$scope'];
		function recipeFormCtrl($scope) {
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

			/**
			 * Image file upload
			 *
			 * @param image
			 * @param $event {object}
			 */
			//rf.onFileSelect = function(image, $event) {
			//	console.log('Image upload:', image, $event);
			//
			//	if (angular.isArray(image)) {
			//		image = image[0];
			//	}
			//
			//	rf.uploadInProgress = true;
			//	rf.uploadProgress = 0;
			//
			//	rf.upload = Upload.upload({
			//		url: '/api/recipe/upload-image',
			//		method: 'POST',
			//		fields: {
			//			// TODO: add information tying this image to a specific recipe
			//		},
			//		file: image
			//	}).progress(function(event) {
			//		rf.uploadProgress = Math.floor(event.loaded / event.total);
			//		$scope.$apply();
			//	}).success(function(data, status, headers, config) {
			//		rf.uploadInProgress = false;
			//		rf.uploadedImage = JSON.parse(data);
			//	}).error(function(err) {
			//		rf.uploadInProgress = false;
			//		console.log('Error uploading file: ' + err.message || err);
			//	})
			//};





			rf.upload = function(files) {
				if (files && files.length) {
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						Upload.upload({
							url: '/api/recipe/upload-image',
							fields: {

							},
							file: file
						}).progress(function(evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
							rf.uploadProgress = progressPercentage + '% ' + evt.config.file.name;
						}).success(function (data, status, headers, config) {
							$timeout(function() {
								rf.uploadInProgress = false;
								rf.uploadedImage = '/uploads/images/' + data.filename;
								console.log(data);
							});
						});
					}
				}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvT0FVVEhDTElFTlRTLmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvUmVjaXBlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLmF1dGguanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS9kaXZpZGVyLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLnNlcnZpY2UuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvcmVjaXBlRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvcmVjaXBlc0xpc3QuZGlyLmpzIiwiY29yZS90cmltU3RyLmZpbHRlci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91c2VyRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwibG9naW4vTG9naW4uY3RybC5qcyIsIm15LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJyZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInJlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJyZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im5nLWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcblx0Lm1vZHVsZSgnckJveCcsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbmdNZXNzYWdlcycsICdtZWRpYUNoZWNrJywgJ3NhdGVsbGl6ZXInLCAnc2x1Z2lmaWVyJywgJ25nRmlsZVVwbG9hZCddKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCBQYWdlLCAkYXV0aCwgdXNlckRhdGEsICR0aW1lb3V0LCBPQVVUSCwgVXNlciwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhY2NvdW50ID0gdGhpcztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTXkgQWNjb3VudCcpO1xuXG5cdFx0YWNjb3VudC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnVXNlciBJbmZvJyxcblx0XHRcdFx0cXVlcnk6ICd1c2VyLWluZm8nXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnTWFuYWdlIExvZ2lucycsXG5cdFx0XHRcdHF1ZXJ5OiAnbWFuYWdlLWxvZ2lucydcblx0XHRcdH1cblx0XHRdO1xuXHRcdGFjY291bnQuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3VzZXItaW5mbyc7XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdGFjY291bnQuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9O1xuXG5cdFx0Ly8gYWxsIGF2YWlsYWJsZSBsb2dpbiBzZXJ2aWNlc1xuXHRcdGFjY291bnQubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXG5cdFx0LyoqXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGFjY291bnQuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqL1xuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdFx0YWNjb3VudC5hZG1pbmlzdHJhdG9yID0gYWNjb3VudC51c2VyLmlzQWRtaW47XG5cdFx0XHRcdGFjY291bnQubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKGFjY291bnQudXNlciwgJ2FjY291bnQnKTtcblx0XHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIGVycm9yIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBhbiBlcnJvciBhbGVydCBpbiB0aGUgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZXJyb3Jcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyRXJyb3IoZXJyb3IpIHtcblx0XHRcdFx0YWNjb3VudC5lcnJvckdldHRpbmdVc2VyID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX2dldFVzZXJTdWNjZXNzLCBfZ2V0VXNlckVycm9yKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcHJvZmlsZSBzYXZlIGJ1dHRvbiB0byBpbml0aWFsIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9idG5TYXZlUmVzZXQoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gZmFsc2U7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdH1cblxuXHRcdF9idG5TYXZlUmVzZXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIFdhdGNoIGRpc3BsYXkgbmFtZSBjaGFuZ2VzIHRvIGNoZWNrIGZvciBlbXB0eSBvciBudWxsIHN0cmluZ1xuXHRcdCAqIFNldCBidXR0b24gdGV4dCBhY2NvcmRpbmdseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB1cGRhdGVkIGRpc3BsYXlOYW1lIHZhbHVlIGZyb20gaW5wdXQgZmllbGRcblx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfSBwcmV2aW91cyBkaXNwbGF5TmFtZSB2YWx1ZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3dhdGNoRGlzcGxheU5hbWUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmIChuZXdWYWwgPT09ICcnIHx8IG5ld1ZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0VudGVyIE5hbWUnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHRcdH1cblx0XHR9XG5cdFx0JHNjb3BlLiR3YXRjaCgnYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lJywgX3dhdGNoRGlzcGxheU5hbWUpO1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICogQ2FsbGVkIG9uIHN1Ym1pc3Npb24gb2YgdXBkYXRlIGZvcm1cblx0XHQgKi9cblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwcm9maWxlRGF0YSA9IHsgZGlzcGxheU5hbWU6IGFjY291bnQudXNlci5kaXNwbGF5TmFtZSB9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3MgY2FsbGJhY2sgd2hlbiBwcm9maWxlIGhhcyBiZWVuIHVwZGF0ZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfdXBkYXRlU3VjY2VzcygpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IHRydWU7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZWQhJztcblxuXHRcdFx0XHQkdGltZW91dChfYnRuU2F2ZVJlc2V0LCAyNTAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBjYWxsYmFjayB3aGVuIHByb2ZpbGUgdXBkYXRlIGhhcyBmYWlsZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfdXBkYXRlRXJyb3IoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoISFhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUpIHtcblx0XHRcdFx0Ly8gU2V0IHN0YXR1cyB0byBTYXZpbmcuLi4gYW5kIHVwZGF0ZSB1cG9uIHN1Y2Nlc3Mgb3IgZXJyb3IgaW4gY2FsbGJhY2tzXG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHVzZXIsIHBhc3NpbmcgcHJvZmlsZSBkYXRhIGFuZCBhc3NpZ25pbmcgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzXG5cdFx0XHRcdHVzZXJEYXRhLnVwZGF0ZVVzZXIocHJvZmlsZURhdGEpLnRoZW4oX3VwZGF0ZVN1Y2Nlc3MsIF91cGRhdGVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIExpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVubGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC51bmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgudW5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSA/IHJlc3BvbnNlLmRhdGEubWVzc2FnZSA6ICdDb3VsZCBub3QgdW5saW5rICcgKyBwcm92aWRlciArICcgYWNjb3VudCcpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJ1VzZXInXTtcblxuXHRmdW5jdGlvbiBBZG1pbkN0cmwoUGFnZSwgJGF1dGgsIHVzZXJEYXRhLCBVc2VyKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdBZG1pbicpO1xuXG5cdFx0LyoqXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhZG1pbi5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciB1bnN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IFVuYXV0aG9yaXplZCBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtlcnJvcn0gcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR1c2VyRGF0YS5nZXRBbGxVc2VycygpLnRoZW4oX2dldEFsbFVzZXJzU3VjY2VzcywgX2dldEFsbFVzZXJzRXJyb3IpO1xuXHR9XG59KSgpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnTVEnLCB7XG5cdFx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4gYWNjb3VudCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ09BVVRIJywge1xuXHRcdFx0TE9HSU5TOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0XHRuYW1lOiAnR29vZ2xlJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICd0d2l0dGVyJyxcblx0XHRcdFx0XHRuYW1lOiAnVHdpdHRlcicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2ZhY2Vib29rJyxcblx0XHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9mYWNlYm9vay5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0XHRuYW1lOiAnR2l0SHViJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZ2l0aHViLmNvbSdcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xufSkoKTsiLCIvLyBsb2dpbi9PYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ09BVVRIQ0xJRU5UUycsIHtcblx0XHRcdExPR0lOVVJMOiAnaHR0cDovL3Jib3gua21haWRhLmlvL2F1dGgvbG9naW4nLFxuXHRcdFx0Q0xJRU5UOiB7XG5cdFx0XHRcdEZCOiAnMzYwMTczMTk3NTA1NjUwJyxcblx0XHRcdFx0R09PR0xFOiAnMzYyMTM2MzIyOTQyLWs0NWg1MnEzdXE1NmRjMWdhczFmNTJjMHVsaGc1MTkwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcblx0XHRcdFx0VFdJVFRFUjogJy9hdXRoL3R3aXR0ZXInLFxuXHRcdFx0XHRHSVRIVUI6ICc5ZmYwOTcyOTljODZlNTI0YjEwZidcblx0XHRcdH1cblx0XHR9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSkge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdHZhciBwYWdlVGl0bGUgPSAnQWxsIFJlY2lwZXMnO1xuXG5cdFx0ZnVuY3Rpb24gdGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUmVjaXBlJywgUmVjaXBlKTtcblxuXHRmdW5jdGlvbiBSZWNpcGUoKSB7XG5cdFx0dmFyIGRpZXRhcnkgPSBbXG5cdFx0XHQnR2x1dGVuLWZyZWUnLFxuXHRcdFx0J1ZlZ2FuJyxcblx0XHRcdCdWZWdldGFyaWFuJ1xuXHRcdF07XG5cblx0XHR2YXIgaW5zZXJ0Q2hhciA9IFtcblx0XHRcdCfihZsnLFxuXHRcdFx0J8K8Jyxcblx0XHRcdCfihZMnLFxuXHRcdFx0J8K9Jyxcblx0XHRcdCfihZQnLFxuXHRcdFx0J8K+J1xuXHRcdF07XG5cblx0XHR2YXIgY2F0ZWdvcmllcyA9IFtcblx0XHRcdCdBcHBldGl6ZXInLFxuXHRcdFx0J0JldmVyYWdlJyxcblx0XHRcdCdEZXNzZXJ0Jyxcblx0XHRcdCdFbnRyZWUnLFxuXHRcdFx0J1NhbGFkJyxcblx0XHRcdCdTaWRlJyxcblx0XHRcdCdTb3VwJ1xuXHRcdF07XG5cblx0XHR2YXIgdGFncyA9IFtcblx0XHRcdCdhbGNvaG9sJyxcblx0XHRcdCdiYWtlZCcsXG5cdFx0XHQnYmVlZicsXG5cdFx0XHQnZmFzdCcsXG5cdFx0XHQnZmlzaCcsXG5cdFx0XHQnbG93LWNhbG9yaWUnLFxuXHRcdFx0J29uZS1wb3QnLFxuXHRcdFx0J3Bhc3RhJyxcblx0XHRcdCdwb3JrJyxcblx0XHRcdCdwb3VsdHJ5Jyxcblx0XHRcdCdzbG93LWNvb2snLFxuXHRcdFx0J3N0b2NrJyxcblx0XHRcdCd2ZWdldGFibGUnXG5cdFx0XTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRkaWV0YXJ5OiBkaWV0YXJ5LFxuXHRcdFx0aW5zZXJ0Q2hhcjogaW5zZXJ0Q2hhcixcblx0XHRcdGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsXG5cdFx0XHR0YWdzOiB0YWdzXG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlcicsICdPQVVUSENMSUVOVFMnXTtcblxuXHRmdW5jdGlvbiBhdXRoQ29uZmlnKCRhdXRoUHJvdmlkZXIsIE9BVVRIQ0xJRU5UUykge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBPQVVUSENMSUVOVFMuTE9HSU5VUkw7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkZCXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HT09HTEVcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIudHdpdHRlcih7XG5cdFx0XHR1cmw6IE9BVVRIQ0xJRU5UUy5DTElFTlQuVFdJVFRFUlxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5naXRodWIoe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuR0lUSFVCXG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoUnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJ107XG5cblx0ZnVuY3Rpb24gYXV0aFJ1bigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRhdXRoKSB7XG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0XHQkcm9vdFNjb3BlLmF1dGhQYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuXHRcdFx0XHQkcm9vdFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gc2VuZCB1c2VyIHRvIGxvZ2luXG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG59KSgpOyIsIi8vIHJvdXRlc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsb2dpbidcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1ZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcmVjaXBlL1JlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JlY2lwZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvYXV0aG9yLzp1c2VySWQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0FyY2hpdmVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVzQXV0aG9yQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy90YWcvOnRhZycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNUYWdDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL2NhdGVnb3J5LzpjYXRlZ29yeScsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL215LXJlY2lwZXMnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL215LXJlY2lwZXMvTXlSZWNpcGVzLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTXlSZWNpcGVzQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ215UmVjaXBlcydcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZS86c2x1Zy9lZGl0Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGUvRWRpdFJlY2lwZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0VkaXRSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZWRpdCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FjY291bnQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2FjY291bnQvQWNjb3VudC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FjY291bnRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWNjb3VudCdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FkbWluJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9hZG1pbi9BZG1pbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBZG1pbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhZG1pbidcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy8nXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cbn0pKCk7IiwiLy8gRm9yIHRvdWNoZW5kL21vdXNldXAgYmx1clxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2JsdXJPbkVuZCcsIGJsdXJPbkVuZCk7XG5cblx0Ymx1ck9uRW5kLiRpbmplY3QgPSBbXTtcblxuXHRmdW5jdGlvbiBibHVyT25FbmQoKSB7XG5cblx0XHRibHVyT25FbmRMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbSddO1xuXG5cdFx0ZnVuY3Rpb24gYmx1ck9uRW5kTGluaygkc2NvcGUsICRlbGVtKSB7XG5cdFx0XHQkZWxlbS5iaW5kKCd0b3VjaGVuZCcsIGJsdXJFbGVtKTtcblx0XHRcdCRlbGVtLmJpbmQoJ21vdXNldXAnLCBibHVyRWxlbSk7XG5cblx0XHRcdGZ1bmN0aW9uIGJsdXJFbGVtKCkge1xuXHRcdFx0XHQkZWxlbS50cmlnZ2VyKCdibHVyJyk7XG5cdFx0XHR9XG5cblx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgndG91Y2hlbmQnLCBibHVyRWxlbSk7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgnbW91c2V1cCcsIGJsdXJFbGVtKVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogYmx1ck9uRW5kTGlua1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdkZXRlY3RBZGJsb2NrJywgZGV0ZWN0QWRibG9jayk7XG5cblx0ZGV0ZWN0QWRibG9jay4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrKCR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblxuXHRcdGRldGVjdEFkYmxvY2tMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbScsICckYXR0cnMnXTtcblxuXHRcdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2tMaW5rKCRzY29wZSwgJGVsZW0sICRhdHRycykge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS5hYiA9IHt9O1xuXG5cdFx0XHQvLyBob3N0bmFtZSBmb3IgbWVzc2FnaW5nXG5cdFx0XHQkc2NvcGUuYWIuaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogZGV0ZWN0QWRibG9ja0xpbmssXG5cdFx0XHR0ZW1wbGF0ZTogICAnPGRpdiBjbGFzcz1cImFkLXRlc3QgZmEtZmFjZWJvb2sgZmEtdHdpdHRlclwiIHN0eWxlPVwiaGVpZ2h0OjFweDtcIj48L2Rpdj4nICtcblx0XHRcdFx0XHRcdCc8ZGl2IG5nLWlmPVwiYWIuYmxvY2tlZFwiIGNsYXNzPVwiYWItbWVzc2FnZSBhbGVydCBhbGVydC1kYW5nZXJcIj4nICtcblx0XHRcdFx0XHRcdFx0JzxpIGNsYXNzPVwiZmEgZmEtYmFuXCI+PC9pPiA8c3Ryb25nPkFkQmxvY2s8L3N0cm9uZz4gaXMgcHJvaGliaXRpbmcgaW1wb3J0YW50IGZ1bmN0aW9uYWxpdHkhIFBsZWFzZSBkaXNhYmxlIGFkIGJsb2NraW5nIG9uIDxzdHJvbmc+e3thYi5ob3N0fX08L3N0cm9uZz4uIFRoaXMgc2l0ZSBpcyBhZC1mcmVlLicgK1xuXHRcdFx0XHRcdFx0JzwvZGl2Pidcblx0XHR9XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RpdmlkZXInLCBkaXZpZGVyKTtcblxuXHRmdW5jdGlvbiBkaXZpZGVyKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInJCb3gtZGl2aWRlclwiPjxpIGNsYXNzPVwiZmEgZmEtY3V0bGVyeVwiPjwvaT48L2Rpdj4nXG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiLy8gRmV0Y2ggbG9jYWwgSlNPTiBkYXRhXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LnNlcnZpY2UoJ2xvY2FsRGF0YScsIGxvY2FsRGF0YSk7XG5cblx0LyoqXG5cdCAqIEdFVCBwcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0UmVzKHJlc3BvbnNlKSB7XG5cdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0fVxuXHR9XG5cblx0bG9jYWxEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gbG9jYWxEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IGxvY2FsIEpTT04gZGF0YSBmaWxlIGFuZCByZXR1cm4gcmVzdWx0c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRKU09OID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL25nLWFwcC9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgYW5ndWxhck1lZGlhQ2hlY2sgPSBhbmd1bGFyLm1vZHVsZSgnbWVkaWFDaGVjaycsIFtdKTtcblxuXHRhbmd1bGFyTWVkaWFDaGVjay5zZXJ2aWNlKCdtZWRpYUNoZWNrJywgWyckd2luZG93JywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCR3aW5kb3csICR0aW1lb3V0KSB7XG5cdFx0dGhpcy5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdHZhciAkc2NvcGUgPSBvcHRpb25zWydzY29wZSddLFxuXHRcdFx0XHRxdWVyeSA9IG9wdGlvbnNbJ21xJ10sXG5cdFx0XHRcdGRlYm91bmNlID0gb3B0aW9uc1snZGVib3VuY2UnXSxcblx0XHRcdFx0JHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KSxcblx0XHRcdFx0YnJlYWtwb2ludHMsXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gdm9pZCAwLFxuXHRcdFx0XHRoYXNNYXRjaE1lZGlhID0gJHdpbmRvdy5tYXRjaE1lZGlhICE9PSB1bmRlZmluZWQgJiYgISEkd2luZG93Lm1hdGNoTWVkaWEoJyEnKS5hZGRMaXN0ZW5lcixcblx0XHRcdFx0bXFMaXN0TGlzdGVuZXIsXG5cdFx0XHRcdG1tTGlzdGVuZXIsXG5cdFx0XHRcdGRlYm91bmNlUmVzaXplLFxuXHRcdFx0XHRtcSA9IHZvaWQgMCxcblx0XHRcdFx0bXFDaGFuZ2UgPSB2b2lkIDAsXG5cdFx0XHRcdGRlYm91bmNlU3BlZWQgPSAhIWRlYm91bmNlID8gZGVib3VuY2UgOiAyNTA7XG5cblx0XHRcdGlmIChoYXNNYXRjaE1lZGlhKSB7XG5cdFx0XHRcdG1xQ2hhbmdlID0gZnVuY3Rpb24gKG1xKSB7XG5cdFx0XHRcdFx0aWYgKG1xLm1hdGNoZXMgJiYgdHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhpdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG1xID0gJHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KTtcblx0XHRcdFx0XHRtcUxpc3RMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSlcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bXEuYWRkTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gYmluZCB0byB0aGUgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQgYW5kIGZpcmUgbXFDaGFuZ2Vcblx0XHRcdFx0XHQkd2luLmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gY2xlYW51cCBsaXN0ZW5lcnMgd2hlbiAkc2NvcGUgaXMgJGRlc3Ryb3llZFxuXHRcdFx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0bXEucmVtb3ZlTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdFx0JHdpbi51bmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIG1xQ2hhbmdlKG1xKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gY3JlYXRlTGlzdGVuZXIoKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWtwb2ludHMgPSB7fTtcblxuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzKSB7XG5cdFx0XHRcdFx0XHRpZiAoISFicmVha3BvaW50c1txdWVyeV0gPT09IGZhbHNlICYmICh0eXBlb2Ygb3B0aW9ucy5lbnRlciA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5lbnRlcihtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKChtcS5tYXRjaGVzICYmICghYnJlYWtwb2ludHNbcXVlcnldKSB8fCAoIW1xLm1hdGNoZXMgJiYgKGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PT0gdHJ1ZSB8fCBicmVha3BvaW50c1txdWVyeV0gPT0gbnVsbCkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG1xLm1hdGNoZXM7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGNvbnZlcnRFbVRvUHggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHR2YXIgZW1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUud2lkdGggPSAnMWVtJztcblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZW1FbGVtZW50KTtcblx0XHRcdFx0XHRweCA9IHZhbHVlICogZW1FbGVtZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZW1FbGVtZW50KTtcblxuXHRcdFx0XHRcdHJldHVybiBweDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZ2V0UFhWYWx1ZSA9IGZ1bmN0aW9uICh3aWR0aCwgdW5pdCkge1xuXHRcdFx0XHRcdHZhciB2YWx1ZTtcblx0XHRcdFx0XHR2YWx1ZSA9IHZvaWQgMDtcblx0XHRcdFx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ2VtJzpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0RW1Ub1B4KHdpZHRoKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHdpZHRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0YnJlYWtwb2ludHNbcXVlcnldID0gbnVsbDtcblxuXHRcdFx0XHRtbUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBwYXJ0cyA9IHF1ZXJ5Lm1hdGNoKC9cXCgoLiopLS4qOlxccyooW1xcZFxcLl0qKSguKilcXCkvKSxcblx0XHRcdFx0XHRcdGNvbnN0cmFpbnQgPSBwYXJ0c1sxXSxcblx0XHRcdFx0XHRcdHZhbHVlID0gZ2V0UFhWYWx1ZShwYXJzZUludChwYXJ0c1syXSwgMTApLCBwYXJ0c1szXSksXG5cdFx0XHRcdFx0XHRmYWtlTWF0Y2hNZWRpYSA9IHt9LFxuXHRcdFx0XHRcdFx0d2luZG93V2lkdGggPSAkd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG5cdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEubWF0Y2hlcyA9IGNvbnN0cmFpbnQgPT09ICdtYXgnICYmIHZhbHVlID4gd2luZG93V2lkdGggfHwgY29uc3RyYWludCA9PT0gJ21pbicgJiYgdmFsdWUgPCB3aW5kb3dXaWR0aDtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShmYWtlTWF0Y2hNZWRpYSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGZha2VNYXRjaE1lZGlhUmVzaXplID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNsZWFyVGltZW91dChkZWJvdW5jZVJlc2l6ZSk7XG5cdFx0XHRcdFx0ZGVib3VuY2VSZXNpemUgPSAkdGltZW91dChtbUxpc3RlbmVyLCBkZWJvdW5jZVNwZWVkKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkd2luLmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkd2luLnVuYmluZCgncmVzaXplJywgZmFrZU1hdGNoTWVkaWFSZXNpemUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gbW1MaXN0ZW5lcigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1dKTtcbn0pKCk7IiwiLy8gUmVjaXBlIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCdyZWNpcGVEYXRhJywgcmVjaXBlRGF0YSk7XG5cblx0LyoqXG5cdCAqIEdFVCBwcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0UmVzKHJlc3BvbnNlKSB7XG5cdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0fVxuXHR9XG5cblx0cmVjaXBlRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZURhdGEoJGh0dHApIHtcblx0XHQvKipcblx0XHQgKiBHZXQgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gc2x1ZyB7c3RyaW5nfSByZWNpcGUgc2x1Z1xuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0UmVjaXBlID0gZnVuY3Rpb24oc2x1Zykge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlLycgKyBzbHVnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuY3JlYXRlUmVjaXBlID0gZnVuY3Rpb24ocmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZS9uZXcnLCByZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGEgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEIChpbiBjYXNlIHNsdWcgaGFzIGNoYW5nZWQpXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLnVwZGF0ZVJlY2lwZSA9IGZ1bmN0aW9uKGlkLCByZWNpcGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIGlkLCByZWNpcGVEYXRhKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIGEgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5kZWxldGVSZWNpcGUgPSBmdW5jdGlvbihpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5kZWxldGUoJy9hcGkvcmVjaXBlLycgKyBpZCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgcHVibGljIHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0UHVibGljUmVjaXBlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcycpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgbXkgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRNeVJlY2lwZXMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMvbWUnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGEgc3BlY2lmaWMgdXNlcidzIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlcklkIHtzdHJpbmd9IHVzZXIgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEF1dGhvclJlY2lwZXMgPSBmdW5jdGlvbih1c2VySWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMvYXV0aG9yLycgKyB1c2VySWQpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGaWxlL3VuZmlsZSB0aGlzIHJlY2lwZSBpbiB1c2VyIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWNpcGVJZCB7c3RyaW5nfSBJRCBvZiByZWNpcGUgdG8gc2F2ZVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZmlsZVJlY2lwZSA9IGZ1bmN0aW9uKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIHJlY2lwZUlkICsgJy9maWxlJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSBmaWxlZCByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWRzIHtBcnJheX0gYXJyYXkgb2YgdXNlcidzIGZpbGVkIHJlY2lwZSBJRHNcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEZpbGVkUmVjaXBlcyA9IGZ1bmN0aW9uKHJlY2lwZUlkcykge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZXMvbWUvZmlsZWQnLCByZWNpcGVJZHMpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3JlY2lwZUZvcm0nLCByZWNpcGVGb3JtKTtcblxuXHRyZWNpcGVGb3JtLiRpbmplY3QgPSBbJ3JlY2lwZURhdGEnLCAnUmVjaXBlJywgJ1NsdWcnLCAnJGxvY2F0aW9uJywgJyR0aW1lb3V0JywgJ1VwbG9hZCddO1xuXG5cdGZ1bmN0aW9uIHJlY2lwZUZvcm0ocmVjaXBlRGF0YSwgUmVjaXBlLCBTbHVnLCAkbG9jYXRpb24sICR0aW1lb3V0LCBVcGxvYWQpIHtcblxuXHRcdHJlY2lwZUZvcm1DdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXHRcdGZ1bmN0aW9uIHJlY2lwZUZvcm1DdHJsKCRzY29wZSkge1xuXHRcdFx0dmFyIHJmID0gdGhpcztcblx0XHRcdHZhciBfaXNFZGl0ID0gISFyZi5yZWNpcGU7XG5cdFx0XHR2YXIgX29yaWdpbmFsU2x1ZyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuc2x1ZyA6IG51bGw7XG5cblx0XHRcdHJmLnJlY2lwZURhdGEgPSBfaXNFZGl0ID8gcmYucmVjaXBlIDoge307XG5cdFx0XHRyZi5yZWNpcGVEYXRhLnVzZXJJZCA9IF9pc0VkaXQgPyByZi5yZWNpcGUudXNlcklkIDogcmYudXNlcklkO1xuXHRcdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50cyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuaW5ncmVkaWVudHMgOiBbe2lkOiAxfV07XG5cdFx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiBbe2lkOiAxfV07XG5cdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MgPSBfaXNFZGl0ID8gcmYucmVjaXBlRGF0YS50YWdzIDogW107XG5cblx0XHRcdHJmLnRpbWVSZWdleCA9IC9eWytdPyhbMC05XSsoPzpbXFwuXVswLTldKik/fFxcLlswLTldKykkLztcblx0XHRcdHJmLnRpbWVFcnJvciA9ICdQbGVhc2UgZW50ZXIgYSBudW1iZXIgaW4gbWludXRlcy4gTXVsdGlwbHkgaG91cnMgYnkgNjAuJztcblxuXHRcdFx0Ly8gZmV0Y2ggY2F0ZWdvcmllcyBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblxuXHRcdFx0Ly8gZmV0Y2ggdGFncyBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLnRhZ3MgPSBSZWNpcGUudGFncztcblxuXHRcdFx0Ly8gZmV0Y2ggZGlldGFyeSBvcHRpb25zIGxpc3Rcblx0XHRcdHJmLmRpZXRhcnkgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdFx0Ly8gZmV0Y2ggc3BlY2lhbCBjaGFyYWN0ZXJzXG5cdFx0XHRyZi5jaGFycyA9IFJlY2lwZS5pbnNlcnRDaGFyO1xuXG5cdFx0XHQvLyBzZXR1cCBzcGVjaWFsIGNoYXJhY3RlcnMgcHJpdmF0ZSB2YXJzXG5cdFx0XHR2YXIgX2xhc3RJbnB1dDtcblx0XHRcdHZhciBfaW5nSW5kZXg7XG5cdFx0XHR2YXIgX2NhcmV0UG9zO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCBzZWxlY3Rpb24gcmFuZ2Vcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gaW5wdXRcblx0XHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25TdGFydCB7bnVtYmVyfVxuXHRcdFx0ICogQHBhcmFtIHNlbGVjdGlvbkVuZCB7bnVtYmVyfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3NldFNlbGVjdGlvblJhbmdlKGlucHV0LCBzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKSB7XG5cdFx0XHRcdGlmIChpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSkge1xuXHRcdFx0XHRcdGlucHV0LmNsaWNrKCk7XG5cdFx0XHRcdFx0aW5wdXQuZm9jdXMoKTtcblx0XHRcdFx0XHRpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChpbnB1dC5jcmVhdGVUZXh0UmFuZ2UpIHtcblx0XHRcdFx0XHR2YXIgcmFuZ2UgPSBpbnB1dC5jcmVhdGVUZXh0UmFuZ2UoKTtcblx0XHRcdFx0XHRyYW5nZS5jb2xsYXBzZSh0cnVlKTtcblx0XHRcdFx0XHRyYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBzZWxlY3Rpb25FbmQpO1xuXHRcdFx0XHRcdHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uU3RhcnQpO1xuXHRcdFx0XHRcdHJhbmdlLnNlbGVjdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IGNhcmV0IHBvc2l0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0XHQgKiBAcGFyYW0gcG9zIHtudW1iZXJ9IGludGVuZGVkIGNhcmV0IHBvc2l0aW9uXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfc2V0Q2FyZXRUb1BvcyhpbnB1dCwgcG9zKSB7XG5cdFx0XHRcdF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgcG9zLCBwb3MpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEtlZXAgdHJhY2sgb2YgY2FyZXQgcG9zaXRpb24gaW4gaW5ncmVkaWVudCBhbW91bnQgdGV4dCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHRcdCAqIEBwYXJhbSBpbmRleCB7bnVtYmVyfVxuXHRcdFx0ICovXG5cdFx0XHRyZi5pbnNlcnRDaGFySW5wdXQgPSBmdW5jdGlvbigkZXZlbnQsIGluZGV4KSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9pbmdJbmRleCA9IGluZGV4O1xuXHRcdFx0XHRcdF9sYXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJyMnICsgJGV2ZW50LnRhcmdldC5pZCk7XG5cdFx0XHRcdFx0X2NhcmV0UG9zID0gX2xhc3RJbnB1dFswXS5zZWxlY3Rpb25TdGFydDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEluc2VydCBjaGFyYWN0ZXIgYXQgbGFzdCBjYXJldCBwb3NpdGlvblxuXHRcdFx0ICogSW4gc3VwcG9ydGVkIGZpZWxkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGNoYXIge3N0cmluZ30gc3BlY2lhbCBjaGFyYWN0ZXJcblx0XHRcdCAqL1xuXHRcdFx0cmYuaW5zZXJ0Q2hhciA9IGZ1bmN0aW9uKGNoYXIpIHtcblx0XHRcdFx0aWYgKF9sYXN0SW5wdXQpIHtcblx0XHRcdFx0XHR2YXIgX3RleHRWYWwgPSByZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10ID09PSB1bmRlZmluZWQgPyAnJyA6IHJmLnJlY2lwZURhdGEuaW5ncmVkaWVudHNbX2luZ0luZGV4XS5hbXQ7XG5cblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10ID0gX3RleHRWYWwuc3Vic3RyaW5nKDAsIF9jYXJldFBvcykgKyBjaGFyICsgX3RleHRWYWwuc3Vic3RyaW5nKF9jYXJldFBvcyk7XG5cblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdF9jYXJldFBvcyA9IF9jYXJldFBvcyArIDE7XG5cdFx0XHRcdFx0XHRfc2V0Q2FyZXRUb1BvcyhfbGFzdElucHV0WzBdLCBfY2FyZXRQb3MpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsZWFyIGNhcmV0IHBvc2l0aW9uIGFuZCBsYXN0IGlucHV0XG5cdFx0XHQgKiBTbyB0aGF0IHNwZWNpYWwgY2hhcmFjdGVycyBkb24ndCBlbmQgdXAgaW4gdW5kZXNpcmVkIGZpZWxkc1xuXHRcdFx0ICovXG5cdFx0XHRyZi5jbGVhckNoYXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0X2luZ0luZGV4ID0gbnVsbDtcblx0XHRcdFx0X2xhc3RJbnB1dCA9IG51bGw7XG5cdFx0XHRcdF9jYXJldFBvcyA9IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEltYWdlIGZpbGUgdXBsb2FkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGltYWdlXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0XHQgKi9cblx0XHRcdC8vcmYub25GaWxlU2VsZWN0ID0gZnVuY3Rpb24oaW1hZ2UsICRldmVudCkge1xuXHRcdFx0Ly9cdGNvbnNvbGUubG9nKCdJbWFnZSB1cGxvYWQ6JywgaW1hZ2UsICRldmVudCk7XG5cdFx0XHQvL1xuXHRcdFx0Ly9cdGlmIChhbmd1bGFyLmlzQXJyYXkoaW1hZ2UpKSB7XG5cdFx0XHQvL1x0XHRpbWFnZSA9IGltYWdlWzBdO1xuXHRcdFx0Ly9cdH1cblx0XHRcdC8vXG5cdFx0XHQvL1x0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0XHQvL1x0cmYudXBsb2FkUHJvZ3Jlc3MgPSAwO1xuXHRcdFx0Ly9cblx0XHRcdC8vXHRyZi51cGxvYWQgPSBVcGxvYWQudXBsb2FkKHtcblx0XHRcdC8vXHRcdHVybDogJy9hcGkvcmVjaXBlL3VwbG9hZC1pbWFnZScsXG5cdFx0XHQvL1x0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdC8vXHRcdGZpZWxkczoge1xuXHRcdFx0Ly9cdFx0XHQvLyBUT0RPOiBhZGQgaW5mb3JtYXRpb24gdHlpbmcgdGhpcyBpbWFnZSB0byBhIHNwZWNpZmljIHJlY2lwZVxuXHRcdFx0Ly9cdFx0fSxcblx0XHRcdC8vXHRcdGZpbGU6IGltYWdlXG5cdFx0XHQvL1x0fSkucHJvZ3Jlc3MoZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdC8vXHRcdHJmLnVwbG9hZFByb2dyZXNzID0gTWF0aC5mbG9vcihldmVudC5sb2FkZWQgLyBldmVudC50b3RhbCk7XG5cdFx0XHQvL1x0XHQkc2NvcGUuJGFwcGx5KCk7XG5cdFx0XHQvL1x0fSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXHRcdFx0Ly9cdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0Ly9cdFx0cmYudXBsb2FkZWRJbWFnZSA9IEpTT04ucGFyc2UoZGF0YSk7XG5cdFx0XHQvL1x0fSkuZXJyb3IoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQvL1x0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHQvL1x0XHRjb25zb2xlLmxvZygnRXJyb3IgdXBsb2FkaW5nIGZpbGU6ICcgKyBlcnIubWVzc2FnZSB8fCBlcnIpO1xuXHRcdFx0Ly9cdH0pXG5cdFx0XHQvL307XG5cblxuXG5cblxuXHRcdFx0cmYudXBsb2FkID0gZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0aWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBmaWxlID0gZmlsZXNbaV07XG5cdFx0XHRcdFx0XHRVcGxvYWQudXBsb2FkKHtcblx0XHRcdFx0XHRcdFx0dXJsOiAnL2FwaS9yZWNpcGUvdXBsb2FkLWltYWdlJyxcblx0XHRcdFx0XHRcdFx0ZmllbGRzOiB7XG5cblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0ZmlsZTogZmlsZVxuXHRcdFx0XHRcdFx0fSkucHJvZ3Jlc3MoZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwcm9ncmVzc1BlcmNlbnRhZ2UgPSBwYXJzZUludCgxMDAuMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWwpO1xuXHRcdFx0XHRcdFx0XHRyZi51cGxvYWRQcm9ncmVzcyA9IHByb2dyZXNzUGVyY2VudGFnZSArICclICcgKyBldnQuY29uZmlnLmZpbGUubmFtZTtcblx0XHRcdFx0XHRcdH0pLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJmLnVwbG9hZEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRyZi51cGxvYWRlZEltYWdlID0gJy91cGxvYWRzL2ltYWdlcy8nICsgZGF0YS5maWxlbmFtZTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblxuXG5cblxuXG5cdFx0XHQvLyBjcmVhdGUgbWFwIG9mIHRvdWNoZWQgdGFnc1xuXHRcdFx0cmYudGFnTWFwID0ge307XG5cdFx0XHRpZiAoX2lzRWRpdCAmJiByZi5yZWNpcGVEYXRhLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChyZi5yZWNpcGVEYXRhLnRhZ3MsIGZ1bmN0aW9uKHRhZywgaSkge1xuXHRcdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQWRkIC8gcmVtb3ZlIHRhZ1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSB0YWcge3N0cmluZ30gdGFnIG5hbWVcblx0XHRcdCAqL1xuXHRcdFx0cmYuYWRkUmVtb3ZlVGFnID0gZnVuY3Rpb24odGFnKSB7XG5cdFx0XHRcdHZhciBfYWN0aXZlVGFnSW5kZXggPSByZi5yZWNpcGVEYXRhLnRhZ3MuaW5kZXhPZih0YWcpO1xuXG5cdFx0XHRcdGlmIChfYWN0aXZlVGFnSW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdC8vIHRhZyBleGlzdHMgaW4gbW9kZWwsIHR1cm4gaXQgb2ZmXG5cdFx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnNwbGljZShfYWN0aXZlVGFnSW5kZXgsIDEpO1xuXHRcdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdGFnIGRvZXMgbm90IGV4aXN0IGluIG1vZGVsLCB0dXJuIGl0IG9uXG5cdFx0XHRcdFx0cmYucmVjaXBlRGF0YS50YWdzLnB1c2godGFnKTtcblx0XHRcdFx0XHRyZi50YWdNYXBbdGFnXSA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xlYW4gZW1wdHkgaXRlbXMgb3V0IG9mIGFycmF5IGJlZm9yZSBzYXZpbmdcblx0XHRcdCAqIEluZ3JlZGllbnRzIG9yIERpcmVjdGlvbnNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWxOYW1lIHtzdHJpbmd9IGluZ3JlZGllbnRzIC8gZGlyZWN0aW9uc1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NsZWFuRW1wdGllcyhtb2RlbE5hbWUpIHtcblx0XHRcdFx0dmFyIF9hcnJheSA9IHJmLnJlY2lwZURhdGFbbW9kZWxOYW1lXTtcblx0XHRcdFx0dmFyIF9jaGVjayA9IG1vZGVsTmFtZSA9PT0gJ2luZ3JlZGllbnRzJyA/ICdpbmdyZWRpZW50JyA6ICdzdGVwJztcblxuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goX2FycmF5LCBmdW5jdGlvbihvYmosIGkpIHtcblx0XHRcdFx0XHRpZiAoISFvYmpbX2NoZWNrXSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdF9hcnJheS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNldCBzYXZlIGJ1dHRvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNldFNhdmVCdG4oKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gZmFsc2U7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGUgUmVjaXBlJyA6ICdTYXZlIFJlY2lwZSc7XG5cdFx0XHR9XG5cblx0XHRcdF9yZXNldFNhdmVCdG4oKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZWNpcGUgY3JlYXRlZCBvciBzYXZlZCBzdWNjZXNzZnVsbHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlIHtwcm9taXNlfSBpZiBlZGl0aW5nIGV2ZW50XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZWQocmVjaXBlKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZWQhJyA6ICdTYXZlZCEnO1xuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBHbyB0byBuZXcgc2x1ZyAoaWYgbmV3KSBvciB1cGRhdGVkIHNsdWcgKGlmIHNsdWcgY2hhbmdlZClcblx0XHRcdFx0ICpcblx0XHRcdFx0ICogQHByaXZhdGVcblx0XHRcdFx0ICovXG5cdFx0XHRcdGZ1bmN0aW9uIF9nb1RvTmV3U2x1ZygpIHtcblx0XHRcdFx0XHR2YXIgX3BhdGggPSAhX2lzRWRpdCA/IHJlY2lwZS5zbHVnIDogcmYucmVjaXBlRGF0YS5zbHVnICsgJy9lZGl0JztcblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvcmVjaXBlLycgKyBfcGF0aCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIV9pc0VkaXQgfHwgX2lzRWRpdCAmJiBfb3JpZ2luYWxTbHVnICE9PSByZi5yZWNpcGVEYXRhLnNsdWcpIHtcblx0XHRcdFx0XHQkdGltZW91dChfZ29Ub05ld1NsdWcsIDEwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDIwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVjaXBlIG5vdCBzYXZlZCAvIGNyZWF0ZWQgZHVlIHRvIGVycm9yXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVyciB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlRXJyb3IoZXJyKSB7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0XHRyZi5zYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDQwMDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNhdmUgcmVjaXBlXG5cdFx0XHQgKi9cblx0XHRcdHJmLnNhdmVSZWNpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0aW5nLi4uJyA6ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIHByZXAgZGF0YSBmb3Igc2F2aW5nXG5cdFx0XHRcdHJmLnJlY2lwZURhdGEuc2x1ZyA9IFNsdWcuc2x1Z2lmeShyZi5yZWNpcGVEYXRhLm5hbWUpO1xuXHRcdFx0XHRfY2xlYW5FbXB0aWVzKCdpbmdyZWRpZW50cycpO1xuXHRcdFx0XHRfY2xlYW5FbXB0aWVzKCdkaXJlY3Rpb25zJyk7XG5cblx0XHRcdFx0Ly8gY2FsbCBBUElcblx0XHRcdFx0aWYgKCFfaXNFZGl0KSB7XG5cdFx0XHRcdFx0cmVjaXBlRGF0YS5jcmVhdGVSZWNpcGUocmYucmVjaXBlRGF0YSlcblx0XHRcdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVjaXBlRGF0YS51cGRhdGVSZWNpcGUocmYucmVjaXBlLl9pZCwgcmYucmVjaXBlRGF0YSlcblx0XHRcdFx0XHRcdC50aGVuKF9yZWNpcGVTYXZlZCwgX3JlY2lwZVNhdmVFcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmVjaXBlRm9ybUxpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlRm9ybUxpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBzZXQgdXAgJHNjb3BlIG9iamVjdCBmb3IgbmFtZXNwYWNpbmdcblx0XHRcdCRzY29wZS5yZmwgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgbmV3IGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqIEZvY3VzIHRoZSBuZXdlc3QgaW5wdXQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9IGNsaWNrIGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLmFkZEl0ZW0gPSBmdW5jdGlvbigkZXZlbnQsIG1vZGVsKSB7XG5cdFx0XHRcdHZhciBfbmV3SXRlbSA9IHtcblx0XHRcdFx0XHRpZDogbW9kZWwubGVuZ3RoICsgMVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdG1vZGVsLnB1c2goX25ld0l0ZW0pO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBfbmV3ZXN0SW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkucGFyZW50KCdwJykucHJldignLmxhc3QnKS5maW5kKCdpbnB1dCcpLmVxKDApO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdF9uZXdlc3RJbnB1dC5mb2N1cygpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVtb3ZlIGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIGkge2luZGV4fVxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUucmZsLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihtb2RlbCwgaSkge1xuXHRcdFx0XHRtb2RlbC5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZTogJz0nLFxuXHRcdFx0XHR1c2VySWQ6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVGb3JtTGlua1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlc0xpc3QnLCByZWNpcGVzTGlzdCk7XG5cblx0cmVjaXBlc0xpc3QuJGluamVjdCA9IFsnUmVjaXBlJ107XG5cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3QoUmVjaXBlKSB7XG5cblx0XHRyZWNpcGVzTGlzdEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVzTGlzdEN0cmwoJHNjb3BlKSB7XG5cdFx0XHQvLyBjb250cm9sbGVyQXMgdmlldyBtb2RlbFxuXHRcdFx0dmFyIHJsID0gdGhpcztcblxuXHRcdFx0Ly8gYnVpbGQgb3V0IHRoZSB0b3RhbCB0aW1lIGFuZCBudW1iZXIgb2YgaW5ncmVkaWVudHMgZm9yIHNvcnRpbmdcblx0XHRcdHZhciBfd2F0Y2hSZWNpcGVzID0gJHNjb3BlLiR3YXRjaCgncmwucmVjaXBlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmwucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdFx0XHRyZWNpcGUudG90YWxUaW1lID0gKHJlY2lwZS5jb29rVGltZSA/IHJlY2lwZS5jb29rVGltZSA6IDApICsgKHJlY2lwZS5wcmVwVGltZSA/IHJlY2lwZS5wcmVwVGltZSA6IDApO1xuXHRcdFx0XHRcdFx0cmVjaXBlLm5JbmcgPSByZWNpcGUuaW5ncmVkaWVudHMubGVuZ3RoO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIGRlcmVnaXN0ZXIgdGhlIHdhdGNoXG5cdFx0XHRcdFx0X3dhdGNoUmVjaXBlcygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gY29uZGl0aW9uYWxseSBzaG93IGNhdGVnb3J5IC8gdGFnIGZpbHRlcnNcblx0XHRcdC8vIGFsd2F5cyBzaG93IHNwZWNpYWwgZGlldCBmaWx0ZXJcblx0XHRcdGlmIChybC5jYXRlZ29yeUZpbHRlciA9PT0gJ3RydWUnKSB7XG5cdFx0XHRcdHJsLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblx0XHRcdFx0cmwuc2hvd0NhdGVnb3J5RmlsdGVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChybC50YWdGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0XHRybC50YWdzID0gUmVjaXBlLnRhZ3M7XG5cdFx0XHRcdHJsLnNob3dUYWdGaWx0ZXIgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmwuc3BlY2lhbERpZXQgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdFx0Ly8gc2V0IGFsbCBmaWx0ZXJzIHRvIGVtcHR5XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzID0ge307XG5cblx0XHRcdGZ1bmN0aW9uIF9yZXNldEZpbHRlclByZWRpY2F0ZXMoKSB7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuY2F0ID0gJyc7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMudGFnID0gJyc7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuZGlldCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZXQgdXAgc29ydCBwcmVkaWNhdGUgYW5kIHJldmVyc2Fsc1xuXHRcdFx0cmwuc29ydFByZWRpY2F0ZSA9ICduYW1lJztcblxuXHRcdFx0cmwucmV2ZXJzZU9iaiA9IHtcblx0XHRcdFx0bmFtZTogZmFsc2UsXG5cdFx0XHRcdHRvdGFsVGltZTogZmFsc2UsXG5cdFx0XHRcdG5Jbmc6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0dmFyIF9sYXN0U29ydGVkQnkgPSAnbmFtZSc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIHNvcnQgYXNjL2Rlc2Ncblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcHJlZGljYXRlIHtzdHJpbmd9XG5cdFx0XHQgKi9cblx0XHRcdHJsLnRvZ2dsZVNvcnQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcblx0XHRcdFx0aWYgKF9sYXN0U29ydGVkQnkgPT09IHByZWRpY2F0ZSkge1xuXHRcdFx0XHRcdHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXSA9ICFybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmwucmV2ZXJzZSA9IHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdFx0X2xhc3RTb3J0ZWRCeSA9IHByZWRpY2F0ZTtcblx0XHRcdH07XG5cblx0XHRcdC8vIG51bWJlciBvZiByZWNpcGVzIHRvIHNob3cvYWRkIGluIGEgc2V0XG5cdFx0XHR2YXIgX3Jlc3VsdHNTZXQgPSAxNTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNldCByZXN1bHRzIHNob3dpbmcgdG8gaW5pdGlhbCBkZWZhdWx0IG9uIHNlYXJjaC9maWx0ZXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzZXRSZXN1bHRzU2hvd2luZygpIHtcblx0XHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gX3Jlc3VsdHNTZXQ7XG5cdFx0XHR9XG5cdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIExvYWQgTW9yZSByZXN1bHRzXG5cdFx0XHQgKi9cblx0XHRcdHJsLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IHJsLm5SZXN1bHRzU2hvd2luZyArPSBfcmVzdWx0c1NldDtcblx0XHRcdH07XG5cblx0XHRcdC8vIHdhdGNoIHNlYXJjaCBxdWVyeSBhbmQgaWYgaXQgZXhpc3RzLCBjbGVhciBmaWx0ZXJzIGFuZCByZXNldCByZXN1bHRzIHNob3dpbmdcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLnF1ZXJ5JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKCEhcmwucXVlcnkpIHtcblx0XHRcdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHdhdGNoIGZpbHRlcnMgYW5kIGlmIGFueSBvZiB0aGVtIGNoYW5nZSwgcmVzZXQgdGhlIHJlc3VsdHMgc2hvd2luZ1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgncmwuZmlsdGVyUHJlZGljYXRlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmICghIW5ld1ZhbCAmJiBuZXdWYWwgIT09IG9sZFZhbCkge1xuXHRcdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgX29wZW5GaWx0ZXJzT25sb2FkID0gJHNjb3BlLiR3YXRjaCgncmwub3BlbkZpbHRlcnMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gbmV3VmFsID09PSAndHJ1ZSc7XG5cdFx0XHRcdFx0X29wZW5GaWx0ZXJzT25sb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBzZWFyY2gvZmlsdGVyIHNlY3Rpb24gb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0cmwudG9nZ2xlU2VhcmNoRmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSAhcmwuc2hvd1NlYXJjaEZpbHRlcjtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xlYXIgc2VhcmNoIHF1ZXJ5IGFuZCBhbGwgZmlsdGVyc1xuXHRcdFx0ICovXG5cdFx0XHRybC5jbGVhclNlYXJjaEZpbHRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRcdHJsLnF1ZXJ5ID0gJyc7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNob3cgbnVtYmVyIG9mIGN1cnJlbnRseSBhY3RpdmUgc2VhcmNoICsgZmlsdGVyIGl0ZW1zXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9XG5cdFx0XHQgKiBAcGFyYW0gZmlsdGVyc09iaiB7b2JqZWN0fVxuXHRcdFx0ICogQHJldHVybnMge251bWJlcn1cblx0XHRcdCAqL1xuXHRcdFx0cmwuYWN0aXZlU2VhcmNoRmlsdGVycyA9IGZ1bmN0aW9uKHF1ZXJ5LCBmaWx0ZXJzT2JqKSB7XG5cdFx0XHRcdHZhciB0b3RhbCA9IDA7XG5cblx0XHRcdFx0aWYgKHF1ZXJ5KSB7XG5cdFx0XHRcdFx0dG90YWwgPSB0b3RhbCArPSAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzT2JqLCBmdW5jdGlvbihmaWx0ZXIpIHtcblx0XHRcdFx0XHRpZiAoZmlsdGVyKSB7XG5cdFx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gdG90YWw7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJlY2lwZXNMaXN0TGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGF0dHJzJywgJyRlbGVtJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVzTGlzdExpbmsoJHNjb3BlLCAkYXR0cnMsICRlbGVtKSB7XG5cdFx0XHQkc2NvcGUucmxsID0ge307XG5cblx0XHRcdC8vIHdhdGNoIHRoZSBjdXJyZW50bHkgdmlzaWJsZSBudW1iZXIgb2YgcmVjaXBlcyB0byBkaXNwbGF5IGEgY291bnRcblx0XHRcdCRzY29wZS4kd2F0Y2goXG5cdFx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiBhbmd1bGFyLmVsZW1lbnQoJy5yZWNpcGVzTGlzdC1saXN0LWl0ZW0nKS5sZW5ndGg7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdFx0JHNjb3BlLnJsbC5kaXNwbGF5ZWRSZXN1bHRzID0gbmV3VmFsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGVzOiAnPScsXG5cdFx0XHRcdG9wZW5GaWx0ZXJzOiAnQCcsXG5cdFx0XHRcdGN1c3RvbUxhYmVsczogJ0AnLFxuXHRcdFx0XHRjYXRlZ29yeUZpbHRlcjogJ0AnLFxuXHRcdFx0XHR0YWdGaWx0ZXI6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcmVjaXBlc0xpc3QudHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlc0xpc3RDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAncmwnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IHJlY2lwZXNMaXN0TGlua1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZpbHRlcigndHJpbVN0cicsIHRyaW1TdHIpO1xuXG5cdGZ1bmN0aW9uIHRyaW1TdHIoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHN0ciwgY2hhcnMpIHtcblx0XHRcdHZhciB0cmltbWVkU3RyID0gc3RyO1xuXHRcdFx0dmFyIF9jaGFycyA9IGNoYXJzID09PSB1bmRlZmluZWQgPyA1MCA6IGNoYXJzO1xuXG5cdFx0XHRpZiAoc3RyLmxlbmd0aCA+IF9jaGFycykge1xuXHRcdFx0XHR0cmltbWVkU3RyID0gc3RyLnN1YnN0cigwLCBfY2hhcnMpICsgJy4uLic7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cmltbWVkU3RyO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LnNlcnZpY2UoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gdXNlckRhdGEoJGh0dHApIHtcblx0XHQvKipcblx0XHQgKiBHZXQgcmVjaXBlIGF1dGhvcidzIGJhc2ljIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSBNb25nb0RCIElEIG9mIHVzZXJcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldEF1dGhvciA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VyLycgKyBpZClcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBjdXJyZW50IHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFVzZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL21lJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMudXBkYXRlVXNlciA9IGZ1bmN0aW9uKHByb2ZpbGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9tZScsIHByb2ZpbGVEYXRhKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGFsbCB1c2VycyAoYWRtaW4gYXV0aG9yaXplZCBvbmx5KVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRBbGxVc2VycyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIEZvciBldmVudHMgYmFzZWQgb24gdmlld3BvcnQgc2l6ZSAtIHVwZGF0ZXMgYXMgdmlld3BvcnQgaXMgcmVzaXplZFxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ3ZpZXdTd2l0Y2gnLCB2aWV3U3dpdGNoKTtcblxuXHR2aWV3U3dpdGNoLiRpbmplY3QgPSBbJ21lZGlhQ2hlY2snLCAnTVEnLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiB2aWV3U3dpdGNoKG1lZGlhQ2hlY2ssIE1RLCAkdGltZW91dCkge1xuXG5cdFx0dmlld1N3aXRjaExpbmsuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cblx0XHQvKipcblx0XHQgKiB2aWV3U3dpdGNoIGRpcmVjdGl2ZSBsaW5rIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdmlld1N3aXRjaExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLnZzID0ge307XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlbnRlciBtZWRpYSBxdWVyeVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlckZuKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHNjb3BlLnZzLnZpZXdmb3JtYXQgPSAnc21hbGwnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGV4aXQgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdEZuKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHNjb3BlLnZzLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5pdGlhbGl6ZSBtZWRpYUNoZWNrXG5cdFx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJGbixcblx0XHRcdFx0ZXhpdDogX2V4aXRGblxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogdmlld1N3aXRjaExpbmtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBoZWFkZXJDdHJsKTtcclxuXHJcblx0aGVhZGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ2xvY2FsRGF0YScsICckYXV0aCcsICd1c2VyRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBoZWFkZXJDdHJsKCRzY29wZSwgJGxvY2F0aW9uLCBsb2NhbERhdGEsICRhdXRoLCB1c2VyRGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRoZWFkZXIubG9jYWxEYXRhID0gZGF0YTtcclxuXHRcdH1cclxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlclxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0XHRoZWFkZXIudXNlciA9IGRhdGE7XHJcblx0XHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IGRhdGEuaXNBZG1pbjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkLCBnZXQgdXNlciBkYXRhXHJcblx0XHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBoZWFkZXIudXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRfY2hlY2tVc2VyQWRtaW4oKTtcclxuXHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2hlY2tVc2VyQWRtaW4pO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cclxuXHRcdCAqIE5lZWRzIHRvIGJlIGEgZnVuY3Rpb24gc28gaXQgaXMgcmUtZXhlY3V0ZWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbSB3aGVuICcvJyBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBmdW5jdGlvbihwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBmdW5jdGlvbihwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJ21lZGlhQ2hlY2snLCAnTVEnLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKG1lZGlhQ2hlY2ssIE1RLCAkdGltZW91dCkge1xuXG5cdFx0bmF2Q29udHJvbExpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHR2YXIgX2JvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKSxcblx0XHRcdFx0X25hdk9wZW47XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1vcGVuJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBlbnRlcmluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIENsb3NlIG5hdiBhbmQgc2V0IHVwIG1lbnUgdG9nZ2xpbmcgZnVuY3Rpb25hbGl0eVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIFRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdFx0XHRfb3Blbk5hdigpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jbG9zZU5hdik7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0X2JvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblx0fVxuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnbG9jYWxEYXRhJywgJ3JlY2lwZURhdGEnLCAnUmVjaXBlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbiddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybChQYWdlLCBsb2NhbERhdGEsIHJlY2lwZURhdGEsIFJlY2lwZSwgJGF1dGgsIHVzZXJEYXRhLCAkbG9jYXRpb24pIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHRQYWdlLnNldFRpdGxlKCdBbGwgUmVjaXBlcycpO1xyXG5cclxuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XHJcblxyXG5cdFx0aG9tZS50YWJzID0gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1JlY2lwZSBCb3hlcycsXHJcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94ZXMnXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnU2VhcmNoIC8gQnJvd3NlIEFsbCcsXHJcblx0XHRcdFx0cXVlcnk6ICdzZWFyY2gtYnJvd3NlLWFsbCdcclxuXHRcdFx0fVxyXG5cdFx0XTtcclxuXHRcdGhvbWUuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3JlY2lwZS1ib3hlcyc7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGFuZ2UgdGFiXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cclxuXHRcdCAqL1xyXG5cdFx0aG9tZS5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xyXG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xyXG5cdFx0XHRob21lLmN1cnJlbnRUYWIgPSBxdWVyeTtcclxuXHRcdH07XHJcblxyXG5cdFx0aG9tZS5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XHJcblx0XHRob21lLnRhZ3MgPSBSZWNpcGUudGFncztcclxuXHJcblx0XHQvLyBidWlsZCBoYXNobWFwIG9mIGNhdGVnb3JpZXNcclxuXHRcdGhvbWUubWFwQ2F0ZWdvcmllcyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBob21lLmNhdGVnb3JpZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW2hvbWUuY2F0ZWdvcmllc1tpXV0gPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgdGFnc1xyXG5cdFx0aG9tZS5tYXBUYWdzID0ge307XHJcblx0XHRmb3IgKHZhciBuID0gMDsgbiA8IGhvbWUudGFncy5sZW5ndGg7IG4rKykge1xyXG5cdFx0XHRob21lLm1hcFRhZ3NbaG9tZS50YWdzW25dXSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgbG9jYWwgZGF0YSBmcm9tIHN0YXRpYyBKU09OXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEgKHN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5zKVxyXG5cdFx0ICogQHJldHVybnMge29iamVjdH0gZGF0YVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUubG9jYWxEYXRhID0gZGF0YTtcclxuXHRcdH1cclxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnJlY2lwZXMgPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gY291bnQgbnVtYmVyIG9mIHJlY2lwZXMgcGVyIGNhdGVnb3J5IGFuZCB0YWdcclxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGhvbWUucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW3JlY2lwZS5jYXRlZ29yeV0gKz0gMTtcclxuXHJcblx0XHRcdFx0Zm9yICh2YXIgdCA9IDA7IHQgPCByZWNpcGUudGFncy5sZW5ndGg7IHQrKykge1xyXG5cdFx0XHRcdFx0aG9tZS5tYXBUYWdzW3JlY2lwZS50YWdzW3RdXSArPSAxO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxyXG5cdFx0XHQudGhlbihfcHVibGljUmVjaXBlc1N1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGdldHRpbmcgdXNlclxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnVzZXIgPSBkYXRhO1xyXG5cdFx0XHRob21lLndlbGNvbWVNc2cgPSAnSGVsbG8sICcgKyBob21lLnVzZXIuZGlzcGxheU5hbWUgKyAnISBXYW50IHRvIDxhIGhyZWY9XCIvbXktcmVjaXBlcz92aWV3PW5ldy1yZWNpcGVcIj5hZGQgYSBuZXcgcmVjaXBlPC9hPj8nO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgZ2V0IHVzZXIgZGF0YVxyXG5cdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpICYmIGhvbWUudXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XHJcblx0XHR9IGVsc2UgaWYgKCEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xyXG5cdFx0XHRob21lLndlbGNvbWVNc2cgPSAnV2VsY29tZSB0byA8c3Ryb25nPnJCb3g8L3N0cm9uZz4hIEJyb3dzZSB0aHJvdWdoIHRoZSBwdWJsaWMgcmVjaXBlIGJveCBvciA8YSBocmVmPVwiL2xvZ2luXCI+TG9naW48L2E+IHRvIGZpbGUgb3IgY29udHJpYnV0ZSByZWNpcGVzLic7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuXHRMb2dpbkN0cmwuJGluamVjdCA9IFsnUGFnZScsICckYXV0aCcsICdPQVVUSCcsICckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnXTtcblxuXHRmdW5jdGlvbiBMb2dpbkN0cmwoUGFnZSwgJGF1dGgsIE9BVVRILCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIGxvY2FsRGF0YSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbG9naW4gPSB0aGlzO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTG9naW4nKTtcblxuXHRcdGxvZ2luLmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0bG9naW4uaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIGxvY2FsIGRhdGEgc3VjY2Vzc2Z1bFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0pTT059XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRsb2dpbi5sb2NhbERhdGEgPSBkYXRhO1xuXHRcdH1cblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogQXV0aGVudGljYXRlIHRoZSB1c2VyIHZpYSBPYXV0aCB3aXRoIHRoZSBzcGVjaWZpZWQgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlciAtICh0d2l0dGVyLCBmYWNlYm9vaywgZ2l0aHViLCBnb29nbGUpXG5cdFx0ICovXG5cdFx0bG9naW4uYXV0aGVudGljYXRlID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IHRydWU7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcblx0XHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aFN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCRyb290U2NvcGUuYXV0aFBhdGgpIHtcblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgkcm9vdFNjb3BlLmF1dGhQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGF1dGhlbnRpY2F0aW5nXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhDYXRjaChyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gJ2Vycm9yJztcblx0XHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChfYXV0aENhdGNoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXG5cdFx0ICovXG5cdFx0bG9naW4ubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdNeVJlY2lwZXNDdHJsJywgTXlSZWNpcGVzQ3RybCk7XG5cblx0TXlSZWNpcGVzQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJ21lZGlhQ2hlY2snLCAnJHNjb3BlJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gTXlSZWNpcGVzQ3RybChQYWdlLCAkYXV0aCwgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRsb2NhdGlvbiwgbWVkaWFDaGVjaywgJHNjb3BlLCBNUSwgJHRpbWVvdXQpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIG15UmVjaXBlcyA9IHRoaXM7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ015IFJlY2lwZXMnKTtcblxuXHRcdG15UmVjaXBlcy50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3gnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ2ZpbGVkLXJlY2lwZXMnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ25ldy1yZWNpcGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3JlY2lwZS1ib3gnO1xuXG5cdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRlbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnUmVjaXBlIEJveCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdOZXcgUmVjaXBlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0ZXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnTXkgUmVjaXBlIEJveCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCBSZWNpcGVzJztcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ0FkZCBOZXcgUmVjaXBlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdG15UmVjaXBlcy5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRteVJlY2lwZXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdG15UmVjaXBlcy51c2VyID0gZGF0YTtcblx0XHRcdHZhciBzYXZlZFJlY2lwZXNPYmogPSB7c2F2ZWRSZWNpcGVzOiBkYXRhLnNhdmVkUmVjaXBlc307XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3Mgc2F2ZWQgcmVjaXBlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZWNpcGVzIHtwcm9taXNlfS5kYXRhXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZWRTdWNjZXNzKHJlY2lwZXMpIHtcblx0XHRcdFx0bXlSZWNpcGVzLmZpbGVkUmVjaXBlcyA9IHJlY2lwZXM7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmdldEZpbGVkUmVjaXBlcyhzYXZlZFJlY2lwZXNPYmopXG5cdFx0XHRcdC50aGVuKF9maWxlZFN1Y2Nlc3MpO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRteVJlY2lwZXMucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0TXlSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0UmVjaXBlQ3RybCcsIEVkaXRSZWNpcGVDdHJsKTtcblxuXHRFZGl0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIEVkaXRSZWNpcGVDdHJsKFBhZ2UsICRhdXRoLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBlZGl0ID0gdGhpcztcblx0XHR2YXIgX3JlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1Zztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCBSZWNpcGUnKTtcblxuXHRcdGVkaXQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0VkaXQgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdlZGl0J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0RlbGV0ZSBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2RlbGV0ZSdcblx0XHRcdH1cblx0XHRdO1xuXHRcdGVkaXQuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ2VkaXQnO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRlZGl0LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0ZWRpdC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRlZGl0LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC51c2VyID0gZGF0YTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRlZGl0Lm9yaWdpbmFsTmFtZSA9IGVkaXQucmVjaXBlLm5hbWU7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFZGl0ICcgKyBlZGl0Lm9yaWdpbmFsTmFtZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKGVycikge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSAnZXJyb3InO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRXJyb3InKTtcblx0XHRcdGVkaXQuZXJyb3JNc2cgPSBlcnIuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZGVsZXRlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXREZWxldGVCdG4oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSBmYWxzZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGUgUmVjaXBlJztcblx0XHR9XG5cblx0XHRfcmVzZXREZWxldGVCdG4oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBhZnRlciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gdHJ1ZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGVkISc7XG5cblx0XHRcdGZ1bmN0aW9uIF9nb1RvUmVjaXBlcygpIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9teS1yZWNpcGVzJyk7XG5cdFx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2dvVG9SZWNpcGVzLCAxNTAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZUVycm9yKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gJ2Vycm9yJztcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdFcnJvciBkZWxldGluZyEnO1xuXG5cdFx0XHQkdGltZW91dChfcmVzZXREZWxldGVCdG4sIDI1MDApO1xuXHRcdH1cblxuXHRcdGVkaXQuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRpbmcuLi4nO1xuXHRcdFx0cmVjaXBlRGF0YS5kZWxldGVSZWNpcGUoZWRpdC5yZWNpcGUuX2lkKVxuXHRcdFx0XHQudGhlbihfZGVsZXRlU3VjY2VzcywgX2RlbGV0ZUVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVDdHJsJywgUmVjaXBlQ3RybCk7XG5cblx0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlQ3RybChQYWdlLCAkYXV0aCwgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmVjaXBlID0gdGhpcztcblx0XHR2YXIgcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnUmVjaXBlJyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSB1c2VyIGluZm9cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUudXNlciA9IGRhdGE7XG5cblx0XHRcdC8vIGxvZ2dlZCBpbiB1c2VycyBjYW4gZmlsZSByZWNpcGVzXG5cdFx0XHRyZWNpcGUuZmlsZVRleHQgPSAnRmlsZSB0aGlzIHJlY2lwZSc7XG5cdFx0XHRyZWNpcGUudW5maWxlVGV4dCA9ICdSZW1vdmUgZnJvbSBGaWxlZCBSZWNpcGVzJztcblx0XHR9XG5cdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gcmVjaXBlIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyZWNpcGUucmVjaXBlLm5hbWUpO1xuXHRcdFx0Y29uc29sZS5sb2cocmVjaXBlLnJlY2lwZSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyBhdXRob3IgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfSBhdXRob3IgcGljdHVyZSwgZGlzcGxheU5hbWVcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRob3JTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0cmVjaXBlLmF1dGhvciA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHR1c2VyRGF0YS5nZXRBdXRob3IocmVjaXBlLnJlY2lwZS51c2VySWQpXG5cdFx0XHRcdC50aGVuKF9hdXRob3JTdWNjZXNzKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXMge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IocmVzKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRyZWNpcGUuZXJyb3JNc2cgPSByZXMuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShyZWNpcGVTbHVnKVxuXHRcdFx0LnRoZW4oX3JlY2lwZVN1Y2Nlc3MsIF9yZWNpcGVFcnJvcik7XG5cblx0XHQvKipcblx0XHQgKiBGaWxlIG9yIHVuZmlsZSB0aGlzIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZUlkIHtzdHJpbmd9IElEIG9mIHJlY2lwZSB0byBzYXZlXG5cdFx0ICovXG5cdFx0cmVjaXBlLmZpbGVSZWNpcGUgPSBmdW5jdGlvbihyZWNpcGVJZCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHRyZWNpcGUuYXBpTXNnID0gZGF0YS5hZGRlZCA/ICdSZWNpcGUgc2F2ZWQhJyA6ICdSZWNpcGUgcmVtb3ZlZCEnO1xuXHRcdFx0XHRyZWNpcGUuZmlsZWQgPSBkYXRhLmFkZGVkO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlRXJyb3IocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdHJlY2lwZURhdGEuZmlsZVJlY2lwZShyZWNpcGVJZClcblx0XHRcdFx0LnRoZW4oX2ZpbGVTdWNjZXNzLCBfZmlsZUVycm9yKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCdtaW5Ub0gnLCBtaW5Ub0gpO1xuXG5cdGZ1bmN0aW9uIG1pblRvSCgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24obWluKSB7XG5cdFx0XHR2YXIgX2hvdXIgPSA2MDtcblx0XHRcdHZhciBfbWluID0gbWluICogMTtcblx0XHRcdHZhciBfZ3RIb3VyID0gX21pbiAvIF9ob3VyID49IDE7XG5cdFx0XHR2YXIgdGltZVN0ciA9IG51bGw7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2V0IG1pbnV0ZS9zIHRleHQgZnJvbSBtaW51dGVzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1pbnV0ZXMge251bWJlcn1cblx0XHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIG1pblRleHQobWludXRlcykge1xuXHRcdFx0XHRpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyA9PT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyAhPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZXMnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfZ3RIb3VyKSB7XG5cdFx0XHRcdHZhciBoUGx1c01pbiA9IF9taW4gJSBfaG91cjtcblx0XHRcdFx0dmFyIF9oYXNNaW51dGVzID0gaFBsdXNNaW4gIT09IDA7XG5cdFx0XHRcdHZhciBob3VycyA9IE1hdGguZmxvb3IoX21pbiAvIF9ob3VyKTtcblx0XHRcdFx0dmFyIGhvdXJzVGV4dCA9IGhvdXJzID09PSAxID8gJyBob3VyJyA6ICcgaG91cnMnO1xuXHRcdFx0XHR2YXIgbWludXRlcyA9IF9oYXNNaW51dGVzID8gJywgJyArIGhQbHVzTWluICsgbWluVGV4dChoUGx1c01pbikgOiAnJztcblxuXHRcdFx0XHR0aW1lU3RyID0gaG91cnMgKyBob3Vyc1RleHQgKyBtaW51dGVzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIG5vSE1pblRleHQgPSBfbWluID09PSAxID8gJyBtaW51dGUnIDogJyBtaW51dGVzJztcblx0XHRcdFx0dGltZVN0ciA9IF9taW4gKyBub0hNaW5UZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGltZVN0cjtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0F1dGhvckN0cmwnLCBSZWNpcGVzQXV0aG9yQ3RybCk7XG5cblx0UmVjaXBlc0F1dGhvckN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNBdXRob3JDdHJsKFBhZ2UsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2FpZCA9ICRyb3V0ZVBhcmFtcy51c2VySWQ7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0F1dGhvcic7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIGJ5ICcgKyByYS5hdXRob3IuZGlzcGxheU5hbWU7XG5cdFx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0QXV0aG9yKF9haWQpXG5cdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0QXV0aG9yUmVjaXBlcyhfYWlkKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLCBSZWNpcGVzQ2F0ZWdvcnlDdHJsKTtcblxuXHRSZWNpcGVzQ2F0ZWdvcnlDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQ2F0ZWdvcnlDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfY2F0ID0gJHJvdXRlUGFyYW1zLmNhdGVnb3J5O1xuXHRcdHZhciBfY2F0VGl0bGUgPSBfY2F0LnN1YnN0cmluZygwLDEpLnRvTG9jYWxlVXBwZXJDYXNlKCkgKyBfY2F0LnN1YnN0cmluZygxKTtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQ2F0ZWdvcnknO1xuXHRcdHJhLmhlYWRpbmcgPSBfY2F0VGl0bGUgKyAncyc7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ2ZhbHNlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIGNhdEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUuY2F0ZWdvcnkgPT0gX2NhdFRpdGxlKSB7XG5cdFx0XHRcdFx0Y2F0QXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSBjYXRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc1RhZ0N0cmwnLCBSZWNpcGVzVGFnQ3RybCk7XG5cblx0UmVjaXBlc1RhZ0N0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNUYWdDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfdGFnID0gJHJvdXRlUGFyYW1zLnRhZztcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzVGFnJztcblxuXHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyB0YWdnZWQgXCInICsgX3RhZyArICdcIic7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAnZmFsc2UnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHRhZ2dlZEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUudGFncy5pbmRleE9mKF90YWcpID4gLTEpIHtcblx0XHRcdFx0XHR0YWdnZWRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IHRhZ2dlZEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
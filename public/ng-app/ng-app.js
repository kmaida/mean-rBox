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
			'vegetarian',
			'vegan',
			'gluten-free'
		];

		var insertChar = [
			'¼',
			'½',
			'¾',
			'º'
		];

		return {
			dietary: dietary,
			insertChar: insertChar
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
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout'];

	function recipeForm(recipeData, Recipe, Slug, $location, $timeout) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;
			var _originalSlug = _isEdit ? rf.recipe.slug : null;

			rf.recipeData = _isEdit ? rf.recipe : {};
			rf.recipeData.userId = _isEdit ? rf.recipe.userId : rf.userId;
			rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients :  [{id: 1}];
			rf.recipeData.directions = _isEdit ? rf.recipe.directions :  [{id: 1}];

			// fetch dietary options list
			rf.dietary = Recipe.dietary;

			// fetch special characters
			rf.insertChar = Recipe.insertChar;

			/**
			 * Add new item
			 * Ingredient or Direction step
			 *
			 * @param model {object} rf.recipeData model
			 */
			rf.addItem = function(model) {
				var _newItem = {
					id: model.length + 1
				};

				model.push(_newItem);
			};

			/**
			 * Remove item
			 * Ingredient or Direction step
			 *
			 * @param model {object} rf.recipeData model
			 * @param i {index}
			 */
			rf.removeItem = function(model, i) {
				model.splice(i, 1);
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
					$timeout(_goToNewSlug, 1500);
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

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/core/recipeForm.tpl.html',
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

	HomeCtrl.$inject = ['Page', 'localData', 'recipeData'];

	function HomeCtrl(Page, localData, recipeData) {
		// controllerAs ViewModel
		var home = this;

		Page.setTitle('All Recipes');

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

	MyRecipesCtrl.$inject = ['Page', '$auth', 'recipeData', 'userData', '$location'];

	function MyRecipesCtrl(Page, $auth, recipeData, userData, $location) {
		// controllerAs ViewModel
		var myRecipes = this;
		var _tab = $location.search().view;

		Page.setTitle('My Recipes');

		myRecipes.tabs = [
			{
				name: 'My Recipe Box',
				query: 'recipe-box'
			},
			{
				name: 'Add New Recipe',
				query: 'add-recipe'
			}
		];

		myRecipes.currentTab = _tab ? _tab : 'recipe-box';

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

		function _getUserSuccess(data) {
			myRecipes.user = data;
		}
		userData.getUser()
			.then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
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
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL1JlY2lwZS5mYWN0b3J5LmpzIiwiY29yZS9Vc2VyLmZhY3RvcnkuanMiLCJjb3JlL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAuY29uZmlnLmpzIiwiY29yZS9kZXRlY3RBZEJsb2NrLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLnNlcnZpY2UuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvcmVjaXBlRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91c2VyRGF0YS5zZXJ2aWNlLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwibG9naW4vTG9naW4uY3RybC5qcyIsIm15LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiLCJyZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicmVjaXBlL1JlY2lwZS5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZy1hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG5cdC5tb2R1bGUoJ3JCb3gnLCBbJ25nUm91dGUnLCAnbmdSZXNvdXJjZScsICduZ1Nhbml0aXplJywgJ25nTWVzc2FnZXMnLCAnbWVkaWFDaGVjaycsICdzYXRlbGxpemVyJywgJ3NsdWdpZmllciddKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCBQYWdlLCAkYXV0aCwgdXNlckRhdGEsICR0aW1lb3V0LCBPQVVUSCwgVXNlciwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhY2NvdW50ID0gdGhpcztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTXkgQWNjb3VudCcpO1xuXG5cdFx0YWNjb3VudC50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnVXNlciBJbmZvJyxcblx0XHRcdFx0cXVlcnk6ICd1c2VyLWluZm8nXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnTWFuYWdlIExvZ2lucycsXG5cdFx0XHRcdHF1ZXJ5OiAnbWFuYWdlLWxvZ2lucydcblx0XHRcdH1cblx0XHRdO1xuXG5cdFx0YWNjb3VudC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAndXNlci1pbmZvJztcblxuXHRcdGFjY291bnQuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRhY2NvdW50LmN1cnJlbnRUYWIgPSBxdWVyeTtcblx0XHR9O1xuXG5cdFx0Ly8gYWxsIGF2YWlsYWJsZSBsb2dpbiBzZXJ2aWNlc1xuXHRcdGFjY291bnQubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXG5cdFx0LyoqXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGFjY291bnQuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqL1xuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdFx0YWNjb3VudC5hZG1pbmlzdHJhdG9yID0gYWNjb3VudC51c2VyLmlzQWRtaW47XG5cdFx0XHRcdGFjY291bnQubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKGFjY291bnQudXNlciwgJ2FjY291bnQnKTtcblx0XHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIGVycm9yIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBhbiBlcnJvciBhbGVydCBpbiB0aGUgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZXJyb3Jcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyRXJyb3IoZXJyb3IpIHtcblx0XHRcdFx0YWNjb3VudC5lcnJvckdldHRpbmdVc2VyID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX2dldFVzZXJTdWNjZXNzLCBfZ2V0VXNlckVycm9yKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcHJvZmlsZSBzYXZlIGJ1dHRvbiB0byBpbml0aWFsIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9idG5TYXZlUmVzZXQoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gZmFsc2U7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdH1cblxuXHRcdF9idG5TYXZlUmVzZXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIFdhdGNoIGRpc3BsYXkgbmFtZSBjaGFuZ2VzIHRvIGNoZWNrIGZvciBlbXB0eSBvciBudWxsIHN0cmluZ1xuXHRcdCAqIFNldCBidXR0b24gdGV4dCBhY2NvcmRpbmdseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB1cGRhdGVkIGRpc3BsYXlOYW1lIHZhbHVlIGZyb20gaW5wdXQgZmllbGRcblx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfSBwcmV2aW91cyBkaXNwbGF5TmFtZSB2YWx1ZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3dhdGNoRGlzcGxheU5hbWUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdGlmIChuZXdWYWwgPT09ICcnIHx8IG5ld1ZhbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0VudGVyIE5hbWUnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHRcdH1cblx0XHR9XG5cdFx0JHNjb3BlLiR3YXRjaCgnYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lJywgX3dhdGNoRGlzcGxheU5hbWUpO1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICogQ2FsbGVkIG9uIHN1Ym1pc3Npb24gb2YgdXBkYXRlIGZvcm1cblx0XHQgKi9cblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwcm9maWxlRGF0YSA9IHsgZGlzcGxheU5hbWU6IGFjY291bnQudXNlci5kaXNwbGF5TmFtZSB9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3MgY2FsbGJhY2sgd2hlbiBwcm9maWxlIGhhcyBiZWVuIHVwZGF0ZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfdXBkYXRlU3VjY2VzcygpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IHRydWU7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZWQhJztcblxuXHRcdFx0XHQkdGltZW91dChfYnRuU2F2ZVJlc2V0LCAyNTAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFcnJvciBjYWxsYmFjayB3aGVuIHByb2ZpbGUgdXBkYXRlIGhhcyBmYWlsZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfdXBkYXRlRXJyb3IoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoISFhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUpIHtcblx0XHRcdFx0Ly8gU2V0IHN0YXR1cyB0byBTYXZpbmcuLi4gYW5kIHVwZGF0ZSB1cG9uIHN1Y2Nlc3Mgb3IgZXJyb3IgaW4gY2FsbGJhY2tzXG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHVzZXIsIHBhc3NpbmcgcHJvZmlsZSBkYXRhIGFuZCBhc3NpZ25pbmcgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzXG5cdFx0XHRcdHVzZXJEYXRhLnVwZGF0ZVVzZXIocHJvZmlsZURhdGEpLnRoZW4oX3VwZGF0ZVN1Y2Nlc3MsIF91cGRhdGVFcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIExpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVubGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC51bmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgudW5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSA/IHJlc3BvbnNlLmRhdGEubWVzc2FnZSA6ICdDb3VsZCBub3QgdW5saW5rICcgKyBwcm92aWRlciArICcgYWNjb3VudCcpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJ1VzZXInXTtcblxuXHRmdW5jdGlvbiBBZG1pbkN0cmwoUGFnZSwgJGF1dGgsIHVzZXJEYXRhLCBVc2VyKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdBZG1pbicpO1xuXG5cdFx0LyoqXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhZG1pbi5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciB1bnN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IFVuYXV0aG9yaXplZCBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtlcnJvcn0gcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR1c2VyRGF0YS5nZXRBbGxVc2VycygpLnRoZW4oX2dldEFsbFVzZXJzU3VjY2VzcywgX2dldEFsbFVzZXJzRXJyb3IpO1xuXHR9XG59KSgpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25zdGFudCgnTVEnLCB7XG5cdFx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIHtcblx0XHRcdExPR0lOUzogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dvb2dsZScsXG5cdFx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2FjY291bnRzLmdvb2dsZS5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdFx0bmFtZTogJ1R3aXR0ZXInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly90d2l0dGVyLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdmYWNlYm9vaycsXG5cdFx0XHRcdFx0bmFtZTogJ0ZhY2Vib29rJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dpdGh1YicsXG5cdFx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2dpdGh1Yi5jb20nXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSkge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdHZhciBwYWdlVGl0bGUgPSAnQWxsIFJlY2lwZXMnO1xuXG5cdFx0ZnVuY3Rpb24gdGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUmVjaXBlJywgUmVjaXBlKTtcblxuXHRmdW5jdGlvbiBSZWNpcGUoKSB7XG5cdFx0dmFyIGRpZXRhcnkgPSBbXG5cdFx0XHQndmVnZXRhcmlhbicsXG5cdFx0XHQndmVnYW4nLFxuXHRcdFx0J2dsdXRlbi1mcmVlJ1xuXHRcdF07XG5cblx0XHR2YXIgaW5zZXJ0Q2hhciA9IFtcblx0XHRcdCfCvCcsXG5cdFx0XHQnwr0nLFxuXHRcdFx0J8K+Jyxcblx0XHRcdCfCuidcblx0XHRdO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRpZXRhcnk6IGRpZXRhcnksXG5cdFx0XHRpbnNlcnRDaGFyOiBpbnNlcnRDaGFyXG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb25maWcoYXV0aENvbmZpZylcblx0XHQucnVuKGF1dGhSdW4pO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlcikge1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSAnaHR0cDovL3Jib3gua21haWRhLmlvL2F1dGgvbG9naW4nO1xuXG5cdFx0JGF1dGhQcm92aWRlci5mYWNlYm9vayh7XG5cdFx0XHRjbGllbnRJZDogJzM2MDE3MzE5NzUwNTY1MCdcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiAnMzYyMTM2MzIyOTQyLWs0NWg1MnEzdXE1NmRjMWdhczFmNTJjMHVsaGc1MTkwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJ1xuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogJy9hdXRoL3R3aXR0ZXInXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogJzlmZjA5NzI5OWM4NmU1MjRiMTBmJ1xuXHRcdH0pO1xuXHR9XG5cblx0YXV0aFJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIGF1dGhSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dCAmJiBuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnNlY3VyZSAmJiAhJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmVjaXBlJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbXktcmVjaXBlcycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvbXktcmVjaXBlcy9NeVJlY2lwZXMudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNeVJlY2lwZXNDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbXlSZWNpcGVzJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRWRpdFJlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlZGl0J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RldGVjdEFkYmxvY2snLCBkZXRlY3RBZGJsb2NrKTtcblxuXHRkZXRlY3RBZGJsb2NrLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2soJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXG5cdFx0ZGV0ZWN0QWRibG9ja0xpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdC8vIGhvc3RuYW1lIGZvciBtZXNzYWdpbmdcblx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBkZXRlY3RBZGJsb2NrTGluayxcblx0XHRcdHRlbXBsYXRlOiAgICc8ZGl2IGNsYXNzPVwiYWQtdGVzdCBmYS1mYWNlYm9vayBmYS10d2l0dGVyXCIgc3R5bGU9XCJoZWlnaHQ6MXB4O1wiPjwvZGl2PicgK1xuXHRcdFx0XHRcdFx0JzxkaXYgbmctaWY9XCJhYi5ibG9ja2VkXCIgY2xhc3M9XCJhYi1tZXNzYWdlIGFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgK1xuXHRcdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH1cblx0fVxuXG59KSgpOyIsIi8vIEZldGNoIGxvY2FsIEpTT04gZGF0YVxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCdsb2NhbERhdGEnLCBsb2NhbERhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdGxvY2FsRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIGxvY2FsRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0SlNPTiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9uZy1hcHAvZGF0YS9kYXRhLmpzb24nKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGFuZ3VsYXJNZWRpYUNoZWNrID0gYW5ndWxhci5tb2R1bGUoJ21lZGlhQ2hlY2snLCBbXSk7XG5cblx0YW5ndWxhck1lZGlhQ2hlY2suc2VydmljZSgnbWVkaWFDaGVjaycsIFsnJHdpbmRvdycsICckdGltZW91dCcsIGZ1bmN0aW9uICgkd2luZG93LCAkdGltZW91dCkge1xuXHRcdHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHR2YXIgJHNjb3BlID0gb3B0aW9uc1snc2NvcGUnXSxcblx0XHRcdFx0cXVlcnkgPSBvcHRpb25zWydtcSddLFxuXHRcdFx0XHRkZWJvdW5jZSA9IG9wdGlvbnNbJ2RlYm91bmNlJ10sXG5cdFx0XHRcdCR3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyksXG5cdFx0XHRcdGJyZWFrcG9pbnRzLFxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IHZvaWQgMCxcblx0XHRcdFx0aGFzTWF0Y2hNZWRpYSA9ICR3aW5kb3cubWF0Y2hNZWRpYSAhPT0gdW5kZWZpbmVkICYmICEhJHdpbmRvdy5tYXRjaE1lZGlhKCchJykuYWRkTGlzdGVuZXIsXG5cdFx0XHRcdG1xTGlzdExpc3RlbmVyLFxuXHRcdFx0XHRtbUxpc3RlbmVyLFxuXHRcdFx0XHRkZWJvdW5jZVJlc2l6ZSxcblx0XHRcdFx0bXEgPSB2b2lkIDAsXG5cdFx0XHRcdG1xQ2hhbmdlID0gdm9pZCAwLFxuXHRcdFx0XHRkZWJvdW5jZVNwZWVkID0gISFkZWJvdW5jZSA/IGRlYm91bmNlIDogMjUwO1xuXG5cdFx0XHRpZiAoaGFzTWF0Y2hNZWRpYSkge1xuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzICYmIHR5cGVvZiBvcHRpb25zLmVudGVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmVudGVyKG1xKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjcmVhdGVMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRtcSA9ICR3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSk7XG5cdFx0XHRcdFx0bXFMaXN0TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UobXEpXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1xLmFkZExpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGJpbmQgdG8gdGhlIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50IGFuZCBmaXJlIG1xQ2hhbmdlXG5cdFx0XHRcdFx0JHdpbi5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblxuXHRcdFx0XHRcdC8vIGNsZWFudXAgbGlzdGVuZXJzIHdoZW4gJHNjb3BlIGlzICRkZXN0cm95ZWRcblx0XHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG1xLnJlbW92ZUxpc3RlbmVyKG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHRcdCR3aW4udW5iaW5kKCdvcmllbnRhdGlvbmNoYW5nZScsIG1xTGlzdExpc3RlbmVyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUxpc3RlbmVyKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrcG9pbnRzID0ge307XG5cblx0XHRcdFx0bXFDaGFuZ2UgPSBmdW5jdGlvbiAobXEpIHtcblx0XHRcdFx0XHRpZiAobXEubWF0Y2hlcykge1xuXHRcdFx0XHRcdFx0aWYgKCEhYnJlYWtwb2ludHNbcXVlcnldID09PSBmYWxzZSAmJiAodHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoYnJlYWtwb2ludHNbcXVlcnldID09PSB0cnVlIHx8IGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5leGl0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5leGl0KG1xKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgobXEubWF0Y2hlcyAmJiAoIWJyZWFrcG9pbnRzW3F1ZXJ5XSkgfHwgKCFtcS5tYXRjaGVzICYmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpKSkpIHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5jaGFuZ2UobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBicmVha3BvaW50c1txdWVyeV0gPSBtcS5tYXRjaGVzO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBjb252ZXJ0RW1Ub1B4ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0dmFyIGVtRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLndpZHRoID0gJzFlbSc7XG5cdFx0XHRcdFx0ZW1FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVtRWxlbWVudCk7XG5cdFx0XHRcdFx0cHggPSB2YWx1ZSAqIGVtRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVtRWxlbWVudCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gcHg7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGdldFBYVmFsdWUgPSBmdW5jdGlvbiAod2lkdGgsIHVuaXQpIHtcblx0XHRcdFx0XHR2YXIgdmFsdWU7XG5cdFx0XHRcdFx0dmFsdWUgPSB2b2lkIDA7XG5cdFx0XHRcdFx0c3dpdGNoICh1bml0KSB7XG5cdFx0XHRcdFx0XHRjYXNlICdlbSc6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gY29udmVydEVtVG9QeCh3aWR0aCk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSB3aWR0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG51bGw7XG5cblx0XHRcdFx0bW1MaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgcGFydHMgPSBxdWVyeS5tYXRjaCgvXFwoKC4qKS0uKjpcXHMqKFtcXGRcXC5dKikoLiopXFwpLyksXG5cdFx0XHRcdFx0XHRjb25zdHJhaW50ID0gcGFydHNbMV0sXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGdldFBYVmFsdWUocGFyc2VJbnQocGFydHNbMl0sIDEwKSwgcGFydHNbM10pLFxuXHRcdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEgPSB7fSxcblx0XHRcdFx0XHRcdHdpbmRvd1dpZHRoID0gJHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuXHRcdFx0XHRcdGZha2VNYXRjaE1lZGlhLm1hdGNoZXMgPSBjb25zdHJhaW50ID09PSAnbWF4JyAmJiB2YWx1ZSA+IHdpbmRvd1dpZHRoIHx8IGNvbnN0cmFpbnQgPT09ICdtaW4nICYmIHZhbHVlIDwgd2luZG93V2lkdGg7XG5cblx0XHRcdFx0XHRyZXR1cm4gbXFDaGFuZ2UoZmFrZU1hdGNoTWVkaWEpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoZGVib3VuY2VSZXNpemUpO1xuXHRcdFx0XHRcdGRlYm91bmNlUmVzaXplID0gJHRpbWVvdXQobW1MaXN0ZW5lciwgZGVib3VuY2VTcGVlZCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JHdpbi5iaW5kKCdyZXNpemUnLCBmYWtlTWF0Y2hNZWRpYVJlc2l6ZSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHdpbi51bmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIG1tTGlzdGVuZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XSk7XG59KSgpOyIsIi8vIFJlY2lwZSBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuc2VydmljZSgncmVjaXBlRGF0YScsIHJlY2lwZURhdGEpO1xuXG5cdC8qKlxuXHQgKiBHRVQgcHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFJlcyhyZXNwb25zZSkge1xuXHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdH1cblx0fVxuXG5cdHJlY2lwZURhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNsdWcge3N0cmluZ30gcmVjaXBlIHNsdWdcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFJlY2lwZSA9IGZ1bmN0aW9uKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmNyZWF0ZVJlY2lwZSA9IGZ1bmN0aW9uKHJlY2lwZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucG9zdCgnL2FwaS9yZWNpcGUvbmV3JywgcmVjaXBlRGF0YSlcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRCAoaW4gY2FzZSBzbHVnIGhhcyBjaGFuZ2VkKVxuXHRcdCAqIEBwYXJhbSByZWNpcGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy51cGRhdGVSZWNpcGUgPSBmdW5jdGlvbihpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERlbGV0ZSBhIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGlkIHtzdHJpbmd9IHJlY2lwZSBJRFxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZGVsZXRlKCcvYXBpL3JlY2lwZS8nICsgaWQpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLmdldFB1YmxpY1JlY2lwZXMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZXMnKVxuXHRcdFx0XHQudGhlbihfZ2V0UmVzKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IHJlY2lwZXNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0TXlSZWNpcGVzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlRm9ybScsIHJlY2lwZUZvcm0pO1xuXG5cdHJlY2lwZUZvcm0uJGluamVjdCA9IFsncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnU2x1ZycsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVGb3JtKHJlY2lwZURhdGEsIFJlY2lwZSwgU2x1ZywgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlRm9ybUN0cmwoKSB7XG5cdFx0XHR2YXIgcmYgPSB0aGlzO1xuXHRcdFx0dmFyIF9pc0VkaXQgPSAhIXJmLnJlY2lwZTtcblx0XHRcdHZhciBfb3JpZ2luYWxTbHVnID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5zbHVnIDogbnVsbDtcblxuXHRcdFx0cmYucmVjaXBlRGF0YSA9IF9pc0VkaXQgPyByZi5yZWNpcGUgOiB7fTtcblx0XHRcdHJmLnJlY2lwZURhdGEudXNlcklkID0gX2lzRWRpdCA/IHJmLnJlY2lwZS51c2VySWQgOiByZi51c2VySWQ7XG5cdFx0XHRyZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5pbmdyZWRpZW50cyA6ICBbe2lkOiAxfV07XG5cdFx0XHRyZi5yZWNpcGVEYXRhLmRpcmVjdGlvbnMgPSBfaXNFZGl0ID8gcmYucmVjaXBlLmRpcmVjdGlvbnMgOiAgW3tpZDogMX1dO1xuXG5cdFx0XHQvLyBmZXRjaCBkaWV0YXJ5IG9wdGlvbnMgbGlzdFxuXHRcdFx0cmYuZGlldGFyeSA9IFJlY2lwZS5kaWV0YXJ5O1xuXG5cdFx0XHQvLyBmZXRjaCBzcGVjaWFsIGNoYXJhY3RlcnNcblx0XHRcdHJmLmluc2VydENoYXIgPSBSZWNpcGUuaW5zZXJ0Q2hhcjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgbmV3IGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICovXG5cdFx0XHRyZi5hZGRJdGVtID0gZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdFx0dmFyIF9uZXdJdGVtID0ge1xuXHRcdFx0XHRcdGlkOiBtb2RlbC5sZW5ndGggKyAxXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bW9kZWwucHVzaChfbmV3SXRlbSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlbW92ZSBpdGVtXG5cdFx0XHQgKiBJbmdyZWRpZW50IG9yIERpcmVjdGlvbiBzdGVwXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBpIHtpbmRleH1cblx0XHRcdCAqL1xuXHRcdFx0cmYucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKG1vZGVsLCBpKSB7XG5cdFx0XHRcdG1vZGVsLnNwbGljZShpLCAxKTtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xlYW4gZW1wdHkgaXRlbXMgb3V0IG9mIGFycmF5IGJlZm9yZSBzYXZpbmdcblx0XHRcdCAqIEluZ3JlZGllbnRzIG9yIERpcmVjdGlvbnNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbW9kZWxOYW1lIHtzdHJpbmd9IGluZ3JlZGllbnRzIC8gZGlyZWN0aW9uc1xuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2NsZWFuRW1wdGllcyhtb2RlbE5hbWUpIHtcblx0XHRcdFx0dmFyIF9hcnJheSA9IHJmLnJlY2lwZURhdGFbbW9kZWxOYW1lXTtcblx0XHRcdFx0dmFyIF9jaGVjayA9IG1vZGVsTmFtZSA9PT0gJ2luZ3JlZGllbnRzJyA/ICdpbmdyZWRpZW50JyA6ICdzdGVwJztcblxuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goX2FycmF5LCBmdW5jdGlvbihvYmosIGkpIHtcblx0XHRcdFx0XHRpZiAoISFvYmpbX2NoZWNrXSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdF9hcnJheS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNldCBzYXZlIGJ1dHRvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNldFNhdmVCdG4oKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gZmFsc2U7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGUgUmVjaXBlJyA6ICdTYXZlIFJlY2lwZSc7XG5cdFx0XHR9XG5cblx0XHRcdF9yZXNldFNhdmVCdG4oKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZWNpcGUgY3JlYXRlZCBvciBzYXZlZCBzdWNjZXNzZnVsbHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVjaXBlIHtwcm9taXNlfSBpZiBlZGl0aW5nIGV2ZW50XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZWQocmVjaXBlKSB7XG5cdFx0XHRcdHJmLnNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0cmYuc2F2ZUJ0blRleHQgPSBfaXNFZGl0ID8gJ1VwZGF0ZWQhJyA6ICdTYXZlZCEnO1xuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBHbyB0byBuZXcgc2x1ZyAoaWYgbmV3KSBvciB1cGRhdGVkIHNsdWcgKGlmIHNsdWcgY2hhbmdlZClcblx0XHRcdFx0ICpcblx0XHRcdFx0ICogQHByaXZhdGVcblx0XHRcdFx0ICovXG5cdFx0XHRcdGZ1bmN0aW9uIF9nb1RvTmV3U2x1ZygpIHtcblx0XHRcdFx0XHR2YXIgX3BhdGggPSAhX2lzRWRpdCA/IHJlY2lwZS5zbHVnIDogcmYucmVjaXBlRGF0YS5zbHVnICsgJy9lZGl0JztcblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvcmVjaXBlLycgKyBfcGF0aCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIV9pc0VkaXQgfHwgX2lzRWRpdCAmJiBfb3JpZ2luYWxTbHVnICE9PSByZi5yZWNpcGVEYXRhLnNsdWcpIHtcblx0XHRcdFx0XHQkdGltZW91dChfZ29Ub05ld1NsdWcsIDE1MDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR0aW1lb3V0KF9yZXNldFNhdmVCdG4sIDIwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVjaXBlIG5vdCBzYXZlZCAvIGNyZWF0ZWQgZHVlIHRvIGVycm9yXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVyciB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZWNpcGVTYXZlRXJyb3IoZXJyKSB7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gJ0Vycm9yIHNhdmluZyEnO1xuXHRcdFx0XHRyZi5zYXZlZCA9ICdlcnJvcic7XG5cblx0XHRcdFx0JHRpbWVvdXQoX3Jlc2V0U2F2ZUJ0biwgNDAwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2F2ZSByZWNpcGVcblx0XHRcdCAqL1xuXHRcdFx0cmYuc2F2ZVJlY2lwZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRpbmcuLi4nIDogJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gcHJlcCBkYXRhIGZvciBzYXZpbmdcblx0XHRcdFx0cmYucmVjaXBlRGF0YS5zbHVnID0gU2x1Zy5zbHVnaWZ5KHJmLnJlY2lwZURhdGEubmFtZSk7XG5cdFx0XHRcdF9jbGVhbkVtcHRpZXMoJ2luZ3JlZGllbnRzJyk7XG5cdFx0XHRcdF9jbGVhbkVtcHRpZXMoJ2RpcmVjdGlvbnMnKTtcblxuXHRcdFx0XHQvLyBjYWxsIEFQSVxuXHRcdFx0XHRpZiAoIV9pc0VkaXQpIHtcblx0XHRcdFx0XHRyZWNpcGVEYXRhLmNyZWF0ZVJlY2lwZShyZi5yZWNpcGVEYXRhKVxuXHRcdFx0XHRcdFx0LnRoZW4oX3JlY2lwZVNhdmVkLCBfcmVjaXBlU2F2ZUVycm9yKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWNpcGVEYXRhLnVwZGF0ZVJlY2lwZShyZi5yZWNpcGUuX2lkLCByZi5yZWNpcGVEYXRhKVxuXHRcdFx0XHRcdFx0LnRoZW4oX3JlY2lwZVNhdmVkLCBfcmVjaXBlU2F2ZUVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGU6ICc9Jyxcblx0XHRcdFx0dXNlcklkOiAnQCdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3JlY2lwZUZvcm0udHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlRm9ybUN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdyZicsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBVc2VyIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5zZXJ2aWNlKCd1c2VyRGF0YScsIHVzZXJEYXRhKTtcblxuXHQvKipcblx0ICogR0VUIHByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0ICpcblx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9nZXRSZXMocmVzcG9uc2UpIHtcblx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHR9XG5cdH1cblxuXHR1c2VyRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRBdXRob3IgPSBmdW5jdGlvbihpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlci8nICsgaWQpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgY3VycmVudCB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0dGhpcy5nZXRVc2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgY3VycmVudCB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcHJvZmlsZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHR0aGlzLnVwZGF0ZVVzZXIgPSBmdW5jdGlvbihwcm9maWxlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvbWUnLCBwcm9maWxlRGF0YSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSlcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0QWxsVXNlcnMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXJzJylcblx0XHRcdFx0LnRoZW4oX2dldFJlcyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBGb3IgZXZlbnRzIGJhc2VkIG9uIHZpZXdwb3J0IHNpemUgLSB1cGRhdGVzIGFzIHZpZXdwb3J0IGlzIHJlc2l6ZWRcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCd2aWV3U3dpdGNoJywgdmlld1N3aXRjaCk7XG5cblx0dmlld1N3aXRjaC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gdmlld1N3aXRjaChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdHZpZXdTd2l0Y2hMaW5rLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0LyoqXG5cdFx0ICogdmlld1N3aXRjaCBkaXJlY3RpdmUgbGluayBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHZpZXdTd2l0Y2hMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS52cyA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBleGl0IG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluaXRpYWxpemUgbWVkaWFDaGVja1xuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyRm4sXG5cdFx0XHRcdGV4aXQ6IF9leGl0Rm5cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IHZpZXdTd2l0Y2hMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgaGVhZGVyQ3RybCk7XHJcblxyXG5cdGhlYWRlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnLCAnJGF1dGgnLCAndXNlckRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhLCAkYXV0aCwgdXNlckRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIGFkbWluVXNlciBpcyB1bmRlZmluZWQsXHJcblx0XHQgKiBnZXQgdGhlIHVzZXIgYW5kIHNldCBhZG1pblVzZXIgYm9vbGVhbi5cclxuXHRcdCAqXHJcblx0XHQgKiBEbyB0aGlzIG9uIGZpcnN0IGNvbnRyb2xsZXIgbG9hZCAoaW5pdCwgcmVmcmVzaClcclxuXHRcdCAqIGFuZCBzdWJzZXF1ZW50IGxvY2F0aW9uIGNoYW5nZXMgKGllLCBjYXRjaGluZyBsb2dvdXQsIGxvZ2luLCBldGMpLlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9jaGVja1VzZXJBZG1pbigpIHtcclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIGFuZCBub3QgZGVmaW5lZCB5ZXQsIGNoZWNrIGlmIHRoZXkncmUgYW4gYWRtaW5cclxuXHRcdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpICYmIGhlYWRlci5hZG1pblVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRcdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gZGF0YS5pc0FkbWluO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdF9jaGVja1VzZXJBZG1pbigpO1xyXG5cdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xyXG5cdFx0ICogTmVlZHMgdG8gYmUgYSBmdW5jdGlvbiBzbyBpdCBpcyByZS1leGVjdXRlZFxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH07XHJcblx0fVxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2wobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdHZhciBfYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpLFxuXHRcdFx0XHRfbmF2T3BlbjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LWNsb3NlZCcpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0XHRfY2xvc2VOYXYoKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogVG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2Nsb3NlTmF2KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZXhpdGluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfYm9keS5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCBuYXYtb3BlbicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXHR9XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICdsb2NhbERhdGEnLCAncmVjaXBlRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybChQYWdlLCBsb2NhbERhdGEsIHJlY2lwZURhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHRQYWdlLnNldFRpdGxlKCdBbGwgUmVjaXBlcycpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGxvY2FsIGRhdGEgZnJvbSBzdGF0aWMgSlNPTlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIChzdWNjZXNzZnVsIHByb21pc2UgcmV0dXJucylcclxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R9IGRhdGFcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcmVjaXBlcyBhcnJheVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3B1YmxpY1JlY2lwZXNTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5wdWJsaWNSZWNpcGVzID0gZGF0YTtcclxuXHRcdH1cclxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpLnRoZW4oX3B1YmxpY1JlY2lwZXNTdWNjZXNzKTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5cdExvZ2luQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ09BVVRIJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJ2xvY2FsRGF0YSddO1xuXG5cdGZ1bmN0aW9uIExvZ2luQ3RybChQYWdlLCAkYXV0aCwgT0FVVEgsICRyb290U2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2sgaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRsb2dpbi5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gbG9jYWwgZGF0YSBzdWNjZXNzZnVsXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7SlNPTn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGxvZ2luLmxvY2FsRGF0YSA9IGRhdGE7XG5cdFx0fVxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBBdXRoZW50aWNhdGUgdGhlIHVzZXIgdmlhIE9hdXRoIHdpdGggdGhlIHNwZWNpZmllZCBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyIC0gKHR3aXR0ZXIsIGZhY2Vib29rLCBnaXRodWIsIGdvb2dsZSlcblx0XHQgKi9cblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdFx0ICogR28gdG8gaW5pdGlhbGx5IGludGVuZGVkIGF1dGhlbnRpY2F0ZWQgcGF0aFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoJHJvb3RTY29wZS5hdXRoUGF0aCkge1xuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgYXV0aGVudGljYXRpbmdcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aENhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSAnZXJyb3InO1xuXHRcdFx0XHRsb2dpbi5sb2dpbk1zZyA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHQkYXV0aC5hdXRoZW50aWNhdGUocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKF9hdXRoU3VjY2Vzcylcblx0XHRcdFx0LmNhdGNoKF9hdXRoQ2F0Y2gpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcblx0XHQgKi9cblx0XHRsb2dpbi5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRhdXRoLmxvZ291dCgnL2xvZ2luJyk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ015UmVjaXBlc0N0cmwnLCBNeVJlY2lwZXNDdHJsKTtcblxuXHRNeVJlY2lwZXNDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAncmVjaXBlRGF0YScsICd1c2VyRGF0YScsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBNeVJlY2lwZXNDdHJsKFBhZ2UsICRhdXRoLCByZWNpcGVEYXRhLCB1c2VyRGF0YSwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBteVJlY2lwZXMgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBSZWNpcGVzJyk7XG5cblx0XHRteVJlY2lwZXMudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ015IFJlY2lwZSBCb3gnLFxuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3gnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiAnQWRkIE5ldyBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2FkZC1yZWNpcGUnXG5cdFx0XHR9XG5cdFx0XTtcblxuXHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAncmVjaXBlLWJveCc7XG5cblx0XHRteVJlY2lwZXMuY2hhbmdlVGFiID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBxdWVyeSk7XG5cdFx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0bXlSZWNpcGVzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bXlSZWNpcGVzLnVzZXIgPSBkYXRhO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRteVJlY2lwZXMucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0TXlSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0UmVjaXBlQ3RybCcsIEVkaXRSZWNpcGVDdHJsKTtcblxuXHRFZGl0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIEVkaXRSZWNpcGVDdHJsKFBhZ2UsICRhdXRoLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBlZGl0ID0gdGhpcztcblx0XHR2YXIgX3JlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1Zztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCBSZWNpcGUnKTtcblxuXHRcdGVkaXQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0VkaXQgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdlZGl0J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0RlbGV0ZSBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2RlbGV0ZSdcblx0XHRcdH1cblx0XHRdO1xuXG5cdFx0ZWRpdC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAnZWRpdCc7XG5cblx0XHRlZGl0LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0ZWRpdC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRlZGl0LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC51c2VyID0gZGF0YTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRlZGl0Lm9yaWdpbmFsTmFtZSA9IGVkaXQucmVjaXBlLm5hbWU7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFZGl0ICcgKyBlZGl0Lm9yaWdpbmFsTmFtZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKGVycikge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSAnZXJyb3InO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRXJyb3InKTtcblx0XHRcdGVkaXQuZXJyb3JNc2cgPSBlcnIuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZGVsZXRlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXREZWxldGVCdG4oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSBmYWxzZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGUgUmVjaXBlJztcblx0XHR9XG5cblx0XHRfcmVzZXREZWxldGVCdG4oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBhZnRlciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gdHJ1ZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGVkISc7XG5cblx0XHRcdGZ1bmN0aW9uIF9nb1RvUmVjaXBlcygpIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9teS1yZWNpcGVzJyk7XG5cdFx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2dvVG9SZWNpcGVzLCAxNTAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZUVycm9yKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gJ2Vycm9yJztcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdFcnJvciBkZWxldGluZyEnO1xuXG5cdFx0XHQkdGltZW91dChfcmVzZXREZWxldGVCdG4sIDI1MDApO1xuXHRcdH1cblxuXHRcdGVkaXQuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRpbmcuLi4nO1xuXHRcdFx0cmVjaXBlRGF0YS5kZWxldGVSZWNpcGUoZWRpdC5yZWNpcGUuX2lkKVxuXHRcdFx0XHQudGhlbihfZGVsZXRlU3VjY2VzcywgX2RlbGV0ZUVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVDdHJsJywgUmVjaXBlQ3RybCk7XG5cblx0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlQ3RybChQYWdlLCAkYXV0aCwgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmVjaXBlID0gdGhpcztcblx0XHR2YXIgcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnUmVjaXBlJyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSB1c2VyIGluZm9cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUudXNlciA9IGRhdGE7XG5cdFx0fVxuXHRcdGlmICgkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9IHJlY2lwZSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gZGF0YTtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUocmVjaXBlLnJlY2lwZS5uYW1lKTtcblx0XHRcdGNvbnNvbGUubG9nKHJlY2lwZS5yZWNpcGUpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgYXV0aG9yIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gYXV0aG9yIHBpY3R1cmUsIGRpc3BsYXlOYW1lXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdHJlY2lwZS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0dXNlckRhdGEuZ2V0QXV0aG9yKHJlY2lwZS5yZWNpcGUudXNlcklkKVxuXHRcdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIHJldHJpZXZpbmcgcmVjaXBlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKHJlcykge1xuXHRcdFx0cmVjaXBlLnJlY2lwZSA9ICdlcnJvcic7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFcnJvcicpO1xuXHRcdFx0cmVjaXBlLmVycm9yTXNnID0gcmVzLmRhdGEubWVzc2FnZTtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRSZWNpcGUocmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXHR9XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
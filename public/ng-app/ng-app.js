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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSENMSUVOVFMuY29uc3RhbnQuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvUGFnZS5mYWN0b3J5LmpzIiwiY29yZS9SZWNpcGUuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9yZWNpcGVGb3JtLmRpci5qcyIsImNvcmUvcmVjaXBlc0xpc3QuZGlyLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvZ2V0LWRhdGEvUmVzLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL3JlY2lwZURhdGEuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvdXNlckRhdGEuZmFjdG9yeS5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2JsdXJPbkVuZC5kaXIuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9kaXZpZGVyLmRpci5qcyIsImNvcmUvdWkvdHJpbVN0ci5maWx0ZXIuanMiLCJjb3JlL3VpL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsIm1vZHVsZXMvaGVhZGVyL0hlYWRlci5jdHJsLmpzIiwibW9kdWxlcy9oZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJwYWdlcy9hY2NvdW50L0FjY291bnQuY3RybC5qcyIsInBhZ2VzL2FkbWluL0FkbWluLmN0cmwuanMiLCJwYWdlcy9ob21lL0hvbWUuY3RybC5qcyIsInBhZ2VzL2xvZ2luL0xvZ2luLmN0cmwuanMiLCJwYWdlcy9yZWNpcGUvRWRpdFJlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL1JlY2lwZS5jdHJsLmpzIiwicGFnZXMvcmVjaXBlL21pblRvSC5maWx0ZXIuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBdXRob3IuY3RybC5qcyIsInBhZ2VzL3JlY2lwZXMtYXJjaGl2ZXMvUmVjaXBlc0NhdGVnb3J5LmN0cmwuanMiLCJwYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNUYWcuY3RybC5qcyIsInBhZ2VzL215LXJlY2lwZXMvTXlSZWNpcGVzLmN0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdyQm94JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAnc2F0ZWxsaXplcicsICdzbHVnaWZpZXInLCAnbmdGaWxlVXBsb2FkJ10pOyIsIi8vIGxvZ2luIGFjY291bnQgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSCcsIHtcblx0XHRcdExPR0lOUzogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dvb2dsZScsXG5cdFx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2FjY291bnRzLmdvb2dsZS5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdFx0bmFtZTogJ1R3aXR0ZXInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly90d2l0dGVyLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdmYWNlYm9vaycsXG5cdFx0XHRcdFx0bmFtZTogJ0ZhY2Vib29rJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2dpdGh1YicsXG5cdFx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2dpdGh1Yi5jb20nXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnN0YW50KCdPQVVUSENMSUVOVFMnLCB7XG5cdFx0XHRMT0dJTlVSTDogJ2h0dHA6Ly9yYm94LmttYWlkYS5pby9hdXRoL2xvZ2luJyxcblx0XHRcdENMSUVOVDoge1xuXHRcdFx0XHRGQjogJzM2MDE3MzE5NzUwNTY1MCcsXG5cdFx0XHRcdEdPT0dMRTogJzM2MjEzNjMyMjk0Mi1rNDVoNTJxM3VxNTZkYzFnYXMxZjUyYzB1bGhnNTE5MC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXG5cdFx0XHRcdFRXSVRURVI6ICcvYXV0aC90d2l0dGVyJyxcblx0XHRcdFx0R0lUSFVCOiAnOWZmMDk3Mjk5Yzg2ZTUyNGIxMGYnXG5cdFx0XHR9XG5cdFx0fSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckc2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjayddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UsICRzY29wZSwgTVEsIG1lZGlhQ2hlY2spIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XG5cdFx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZW50ZXItbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZXhpdC1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9uJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3RhcnQoJGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7XG5cdFx0XHRcdF9sb2FkaW5nT24oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3VjY2VzcyBoYW5kbGVyXG5cdFx0ICogTWF0Y2ggY3VycmVudCBtZWRpYSBxdWVyeSBhbmQgcnVuIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG5cdFx0ICogSWYgY3VycmVudCByb3V0ZSBoYXMgYmVlbiByZXNvbHZlZCwgdHVybiBvZmYgbG9hZGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcblx0XHRcdG1jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cblx0XHRcdGlmIChjdXJyZW50LiQkcm91dGUgJiYgY3VycmVudC4kJHJvdXRlLnJlc29sdmUpIHtcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cdFx0XHRfbG9hZGluZ09mZigpO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xuXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XG5cdFx0Ly8gcHJpdmF0ZSB2YXJzXG5cdFx0dmFyIHNpdGVUaXRsZSA9ICdyQm94Jztcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0FsbCBSZWNpcGVzJztcblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFRpdGxlIGZ1bmN0aW9uXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArICcgfCAnICsgcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmFjdG9yeSgnUmVjaXBlJywgUmVjaXBlKTtcblxuXHRmdW5jdGlvbiBSZWNpcGUoKSB7XG5cdFx0dmFyIGRpZXRhcnkgPSBbXG5cdFx0XHQnR2x1dGVuLWZyZWUnLFxuXHRcdFx0J1ZlZ2FuJyxcblx0XHRcdCdWZWdldGFyaWFuJ1xuXHRcdF07XG5cblx0XHR2YXIgaW5zZXJ0Q2hhciA9IFtcblx0XHRcdCfihZsnLFxuXHRcdFx0J8K8Jyxcblx0XHRcdCfihZMnLFxuXHRcdFx0J8K9Jyxcblx0XHRcdCfihZQnLFxuXHRcdFx0J8K+J1xuXHRcdF07XG5cblx0XHR2YXIgY2F0ZWdvcmllcyA9IFtcblx0XHRcdCdBcHBldGl6ZXInLFxuXHRcdFx0J0JldmVyYWdlJyxcblx0XHRcdCdEZXNzZXJ0Jyxcblx0XHRcdCdFbnRyZWUnLFxuXHRcdFx0J1NhbGFkJyxcblx0XHRcdCdTaWRlJyxcblx0XHRcdCdTb3VwJ1xuXHRcdF07XG5cblx0XHR2YXIgdGFncyA9IFtcblx0XHRcdCdhbGNvaG9sJyxcblx0XHRcdCdiYWtlZCcsXG5cdFx0XHQnYmVlZicsXG5cdFx0XHQnZmFzdCcsXG5cdFx0XHQnZmlzaCcsXG5cdFx0XHQnbG93LWNhbG9yaWUnLFxuXHRcdFx0J29uZS1wb3QnLFxuXHRcdFx0J3Bhc3RhJyxcblx0XHRcdCdwb3JrJyxcblx0XHRcdCdwb3VsdHJ5Jyxcblx0XHRcdCdzbG93LWNvb2snLFxuXHRcdFx0J3N0b2NrJyxcblx0XHRcdCd2ZWdldGFibGUnXG5cdFx0XTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRkaWV0YXJ5OiBkaWV0YXJ5LFxuXHRcdFx0aW5zZXJ0Q2hhcjogaW5zZXJ0Q2hhcixcblx0XHRcdGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsXG5cdFx0XHR0YWdzOiB0YWdzXG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TGlua2VkQWNjb3VudHM6IGdldExpbmtlZEFjY291bnRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhcnJheSBvZiBhIHVzZXIncyBjdXJyZW50bHktbGlua2VkIGFjY291bnQgbG9naW5zXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlck9ialxuXHRcdCAqIEByZXR1cm5zIHtBcnJheX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMaW5rZWRBY2NvdW50cyh1c2VyT2JqKSB7XG5cdFx0XHR2YXIgbGlua2VkQWNjb3VudHMgPSBbXTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKE9BVVRILkxPR0lOUywgZnVuY3Rpb24oYWN0T2JqKSB7XG5cdFx0XHRcdHZhciBhY3QgPSBhY3RPYmouYWNjb3VudDtcblxuXHRcdFx0XHRpZiAodXNlck9ialthY3RdKSB7XG5cdFx0XHRcdFx0bGlua2VkQWNjb3VudHMucHVzaChhY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGxpbmtlZEFjY291bnRzO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlRm9ybScsIHJlY2lwZUZvcm0pO1xuXG5cdHJlY2lwZUZvcm0uJGluamVjdCA9IFsncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnU2x1ZycsICckbG9jYXRpb24nLCAnJHRpbWVvdXQnLCAnVXBsb2FkJywgJ21lZGlhQ2hlY2snLCAnTVEnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVGb3JtKHJlY2lwZURhdGEsIFJlY2lwZSwgU2x1ZywgJGxvY2F0aW9uLCAkdGltZW91dCwgVXBsb2FkLCBtZWRpYUNoZWNrLCBNUSkge1xuXG5cdFx0cmVjaXBlRm9ybUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVGb3JtQ3RybCgkc2NvcGUpIHtcblx0XHRcdHZhciByZiA9IHRoaXM7XG5cdFx0XHR2YXIgX2lzRWRpdCA9ICEhcmYucmVjaXBlO1xuXHRcdFx0dmFyIF9vcmlnaW5hbFNsdWcgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnNsdWcgOiBudWxsO1xuXG5cdFx0XHRyZi5yZWNpcGVEYXRhID0gX2lzRWRpdCA/IHJmLnJlY2lwZSA6IHt9O1xuXHRcdFx0cmYucmVjaXBlRGF0YS51c2VySWQgPSBfaXNFZGl0ID8gcmYucmVjaXBlLnVzZXJJZCA6IHJmLnVzZXJJZDtcblx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBfaXNFZGl0ID8gcmYucmVjaXBlLnBob3RvIDogbnVsbDtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgNS1jaGFyYWN0ZXIgSUQ7XG5cdFx0XHQgKiBPbiAkc2NvcGUgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyIGFuZCBsaW5rXG5cdFx0XHQgKlxuXHRcdFx0ICogQHJldHVybnMge3N0cmluZ31cblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLmdlbmVyYXRlSWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIF9pZCA9ICcnO1xuXHRcdFx0XHR2YXIgX2NoYXJzZXQgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODknO1xuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG5cdFx0XHRcdFx0X2lkICs9IF9jaGFyc2V0LmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfY2hhcnNldC5sZW5ndGgpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBfaWQ7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBpcyB0aGlzIGEgdG91Y2ggZGV2aWNlP1xuXHRcdFx0cmYuaXNUb3VjaERldmljZSA9ICEhTW9kZXJuaXpyLnRvdWNoZXZlbnRzO1xuXG5cdFx0XHQvLyBidWlsZCBsaXN0c1xuXHRcdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50cyA9IF9pc0VkaXQgPyByZi5yZWNpcGUuaW5ncmVkaWVudHMgOiBbe2lkOiAkc2NvcGUuZ2VuZXJhdGVJZCgpLCB0eXBlOiAnaW5nJ31dO1xuXHRcdFx0cmYucmVjaXBlRGF0YS5kaXJlY3Rpb25zID0gX2lzRWRpdCA/IHJmLnJlY2lwZS5kaXJlY3Rpb25zIDogW3tpZDogJHNjb3BlLmdlbmVyYXRlSWQoKSwgdHlwZTogJ3N0ZXAnfV07XG5cblx0XHRcdHJmLnJlY2lwZURhdGEudGFncyA9IF9pc0VkaXQgPyByZi5yZWNpcGVEYXRhLnRhZ3MgOiBbXTtcblxuXHRcdFx0Ly8gbWFuYWdlIHRpbWUgZmllbGRzXG5cdFx0XHRyZi50aW1lUmVnZXggPSAvXlsrXT8oWzAtOV0rKD86W1xcLl1bMC05XSopP3xcXC5bMC05XSspJC87XG5cdFx0XHRyZi50aW1lRXJyb3IgPSAnUGxlYXNlIGVudGVyIGEgbnVtYmVyIGluIG1pbnV0ZXMuIE11bHRpcGx5IGhvdXJzIGJ5IDYwLic7XG5cblx0XHRcdC8vIGZldGNoIGNhdGVnb3JpZXMgb3B0aW9ucyBsaXN0XG5cdFx0XHRyZi5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XG5cblx0XHRcdC8vIGZldGNoIHRhZ3Mgb3B0aW9ucyBsaXN0XG5cdFx0XHRyZi50YWdzID0gUmVjaXBlLnRhZ3M7XG5cblx0XHRcdC8vIGZldGNoIGRpZXRhcnkgb3B0aW9ucyBsaXN0XG5cdFx0XHRyZi5kaWV0YXJ5ID0gUmVjaXBlLmRpZXRhcnk7XG5cblx0XHRcdC8vIGZldGNoIHNwZWNpYWwgY2hhcmFjdGVyc1xuXHRcdFx0cmYuY2hhcnMgPSBSZWNpcGUuaW5zZXJ0Q2hhcjtcblxuXHRcdFx0Ly8gc2V0dXAgc3BlY2lhbCBjaGFyYWN0ZXJzIHByaXZhdGUgdmFyc1xuXHRcdFx0dmFyIF9sYXN0SW5wdXQ7XG5cdFx0XHR2YXIgX2luZ0luZGV4O1xuXHRcdFx0dmFyIF9jYXJldFBvcztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZXQgc2VsZWN0aW9uIHJhbmdlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGlucHV0XG5cdFx0XHQgKiBAcGFyYW0gc2VsZWN0aW9uU3RhcnQge251bWJlcn1cblx0XHRcdCAqIEBwYXJhbSBzZWxlY3Rpb25FbmQge251bWJlcn1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9zZXRTZWxlY3Rpb25SYW5nZShpbnB1dCwgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCkge1xuXHRcdFx0XHRpZiAoaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcblx0XHRcdFx0XHRpbnB1dC5jbGljaygpO1xuXHRcdFx0XHRcdGlucHV0LmZvY3VzKCk7XG5cdFx0XHRcdFx0aW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2Uoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoaW5wdXQuY3JlYXRlVGV4dFJhbmdlKSB7XG5cdFx0XHRcdFx0dmFyIHJhbmdlID0gaW5wdXQuY3JlYXRlVGV4dFJhbmdlKCk7XG5cdFx0XHRcdFx0cmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG5cdFx0XHRcdFx0cmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgc2VsZWN0aW9uRW5kKTtcblx0XHRcdFx0XHRyYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIHNlbGVjdGlvblN0YXJ0KTtcblx0XHRcdFx0XHRyYW5nZS5zZWxlY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCBjYXJldCBwb3NpdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBpbnB1dFxuXHRcdFx0ICogQHBhcmFtIHBvcyB7bnVtYmVyfSBpbnRlbmRlZCBjYXJldCBwb3NpdGlvblxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3NldENhcmV0VG9Qb3MoaW5wdXQsIHBvcykge1xuXHRcdFx0XHRfc2V0U2VsZWN0aW9uUmFuZ2UoaW5wdXQsIHBvcywgcG9zKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBLZWVwIHRyYWNrIG9mIGNhcmV0IHBvc2l0aW9uIGluIGluZ3JlZGllbnQgYW1vdW50IHRleHQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0XHQgKiBAcGFyYW0gaW5kZXgge251bWJlcn1cblx0XHRcdCAqL1xuXHRcdFx0cmYuaW5zZXJ0Q2hhcklucHV0ID0gZnVuY3Rpb24oJGV2ZW50LCBpbmRleCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfaW5nSW5kZXggPSBpbmRleDtcblx0XHRcdFx0XHRfbGFzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCcjJyArICRldmVudC50YXJnZXQuaWQpO1xuXHRcdFx0XHRcdF9jYXJldFBvcyA9IF9sYXN0SW5wdXRbMF0uc2VsZWN0aW9uU3RhcnQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbnNlcnQgY2hhcmFjdGVyIGF0IGxhc3QgY2FyZXQgcG9zaXRpb25cblx0XHRcdCAqIEluIHN1cHBvcnRlZCBmaWVsZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBjaGFyIHtzdHJpbmd9IHNwZWNpYWwgY2hhcmFjdGVyXG5cdFx0XHQgKi9cblx0XHRcdHJmLmluc2VydENoYXIgPSBmdW5jdGlvbihjaGFyKSB7XG5cdFx0XHRcdGlmIChfbGFzdElucHV0KSB7XG5cdFx0XHRcdFx0dmFyIF90ZXh0VmFsID0gcmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCA9PT0gdW5kZWZpbmVkID8gJycgOiByZi5yZWNpcGVEYXRhLmluZ3JlZGllbnRzW19pbmdJbmRleF0uYW10O1xuXG5cdFx0XHRcdFx0cmYucmVjaXBlRGF0YS5pbmdyZWRpZW50c1tfaW5nSW5kZXhdLmFtdCA9IF90ZXh0VmFsLnN1YnN0cmluZygwLCBfY2FyZXRQb3MpICsgY2hhciArIF90ZXh0VmFsLnN1YnN0cmluZyhfY2FyZXRQb3MpO1xuXG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRfY2FyZXRQb3MgPSBfY2FyZXRQb3MgKyAxO1xuXHRcdFx0XHRcdFx0X3NldENhcmV0VG9Qb3MoX2xhc3RJbnB1dFswXSwgX2NhcmV0UG9zKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbGVhciBjYXJldCBwb3NpdGlvbiBhbmQgbGFzdCBpbnB1dFxuXHRcdFx0ICogU28gdGhhdCBzcGVjaWFsIGNoYXJhY3RlcnMgZG9uJ3QgZW5kIHVwIGluIHVuZGVzaXJlZCBmaWVsZHNcblx0XHRcdCAqL1xuXHRcdFx0cmYuY2xlYXJDaGFyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9pbmdJbmRleCA9IG51bGw7XG5cdFx0XHRcdF9sYXN0SW5wdXQgPSBudWxsO1xuXHRcdFx0XHRfY2FyZXRQb3MgPSBudWxsO1xuXHRcdFx0fTtcblxuXHRcdFx0cmYudXBsb2FkZWRGaWxlID0gbnVsbDtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVcGxvYWQgaW1hZ2UgZmlsZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBmaWxlcyB7QXJyYXl9IGFycmF5IG9mIGZpbGVzIHRvIHVwbG9hZFxuXHRcdFx0ICovXG5cdFx0XHRyZi51cGRhdGVGaWxlID0gZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0aWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGlmIChmaWxlc1swXS5zaXplID4gMzAwMDAwKSB7XG5cdFx0XHRcdFx0XHRyZi51cGxvYWRFcnJvciA9ICdGaWxlc2l6ZSBvdmVyIDUwMGtiIC0gcGhvdG8gd2FzIG5vdCB1cGxvYWRlZC4nO1xuXHRcdFx0XHRcdFx0cmYucmVtb3ZlUGhvdG8oKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IGZpbGVzWzBdOyAgICAvLyBvbmx5IHNpbmdsZSB1cGxvYWQgYWxsb3dlZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZW1vdmUgdXBsb2FkZWQgcGhvdG8gZnJvbSBmcm9udC1lbmRcblx0XHRcdCAqL1xuXHRcdFx0cmYucmVtb3ZlUGhvdG8gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmYucmVjaXBlRGF0YS5waG90byA9IG51bGw7XG5cdFx0XHRcdHJmLnVwbG9hZGVkRmlsZSA9IG51bGw7XG5cdFx0XHRcdGFuZ3VsYXIuZWxlbWVudCgnI3JlY2lwZVBob3RvJykudmFsKCcnKTtcblx0XHRcdH07XG5cblx0XHRcdC8vIGNyZWF0ZSBtYXAgb2YgdG91Y2hlZCB0YWdzXG5cdFx0XHRyZi50YWdNYXAgPSB7fTtcblx0XHRcdGlmIChfaXNFZGl0ICYmIHJmLnJlY2lwZURhdGEudGFncy5sZW5ndGgpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHJmLnJlY2lwZURhdGEudGFncywgZnVuY3Rpb24odGFnLCBpKSB7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSB0cnVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgLyByZW1vdmUgdGFnXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHRhZyB7c3RyaW5nfSB0YWcgbmFtZVxuXHRcdFx0ICovXG5cdFx0XHRyZi5hZGRSZW1vdmVUYWcgPSBmdW5jdGlvbih0YWcpIHtcblx0XHRcdFx0dmFyIF9hY3RpdmVUYWdJbmRleCA9IHJmLnJlY2lwZURhdGEudGFncy5pbmRleE9mKHRhZyk7XG5cblx0XHRcdFx0aWYgKF9hY3RpdmVUYWdJbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0Ly8gdGFnIGV4aXN0cyBpbiBtb2RlbCwgdHVybiBpdCBvZmZcblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3Muc3BsaWNlKF9hY3RpdmVUYWdJbmRleCwgMSk7XG5cdFx0XHRcdFx0cmYudGFnTWFwW3RhZ10gPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB0YWcgZG9lcyBub3QgZXhpc3QgaW4gbW9kZWwsIHR1cm4gaXQgb25cblx0XHRcdFx0XHRyZi5yZWNpcGVEYXRhLnRhZ3MucHVzaCh0YWcpO1xuXHRcdFx0XHRcdHJmLnRhZ01hcFt0YWddID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbGVhbiBlbXB0eSBpdGVtcyBvdXQgb2YgYXJyYXkgYmVmb3JlIHNhdmluZ1xuXHRcdFx0ICogSW5ncmVkaWVudHMgb3IgRGlyZWN0aW9uc1xuXHRcdFx0ICogQWxzbyBjbGVhcnMgb3V0IGVtcHR5IGhlYWRpbmdzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1vZGVsTmFtZSB7c3RyaW5nfSBpbmdyZWRpZW50cyAvIGRpcmVjdGlvbnNcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbGVhbkVtcHRpZXMobW9kZWxOYW1lKSB7XG5cdFx0XHRcdHZhciBfYXJyYXkgPSByZi5yZWNpcGVEYXRhW21vZGVsTmFtZV07XG5cdFx0XHRcdHZhciBfY2hlY2sgPSBtb2RlbE5hbWUgPT09ICdpbmdyZWRpZW50cycgPyAnaW5ncmVkaWVudCcgOiAnc3RlcCc7XG5cblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKF9hcnJheSwgZnVuY3Rpb24ob2JqLCBpKSB7XG5cdFx0XHRcdFx0aWYgKCEhb2JqW19jaGVja10gPT09IGZhbHNlICYmICFvYmouaXNIZWFkaW5nIHx8IG9iai5pc0hlYWRpbmcgJiYgISFvYmouaGVhZGluZ1RleHQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0XHRfYXJyYXkuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzZXQgc2F2ZSBidXR0b25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzZXRTYXZlQnRuKCkge1xuXHRcdFx0XHRyZi5zYXZlZCA9IGZhbHNlO1xuXHRcdFx0XHRyZi51cGxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRyZi5zYXZlQnRuVGV4dCA9IF9pc0VkaXQgPyAnVXBkYXRlIFJlY2lwZScgOiAnU2F2ZSBSZWNpcGUnO1xuXHRcdFx0fVxuXG5cdFx0XHRfcmVzZXRTYXZlQnRuKCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVjaXBlIGNyZWF0ZWQgb3Igc2F2ZWQgc3VjY2Vzc2Z1bGx5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlY2lwZSB7cHJvbWlzZX0gaWYgZWRpdGluZyBldmVudFxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3JlY2lwZVNhdmVkKHJlY2lwZSkge1xuXHRcdFx0XHRyZi5zYXZlZCA9IHRydWU7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGVkIScgOiAnU2F2ZWQhJztcblxuXHRcdFx0XHQvKipcblx0XHRcdFx0ICogR28gdG8gbmV3IHNsdWcgKGlmIG5ldykgb3IgdXBkYXRlZCBzbHVnIChpZiBzbHVnIGNoYW5nZWQpXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRmdW5jdGlvbiBfZ29Ub05ld1NsdWcoKSB7XG5cdFx0XHRcdFx0dmFyIF9wYXRoID0gIV9pc0VkaXQgPyByZWNpcGUuc2x1ZyA6IHJmLnJlY2lwZURhdGEuc2x1ZyArICcvZWRpdCc7XG5cblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL3JlY2lwZS8nICsgX3BhdGgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFfaXNFZGl0IHx8IF9pc0VkaXQgJiYgX29yaWdpbmFsU2x1ZyAhPT0gcmYucmVjaXBlRGF0YS5zbHVnKSB7XG5cdFx0XHRcdFx0JHRpbWVvdXQoX2dvVG9OZXdTbHVnLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCAyMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlY2lwZSBub3Qgc2F2ZWQgLyBjcmVhdGVkIGR1ZSB0byBlcnJvclxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnIge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVjaXBlU2F2ZUVycm9yKGVycikge1xuXHRcdFx0XHRyZi5zYXZlQnRuVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdFx0cmYuc2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0XHQkdGltZW91dChfcmVzZXRTYXZlQnRuLCA0MDAwKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTYXZlIHJlY2lwZSBkYXRhXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3NhdmVSZWNpcGUoKSB7XG5cdFx0XHRcdGlmICghX2lzRWRpdCkge1xuXHRcdFx0XHRcdHJlY2lwZURhdGEuY3JlYXRlUmVjaXBlKHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlY2lwZURhdGEudXBkYXRlUmVjaXBlKHJmLnJlY2lwZS5faWQsIHJmLnJlY2lwZURhdGEpXG5cdFx0XHRcdFx0XHQudGhlbihfcmVjaXBlU2F2ZWQsIF9yZWNpcGVTYXZlRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2F2ZSByZWNpcGVcblx0XHRcdCAqIENsaWNrIG9uIHN1Ym1pdFxuXHRcdFx0ICovXG5cdFx0XHRyZi5zYXZlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRcdHJmLnNhdmVCdG5UZXh0ID0gX2lzRWRpdCA/ICdVcGRhdGluZy4uLicgOiAnU2F2aW5nLi4uJztcblxuXHRcdFx0XHQvLyBwcmVwIGRhdGEgZm9yIHNhdmluZ1xuXHRcdFx0XHRyZi5yZWNpcGVEYXRhLnNsdWcgPSBTbHVnLnNsdWdpZnkocmYucmVjaXBlRGF0YS5uYW1lKTtcblx0XHRcdFx0X2NsZWFuRW1wdGllcygnaW5ncmVkaWVudHMnKTtcblx0XHRcdFx0X2NsZWFuRW1wdGllcygnZGlyZWN0aW9ucycpO1xuXG5cdFx0XHRcdC8vIHNhdmUgdXBsb2FkZWQgZmlsZSwgaWYgdGhlcmUgaXMgb25lXG5cdFx0XHRcdC8vIG9uY2Ugc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkIGltYWdlLCBzYXZlIHJlY2lwZSB3aXRoIHJlZmVyZW5jZSB0byBzYXZlZCBpbWFnZVxuXHRcdFx0XHRpZiAocmYudXBsb2FkZWRGaWxlKSB7XG5cdFx0XHRcdFx0VXBsb2FkXG5cdFx0XHRcdFx0XHQudXBsb2FkKHtcblx0XHRcdFx0XHRcdFx0dXJsOiAnL2FwaS9yZWNpcGUvdXBsb2FkJyxcblx0XHRcdFx0XHRcdFx0ZmlsZTogcmYudXBsb2FkZWRGaWxlXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnByb2dyZXNzKGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgcHJvZ3Jlc3NQZXJjZW50YWdlID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcblx0XHRcdFx0XHRcdFx0cmYudXBsb2FkRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHJmLnVwbG9hZFByb2dyZXNzID0gcHJvZ3Jlc3NQZXJjZW50YWdlICsgJyUgJyArIGV2dC5jb25maWcuZmlsZS5uYW1lO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJmLnVwbG9hZFByb2dyZXNzKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXHRcdFx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmYudXBsb2FkSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdHJmLnJlY2lwZURhdGEucGhvdG8gPSBkYXRhLmZpbGVuYW1lO1xuXG5cdFx0XHRcdFx0XHRcdFx0X3NhdmVSZWNpcGUoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmVycm9yKGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0XHRyZi51cGxvYWRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdHJmLnVwbG9hZEVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdFcnJvciB1cGxvYWRpbmcgZmlsZTonLCBlcnIubWVzc2FnZSB8fCBlcnIpO1xuXG5cdFx0XHRcdFx0XHRcdF9yZWNpcGVTYXZlRXJyb3IoKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gbm8gdXBsb2FkZWQgZmlsZSwgc2F2ZSByZWNpcGVcblx0XHRcdFx0XHRfc2F2ZVJlY2lwZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmVjaXBlRm9ybUxpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtJywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gcmVjaXBlRm9ybUxpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBzZXQgdXAgJHNjb3BlIG9iamVjdCBmb3IgbmFtZXNwYWNpbmdcblx0XHRcdCRzY29wZS5yZmwgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBZGQgbmV3IGl0ZW1cblx0XHRcdCAqIEluZ3JlZGllbnQgb3IgRGlyZWN0aW9uIHN0ZXBcblx0XHRcdCAqIEZvY3VzIHRoZSBuZXdlc3QgaW5wdXQgZmllbGRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9IGNsaWNrIGV2ZW50XG5cdFx0XHQgKiBAcGFyYW0gbW9kZWwge29iamVjdH0gcmYucmVjaXBlRGF0YSBtb2RlbFxuXHRcdFx0ICogQHBhcmFtIHR5cGUge3N0cmluZ30gaW5nIC1vci0gc3RlcFxuXHRcdFx0ICogQHBhcmFtIGlzSGVhZGluZyB7Ym9vbGVhbn1cblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5hZGRJdGVtID0gZnVuY3Rpb24oJGV2ZW50LCBtb2RlbCwgdHlwZSwgaXNIZWFkaW5nKSB7XG5cdFx0XHRcdHZhciBfbmV3SXRlbSA9IHtcblx0XHRcdFx0XHRpZDogJHNjb3BlLmdlbmVyYXRlSWQoKSxcblx0XHRcdFx0XHR0eXBlOiB0eXBlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKGlzSGVhZGluZykge1xuXHRcdFx0XHRcdF9uZXdJdGVtLmlzSGVhZGluZyA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtb2RlbC5wdXNoKF9uZXdJdGVtKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgX25ld2VzdElucHV0ID0gYW5ndWxhci5lbGVtZW50KCRldmVudC50YXJnZXQpLnBhcmVudCgncCcpLnByZXYoJy5sYXN0JykuZmluZCgnaW5wdXQnKS5lcSgwKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuY2xpY2soKTtcblx0XHRcdFx0XHRfbmV3ZXN0SW5wdXQuZm9jdXMoKTsgICAvLyBUT0RPOiBmb2N1cyBpc24ndCBoaWdobGlnaHRpbmcgcHJvcGVybHlcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlbW92ZSBpdGVtXG5cdFx0XHQgKiBJbmdyZWRpZW50IG9yIERpcmVjdGlvbiBzdGVwXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBpIHtpbmRleH1cblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5yZW1vdmVJdGVtID0gZnVuY3Rpb24obW9kZWwsIGkpIHtcblx0XHRcdFx0bW9kZWwuc3BsaWNlKGksIDEpO1xuXHRcdFx0fTtcblxuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLkxBUkdFLFxuXHRcdFx0XHRlbnRlcjogZnVuY3Rpb24obXEpIHtcblx0XHRcdFx0XHQkc2NvcGUucmZsLmlzTGFyZ2VWaWV3ID0gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXhpdDogZnVuY3Rpb24obXEpIHtcblx0XHRcdFx0XHQkc2NvcGUucmZsLmlzTGFyZ2VWaWV3ID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE1vdmUgaXRlbSB1cCBvciBkb3duXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtICRldmVudFxuXHRcdFx0ICogQHBhcmFtIG1vZGVsIHtvYmplY3R9IHJmLnJlY2lwZURhdGEgbW9kZWxcblx0XHRcdCAqIEBwYXJhbSBvbGRJbmRleCB7aW5kZXh9IGN1cnJlbnQgaW5kZXhcblx0XHRcdCAqIEBwYXJhbSBuZXdJbmRleCB7bnVtYmVyfSBuZXcgaW5kZXhcblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlSXRlbSA9IGZ1bmN0aW9uKCRldmVudCwgbW9kZWwsIG9sZEluZGV4LCBuZXdJbmRleCkge1xuXHRcdFx0XHR2YXIgX2l0ZW0gPSBhbmd1bGFyLmVsZW1lbnQoJGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnbGknKTtcblxuXHRcdFx0XHRtb2RlbC5tb3ZlKG9sZEluZGV4LCBuZXdJbmRleCk7XG5cblx0XHRcdFx0X2l0ZW0uYWRkQ2xhc3MoJ21vdmVkJyk7XG5cblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0X2l0ZW0ucmVtb3ZlQ2xhc3MoJ21vdmVkJyk7XG5cdFx0XHRcdH0sIDcwMCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkc2NvcGUucmZsLm1vdmVJbmdyZWRpZW50cyA9IGZhbHNlO1xuXHRcdFx0JHNjb3BlLnJmbC5tb3ZlRGlyZWN0aW9ucyA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHJlY2lwZTogJz0nLFxuXHRcdFx0XHR1c2VySWQ6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcmVjaXBlRm9ybS50cGwuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiByZWNpcGVGb3JtQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3JmJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByZWNpcGVGb3JtTGlua1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgncmVjaXBlc0xpc3QnLCByZWNpcGVzTGlzdCk7XG5cblx0cmVjaXBlc0xpc3QuJGluamVjdCA9IFsnUmVjaXBlJ107XG5cblx0ZnVuY3Rpb24gcmVjaXBlc0xpc3QoUmVjaXBlKSB7XG5cblx0XHRyZWNpcGVzTGlzdEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVzTGlzdEN0cmwoJHNjb3BlKSB7XG5cdFx0XHQvLyBjb250cm9sbGVyQXMgdmlldyBtb2RlbFxuXHRcdFx0dmFyIHJsID0gdGhpcztcblxuXHRcdFx0Ly8gYnVpbGQgb3V0IHRoZSB0b3RhbCB0aW1lIGFuZCBudW1iZXIgb2YgaW5ncmVkaWVudHMgZm9yIHNvcnRpbmdcblx0XHRcdHZhciBfd2F0Y2hSZWNpcGVzID0gJHNjb3BlLiR3YXRjaCgncmwucmVjaXBlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmwucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdFx0XHRyZWNpcGUudG90YWxUaW1lID0gKHJlY2lwZS5jb29rVGltZSA/IHJlY2lwZS5jb29rVGltZSA6IDApICsgKHJlY2lwZS5wcmVwVGltZSA/IHJlY2lwZS5wcmVwVGltZSA6IDApO1xuXHRcdFx0XHRcdFx0cmVjaXBlLm5JbmcgPSByZWNpcGUuaW5ncmVkaWVudHMubGVuZ3RoO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIGRlcmVnaXN0ZXIgdGhlIHdhdGNoXG5cdFx0XHRcdFx0X3dhdGNoUmVjaXBlcygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gY29uZGl0aW9uYWxseSBzaG93IGNhdGVnb3J5IC8gdGFnIGZpbHRlcnNcblx0XHRcdC8vIGFsd2F5cyBzaG93IHNwZWNpYWwgZGlldCBmaWx0ZXJcblx0XHRcdGlmIChybC5jYXRlZ29yeUZpbHRlciA9PT0gJ3RydWUnKSB7XG5cdFx0XHRcdHJsLmNhdGVnb3JpZXMgPSBSZWNpcGUuY2F0ZWdvcmllcztcblx0XHRcdFx0cmwuc2hvd0NhdGVnb3J5RmlsdGVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChybC50YWdGaWx0ZXIgPT09ICd0cnVlJykge1xuXHRcdFx0XHRybC50YWdzID0gUmVjaXBlLnRhZ3M7XG5cdFx0XHRcdHJsLnNob3dUYWdGaWx0ZXIgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmwuc3BlY2lhbERpZXQgPSBSZWNpcGUuZGlldGFyeTtcblxuXHRcdFx0Ly8gc2V0IGFsbCBmaWx0ZXJzIHRvIGVtcHR5XG5cdFx0XHRybC5maWx0ZXJQcmVkaWNhdGVzID0ge307XG5cblx0XHRcdGZ1bmN0aW9uIF9yZXNldEZpbHRlclByZWRpY2F0ZXMoKSB7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuY2F0ID0gJyc7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMudGFnID0gJyc7XG5cdFx0XHRcdHJsLmZpbHRlclByZWRpY2F0ZXMuZGlldCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZXQgdXAgc29ydCBwcmVkaWNhdGUgYW5kIHJldmVyc2Fsc1xuXHRcdFx0cmwuc29ydFByZWRpY2F0ZSA9ICduYW1lJztcblxuXHRcdFx0cmwucmV2ZXJzZU9iaiA9IHtcblx0XHRcdFx0bmFtZTogZmFsc2UsXG5cdFx0XHRcdHRvdGFsVGltZTogZmFsc2UsXG5cdFx0XHRcdG5Jbmc6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0dmFyIF9sYXN0U29ydGVkQnkgPSAnbmFtZSc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIHNvcnQgYXNjL2Rlc2Ncblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcHJlZGljYXRlIHtzdHJpbmd9XG5cdFx0XHQgKi9cblx0XHRcdHJsLnRvZ2dsZVNvcnQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcblx0XHRcdFx0aWYgKF9sYXN0U29ydGVkQnkgPT09IHByZWRpY2F0ZSkge1xuXHRcdFx0XHRcdHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXSA9ICFybC5yZXZlcnNlT2JqW3ByZWRpY2F0ZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmwucmV2ZXJzZSA9IHJsLnJldmVyc2VPYmpbcHJlZGljYXRlXTtcblx0XHRcdFx0X2xhc3RTb3J0ZWRCeSA9IHByZWRpY2F0ZTtcblx0XHRcdH07XG5cblx0XHRcdC8vIG51bWJlciBvZiByZWNpcGVzIHRvIHNob3cvYWRkIGluIGEgc2V0XG5cdFx0XHR2YXIgX3Jlc3VsdHNTZXQgPSAxNTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNldCByZXN1bHRzIHNob3dpbmcgdG8gaW5pdGlhbCBkZWZhdWx0IG9uIHNlYXJjaC9maWx0ZXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzZXRSZXN1bHRzU2hvd2luZygpIHtcblx0XHRcdFx0cmwublJlc3VsdHNTaG93aW5nID0gX3Jlc3VsdHNTZXQ7XG5cdFx0XHR9XG5cdFx0XHRfcmVzZXRSZXN1bHRzU2hvd2luZygpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIExvYWQgTW9yZSByZXN1bHRzXG5cdFx0XHQgKi9cblx0XHRcdHJsLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJsLm5SZXN1bHRzU2hvd2luZyA9IHJsLm5SZXN1bHRzU2hvd2luZyArPSBfcmVzdWx0c1NldDtcblx0XHRcdH07XG5cblx0XHRcdC8vIHdhdGNoIHNlYXJjaCBxdWVyeSBhbmQgaWYgaXQgZXhpc3RzLCBjbGVhciBmaWx0ZXJzIGFuZCByZXNldCByZXN1bHRzIHNob3dpbmdcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3JsLnF1ZXJ5JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKCEhcmwucXVlcnkpIHtcblx0XHRcdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRcdFx0X3Jlc2V0UmVzdWx0c1Nob3dpbmcoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHdhdGNoIGZpbHRlcnMgYW5kIGlmIGFueSBvZiB0aGVtIGNoYW5nZSwgcmVzZXQgdGhlIHJlc3VsdHMgc2hvd2luZ1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgncmwuZmlsdGVyUHJlZGljYXRlcycsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmICghIW5ld1ZhbCAmJiBuZXdWYWwgIT09IG9sZFZhbCkge1xuXHRcdFx0XHRcdF9yZXNldFJlc3VsdHNTaG93aW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgX29wZW5GaWx0ZXJzT25sb2FkID0gJHNjb3BlLiR3YXRjaCgncmwub3BlbkZpbHRlcnMnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRybC5zaG93U2VhcmNoRmlsdGVyID0gbmV3VmFsID09PSAndHJ1ZSc7XG5cdFx0XHRcdFx0X29wZW5GaWx0ZXJzT25sb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBzZWFyY2gvZmlsdGVyIHNlY3Rpb24gb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0cmwudG9nZ2xlU2VhcmNoRmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJsLnNob3dTZWFyY2hGaWx0ZXIgPSAhcmwuc2hvd1NlYXJjaEZpbHRlcjtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xlYXIgc2VhcmNoIHF1ZXJ5IGFuZCBhbGwgZmlsdGVyc1xuXHRcdFx0ICovXG5cdFx0XHRybC5jbGVhclNlYXJjaEZpbHRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfcmVzZXRGaWx0ZXJQcmVkaWNhdGVzKCk7XG5cdFx0XHRcdHJsLnF1ZXJ5ID0gJyc7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNob3cgbnVtYmVyIG9mIGN1cnJlbnRseSBhY3RpdmUgc2VhcmNoICsgZmlsdGVyIGl0ZW1zXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9XG5cdFx0XHQgKiBAcGFyYW0gZmlsdGVyc09iaiB7b2JqZWN0fVxuXHRcdFx0ICogQHJldHVybnMge251bWJlcn1cblx0XHRcdCAqL1xuXHRcdFx0cmwuYWN0aXZlU2VhcmNoRmlsdGVycyA9IGZ1bmN0aW9uKHF1ZXJ5LCBmaWx0ZXJzT2JqKSB7XG5cdFx0XHRcdHZhciB0b3RhbCA9IDA7XG5cblx0XHRcdFx0aWYgKHF1ZXJ5KSB7XG5cdFx0XHRcdFx0dG90YWwgPSB0b3RhbCArPSAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzT2JqLCBmdW5jdGlvbihmaWx0ZXIpIHtcblx0XHRcdFx0XHRpZiAoZmlsdGVyKSB7XG5cdFx0XHRcdFx0XHR0b3RhbCA9IHRvdGFsICs9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gdG90YWw7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJlY2lwZXNMaXN0TGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGF0dHJzJywgJyRlbGVtJ107XG5cblx0XHRmdW5jdGlvbiByZWNpcGVzTGlzdExpbmsoJHNjb3BlLCAkYXR0cnMsICRlbGVtKSB7XG5cdFx0XHQkc2NvcGUucmxsID0ge307XG5cblx0XHRcdC8vIHdhdGNoIHRoZSBjdXJyZW50bHkgdmlzaWJsZSBudW1iZXIgb2YgcmVjaXBlcyB0byBkaXNwbGF5IGEgY291bnRcblx0XHRcdCRzY29wZS4kd2F0Y2goXG5cdFx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiBhbmd1bGFyLmVsZW1lbnQoJy5yZWNpcGVzTGlzdC1saXN0LWl0ZW0nKS5sZW5ndGg7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdFx0JHNjb3BlLnJsbC5kaXNwbGF5ZWRSZXN1bHRzID0gbmV3VmFsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRyZWNpcGVzOiAnPScsXG5cdFx0XHRcdG9wZW5GaWx0ZXJzOiAnQCcsXG5cdFx0XHRcdGN1c3RvbUxhYmVsczogJ0AnLFxuXHRcdFx0XHRjYXRlZ29yeUZpbHRlcjogJ0AnLFxuXHRcdFx0XHR0YWdGaWx0ZXI6ICdAJ1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcmVjaXBlc0xpc3QudHBsLmh0bWwnLFxuXHRcdFx0Y29udHJvbGxlcjogcmVjaXBlc0xpc3RDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAncmwnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IHJlY2lwZXNMaXN0TGlua1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBGb3IgZXZlbnRzIGJhc2VkIG9uIHZpZXdwb3J0IHNpemUgLSB1cGRhdGVzIGFzIHZpZXdwb3J0IGlzIHJlc2l6ZWRcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCd2aWV3U3dpdGNoJywgdmlld1N3aXRjaCk7XG5cblx0dmlld1N3aXRjaC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gdmlld1N3aXRjaChtZWRpYUNoZWNrLCBNUSwgJHRpbWVvdXQpIHtcblxuXHRcdHZpZXdTd2l0Y2hMaW5rLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0LyoqXG5cdFx0ICogdmlld1N3aXRjaCBkaXJlY3RpdmUgbGluayBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHZpZXdTd2l0Y2hMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS52cyA9IHt9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBleGl0IG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRGbigpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluaXRpYWxpemUgbWVkaWFDaGVja1xuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyRm4sXG5cdFx0XHRcdGV4aXQ6IF9leGl0Rm5cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IHZpZXdTd2l0Y2hMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ09BVVRIQ0xJRU5UUyddO1xuXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlciwgT0FVVEhDTElFTlRTKSB7XG5cdFx0JGF1dGhQcm92aWRlci5sb2dpblVybCA9IE9BVVRIQ0xJRU5UUy5MT0dJTlVSTDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IE9BVVRIQ0xJRU5UUy5DTElFTlQuRkJcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiBPQVVUSENMSUVOVFMuQ0xJRU5ULkdPT0dMRVxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogT0FVVEhDTElFTlRTLkNMSUVOVC5UV0lUVEVSXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogT0FVVEhDTElFTlRTLkNMSUVOVC5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblxuXHRmdW5jdGlvbiBhdXRoUnVuKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJGF1dGgpIHtcblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdFx0aWYgKG5leHQgJiYgbmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5zZWN1cmUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuYXV0aFBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG5cdFx0XHRcdCRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyBzZW5kIHVzZXIgdG8gbG9naW5cblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnL2xvZ2luJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cbn0pKCk7IiwiLy8gcm91dGVzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGUvUmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdSZWNpcGVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmVjaXBlJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlcy9hdXRob3IvOnVzZXJJZCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvcmVjaXBlcy1hcmNoaXZlcy9SZWNpcGVzQXJjaGl2ZXMudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1JlY2lwZXNBdXRob3JDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncmEnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9yZWNpcGVzL3RhZy86dGFnJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc1RhZ0N0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdyYSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3JlY2lwZXMvY2F0ZWdvcnkvOmNhdGVnb3J5Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9yZWNpcGVzLWFyY2hpdmVzL1JlY2lwZXNBcmNoaXZlcy52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUmVjaXBlc0NhdGVnb3J5Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3JhJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbXktcmVjaXBlcycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvbXktcmVjaXBlcy9NeVJlY2lwZXMudmlldy5odG1sJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlLFxuXHRcdFx0XHRyZWxvYWRPblNlYXJjaDogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNeVJlY2lwZXNDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbXlSZWNpcGVzJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvcmVjaXBlLzpzbHVnL2VkaXQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL3JlY2lwZS9FZGl0UmVjaXBlLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRWRpdFJlY2lwZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlZGl0J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0cmVsb2FkT25TZWFyY2g6IGZhbHNlLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50J1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ1JlcycsIFJlcyk7XG5cblx0ZnVuY3Rpb24gUmVzKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3VjY2Vzczogc3VjY2Vzcyxcblx0XHRcdGVycm9yOiBlcnJvclxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKiBVc2VmdWwgZm9yIEFQSXMgKGllLCB3aXRoIG5naW54KSB3aGVyZSBzZXJ2ZXIgZXJyb3IgSFRNTCBwYWdlIG1heSBiZSByZXR1cm5lZCBpbiBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gUmVjaXBlIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5mYWN0b3J5KCdyZWNpcGVEYXRhJywgcmVjaXBlRGF0YSk7XG5cblx0cmVjaXBlRGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcblxuXHRmdW5jdGlvbiByZWNpcGVEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFJlY2lwZTogZ2V0UmVjaXBlLFxuXHRcdFx0Y3JlYXRlUmVjaXBlOiBjcmVhdGVSZWNpcGUsXG5cdFx0XHR1cGRhdGVSZWNpcGU6IHVwZGF0ZVJlY2lwZSxcblx0XHRcdGRlbGV0ZVJlY2lwZTogZGVsZXRlUmVjaXBlLFxuXHRcdFx0Z2V0UHVibGljUmVjaXBlczogZ2V0UHVibGljUmVjaXBlcyxcblx0XHRcdGdldE15UmVjaXBlczogZ2V0TXlSZWNpcGVzLFxuXHRcdFx0Z2V0QXV0aG9yUmVjaXBlczogZ2V0QXV0aG9yUmVjaXBlcyxcblx0XHRcdGZpbGVSZWNpcGU6IGZpbGVSZWNpcGUsXG5cdFx0XHRnZXRGaWxlZFJlY2lwZXM6IGdldEZpbGVkUmVjaXBlcyxcblx0XHRcdGNsZWFuVXBsb2FkczogY2xlYW5VcGxvYWRzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCByZWNpcGUgKEdFVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBzbHVnIHtzdHJpbmd9IHJlY2lwZSBzbHVnXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0UmVjaXBlKHNsdWcpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3JlY2lwZS8nICsgc2x1Zylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgcmVjaXBlIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjcmVhdGVSZWNpcGUocmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wb3N0KCcvYXBpL3JlY2lwZS9uZXcnLCByZWNpcGVEYXRhKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYSByZWNpcGUgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBpZCB7c3RyaW5nfSByZWNpcGUgSUQgKGluIGNhc2Ugc2x1ZyBoYXMgY2hhbmdlZClcblx0XHQgKiBAcGFyYW0gcmVjaXBlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVJlY2lwZShpZCwgcmVjaXBlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvcmVjaXBlLycgKyBpZCwgcmVjaXBlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRGVsZXRlIGEgcmVjaXBlIChERUxFVEUpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gcmVjaXBlIElEXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGVsZXRlUmVjaXBlKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmRlbGV0ZSgnL2FwaS9yZWNpcGUvJyArIGlkKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRQdWJsaWNSZWNpcGVzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcycpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBteSByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRNeVJlY2lwZXMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9yZWNpcGVzL21lJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGEgc3BlY2lmaWMgdXNlcidzIHB1YmxpYyByZWNpcGVzIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdXNlcklkIHtzdHJpbmd9IHVzZXIgSURcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBdXRob3JSZWNpcGVzKHVzZXJJZCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvcmVjaXBlcy9hdXRob3IvJyArIHVzZXJJZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRmlsZS91bmZpbGUgdGhpcyByZWNpcGUgaW4gdXNlciBkYXRhIChQVVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWQge3N0cmluZ30gSUQgb2YgcmVjaXBlIHRvIHNhdmVcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmaWxlUmVjaXBlKHJlY2lwZUlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9yZWNpcGUvJyArIHJlY2lwZUlkICsgJy9maWxlJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IG15IGZpbGVkIHJlY2lwZXMgKFBPU1QpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVjaXBlSWRzIHtBcnJheX0gYXJyYXkgb2YgdXNlcidzIGZpbGVkIHJlY2lwZSBJRHNcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRGaWxlZFJlY2lwZXMocmVjaXBlSWRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlcy9tZS9maWxlZCcsIHJlY2lwZUlkcylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2xlYW4gdXBsb2FkIGZpbGVzIChQT1NUKVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbGVzXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xlYW5VcGxvYWRzKGZpbGVzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnBvc3QoJy9hcGkvcmVjaXBlL2NsZWFuLXVwbG9hZHMnLCBmaWxlcyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmZhY3RvcnkoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldEF1dGhvcjogZ2V0QXV0aG9yLFxuXHRcdFx0Z2V0VXNlcjogZ2V0VXNlcixcblx0XHRcdHVwZGF0ZVVzZXI6IHVwZGF0ZVVzZXIsXG5cdFx0XHRnZXRBbGxVc2VyczogZ2V0QWxsVXNlcnNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHJlY2lwZSBhdXRob3IncyBiYXNpYyBkYXRhIChHRVQpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gaWQge3N0cmluZ30gTW9uZ29EQiBJRCBvZiB1c2VyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QXV0aG9yKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VyLycgKyBpZClcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGEgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGEgKFBVVClcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSkgKEdFVClcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgTVEgPSB7XG5cdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxuXHRcdExBUkdFOiAnKG1pbi13aWR0aDogNzY4cHgpJ1xuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29uc3RhbnQoJ01RJywgTVEpO1xufSkoKTsiLCIvLyBGb3IgdG91Y2hlbmQvbW91c2V1cCBibHVyXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmRpcmVjdGl2ZSgnYmx1ck9uRW5kJywgYmx1ck9uRW5kKTtcblxuXHRmdW5jdGlvbiBibHVyT25FbmQoKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGJsdXJPbkVuZExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogYmx1ck9uRW5kIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBibHVyT25FbmRMaW5rKCRzY29wZSwgJGVsZW0pIHtcblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQkZWxlbS5iaW5kKCd0b3VjaGVuZCcsIF9ibHVyRWxlbSk7XG5cdFx0XHRcdCRlbGVtLmJpbmQoJ21vdXNldXAnLCBfYmx1ckVsZW0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgX29uRGVzdHJveSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRmlyZSBibHVyIGV2ZW50XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2JsdXJFbGVtKCkge1xuXHRcdFx0XHQkZWxlbS50cmlnZ2VyKCdibHVyJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT24gJGRlc3Ryb3ksIHVuYmluZCBoYW5kbGVyc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vbkRlc3Ryb3koKSB7XG5cdFx0XHRcdCRlbGVtLnVuYmluZCgndG91Y2hlbmQnLCBfYmx1ckVsZW0pO1xuXHRcdFx0XHQkZWxlbS51bmJpbmQoJ21vdXNldXAnLCBfYmx1ckVsZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5kaXJlY3RpdmUoJ2RldGVjdEFkYmxvY2snLCBkZXRlY3RBZGJsb2NrKTtcblxuXHRkZXRlY3RBZGJsb2NrLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2NhdGlvbiddO1xuXG5cdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2soJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBkZXRlY3RBZGJsb2NrTGluayxcblx0XHRcdHRlbXBsYXRlOiAgICc8ZGl2IGNsYXNzPVwiYWQtdGVzdCBmYS1mYWNlYm9vayBmYS10d2l0dGVyXCIgc3R5bGU9XCJoZWlnaHQ6MXB4O1wiPjwvZGl2PicgK1xuXHRcdFx0XHRcdFx0JzxkaXYgbmctaWY9XCJhYi5ibG9ja2VkXCIgY2xhc3M9XCJhYi1tZXNzYWdlIGFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgK1xuXHRcdFx0XHRcdFx0JzxpIGNsYXNzPVwiZmEgZmEtYmFuXCI+PC9pPiA8c3Ryb25nPkFkQmxvY2s8L3N0cm9uZz4gaXMgcHJvaGliaXRpbmcgaW1wb3J0YW50IGZ1bmN0aW9uYWxpdHkhIFBsZWFzZSBkaXNhYmxlIGFkIGJsb2NraW5nIG9uIDxzdHJvbmc+e3thYi5ob3N0fX08L3N0cm9uZz4uIFRoaXMgc2l0ZSBpcyBhZC1mcmVlLicgK1xuXHRcdFx0XHRcdFx0JzwvZGl2Pidcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogZGV0ZWN0QWRCbG9jayBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtXG5cdFx0ICogQHBhcmFtICRhdHRyc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2tMaW5rKCRzY29wZSwgJGVsZW0sICRhdHRycykge1xuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHRcdCRzY29wZS5hYiA9IHt9O1xuXG5cdFx0XHRcdC8vIGhvc3RuYW1lIGZvciBtZXNzYWdpbmdcblx0XHRcdFx0JHNjb3BlLmFiLmhvc3QgPSAkbG9jYXRpb24uaG9zdCgpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KF9hcmVBZHNCbG9ja2VkLCAyMDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENoZWNrIGlmIGFkcyBhcmUgYmxvY2tlZCAtIGNhbGxlZCBpbiAkdGltZW91dCB0byBsZXQgQWRCbG9ja2VycyBydW5cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXJlQWRzQmxvY2tlZCgpIHtcblx0XHRcdFx0dmFyIF9hID0gJGVsZW0uZmluZCgnLmFkLXRlc3QnKTtcblxuXHRcdFx0XHQkc2NvcGUuYWIuYmxvY2tlZCA9IF9hLmhlaWdodCgpIDw9IDAgfHwgISRlbGVtLmZpbmQoJy5hZC10ZXN0OnZpc2libGUnKS5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCdkaXZpZGVyJywgZGl2aWRlcik7XG5cblx0ZnVuY3Rpb24gZGl2aWRlcigpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwickJveC1kaXZpZGVyXCI+PGkgY2xhc3M9XCJmYSBmYS1jdXRsZXJ5XCI+PC9pPjwvZGl2Pidcblx0XHR9O1xuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5maWx0ZXIoJ3RyaW1TdHInLCB0cmltU3RyKTtcblxuXHRmdW5jdGlvbiB0cmltU3RyKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihzdHIsIGNoYXJzKSB7XG5cdFx0XHR2YXIgdHJpbW1lZFN0ciA9IHN0cjtcblx0XHRcdHZhciBfY2hhcnMgPSBjaGFycyA9PT0gdW5kZWZpbmVkID8gNTAgOiBjaGFycztcblxuXHRcdFx0aWYgKHN0ci5sZW5ndGggPiBfY2hhcnMpIHtcblx0XHRcdFx0dHJpbW1lZFN0ciA9IHN0ci5zdWJzdHIoMCwgX2NoYXJzKSArICcuLi4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJpbW1lZFN0cjtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyQm94JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgaGVhZGVyQ3RybCk7XHJcblxyXG5cdGhlYWRlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICckYXV0aCcsICd1c2VyRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBoZWFkZXJDdHJsKCRzY29wZSwgJGxvY2F0aW9uLCAkYXV0aCwgdXNlckRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCcvbG9naW4nKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIGFkbWluVXNlciBpcyB1bmRlZmluZWQsXHJcblx0XHQgKiBnZXQgdGhlIHVzZXIgYW5kIHNldCBhZG1pblVzZXIgYm9vbGVhbi5cclxuXHRcdCAqXHJcblx0XHQgKiBEbyB0aGlzIG9uIGZpcnN0IGNvbnRyb2xsZXIgbG9hZCAoaW5pdCwgcmVmcmVzaClcclxuXHRcdCAqIGFuZCBzdWJzZXF1ZW50IGxvY2F0aW9uIGNoYW5nZXMgKGllLCBjYXRjaGluZyBsb2dvdXQsIGxvZ2luLCBldGMpLlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9jaGVja1VzZXJBZG1pbigpIHtcclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXJcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdFx0aGVhZGVyLnVzZXIgPSBkYXRhO1xyXG5cdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgZ2V0IHVzZXIgZGF0YVxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLnVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0X2NoZWNrVXNlckFkbWluKCk7XHJcblx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2NoZWNrVXNlckFkbWluKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XHJcblx0XHQgKiBOZWVkcyB0byBiZSBhIGZ1bmN0aW9uIHNvIGl0IGlzIHJlLWV4ZWN1dGVkXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWydtZWRpYUNoZWNrJywgJ01RJywgJyR0aW1lb3V0JywgJyR3aW5kb3cnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKG1lZGlhQ2hlY2ssIE1RLCAkdGltZW91dCwgJHdpbmRvdykge1xuXG5cdFx0bmF2Q29udHJvbExpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycyddO1xuXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHR2YXIgX3dpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KTtcblx0XHRcdHZhciBfYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfYm9keS5maW5kKCcubGF5b3V0LWNhbnZhcycpO1xuXHRcdFx0dmFyIF9uYXZPcGVuO1xuXHRcdFx0dmFyIF9kZWJvdW5jZVJlc2l6ZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfbGF5b3V0Q2FudmFzLmNzcygnbWluLWhlaWdodCcsICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBCaW5kIHJlc2l6ZSBldmVudCB0byB3aW5kb3dcblx0XHRcdCAqIEFwcGx5IG1pbi1oZWlnaHQgdG8gbGF5b3V0IHRvXG5cdFx0XHQgKiBtYWtlIG5hdiBmdWxsLWhlaWdodFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfbGF5b3V0SGVpZ2h0KCkge1xuXHRcdFx0XHQkdGltZW91dC5jYW5jZWwoX2RlYm91bmNlUmVzaXplKTtcblx0XHRcdFx0X2RlYm91bmNlUmVzaXplID0gJHRpbWVvdXQoX3Jlc2l6ZWQsIDIwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJ1biBpbml0aWFsIGxheW91dCBoZWlnaHQgY2FsY3VsYXRpb25cblx0XHRcdF9sYXlvdXRIZWlnaHQoKTtcblxuXHRcdFx0Ly8gYmluZCBoZWlnaHQgY2FsY3VsYXRpb24gdG8gd2luZG93IHJlc2l6ZVxuXHRcdFx0X3dpbi5iaW5kKCdyZXNpemUnLCBfbGF5b3V0SGVpZ2h0KTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQnKVxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmICghX25hdk9wZW4pIHtcblx0XHRcdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgX2Nsb3NlTmF2KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZXhpdGluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfYm9keS5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCBuYXYtb3BlbicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFVuYmluZCByZXNpemUgbGlzdGVuZXIgb24gZGVzdHJ1Y3Rpb24gb2Ygc2NvcGVcblx0XHRcdCAqL1xuXHRcdFx0JHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0d2luLnVuYmluZCgncmVzaXplJywgX2xheW91dEhlaWdodCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblx0fVxuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBBY2NvdW50Q3RybCk7XG5cblx0QWNjb3VudEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnJHRpbWVvdXQnLCAnT0FVVEgnLCAnVXNlcicsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBBY2NvdW50Q3RybCgkc2NvcGUsIFBhZ2UsICRhdXRoLCB1c2VyRGF0YSwgJHRpbWVvdXQsIE9BVVRILCBVc2VyLCAkbG9jYXRpb24pIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFjY291bnQgPSB0aGlzO1xuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdNeSBBY2NvdW50Jyk7XG5cblx0XHRhY2NvdW50LnRhYnMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdVc2VyIEluZm8nLFxuXHRcdFx0XHRxdWVyeTogJ3VzZXItaW5mbydcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdNYW5hZ2UgTG9naW5zJyxcblx0XHRcdFx0cXVlcnk6ICdtYW5hZ2UtbG9naW5zJ1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0YWNjb3VudC5jdXJyZW50VGFiID0gX3RhYiA/IF90YWIgOiAndXNlci1pbmZvJztcblxuXHRcdC8qKlxuXHRcdCAqIENoYW5nZSB0YWJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBxdWVyeSB7c3RyaW5nfSB0YWIgdG8gc3dpdGNoIHRvXG5cdFx0ICovXG5cdFx0YWNjb3VudC5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdGFjY291bnQuY3VycmVudFRhYiA9IHF1ZXJ5O1xuXHRcdH07XG5cblx0XHQvLyBhbGwgYXZhaWxhYmxlIGxvZ2luIHNlcnZpY2VzXG5cdFx0YWNjb3VudC5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWNjb3VudC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBBY2NvdW50IFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRhY2NvdW50LnVzZXIgPSBkYXRhO1xuXHRcdFx0XHRhY2NvdW50LmFkbWluaXN0cmF0b3IgPSBhY2NvdW50LnVzZXIuaXNBZG1pbjtcblx0XHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0XHRhY2NvdW50LnNob3dBY2NvdW50ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IGFuIGVycm9yIGFsZXJ0IGluIHRoZSBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0XHRhY2NvdW50LmVycm9yR2V0dGluZ1VzZXIgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0X2J0blNhdmVSZXNldCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfd2F0Y2hEaXNwbGF5TmFtZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCA9PT0gJycgfHwgbmV3VmFsID09PSBudWxsKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRW50ZXIgTmFtZSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGFjY291bnQudXBkYXRlUHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2VzcyBjYWxsYmFjayB3aGVuIHByb2ZpbGUgaGFzIGJlZW4gdXBkYXRlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlZCEnO1xuXG5cdFx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghIWFjY291bnQudXNlci5kaXNwbGF5TmFtZSkge1xuXHRcdFx0XHQvLyBTZXQgc3RhdHVzIHRvIFNhdmluZy4uLiBhbmQgdXBkYXRlIHVwb24gc3VjY2VzcyBvciBlcnJvciBpbiBjYWxsYmFja3Ncblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgdXNlciwgcGFzc2luZyBwcm9maWxlIGRhdGEgYW5kIGFzc2lnbmluZyBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3Ncblx0XHRcdFx0dXNlckRhdGEudXBkYXRlVXNlcihwcm9maWxlRGF0YSkudGhlbihfdXBkYXRlU3VjY2VzcywgX3VwZGF0ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVW5saW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LnVubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC51bmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5tZXNzYWdlIDogJ0NvdWxkIG5vdCB1bmxpbmsgJyArIHByb3ZpZGVyICsgJyBhY2NvdW50Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FkbWluQ3RybCcsIEFkbWluQ3RybCk7XG5cblx0QWRtaW5DdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnVXNlciddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybChQYWdlLCAkYXV0aCwgdXNlckRhdGEsIFVzZXIpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FkbWluJyk7XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGFkbWluLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgQWRtaW4gVUlcblx0XHQgKiBEaXNwbGF5IGxpc3Qgb2YgdXNlcnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFkbWluLnVzZXJzID0gZGF0YTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGFkbWluLnVzZXJzLCBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdHVzZXIubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKHVzZXIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHVzZXJEYXRhLmdldEFsbFVzZXJzKCkudGhlbihfZ2V0QWxsVXNlcnNTdWNjZXNzLCBfZ2V0QWxsVXNlcnNFcnJvcik7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnckJveCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICdSZWNpcGUnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKFBhZ2UsIHJlY2lwZURhdGEsIFJlY2lwZSwgJGF1dGgsIHVzZXJEYXRhLCAkbG9jYXRpb24pIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHRQYWdlLnNldFRpdGxlKCdBbGwgUmVjaXBlcycpO1xyXG5cclxuXHRcdHZhciBfdGFiID0gJGxvY2F0aW9uLnNlYXJjaCgpLnZpZXc7XHJcblxyXG5cdFx0aG9tZS50YWJzID0gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1JlY2lwZSBCb3hlcycsXHJcblx0XHRcdFx0cXVlcnk6ICdyZWNpcGUtYm94ZXMnXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnU2VhcmNoIC8gQnJvd3NlIEFsbCcsXHJcblx0XHRcdFx0cXVlcnk6ICdzZWFyY2gtYnJvd3NlLWFsbCdcclxuXHRcdFx0fVxyXG5cdFx0XTtcclxuXHRcdGhvbWUuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3JlY2lwZS1ib3hlcyc7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGFuZ2UgdGFiXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cclxuXHRcdCAqL1xyXG5cdFx0aG9tZS5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xyXG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xyXG5cdFx0XHRob21lLmN1cnJlbnRUYWIgPSBxdWVyeTtcclxuXHRcdH07XHJcblxyXG5cdFx0aG9tZS5jYXRlZ29yaWVzID0gUmVjaXBlLmNhdGVnb3JpZXM7XHJcblx0XHRob21lLnRhZ3MgPSBSZWNpcGUudGFncztcclxuXHJcblx0XHQvLyBidWlsZCBoYXNobWFwIG9mIGNhdGVnb3JpZXNcclxuXHRcdGhvbWUubWFwQ2F0ZWdvcmllcyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBob21lLmNhdGVnb3JpZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW2hvbWUuY2F0ZWdvcmllc1tpXV0gPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGJ1aWxkIGhhc2htYXAgb2YgdGFnc1xyXG5cdFx0aG9tZS5tYXBUYWdzID0ge307XHJcblx0XHRmb3IgKHZhciBuID0gMDsgbiA8IGhvbWUudGFncy5sZW5ndGg7IG4rKykge1xyXG5cdFx0XHRob21lLm1hcFRhZ3NbaG9tZS50YWdzW25dXSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHB1YmxpYyByZWNpcGVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcHVibGljUmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLnJlY2lwZXMgPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gY291bnQgbnVtYmVyIG9mIHJlY2lwZXMgcGVyIGNhdGVnb3J5IGFuZCB0YWdcclxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGhvbWUucmVjaXBlcywgZnVuY3Rpb24ocmVjaXBlKSB7XHJcblx0XHRcdFx0aG9tZS5tYXBDYXRlZ29yaWVzW3JlY2lwZS5jYXRlZ29yeV0gKz0gMTtcclxuXHJcblx0XHRcdFx0Zm9yICh2YXIgdCA9IDA7IHQgPCByZWNpcGUudGFncy5sZW5ndGg7IHQrKykge1xyXG5cdFx0XHRcdFx0aG9tZS5tYXBUYWdzW3JlY2lwZS50YWdzW3RdXSArPSAxO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGYWlsdXJlIHRvIHJldHVybiBwdWJsaWMgcmVjaXBlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBlcnJvclxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3B1YmxpY1JlY2lwZXNGYWlsdXJlKGVycm9yKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdUaGVyZSB3YXMgYW4gZXJyb3IgcmV0cmlldmluZyByZWNpcGVzOicsIGVycm9yKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZWNpcGVEYXRhLmdldFB1YmxpY1JlY2lwZXMoKVxyXG5cdFx0XHQudGhlbihfcHVibGljUmVjaXBlc1N1Y2Nlc3MsIF9wdWJsaWNSZWNpcGVzRmFpbHVyZSk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZ2V0dGluZyB1c2VyXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUudXNlciA9IGRhdGE7XHJcblx0XHRcdGhvbWUud2VsY29tZU1zZyA9ICdIZWxsbywgJyArIGhvbWUudXNlci5kaXNwbGF5TmFtZSArICchIFdhbnQgdG8gPGEgaHJlZj1cIi9teS1yZWNpcGVzP3ZpZXc9bmV3LXJlY2lwZVwiPmFkZCBhIG5ldyByZWNpcGU8L2E+Pyc7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkLCBnZXQgdXNlciBkYXRhXHJcblx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaG9tZS51c2VyID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcclxuXHRcdH0gZWxzZSBpZiAoISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcblx0XHRcdGhvbWUud2VsY29tZU1zZyA9ICdXZWxjb21lIHRvIDxzdHJvbmc+ckJveDwvc3Ryb25nPiEgQnJvd3NlIHRocm91Z2ggdGhlIHB1YmxpYyByZWNpcGUgYm94IG9yIDxhIGhyZWY9XCIvbG9naW5cIj5Mb2dpbjwvYT4gdG8gZmlsZSBvciBjb250cmlidXRlIHJlY2lwZXMuJztcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5cdExvZ2luQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ09BVVRIJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gTG9naW5DdHJsKFBhZ2UsICRhdXRoLCBPQVVUSCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2sgaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRsb2dpbi5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQXV0aGVudGljYXRlIHRoZSB1c2VyIHZpYSBPYXV0aCB3aXRoIHRoZSBzcGVjaWZpZWQgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlciAtICh0d2l0dGVyLCBmYWNlYm9vaywgZ2l0aHViLCBnb29nbGUpXG5cdFx0ICovXG5cdFx0bG9naW4uYXV0aGVudGljYXRlID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IHRydWU7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcblx0XHRcdCAqIEdvIHRvIGluaXRpYWxseSBpbnRlbmRlZCBhdXRoZW50aWNhdGVkIHBhdGhcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge3Byb21pc2V9XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aFN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCRyb290U2NvcGUuYXV0aFBhdGgpIHtcblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgkcm9vdFNjb3BlLmF1dGhQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGF1dGhlbnRpY2F0aW5nXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtwcm9taXNlfVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2F1dGhDYXRjaChyZXNwb25zZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gJ2Vycm9yJztcblx0XHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChfYXV0aENhdGNoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXG5cdFx0ICovXG5cdFx0bG9naW4ubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkYXV0aC5sb2dvdXQoJy9sb2dpbicpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0UmVjaXBlQ3RybCcsIEVkaXRSZWNpcGVDdHJsKTtcblxuXHRFZGl0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRsb2NhdGlvbicsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIEVkaXRSZWNpcGVDdHJsKFBhZ2UsICRhdXRoLCAkcm91dGVQYXJhbXMsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBlZGl0ID0gdGhpcztcblx0XHR2YXIgX3JlY2lwZVNsdWcgPSAkcm91dGVQYXJhbXMuc2x1Zztcblx0XHR2YXIgX3RhYiA9ICRsb2NhdGlvbi5zZWFyY2goKS52aWV3O1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnRWRpdCBSZWNpcGUnKTtcblxuXHRcdGVkaXQudGFicyA9IFtcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0VkaXQgUmVjaXBlJyxcblx0XHRcdFx0cXVlcnk6ICdlZGl0J1xuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ0RlbGV0ZSBSZWNpcGUnLFxuXHRcdFx0XHRxdWVyeTogJ2RlbGV0ZSdcblx0XHRcdH1cblx0XHRdO1xuXHRcdGVkaXQuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ2VkaXQnO1xuXG5cdFx0LyoqXG5cdFx0ICogQ2hhbmdlIHRhYlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHF1ZXJ5IHtzdHJpbmd9IHRhYiB0byBzd2l0Y2ggdG9cblx0XHQgKi9cblx0XHRlZGl0LmNoYW5nZVRhYiA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cdFx0XHQkbG9jYXRpb24uc2VhcmNoKCd2aWV3JywgcXVlcnkpO1xuXHRcdFx0ZWRpdC5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRlZGl0LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC51c2VyID0gZGF0YTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0VXNlcigpXG5cdFx0XHQudGhlbihfZ2V0VXNlclN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3MgcmVjaXBlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRlZGl0LnJlY2lwZSA9IGRhdGE7XG5cdFx0XHRlZGl0Lm9yaWdpbmFsTmFtZSA9IGVkaXQucmVjaXBlLm5hbWU7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdFZGl0ICcgKyBlZGl0Lm9yaWdpbmFsTmFtZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JlY2lwZUVycm9yKGVycikge1xuXHRcdFx0ZWRpdC5yZWNpcGUgPSAnZXJyb3InO1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnRXJyb3InKTtcblx0XHRcdGVkaXQuZXJyb3JNc2cgPSBlcnIuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShfcmVjaXBlU2x1Zylcblx0XHRcdC50aGVuKF9yZWNpcGVTdWNjZXNzLCBfcmVjaXBlRXJyb3IpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgZGVsZXRlIGJ1dHRvblxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVzZXREZWxldGVCdG4oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZWQgPSBmYWxzZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGUgUmVjaXBlJztcblx0XHR9XG5cblx0XHRfcmVzZXREZWxldGVCdG4oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBhZnRlciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gdHJ1ZTtcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdEZWxldGVkISc7XG5cblx0XHRcdGZ1bmN0aW9uIF9nb1RvUmVjaXBlcygpIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9teS1yZWNpcGVzJyk7XG5cdFx0XHRcdCRsb2NhdGlvbi5zZWFyY2goJ3ZpZXcnLCBudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2dvVG9SZWNpcGVzLCAxNTAwKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFcnJvciBkZWxldGluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2RlbGV0ZUVycm9yKCkge1xuXHRcdFx0ZWRpdC5kZWxldGVkID0gJ2Vycm9yJztcblx0XHRcdGVkaXQuZGVsZXRlQnRuVGV4dCA9ICdFcnJvciBkZWxldGluZyEnO1xuXG5cdFx0XHQkdGltZW91dChfcmVzZXREZWxldGVCdG4sIDI1MDApO1xuXHRcdH1cblxuXHRcdGVkaXQuZGVsZXRlUmVjaXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlZGl0LmRlbGV0ZUJ0blRleHQgPSAnRGVsZXRpbmcuLi4nO1xuXHRcdFx0cmVjaXBlRGF0YS5kZWxldGVSZWNpcGUoZWRpdC5yZWNpcGUuX2lkKVxuXHRcdFx0XHQudGhlbihfZGVsZXRlU3VjY2VzcywgX2RlbGV0ZUVycm9yKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdSZWNpcGVDdHJsJywgUmVjaXBlQ3RybCk7XG5cblx0UmVjaXBlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJyRyb3V0ZVBhcmFtcycsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJ107XG5cblx0ZnVuY3Rpb24gUmVjaXBlQ3RybChQYWdlLCAkYXV0aCwgJHJvdXRlUGFyYW1zLCByZWNpcGVEYXRhLCB1c2VyRGF0YSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmVjaXBlID0gdGhpcztcblx0XHR2YXIgcmVjaXBlU2x1ZyA9ICRyb3V0ZVBhcmFtcy5zbHVnO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnUmVjaXBlJyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSB1c2VyIGluZm9cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyZWNpcGUudXNlciA9IGRhdGE7XG5cblx0XHRcdC8vIGxvZ2dlZCBpbiB1c2VycyBjYW4gZmlsZSByZWNpcGVzXG5cdFx0XHRyZWNpcGUuZmlsZVRleHQgPSAnRmlsZSB0aGlzIHJlY2lwZSc7XG5cdFx0XHRyZWNpcGUudW5maWxlVGV4dCA9ICdSZW1vdmUgZnJvbSBGaWxlZCBSZWNpcGVzJztcblx0XHR9XG5cdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdFx0LnRoZW4oX2dldFVzZXJTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHJlY2lwZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gcmVjaXBlIGRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVTdWNjZXNzKGRhdGEpIHtcblx0XHRcdHJlY2lwZS5yZWNpcGUgPSBkYXRhO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyZWNpcGUucmVjaXBlLm5hbWUpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5pbmcgYXV0aG9yIGRhdGFcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0gYXV0aG9yIHBpY3R1cmUsIGRpc3BsYXlOYW1lXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdHJlY2lwZS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0dXNlckRhdGEuZ2V0QXV0aG9yKHJlY2lwZS5yZWNpcGUudXNlcklkKVxuXHRcdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHRcdHJlY2lwZS5pbmdDaGVja2VkID0gW107XG5cdFx0XHRyZWNpcGUuc3RlcENoZWNrZWQgPSBbXTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDcmVhdGUgYXJyYXkgdG8ga2VlcCB0cmFjayBvZiBjaGVja2VkIC8gdW5jaGVja2VkIGl0ZW1zXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGNoZWNrZWRBcnJcblx0XHRcdCAqIEBwYXJhbSBzb3VyY2VBcnJcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jcmVhdGVDaGVja2VkQXJyYXlzKGNoZWNrZWRBcnIsIHNvdXJjZUFycikge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZUFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNoZWNrZWRBcnJbaV0gPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfY3JlYXRlQ2hlY2tlZEFycmF5cyhyZWNpcGUuaW5nQ2hlY2tlZCwgcmVjaXBlLnJlY2lwZS5pbmdyZWRpZW50cyk7XG5cdFx0XHRfY3JlYXRlQ2hlY2tlZEFycmF5cyhyZWNpcGUuc3RlcENoZWNrZWQsIHJlY2lwZS5yZWNpcGUuZGlyZWN0aW9ucyk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIGNoZWNrbWFya1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSB0eXBlXG5cdFx0XHQgKiBAcGFyYW0gaW5kZXhcblx0XHRcdCAqL1xuXHRcdFx0cmVjaXBlLnRvZ2dsZUNoZWNrID0gZnVuY3Rpb24odHlwZSwgaW5kZXgpIHtcblx0XHRcdFx0cmVjaXBlW3R5cGUgKyAnQ2hlY2tlZCddW2luZGV4XSA9ICFyZWNpcGVbdHlwZSArICdDaGVja2VkJ11baW5kZXhdO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgcmV0cmlldmluZyByZWNpcGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXMge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlRXJyb3IocmVzKSB7XG5cdFx0XHRyZWNpcGUucmVjaXBlID0gJ2Vycm9yJztcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0Vycm9yJyk7XG5cdFx0XHRyZWNpcGUuZXJyb3JNc2cgPSByZXMuZGF0YS5tZXNzYWdlO1xuXHRcdH1cblx0XHRyZWNpcGVEYXRhLmdldFJlY2lwZShyZWNpcGVTbHVnKVxuXHRcdFx0LnRoZW4oX3JlY2lwZVN1Y2Nlc3MsIF9yZWNpcGVFcnJvcik7XG5cblx0XHQvKipcblx0XHQgKiBGaWxlIG9yIHVuZmlsZSB0aGlzIHJlY2lwZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlY2lwZUlkIHtzdHJpbmd9IElEIG9mIHJlY2lwZSB0byBzYXZlXG5cdFx0ICovXG5cdFx0cmVjaXBlLmZpbGVSZWNpcGUgPSBmdW5jdGlvbihyZWNpcGVJZCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtwcm9taXNlfS5kYXRhXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHRyZWNpcGUuYXBpTXNnID0gZGF0YS5hZGRlZCA/ICdSZWNpcGUgc2F2ZWQhJyA6ICdSZWNpcGUgcmVtb3ZlZCEnO1xuXHRcdFx0XHRyZWNpcGUuZmlsZWQgPSBkYXRhLmFkZGVkO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIHByb21pc2UgZnJvbSBzYXZpbmcgcmVjaXBlIHRvIHVzZXIgZGF0YVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7cHJvbWlzZX1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9maWxlRXJyb3IocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdHJlY2lwZURhdGEuZmlsZVJlY2lwZShyZWNpcGVJZClcblx0XHRcdFx0LnRoZW4oX2ZpbGVTdWNjZXNzLCBfZmlsZUVycm9yKTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuZmlsdGVyKCdtaW5Ub0gnLCBtaW5Ub0gpO1xuXG5cdGZ1bmN0aW9uIG1pblRvSCgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24obWluKSB7XG5cdFx0XHR2YXIgX2hvdXIgPSA2MDtcblx0XHRcdHZhciBfbWluID0gbWluICogMTtcblx0XHRcdHZhciBfZ3RIb3VyID0gX21pbiAvIF9ob3VyID49IDE7XG5cdFx0XHR2YXIgdGltZVN0ciA9IG51bGw7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2V0IG1pbnV0ZS9zIHRleHQgZnJvbSBtaW51dGVzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG1pbnV0ZXMge251bWJlcn1cblx0XHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIG1pblRleHQobWludXRlcykge1xuXHRcdFx0XHRpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyA9PT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoX2hhc01pbnV0ZXMgJiYgbWludXRlcyAhPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiAnIG1pbnV0ZXMnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfZ3RIb3VyKSB7XG5cdFx0XHRcdHZhciBoUGx1c01pbiA9IF9taW4gJSBfaG91cjtcblx0XHRcdFx0dmFyIF9oYXNNaW51dGVzID0gaFBsdXNNaW4gIT09IDA7XG5cdFx0XHRcdHZhciBob3VycyA9IE1hdGguZmxvb3IoX21pbiAvIF9ob3VyKTtcblx0XHRcdFx0dmFyIGhvdXJzVGV4dCA9IGhvdXJzID09PSAxID8gJyBob3VyJyA6ICcgaG91cnMnO1xuXHRcdFx0XHR2YXIgbWludXRlcyA9IF9oYXNNaW51dGVzID8gJywgJyArIGhQbHVzTWluICsgbWluVGV4dChoUGx1c01pbikgOiAnJztcblxuXHRcdFx0XHR0aW1lU3RyID0gaG91cnMgKyBob3Vyc1RleHQgKyBtaW51dGVzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIG5vSE1pblRleHQgPSBfbWluID09PSAxID8gJyBtaW51dGUnIDogJyBtaW51dGVzJztcblx0XHRcdFx0dGltZVN0ciA9IF9taW4gKyBub0hNaW5UZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGltZVN0cjtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc0F1dGhvckN0cmwnLCBSZWNpcGVzQXV0aG9yQ3RybCk7XG5cblx0UmVjaXBlc0F1dGhvckN0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJ3VzZXJEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNBdXRob3JDdHJsKFBhZ2UsIHJlY2lwZURhdGEsIHVzZXJEYXRhLCAkcm91dGVQYXJhbXMpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHJhID0gdGhpcztcblx0XHR2YXIgX2FpZCA9ICRyb3V0ZVBhcmFtcy51c2VySWQ7XG5cblx0XHRyYS5jbGFzc05hbWUgPSAncmVjaXBlc0F1dGhvcic7XG5cblx0XHRyYS5zaG93Q2F0ZWdvcnlGaWx0ZXIgPSAndHJ1ZSc7XG5cdFx0cmEuc2hvd1RhZ0ZpbHRlciA9ICd0cnVlJztcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGdldHRpbmcgYXV0aG9yJ3MgYmFzaWMgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aG9yU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRyYS5hdXRob3IgPSBkYXRhO1xuXHRcdFx0cmEuaGVhZGluZyA9ICdSZWNpcGVzIGJ5ICcgKyByYS5hdXRob3IuZGlzcGxheU5hbWU7XG5cdFx0XHRyYS5jdXN0b21MYWJlbHMgPSByYS5oZWFkaW5nO1xuXHRcdFx0UGFnZS5zZXRUaXRsZShyYS5oZWFkaW5nKTtcblx0XHR9XG5cdFx0dXNlckRhdGEuZ2V0QXV0aG9yKF9haWQpXG5cdFx0XHQudGhlbihfYXV0aG9yU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuZWQgZnJvbSBnZXR0aW5nIHVzZXIncyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0cmEucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0QXV0aG9yUmVjaXBlcyhfYWlkKVxuXHRcdFx0LnRoZW4oX3JlY2lwZXNTdWNjZXNzKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnckJveCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1JlY2lwZXNDYXRlZ29yeUN0cmwnLCBSZWNpcGVzQ2F0ZWdvcnlDdHJsKTtcblxuXHRSZWNpcGVzQ2F0ZWdvcnlDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAncmVjaXBlRGF0YScsICckcm91dGVQYXJhbXMnXTtcblxuXHRmdW5jdGlvbiBSZWNpcGVzQ2F0ZWdvcnlDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfY2F0ID0gJHJvdXRlUGFyYW1zLmNhdGVnb3J5O1xuXHRcdHZhciBfY2F0VGl0bGUgPSBfY2F0LnN1YnN0cmluZygwLDEpLnRvTG9jYWxlVXBwZXJDYXNlKCkgKyBfY2F0LnN1YnN0cmluZygxKTtcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzQ2F0ZWdvcnknO1xuXHRcdHJhLmhlYWRpbmcgPSBfY2F0VGl0bGUgKyAncyc7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ2ZhbHNlJztcblx0XHRyYS5zaG93VGFnRmlsdGVyID0gJ3RydWUnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIGNhdEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUuY2F0ZWdvcnkgPT0gX2NhdFRpdGxlKSB7XG5cdFx0XHRcdFx0Y2F0QXJyLnB1c2gocmVjaXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJhLnJlY2lwZXMgPSBjYXRBcnI7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0UHVibGljUmVjaXBlcygpXG5cdFx0XHQudGhlbihfcmVjaXBlc1N1Y2Nlc3MpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyQm94Jylcblx0XHQuY29udHJvbGxlcignUmVjaXBlc1RhZ0N0cmwnLCBSZWNpcGVzVGFnQ3RybCk7XG5cblx0UmVjaXBlc1RhZ0N0cmwuJGluamVjdCA9IFsnUGFnZScsICdyZWNpcGVEYXRhJywgJyRyb3V0ZVBhcmFtcyddO1xuXG5cdGZ1bmN0aW9uIFJlY2lwZXNUYWdDdHJsKFBhZ2UsIHJlY2lwZURhdGEsICRyb3V0ZVBhcmFtcykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgcmEgPSB0aGlzO1xuXHRcdHZhciBfdGFnID0gJHJvdXRlUGFyYW1zLnRhZztcblxuXHRcdHJhLmNsYXNzTmFtZSA9ICdyZWNpcGVzVGFnJztcblxuXHRcdHJhLmhlYWRpbmcgPSAnUmVjaXBlcyB0YWdnZWQgXCInICsgX3RhZyArICdcIic7XG5cdFx0cmEuY3VzdG9tTGFiZWxzID0gcmEuaGVhZGluZztcblx0XHRQYWdlLnNldFRpdGxlKHJhLmhlYWRpbmcpO1xuXG5cdFx0cmEuc2hvd0NhdGVnb3J5RmlsdGVyID0gJ3RydWUnO1xuXHRcdHJhLnNob3dUYWdGaWx0ZXIgPSAnZmFsc2UnO1xuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmVkIGZyb20gZ2V0dGluZyBwdWJsaWMgcmVjaXBlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0FycmF5fSByZWNpcGVzIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcmVjaXBlc1N1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dmFyIHRhZ2dlZEFyciA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24ocmVjaXBlKSB7XG5cdFx0XHRcdGlmIChyZWNpcGUudGFncy5pbmRleE9mKF90YWcpID4gLTEpIHtcblx0XHRcdFx0XHR0YWdnZWRBcnIucHVzaChyZWNpcGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmEucmVjaXBlcyA9IHRhZ2dlZEFycjtcblx0XHR9XG5cdFx0cmVjaXBlRGF0YS5nZXRQdWJsaWNSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JCb3gnKVxuXHRcdC5jb250cm9sbGVyKCdNeVJlY2lwZXNDdHJsJywgTXlSZWNpcGVzQ3RybCk7XG5cblx0TXlSZWNpcGVzQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRhdXRoJywgJ3JlY2lwZURhdGEnLCAndXNlckRhdGEnLCAnJGxvY2F0aW9uJywgJ21lZGlhQ2hlY2snLCAnJHNjb3BlJywgJ01RJywgJyR0aW1lb3V0J107XG5cblx0ZnVuY3Rpb24gTXlSZWNpcGVzQ3RybChQYWdlLCAkYXV0aCwgcmVjaXBlRGF0YSwgdXNlckRhdGEsICRsb2NhdGlvbiwgbWVkaWFDaGVjaywgJHNjb3BlLCBNUSwgJHRpbWVvdXQpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIG15UmVjaXBlcyA9IHRoaXM7XG5cdFx0dmFyIF90YWIgPSAkbG9jYXRpb24uc2VhcmNoKCkudmlldztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ015IFJlY2lwZXMnKTtcblxuXHRcdG15UmVjaXBlcy50YWJzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ3JlY2lwZS1ib3gnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ2ZpbGVkLXJlY2lwZXMnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeTogJ25ldy1yZWNpcGUnXG5cdFx0XHR9XG5cdFx0XTtcblx0XHRteVJlY2lwZXMuY3VycmVudFRhYiA9IF90YWIgPyBfdGFiIDogJ3JlY2lwZS1ib3gnO1xuXG5cdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRlbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnUmVjaXBlIEJveCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMl0ubmFtZSA9ICdOZXcgUmVjaXBlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0ZXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG15UmVjaXBlcy50YWJzWzBdLm5hbWUgPSAnTXkgUmVjaXBlIEJveCc7XG5cdFx0XHRcdFx0bXlSZWNpcGVzLnRhYnNbMV0ubmFtZSA9ICdGaWxlZCBSZWNpcGVzJztcblx0XHRcdFx0XHRteVJlY2lwZXMudGFic1syXS5uYW1lID0gJ0FkZCBOZXcgUmVjaXBlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKiBDaGFuZ2UgdGFiXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVlcnkge3N0cmluZ30gdGFiIHRvIHN3aXRjaCB0b1xuXHRcdCAqL1xuXHRcdG15UmVjaXBlcy5jaGFuZ2VUYWIgPSBmdW5jdGlvbihxdWVyeSkge1xuXHRcdFx0JGxvY2F0aW9uLnNlYXJjaCgndmlldycsIHF1ZXJ5KTtcblx0XHRcdG15UmVjaXBlcy5jdXJyZW50VGFiID0gcXVlcnk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRteVJlY2lwZXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBnZXR0aW5nIHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7cHJvbWlzZX0uZGF0YVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJTdWNjZXNzKGRhdGEpIHtcblx0XHRcdG15UmVjaXBlcy51c2VyID0gZGF0YTtcblx0XHRcdHZhciBzYXZlZFJlY2lwZXNPYmogPSB7c2F2ZWRSZWNpcGVzOiBkYXRhLnNhdmVkUmVjaXBlc307XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybmluZyB1c2VyJ3Mgc2F2ZWQgcmVjaXBlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZWNpcGVzIHtwcm9taXNlfS5kYXRhXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZmlsZWRTdWNjZXNzKHJlY2lwZXMpIHtcblx0XHRcdFx0bXlSZWNpcGVzLmZpbGVkUmVjaXBlcyA9IHJlY2lwZXM7XG5cdFx0XHR9XG5cdFx0XHRyZWNpcGVEYXRhLmdldEZpbGVkUmVjaXBlcyhzYXZlZFJlY2lwZXNPYmopXG5cdFx0XHRcdC50aGVuKF9maWxlZFN1Y2Nlc3MpO1xuXHRcdH1cblx0XHR1c2VyRGF0YS5nZXRVc2VyKClcblx0XHRcdC50aGVuKF9nZXRVc2VyU3VjY2Vzcyk7XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgcmV0dXJuaW5nIHVzZXIncyByZWNpcGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge3Byb21pc2V9LmRhdGFcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yZWNpcGVzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRteVJlY2lwZXMucmVjaXBlcyA9IGRhdGE7XG5cdFx0fVxuXHRcdHJlY2lwZURhdGEuZ2V0TXlSZWNpcGVzKClcblx0XHRcdC50aGVuKF9yZWNpcGVzU3VjY2Vzcyk7XG5cdH1cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
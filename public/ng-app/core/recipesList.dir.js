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
			rl.catPredicate = '';
			rl.tagPredicate = '';
			rl.dietPredicate = '';

			// set up sort predicate and reversals
			rl.sortPredicate = 'name';
			rl.nameReverse = false;
			rl.totalTimeReverse = true;
			rl.nIngReverse = true;

			/**
			 * Toggle sort asc/desc
			 *
			 * @param predicate {string}
			 */
			rl.toggleSort = function(predicate) {
				rl[predicate + 'Reverse'] = !rl[predicate + 'Reverse'];
				rl.reverse = rl[predicate + 'Reverse'];
			};

			// number of recipes to show/add in a set
			var _resultsSet = 3;

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
					rl.catPredicate = '';
					rl.tagPredicate = '';
					rl.dietPredicate = '';
					_resetResultsShowing();
				}
			});

			// watch filters and if any of them change, reset the results showing
			$scope.$watchGroup(['rl.catPredicate', 'rl.tagPredicate', 'rl.dietPredicate'], function(newVal, oldVal) {
				if (!!newVal && newVal !== oldVal) {
					_resetResultsShowing();
				}
			});
		}

		// TODO: delete this link function if not needed
		recipesListLink.$inject = ['$scope', '$attrs', '$elem'];

		function recipesListLink($scope, $attrs, $elem) {
			$scope.rll = {};


		}

		return {
			restrict: 'EA',
			scope: {
				recipes: '=',
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
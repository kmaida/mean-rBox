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

			if (rl.categoryFilter === 'true') {
				rl.categories = Recipe.categories;
				rl.showCategoryFilter = true;
			}
			if (rl.tagFilter === 'true') {
				rl.tags = Recipe.tags;
				rl.showTagFilter = true;
			}

			rl.sortPredicate = 'name';
			rl.catPredicate = '';
			rl.tagPredicate = '';

			rl.nameReverse = false;
			rl.totalTimeReverse = false;
			rl.nIngReverse = false;

			rl.toggleSort = function(predicate) {
				rl[predicate + 'Reverse'] = !rl[predicate + 'Reverse'];

				rl.reverse = rl[predicate + 'Reverse'];
			};

			$scope.$watch('rl.query', function(newVal, oldVal) {
				if (!!rl.query) {
					rl.catPredicate = '';
					rl.tagPredicate = '';
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
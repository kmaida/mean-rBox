(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipesList', recipesList);

	recipesList.$inject = ['Recipe'];

	function recipesList(Recipe) {

		function recipesListCtrl() {
			// controllerAs view model
			var rl = this;

			if (rl.categoryFilter === 'true') {
				rl.categories = Recipe.categories;
				rl.showCategoryFilter = true;
			}
		}

		recipesListLink.$inject = ['$scope', '$attrs', '$elem'];

		function recipesListLink($scope, $attrs, $elem) {
			$scope.rll = {};


		}

		return {
			restrict: 'EA',
			scope: {
				recipes: '=',
				categoryFilter: '@'
			},
			templateUrl: 'ng-app/core/recipesList.tpl.html',
			controller: recipesListCtrl,
			controllerAs: 'rl',
			bindToController: true,
			link: recipesListLink
		}
	}
})();
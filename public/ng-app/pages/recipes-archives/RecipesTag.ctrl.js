(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipesTagCtrl', RecipesTagCtrl);

	RecipesTagCtrl.$inject = ['$scope', 'Page', 'recipeData', '$routeParams'];

	function RecipesTagCtrl($scope, Page, recipeData, $routeParams) {
		// controllerAs ViewModel
		var ra = this;

		// private variables
		var _tag = $routeParams.tag;

		// bindable members
		ra.className = 'recipesTag';
		ra.heading = 'Recipes tagged "' + _tag + '"';
		ra.customLabels = ra.heading;
		ra.showCategoryFilter = 'true';
		ra.showTagFilter = 'false';

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle(ra.heading);
			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @returns {promise}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return recipeData.getPublicRecipes().then(_recipesSuccess);
		}

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

			$scope.$emit('loading-off');
		}
	}
}());
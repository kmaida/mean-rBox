(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['Page', 'localData', 'recipeData', 'Recipe'];

	function HomeCtrl(Page, localData, recipeData, Recipe) {
		// controllerAs ViewModel
		var home = this;

		Page.setTitle('All Recipes');

		home.categories = Recipe.categories;
		home.tags = Recipe.tags;

		home.mapCategories = {};
		home.mapTags = {};

		for (var i = 0; i < home.categories.length; i++) {
			home.mapCategories[home.categories[i]] = '';
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

			angular.forEach(home.recipes, function(recipe) {
				console.log(recipe, recipe.category);
			});
		}
		recipeData.getPublicRecipes()
			.then(_publicRecipesSuccess);
	}
})();
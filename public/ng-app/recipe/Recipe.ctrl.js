(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;

		// TODO: use slugify for URLs instead of MongoDB IDs
		var recipeSlug = $routeParams.slug;

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		recipe.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		function _getUserSuccess(data) {
			recipe.user = data;
		}
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipeSuccess(data) {
			recipe.recipe = data;
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess);
	}
})();
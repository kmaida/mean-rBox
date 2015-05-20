(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;

		var recipeSlug = $routeParams.slug;

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
			userData.getUser().then(_getUserSuccess);
		}

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data {object} recipe data
		 * @private
		 */
		function _recipeSuccess(data) {
			recipe.recipe = data;
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess);
	}
})();
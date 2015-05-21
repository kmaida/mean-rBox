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
			Page.setTitle(recipe.recipe.name);
			console.log(recipe.recipe);
		}

		/**
		 * Error retrieving recipe
		 *
		 * @private
		 */
		function _recipeError(err) {
			recipe.recipe = 'error';
			Page.setTitle('Oops!');
			recipe.errorMsg = err.data.message;
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess, _recipeError);
	}
})();
(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['Page', '$auth', '$routeParams', 'recipeData', 'userData'];

	function EditRecipeCtrl(Page, $auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var edit = this;
		var recipeSlug = $routeParams.slug;

		Page.setTitle('Edit Recipe');

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
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipeSuccess(data) {
			edit.recipe = data;
			Page.setTitle('Edit ' + edit.recipe.name);
		}

		/**
		 * Error retrieving recipe
		 *
		 * @private
		 */
		function _recipeError() {
			edit.recipe = 'error';
			Page.setTitle('Recipe Not Found');
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess, _recipeError);

		/**
		 * Successful promise after deleting recipe
		 *
		 * @param data
		 * @private
		 */
		function _deleteSuccess(data) {
			console.log('recipe deleted!');
		}
		edit.deleteRecipe = function() {
			recipeData.deleteRecipe(edit.recipe._id).then(_deleteSuccess);
		}
	}
})();
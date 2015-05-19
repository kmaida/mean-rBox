(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function EditRecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var edit = this;

		// TODO: use slugify for URLs instead of MongoDB IDs
		var recipeId = $routeParams.id;

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
		}
		recipeData.getRecipe(recipeId).then(_recipeSuccess);

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
			recipeData.deleteRecipe(recipeId).then(_deleteSuccess);
		}
	}
})();
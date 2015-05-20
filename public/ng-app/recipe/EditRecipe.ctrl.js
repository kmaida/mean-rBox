(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['$auth', '$routeParams', 'recipeData', 'userData'];

	function EditRecipeCtrl($auth, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var edit = this;
		var recipeSlug = $routeParams.slug;

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

		/**
		 * Error retrieving recipe
		 *
		 * @private
		 */
		function _recipeError() {
			edit.recipe = 'error';
		}
		recipeData.getRecipe(recipeSlug).then(_recipeSuccess);

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
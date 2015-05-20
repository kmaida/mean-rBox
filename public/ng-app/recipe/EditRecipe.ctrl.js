(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('EditRecipeCtrl', EditRecipeCtrl);

	EditRecipeCtrl.$inject = ['Page', '$auth', '$routeParams', 'recipeData', 'userData', '$location'];

	function EditRecipeCtrl(Page, $auth, $routeParams, recipeData, userData, $location) {
		// controllerAs ViewModel
		var edit = this;
		var _recipeSlug = $routeParams.slug;
		var _tab = $location.search().view;

		Page.setTitle('Edit Recipe');

		edit.tabs = [
			{
				name: 'Edit Recipe',
				query: 'edit'
			},
			{
				name: 'Delete Recipe',
				query: 'delete'
			}
		];

		edit.currentTab = _tab ? _tab : 'edit';

		edit.changeTab = function(query) {
			$location.search('view', query);
			edit.currentTab = query;
		};

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
			edit.originalName = edit.recipe.name;
			Page.setTitle('Edit ' + edit.originalName);
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
		recipeData.getRecipe(_recipeSlug).then(_recipeSuccess, _recipeError);

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
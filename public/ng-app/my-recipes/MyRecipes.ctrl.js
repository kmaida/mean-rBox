(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['Page', '$auth', 'recipeData', 'userData', '$location', 'mediaCheck', '$scope', 'MQ', '$timeout'];

	function MyRecipesCtrl(Page, $auth, recipeData, userData, $location, mediaCheck, $scope, MQ, $timeout) {
		// controllerAs ViewModel
		var myRecipes = this;
		var _tab = $location.search().view;

		Page.setTitle('My Recipes');

		myRecipes.tabs = [
			{
				query: 'recipe-box'
			},
			{
				query: 'filed-recipes'
			},
			{
				query: 'new-recipe'
			}
		];
		myRecipes.currentTab = _tab ? _tab : 'recipe-box';

		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: function() {
				$timeout(function() {
					myRecipes.tabs[0].name = 'Recipe Box';
					myRecipes.tabs[1].name = 'Filed';
					myRecipes.tabs[2].name = 'New Recipe';
				});
			},
			exit: function() {
				$timeout(function() {
					myRecipes.tabs[0].name = 'My Recipe Box';
					myRecipes.tabs[1].name = 'Filed Recipes';
					myRecipes.tabs[2].name = 'Add New Recipe';
				});
			}
		});

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		myRecipes.changeTab = function(query) {
			$location.search('view', query);
			myRecipes.currentTab = query;
		};

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		myRecipes.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Successful promise getting user's data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			myRecipes.user = data;
			var savedRecipesObj = {savedRecipes: data.savedRecipes};

			/**
			 * Successful promise returning user's saved recipes
			 *
			 * @param recipes {promise}.data
			 * @private
			 */
			function _filedSuccess(recipes) {
				myRecipes.filedRecipes = recipes;
			}
			recipeData.getFiledRecipes(savedRecipesObj)
				.then(_filedSuccess);
		}
		userData.getUser()
			.then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _recipesSuccess(data) {
			myRecipes.recipes = data;
		}
		recipeData.getMyRecipes()
			.then(_recipesSuccess);
	}
})();
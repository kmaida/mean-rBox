(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', '$location', '$timeout'];

	function recipeForm(recipeData, $location, $timeout) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;

			rf.recipeData = {};
			rf.recipeData.userId = rf.userId;

			/**
			 * Recipe created or saved successfully
			 *
			 * @param data
			 * @private
			 */
			function _recipeSaved(data) {
				var recipeId = data._id;

				console.log('recipe saved! ID:', recipeId);
			}

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData).then(_recipeSaved);
				} else {
					recipeData.saveRecipe(rf.recipe._id, rf.recipeData).then(_recipeSaved);
				}
			};
		}

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/my-recipes/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true
		}
	}
})();
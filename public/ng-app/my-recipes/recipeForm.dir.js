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

			if (_isEdit) {
				rf.recipeData = rf.recipe;
			} else {
				rf.recipeData = {};
				rf.recipeData.userId = rf.userId;
			}

			/**
			 * Recipe created or saved successfully
			 *
			 * @param res
			 * @private
			 */
			function _recipeSaved(res) {
				console.log('saved');

				if (!_isEdit) {
					var recipeId = res.data._id;

					console.log('new recipe ID:', recipeId);
				}
			}

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData).then(_recipeSaved);
				} else {
					recipeData.updateRecipe(rf.recipe._id, rf.recipeData).then(_recipeSaved);
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
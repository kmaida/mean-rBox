/*
 |--------------------------------------------------------------------------
 | Recipe Model
 |--------------------------------------------------------------------------
 */

var mongoose = require('mongoose');
var config = require('../config');

var recipeSchema = new mongoose.Schema({
	userId: String,
	name: String,
	slug: String,
	isPublic: Boolean,
	dietary: String,
	tags: Array,
	ingredients: Array,
	directions: Array,
	servings: Number,
	prepTime: String,
	cookTime: String
});

var Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = mongoose.model('Recipe', recipeSchema);
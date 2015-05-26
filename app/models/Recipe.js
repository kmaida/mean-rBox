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
	description: String,
	isPublic: Boolean,
	dietary: String,
	category: String,
	tags: Array,
	ingredients: Array,
	directions: Array,
	servings: Number,
	prepTime: Number,
	cookTime: Number
});

var Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = mongoose.model('Recipe', recipeSchema);
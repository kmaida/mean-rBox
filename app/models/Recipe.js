/*
 |--------------------------------------------------------------------------
 | Recipe Model
 |--------------------------------------------------------------------------
 */

var mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
var config = require('../config');

var recipeSchema = new mongoose.Schema({
	userId: String,
	name: String,
	isPublic: Boolean
});

/**
 * https://www.npmjs.com/package/mongoose-encryption
 *
 * To create an admin user, go to api.js and add "user.isAdmin = true;"
 * in step 3b of whichever oauth method you are going to use to create
 * the new admin. Once user has been created / logged in, remove user.isAdmin = true
 *
 * See api.js line 219 for example.
 */

recipeSchema.plugin(encrypt, {
	secret: config.TOKEN_SECRET,
	encryptedFields: ['userId']
});

var Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = mongoose.model('Recipe', recipeSchema);
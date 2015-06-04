// login/Oauth constants
(function() {
	'use strict';

	angular
		.module('rBox')
		.constant('OAUTHCLIENTS', {
			LOGINURL: 'http://localhost:8080/auth/login',
			CLIENT: {
				FB: '[your Facebook client ID]',
				GOOGLE: '[your Google client ID]',
				TWITTER: '/auth/twitter',
				GITHUB: '[your GitHub client ID]'
			}
		});
})();
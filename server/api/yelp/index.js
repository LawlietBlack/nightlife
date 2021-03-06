
var express = require('express');
var oauthSignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var _ = require('lodash');

var router = express.Router();


/* Function for yelp call
 * ------------------------
 * set_parameters: object with params to search
 * callback: callback(error, response, body)
*/
var request_yelp = function(set_parameters, callback) {
	var httpMethod = 'GET';
	var url = 'http://api.yelp.com/v2/search';
	var default_parameters = {
		location: 'Portland',
		sort: '2'
	};
	var required_parameters = {
		oauth_consumer_key: process.env.YELP_CONSUMER_KEY,
		oauth_token: process.env.YELP_TOKEN,
		oauth_nonce: n(),
		oauth_timestamp: n().toString().substr(0,10),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version: '1.0'
	}
	var parameters = _.assign(default_parameters, set_parameters, required_parameters);
	var consumerSecret = process.env.YELP_CONSUMER_SECRET;
	var tokenSecret = process.env.YELP_TOKEN_SECRET;
	var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false });
	parameters.oauth_signature = signature;
	var paramURL = qs.stringify(parameters);
	var apiURL = url + '?' + paramURL;

	request(apiURL, function(error, response, body) {
		console.log(error, response, body)
		return callback(error, response, body);
	});

};
router.get('/', function(request, response) {
	var query = request.query
	request_yelp(query, function(err, res, body) {
		response.json(body);
	})
})

module.exports = router;
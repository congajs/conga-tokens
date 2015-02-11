/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @Route("/_tokens/:token")
 */
function TokenController() { }

TokenController.prototype = {

	/**
	 * Get a token
	 *
	 * @Route("/", name="tokens.get", methods=["GET"])
	 *
	 * @param req
	 * @param res
	 */
	getTokenAction: function(req, res) {

		var container = this.container;

		// TODO : options to custom token views / return JSON - right now it's just JSON

		var tokenService = container.get('tokens');
		var manager = tokenService.createManager();

		tokenService.getToken(req.params.token, manager).then(function(token) {
			if (token) {

				if (!token.isViewable) {
					tokenService.executeToken(token, manager).then(function(hash) {

						// TODO : need to see if manager has a pool before closing
						//manager.closeConnection();

						// the token was executed
						res.OK(hash);

					}).fail(function(err) {

						container.get('logger').error(err.stack || err);

						// TODO : need to see if manager has a pool before closing
						//manager.closeConnection();

						res.INTERNAL_SERVER_ERROR({error: 'Unable to execute token'});

					});
				} else {

					// the token is being viewed / accessed

					if (isNaN(token.numViews)) {
						token.numViews = 1;
					} else {
						token.numViews += 1;
					}

					if (!isNaN(token.viewLimit) && token.viewLimit > 0 && token.viewLimit < token.numViews) {

						// the token has reached its view limit

						// TODO : need to see if manager has a pool before closing
						//manager.closeConnection();

						res.NOT_FOUND('View Limit Exceeded');

					} else {

						// somebody is viewing the token
						if (!Array.isArray(token.viewedAt)) {
							token.viewedAt = [new Date()];
						} else {
							token.viewedAt.push(new Date());
						}

						manager.persist(token);
						manager.flush(token).then(function() {

							// TODO : need to see if manager has a pool before closing
							//manager.closeConnection();

							res.OK({token: token});

						}).fail(function(err) {

							// TODO : need to see if manager has a pool before closing
							//manager.closeConnection();

							res.OK({token: token});

						});
					}
				}
			} else {

				// TODO : need to see if manager has a pool before closing
				//manager.closeConnection();

				res.NOT_FOUND({error: 'Invalid Token: ' + req.params.token});
			}
		}).fail(function(err) {

			container.get('logger').error(err.stack || err);

			// TODO : need to see if manager has a pool before closing
			//manager.closeConnection();

			res.INTERNAL_SERVER_ERROR({error: 'Unable to fetch token'});

		});
	} ,

	/**
	 * Execute a token
	 *
	 * @Route("/", methods=["POST"])
	 * @Route("/execute", name="tokens.execute", methods=["GET","POST"])
	 *
	 * @param req
	 * @param res
	 */
	executeTokenAction: function(req, res) {

		// TODO : make some way to view the token before executing (think maybe, reset your password form)

		// TODO : how do other controllers hook in to token.onExecute, like send a redirect?
			// - maybe with an event listener, it can pass in the token's className, the token, the request and the response

		var container = this.container;
		var tokenService = container.get('tokens');
		var manager = tokenService.createManager();

		// execute the token
		tokenService.executeToken(req.params.token, manager, null, req, res).then(function(hash) {

			if (!res.headersSent) {

				if (!hash) {
					res.NOT_FOUND({error: 'Token not found ' + req.params.token});
					return;
				}

				// TODO : options to custom token views / return JSON - right now it's just JSON

				// return the hash from the service
				res.OK(hash);

			}

		}).fail(function(err) {

			container.get('logger').error(err.stack || err);

			res.INTERNAL_SERVER_ERROR({error: 'Unable to execute token'});

		});
	} ,

	/**
	 * Delete a token
	 *
	 * @Route("/", name="tokens.delete", methods=["DELETE"])
	 *
	 * @param req
	 * @param res
	 */
	deleteTokenAction: function(req, res) {

		var container = this.container;
		var tokenService = container.get('tokens');
		var manager = tokenService.createManager();

		tokenService.removeToken(req.params.token, manager).then(function(token) {
			if (token) {

				res.NO_CONTENT();

			} else {

				res.NOT_FOUND();

			}
		}).fail(function(err) {

			container.get('logger').error(err.stack || err);

			res.INTERNAL_SERVER_ERROR({error: 'Unable to delete token'});

		});

	}
};

TokenController.prototype.constructor = TokenController;

module.exports = TokenController;
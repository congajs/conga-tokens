/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


// core modules
var crypto = require('crypto');

// third party modules
var Q = require('q');

/**
 *
 * @param {Container} container The service container
 * @constructor
 */
function TokenService(container) {
	this.container = container;
}

// TODO : check manager poolSize before closing the manager (if pool is > 1 do not close)

TokenService.prototype = {

	/**
	 * Create a new bass manager
	 *
	 * @returns {Manager}
	 */
	createManager: function() {
		return this.container.get('bass').createSession().getManager(
			this.container.getParameter('tokens.bass.connection')
		);
	} ,

	/**
	 * Ensure that a manager exists, and if not create one
	 * @param {Manager|undefined} manager The manager (if any)
	 * @returns {{manager: (*|Manager), isNew: boolean}}
	 */
	ensureManager: function(manager) {
		var isNew = false;
		if (!manager) {
			manager = this.createManager();
			isNew = true;
		}
		return {
			manager: manager ,
			isNew: isNew,
            closeConnection: function(cb) {
                // NOTE: Connections now managed by connection pool so we do not close them
                if (typeof cb === 'function') {
                    cb(null);
                }
            }
		}
	} ,

	/**
	 * Get the document name
	 *
	 * @returns {String}
	 */
	getDocumentName: function() {
		return this.container.getParameter('tokens.bass.document.name');
	} ,

	/**
	 * Create a token hash
	 *
	 * @returns {String}
	 */
	generateTokenHash: function() {
		var time = process.hrtime();
		var str = (new Date()).getTime() + '.' + (time[0] * 1e9 + time[1]);
		return crypto.createHash('md5').update(str, 'utf8').digest('hex');
	} ,

	/**
	 * Emit an event
	 *
	 * @param {String} name The event name
	 * @param {Object} data The data to send with the event (optional)
	 * @param {Function} callback The function to execute when the event is finished
	 * @return TokenService
	 */
	emit: function(name, data, callback) {

		if (!data) {
			data = {};
		}

		if (data.token instanceof Object && data.token.type !== undefined && data.token.type !== null) {
			if (this.container.hasParameter('tokens.type.' + data.token.type + '.name')) {

				name += '.' + this.container.getParameter('tokens.type.' + data.token.type + '.name');

			} else if (isNaN(data.token.type)) {

				name += '.' + data.token.type.replace(/[\-\s]+/g, '_');

			}
		}

		data.container = this.container;

		this.container.get('event.dispatcher').dispatch(name, data, callback);

		return this;
	} ,

    /**
     * Helper that closes a mongo connection
     * @param manager
     * @private
     */
    _closeConnection: function(ensure) {

        if (ensure.isNew) {
            ensure.closeConnection();
        }
    },

	/**
	 * Create a new token
	 *
	 * @param {Object|*} data The data to hydrate the token with
	 * @param {Object|*} dataPayload The payload data for the token
	 * @param {Manager|null|undefined} manager The manager to use, if not provided on will be created
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @returns {Promise}
	 */
	createToken: function(data, dataPayload, manager, documentName) {

		var deferred = Q.defer();
        var self = this;

		if (!data) {
			data = {};
		}

		if (!data.token) {
			data.token = this.generateTokenHash();
		}

		var ensure = this.ensureManager(manager);

		if (!documentName) {
			if (data.constructor &&
				data.constructor !== Object &&
				data.constructor !== Function) {

				documentName = data.constructor.name;

			} else {

				documentName = this.getDocumentName();
			}
		}

		var token = ensure.manager.createDocument(documentName, data);

		if (dataPayload) {
			token.payload.setData(dataPayload);
		}

		var errors = this.container.get('validator').validate(token);
		if (errors.length > 0) {

			setTimeout(function() {
                self._closeConnection(ensure);
				deferred.reject(new Error('Validation failed: ' + errors.join("\n")));
			}, 1);

		} else {

			ensure.manager.persist(token);
			ensure.manager.flush().then(function() {

				self._closeConnection(ensure);

				self.emit('create', {token: token}, function() {
					deferred.resolve(token);
				});

			}).fail(function(err) {

                self._closeConnection(ensure);
				deferred.reject(err);
			});
		}

		return deferred.promise;
	} ,


	createCompositeToken: function(data, dataPayload, manager, documentName) {

	} ,

	/**
	 * Get a token from storage
	 *
	 * @param {String} token The token string
	 * @param {Manager|undefined} manager The manager to use, if not provided on will be created
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @returns {Promise}
	 */
	getToken: function(token, manager, documentName) {
		var deferred = Q.defer();
        var self = this;
		var ensure = this.ensureManager(manager);

		ensure.manager.findOneBy(documentName || this.getDocumentName(), {token: token}).then(function(document) {

            self._closeConnection(ensure);
			deferred.resolve(document);

		}).fail(function(err) {

            self._closeConnection(ensure);
			deferred.reject(err);
		});

		return deferred.promise;
	} ,

	/**
	 * Update a token
	 *
	 * @param {String} token The token string
	 * @param {Object} data The data to update the token with
	 * @param {Manager|undefined} manager The manager to use, if not provided one will be created
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @returns {Promise}
	 */
	updateToken: function(token, data, manager, documentName) {
		var deferred = Q.defer();

		var ensure = this.ensureManager(manager);

		var self = this;

		var finish = function(token) {
			self.container.get('rest.manager').deserialize(token, data);

			var errors = self.container.get('validator').validate(token);
			if (errors.length > 0) {

                self._closeConnection(ensure);
				deferred.reject(new Error('Validation Errors: ' + errors.join("\n")));

			} else {

				ensure.manager.persist(token);
				ensure.manager.flush().then(function() {

                    self._closeConnection(ensure);
					self.emit('update', {token: token}, function() {
						deferred.resolve(token);
					});

				}).fail(function(err) {

                    self._closeConnection(ensure);
					deferred.reject(err);
				});
			}
		};

		if (typeof token === 'string') {

			this.getToken(token, ensure.manager, documentName).then(function(token) {
				if (token) {

					finish(token);

				} else {

                    self._closeConnection(ensure);
					deferred.resolve(null);
				}
			}).fail(function(err) {

                self._closeConnection(ensure);
				deferred.reject(err);
			});

		} else if (token instanceof Object) {

			finish(token);

		} else {

			setTimeout(function() {
				deferred.reject(new Error('Invalid Argument'));
			}, 1);

		}

		return deferred.promise;
	} ,

	/**
	 * Remove a token
	 *
	 * @param {String} token The token string
	 * @param {Manager|undefined} manager The manager to use, if not provided on will be created
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @returns {Promise}
	 */
	removeToken: function(token, manager, documentName) {
		var deferred = Q.defer();
        var self = this;
		var ensure = this.ensureManager(manager);

		this.getToken(token, ensure.manager, documentName).then(function(token) {
			if (token) {

				ensure.manager.remove(token);
				ensure.manager.flush().then(function() {

                    self._closeConnection(ensure);
					self.emit('remove', {token: token}, function() {
						deferred.resolve(token);
					});

				}).fail(function(err) {

                    self._closeConnection(ensure);
					deferred.reject(err);
				});
			} else {
				deferred.resolve(null);
			}
		}).fail(function(err) {

            self._closeConnection(ensure);
			deferred.reject(err);
		});

		return deferred.promise;
	} ,

	/**
	 * Fetch the next token for in a composite token list
	 * @param {CompositeToken} compositeToken The composite token
	 * @param {Manager|null} manager The manager to use
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @returns {Promise}
	 */
	findNextTokenFromComposite: function(compositeToken, manager, documentName) {

		var deferred = Q.defer();
        var self = this;
		var ensure = this.ensureManager(manager);

		// find the first token in the list of tokens, sorted by createdAt desc (first in first out), executedAt asc (null first)
		ensure.manager.findWhereIn(
			documentName || this.getDocumentName(), 	// bass document name
			'token', 									// field name
			compositeToken.tokens || [], 				// search criteria
			{createdAt: -1, executedAt: 1}, 			// sort by
			1											// limit
		).then(function(results) {

            self._closeConnection(ensure);
			if (results !== null && results.length > 0) {

				// return the next token
				deferred.resolve(results[0].token);

			} else {

				// all executed
				deferred.resolve(null);

			}
		}).fail(function(err) {

            self._closeConnection(ensure);
			deferred.reject(err);
		});

		return deferred.promise;
	} ,

	/**
	 * Execute a token
	 *
	 * @param {String} token The token string
	 * @param {Manager|null} manager The manager to use
	 * @param {String|undefined} documentName The optional document (storage entity) name to use for the new token
	 * @param {Object|undefined} req The request object, if any
	 * @param {Object|undefined} res The response object, if any
	 * @returns {Promise}
	 */
	executeToken: function(token, manager, documentName, req, res) {
		var deferred = Q.defer();
        var self = this;
		var ensure = this.ensureManager(manager);

		// NOTE: when executing a token, if that token is composite and contains other token strings
		// we recurse through them all and execute them in sequence.  If any token being executed is
		// a viewable token and needs to be viewed before execution, the execution of the composite
		// token and the viewable token are halted.  If it was from a composite token, the place in
		// execution is remembered so that the next time the token is accessed, it starts where it
		// left off.  When the viewable token halts because it requires user input, the token is
		// returned to the client with instructions to get input from the user.  If the viewable
		// token does not require input, but must be viewed, the token is returned with instructions
		// to render a website URL.  If a token is composite, each token within it must know the
		// token string of its composite token.

		this.getToken(token, ensure.manager, documentName).then(function(token) {
			if (token) {
				if (token.isComposite) {
					// we have a composite token, fetch the next token in the list that is not already executed
					self.findNextTokenFromComposite(token, ensure.manager, documentName).then(function(nextToken) {

                        self._closeConnection(ensure);
						if (nextToken) {

							// return the next token
							deferred.resolve({next: nextToken, token: token});

						} else {

							// all executed
							deferred.resolve({executed: true, token: token});

						}
					}).fail(function(err) {

                        self._closeConnection(ensure);
						deferred.reject(err);
					});
				} else {
					// token not composite, execute it
					token.execute(function(err) {
						if (err) {
                            self._closeConnection(ensure);
							deferred.reject(err);
							return;
						}
						ensure.manager.persist(token);
						ensure.manager.flush().then(function() {

                            self._closeConnection(ensure);
							// emit the custom token event(s)
							self.emit('execute', {token: token, request: req, response: res}, function() {

								// the event might change the token?
								if (token.fromComposite) {

									self.getToken(token.fromComposite, ensure.manager, documentName).then(function(compositeToken) {

										// return the next token in the composite list
										self.findNextTokenFromComposite(token, ensure.manager, documentName).then(function(nextToken) {

                                            self._closeConnection(ensure);
											if (nextToken) {

												// return the next token
												deferred.resolve({next: nextToken, token: token});

											} else {

												// all executed
												deferred.resolve({executed: true, token: token});

											}
										}).fail(function(err) {

											// could not get next token from composite
                                            self._closeConnection(ensure);
											// just call it done
											deferred.resolve({executed: true, token: token});
										});

									}).fail(function(err) {

										// could not get composite token
                                        self._closeConnection(ensure);
										// just call it done
										deferred.resolve({executed: true, token: token});

									});
								} else {

									// token is not from composite, we are done
									deferred.resolve({executed: true, token: token});

								}
							});
						}).fail(function(err) {

							// flush has failed
                            self._closeConnection(ensure);
							deferred.reject(err);
						});
					});
				}
			} else {

				// could not find a token
                self._closeConnection(ensure);
				deferred.resolve(null);
			}
		}).fail(function(err) {

			// could not get a token
            self._closeConnection(ensure);
			deferred.reject(err);
		});

		return deferred.promise;
	}
};

TokenService.prototype.constructor = TokenService;

module.exports = TokenService;
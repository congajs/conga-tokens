/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var tagSorter = require('conga-framework').ioc.tagSorter;

/**
 * The kernel listener sets up token events and annotations
 *
 * @constructor
 */
function KernelListener() { }

KernelListener.prototype = {

	/**
	 * Respond to the kernel-compile event
	 * @param {Object} event The object passed to this event
	 * @param {Function} cb The callback to execute when finished
	 */
	onKernelCompile: function(event, cb) {

		// register user defined token events
		this.registerTokenEventListeners(event.container);

		cb();
	} ,

	/**
	 * Respond to the kernel-pre-controller event
	 * @param {Object} event The object passed to this event
	 * @param {Function} cb The callback to execute when finished
	 */
	onPreController: function(event, cb) {

		// cancel the controller if it is not enabled
		if (!event.container.getParameter('tokens.controller.enabled')) {
			event.response.NOT_FOUND();
			return;
		}

		cb();
	} ,

	/**
	 * Register token events
	 * @param {Container} container The service container
	 * @returns {void}
	 * @protected
	 */
	registerTokenEventListeners: function(container) {
		var tags = container.getTagsByName(container.getParameter('tokens.event.name'));

		if (!tags) {
			return;
		}

		// sort the tags by priority
		tagSorter.sortByPriority(tags);

		// register the token events
		tags.forEach(function(tag) {

			container.get('event.dispatcher').addListener(
				tag.getParameter('event'),
				container.get(tag.getServiceId()),
				tag.getParameter('method'));

		});
	}
};

KernelListener.prototype.constructor = KernelListener;

module.exports = KernelListener;
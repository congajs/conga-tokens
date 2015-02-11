/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var CompositeToken = require('./../token/composite-token');

/**
 * The Composite Token document
 *
 * @Bass:Document
 * @Bass:Inherit(document="ViewableTokenDocument")
 *
 * @constructor
 */
function CompositeTokenDocument() {
	CompositeToken.apply(this, arguments);
}

Conga.inherits(CompositeTokenDocument, CompositeToken, {

	/**
	 * {@inheritdoc}
	 *
	 * @Rest:Property
	 */
	isViewable: false ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Boolean", name="is_composite")
	 * @Rest:Property
	 */
	isComposite: false ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Array", name="composite_tokens")
	 * @Rest:Property
	 */
	tokens: []

});

module.exports = CompositeTokenDocument;
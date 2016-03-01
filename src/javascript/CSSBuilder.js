/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict"

var EXPORTED_SYMBOLS = [ "CSSBuilder" ];

/**
 * A utility class that allows to build CSS strings in a more functional or
 * object oriented manner than purely concatening strings. It will also
 * automatically add units (pixel) and "!important" by default to all
 * declarations.
 * 
 * @param selector The selector to be added.
 * @param important Optional. The default value for if !important
 *                  should be added to declarations.
 */
var CSSBuilder = function(selector, important) {
	/** The declarations string. */
	this.declarations = "";
	
	/** If the !important statement should be added by default. */
	this.important = (typeof important !== "undefined" ? important : true);
	
	/** The selector that is used. */
	this.selector = selector;
	
	/**
	 * Add the given property with the given value.
	 *
	 * @param property The property.
	 * @param value The value.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.add = function(property, value, important) {
		var declaration = property + ": " + value;
		
		if ((typeof important === "undefined" && this.important) || important) {
			declaration = declaration + " !important";
		}
		
		declaration = declaration + ";\n";
		
		this.declarations = this.declarations + declaration;
		
		return this;
	};
	
	/**
	 * Adds the default unit (px) to the given value if it doens't already have
	 * a unit.
	 *
	 * @param value The value.
	 * @return The value with a unit.
	 */
	this.addUnit = function(value) {
		if (!(/[a-zA-Z]{2}$/.test(value))) {
			return value + "px";
		}
		
		return value;
	};
	
	/**
	 * Adds the given selector.
	 *
	 * @param selector The selector string to add.
	 * @return This object.
	 */
	this.addSelector = function(selector) {
		this.selector = this.selector + ", " + selector;
		return this;
	};
	
	/**
	 * Sets an "automatic" -moz-padding. If the given value is positive, the
	 * margin will be set to 0px and the padding will be set to the given value.
	 * If the given value is negative, the margin will be set to the given value
	 * and the padding will be set to 0px.
	 *
	 * @param postfix The postfix, start or end.
	 * @param value The value.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.autoMozPadding = function(postfix, value, important) {
		var declaration = "";
		
		if (postfix != null && postfix !== "") {
			declaration = declaration + "-" + postfix;
		} else {
			declaration = declaration + "-start";
		}
		
		if (value >= 0) {
			this.add("-moz-padding" + declaration, this.addUnit(value), important);
			this.add("-moz-margin" + declaration, "0px", important);
		} else {
			this.add("-moz-padding" + declaration, "0px", important);
			this.add("-moz-margin" + declaration, this.addUnit(value), important);
		}
		
		return this;
	}
	
	/**
	 * Sets an "automatic" padding. If the given value is positive, the margin
	 * will be set to 0px and the padding will be set to the given value. If the
	 * given value is negative, the margin will be set to the given value and
	 * the padding will be set to 0px.
	 *
	 * @param postfix The postfix, so top, bottom, left or right. Can be left
	 *                null or empty for all.
	 * @param value The value.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.autoPadding = function(postfix, value, important) {
		var declaration = "";
		
		if (postfix != null && postfix !== "") {
			declaration = declaration + "-" + postfix;
		}
		
		if (value >= 0) {
			this.add("padding" + declaration, this.addUnit(value), important);
			this.add("margin" + declaration, "0px", important);
		} else {
			this.add("padding" + declaration, "0px", important);
			this.add("margin" + declaration, this.addUnit(value), important);
		}
		
		return this;
	};
	
	/**
	 * Sets the font family.
	 *
	 * @param value The font family or the font name.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.fontFamily = function(value, important) {
		this.add("font-family", value, important);
		
		return this;
	};
	
	/**
	 * Sets the font size.
	 *
	 * @param value The font size.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.fontSize = function(value, important) {
		this.add("font-size", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Forces a height of the given value, by setting height, min-height and
	 * max-height.
	 *
	 * @param value The value of the height.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.forceHeight = function(value, important) {
		this.add("height", this.addUnit(value), important);
		this.add("min-height", this.addUnit(value), important);
		this.add("max-height", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Forces a width of the given value, by setting width, min-width and
	 * max-width.
	 *
	 * @param value The value of the width.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.forceWidth = function(value) {
		this.add("width", this.addUnit(value), important);
		this.add("min-width", this.addUnit(value), important);
		this.add("max-width", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the height to the given value.
	 *
	 * @param value The value for the height.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.height = function(value, important) {
		this.add("height", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Adds "display: none" to the declarations.
	 *
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.hide = function(important) {
		this.add("display", "none", important);
		return this;
	};
	
	/**
	 * Sets the margin for the given postfix (if any) to the given value.
	 *
	 * @param postfix The postfix, so top, bottom, left or right. Can be null or
	 *                empty for all.
	 * @param value The value for the margin.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.margin = function(postfix, value, important) {
		var declaration = "";
		
		if (postfix != null && postfix !== "") {
			declaration = declaration + "-" + postfix;
		}
		
		this.add("margin" + declaration, this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the max-height to the given value.
	 *
	 * @param value The value for the max-height.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.maxHeight = function(value, important) {
		this.add("max-Height", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the max-width to the given value.
	 *
	 * @param value The value for the max-width.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.maxWidth = function(value, important) {
		this.add("max-width", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the min-height to the given value.
	 *
	 * @param value The value for the min-height.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.minHeight = function(value, important) {
		this.add("min-Height", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the min-width to the given value.
	 *
	 * @param value The value for the min-width.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.minWidth = function(value, important) {
		this.add("min-width", this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Sets the padding for the given postfix (if any) to the given value.
	 *
	 * @param postfix The postfix, so top, bottom, left or right. Can be null or
	 *            empty for all.
	 * @param value The value for the margin.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.padding = function(postfix, value, important) {
		var property = "padding";
		
		if (postfix != null && postfix !== "") {
			property = property + "-" + postfix;
		}
		
		this.add(property, this.addUnit(value), important);
		
		return this;
	};
	
	/**
	 * Set the default value for if the !important statement should be added.
	 * 
	 * @param important The new value.
	 */
	this.setDefaultImportant = function(important) {
		this.important = important;
	};
	
	/**
	 * Returns the CSS representation of this class.
	 *
	 * @return The CSS string.
	 */
	this.toCSS = function() {
		return this.selector + " {\n" + this.declarations + "}";
	};
	
	/**
	 * Sets the width to the given value.
	 *
	 * @param value The value for the width.
	 * @param important Optional. If the !important statement should be added.
	 * @return This object.
	 */
	this.width = function(value, important) {
		this.add("width", this.addUnit(value), important);
		
		return this;
	};
};


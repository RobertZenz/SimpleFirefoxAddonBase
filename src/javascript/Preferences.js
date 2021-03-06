/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 */

"use strict";

var EXPORTED_SYMBOLS = [ "Preferences" ];

/**
 * A utility that allows to easily register preferences with default values an
 * callbacks in case that the value of the preference changes.
 */
var Preferences = function() {
	/** The root branch of the preferences. */
	this.branch = null;
	
	/** The callbacks that should be invoked. */
	this.changeCallbacks = {};
	
	/** The default preference service provided by Firefox. */
	this.defaultPreferences = null;
	
	/** The functions for acquiring the value of a preference. */
	this.getFunctions = {};
	
		/** The preferences service provided by Firefox. */
	this.preferences = null;
	
	/**
	 * Adds a listener for the given prefrence.
	 *
	 * @param {string} name The name of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 * @param {function} getFunction The function to get the value.
	 */
	this.addListener = function(name, onChange, getFunction) {
		this.changeCallbacks[name] = onChange;
		this.getFunctions[name] = getFunction;
	};
	
	/**
	 * Destroys this Preferences.
	 */
	this.destroy = function() {
		if (this.preferences != null) {
			this.preferences.removeObserver("", this);
		}
		
		this.changeCallbacks = null;
		this.defaultPreferences = null;
		this.preferences = null;
		this.getFunctions = null;
	};
	
	/**
	 * Gets a bool preference. If the preference does not exist, the given
	 * default value is returned instead.
	 * 
	 * @param {string} name The name of the preference.
	 * @param {boolean} defaultValue The default value to return in case that
	 *                               the preference does not exist.
	 * @returns {boolean} The value of the preference, or the default value if
	 *                    the preference does not exist.
	 */
	this.getBool = function(name, defaultValue) {
		try {
			return this.preferences.getBoolPref(name);
		} catch (e) {
			// Empty on purpose
		}
		
		return defaultValue;
	};
	
	/**
	 * Gets a char preference. If the preference does not exist, the given
	 * default value is returned instead.
	 * 
	 * @param {string} name The name of the preference.
	 * @param {string} defaultValue The default value to return in case that the
	 *                              preference does not exist.
	 * @returns {string} The value of the preference, or the default value if
	 *                   the preference does not exist.
	 */
	this.getChar = function(name, defaultValue) {
		try {
			return this.preferences.getCharPref(name);
		} catch (e) {
			// Empty on purpose
		}
		
		return defaultValue;
	};
	
	/**
	 * Gets an int preference. If the preference does not exist, the given
	 * default value is returned instead.
	 * 
	 * @param {string} name The name of the preference.
	 * @param {int} defaultValue The default value to return in case that the
	 *                           preference does not exist.
	 * @returns {int} The value of the preference, or the default value if
	 *                the preference does not exist.
	 */
	this.getInt = function(name, defaultValue) {
		try {
			return this.preferences.getIntPref(name);
		} catch (e) {
			// Empty on purpose
		}
		
		return defaultValue;
	};
	
	/**
	 * Initializes this Preferences object.
	 * 
	 * @param {string} branch The branch/prefix of all preferences managed by
	 *                        this.
	 */
	this.init = function(branch) {
		this.destroy();
		
		this.branch = branch;
		
		this.changeCallbacks = {};
		this.defaultPreferences = {};
		this.preferences = {};
		this.getFunctions = {};
		
		this.defaultPreferences = Components
			.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getDefaultBranch(this.branch);
		this.preferences = Components
			.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch(this.branch);
		this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.preferences.addObserver("", this, false);
	};
	
	/**
	 * Invoked if the value of a preference changes.
	 * 
	 * @param {Object} subject ???
	 * @param {string} topic The change topic.
	 * @param {Object} data The name of the changed preference.
	 */
	this.observe = function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		
		var changeCallback = this.changeCallbacks[data];
		
		if (changeCallback != null) {
			var value = this.getFunctions[data](data);
			changeCallback(data, value);
		}
	};
	
	/**
	 * Registers a new preference with the given values.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {Object} defaultValue The default value of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 * @param defaultFunction The function to invoke for setting the default
	 *            value.
	 * @param getFunction The function to get the value.
	 */
	this.register = function(name, defaultValue, onChange, defaultFunction, getFunction) {
		defaultFunction(name, defaultValue);
		
		this.addListener(name, onChange, getFunction);
		
		// Invoke the observe method so that the callback is invoked at least
		// once right after the preference is registered.
		this.observe(null, "nsPref:changed", name);
	};
	
	/**
	 * Registers a new bool preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {boolean} defaultValue The default value of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerBool = function(name, defaultValue, onChange) {
		this.register(name, defaultValue, onChange, this.defaultPreferences.setBoolPref, this.preferences.getBoolPref);
	};
	
	/**
	 * Registers a new char preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {string} defaultValue The default value of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerChar = function(name, defaultValue, onChange) {
		this.register(name, defaultValue, onChange, this.defaultPreferences.setCharPref, this.preferences.getCharPref);
	};
	
	/**
	 * Registers a new int preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {int} defaultValue The default value of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerInt = function(name, defaultValue, onChange) {
		this.register(name, defaultValue, onChange, this.defaultPreferences.setIntPref, this.preferences.getIntPref);
	};
};


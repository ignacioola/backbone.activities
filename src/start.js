(function($) {

    // Initial Setup
    // -------------

    var root = this,
        // The top-level namespace
        activities;

    if (typeof exports !== 'undefined') {
        activities = exports;
    } else {
        activities = root.activities = {};
    }

    // Current version of the library.
    activities.VERSION = '0.1.0';

    // Require jquery.
    if (!$ && (typeof require !== 'undefined')) {
         root.jQuery = $ = require('jquery');
    }

    // Require Backbone.
    if (!root.Backbone && (typeof require !== 'undefined')) {
        root.Backbone = require('backbone');
    }

    // Require Underscore.
    if (!root._ && (typeof require !== 'undefined')) {
        root._ = require('underscore')._;
    }

    root.Backbone.activities = activities;


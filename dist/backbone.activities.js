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
    activities.VERSION = '0.3.1';

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

// Helpers
// -------
activities.helpers = {};

var getPlaces = function(ActivityClass) {
    var place = ActivityClass.prototype.place;

    if (!place) {
        throw new Error("Activity must have a `place` property");
    }

    if (_.isArray(place)) {
        return place;
    }
    else {
        return [ place ];
    }
};

var isArray = function(obj) {
    return _.isArray(obj);
}

activities.helpers.extend = Backbone.View.extend;
activities.helpers.getPlaces = getPlaces;
// jQuery's `$.when` method treates any non deferred objects that it's passed
// as a resolved deferred.
activities.helpers.resolvedPromise = null;

// Event Bus
// ---------
//
// Global eventBus used to communicate between modules.
var eventBus = {};

_.extend(eventBus, Backbone.Events);

activities.getEventBus = function() {
    return eventBus;
};

// activities.History
// ------------------

// Wrapper for Backbone.History, keeps it as it is only overriding the
// `loadUrl` method to trigger the 'historyChange' event.
function History() {
    return Backbone.History.apply(this, arguments);
}

_.extend(History.prototype, Backbone.History.prototype, {

    eventBus: eventBus,

    loadUrl: function(fragmentOverride) {
        var ret = Backbone.History.prototype.loadUrl.apply(this, arguments);
        var path = this.getFragment();

        this.eventBus.trigger("historyChange", path);

        return true;
    }

});

activities.History = History;
activities.history || (activities.history = new History());

// Place Controller
// ----------------
var placeController = {

    eventBus: activities.getEventBus(),
   
    goTo: function(place) {
        this.eventBus.trigger("placeChangeRequest", place);
    }

};

activities.getPlaceController = function() {
    return placeController;
}

/**
 * Initialize `Route` with the given `path` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @param {String} path
 * @param {Object} options.
 */

function Route(path, options) {
  options = options || {};
  this.path = path;
  this.params = {};
  this.regexp = this.pathRegexp(path
    , this.keys = []
    , options.sensitive
    , options.strict);
}

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 */

Route.prototype.test = function(path){
  var keys = this.keys
    , params = this.params = []
    , m = this.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    var val = 'string' == typeof m[i]
      ? decodeURIComponent(m[i])
      : m[i];

    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }

  return true;
};


Route.prototype.extractParameters = function(path) {
    return this.params;
};

Route.prototype.pathRegexp = function(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  if (Array.isArray(path)) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/\+/g, '__plus__')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/__plus__/g, '(.+)')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

activities.Route = Route;

// activities.Place
// ----------------

function Place(params) {
    this.params = params || {};

    this.initialize.apply(this, arguments);
}

_.extend(Place.prototype, {
    pattern: null,

    initialize: function() {},

    // Builds a route from our `string` pattern and params `object`.
    getRoute: function() {
        var p, path = this.pattern;

        for (p in this.params) {
            path = path.replace(":" + p, this.params[p]);
        }

        return path;
    },

    getParams: function() {
        return this.params;
    },

    equals: function(place) {
        if (place instanceof this.constructor && this._equalParams(place)) {
            return true;
        }

        return false;
    },

    _equalParams: function(place) {
        var params = place.getParams();

        return _.isEqual(params, this.params);
    }
});

Place.extend = activities.helpers.extend;
activities.Place = Place;

// activities.Activity
// -------------------
function Activity(place) {
    this.currentPlace = place;

    this.initialize.apply(this, arguments);
}

_.extend(Activity.prototype, {

    placeController: activities.getPlaceController(),
    eventBus: activities.getEventBus(),
                          
    // override
    initialize: function(place) {},

    // override
    start: function(panel) {},

    // override
    stop: function() {},

    // override
    cancel: function() {},

    // override
    mayStop: function() {
        return true;
    },

    goTo: function(place) {
        this.placeController.goTo(place);
    }
});

Activity.extend = activities.helpers.extend;
activities.Activity = Activity;
// activities.Match
// ----------------

// Relates an ´Activity´ subclass to a ´Place´ subclass.
function Match(Place, Activity) {
    this.Place = Place;
    this.Activity = Activity;

    // every place must have a ´pattern´
    this.pattern = Place.prototype.pattern;
}

_.extend(Match.prototype, {

    // Tests a if a place is instance of our ´Place´ class.
    test: function(place) {
        var route, params;

        if (place instanceof activities.Place) {
            if(place instanceof this.Place) {
                return true;
            } else {
                return false;
            }
        }
        
        this.route = new activities.Route(this.pattern);

        return this.route.test(place);
    },

    // Builds a place from a `string` path.
    buildPlace: function(path) {
        var params;

        if (!this.route) {
            throw new Error("place can only be built when the original place is a string");
        }

        params = this.route.extractParameters(path);
        return new this.Place(params);
    }

});

activities.Match = Match;

// activities.DisplayRegion
// ------------------------
var DisplayRegion = function(el) {
    this.setElement(el);
}

_.extend(DisplayRegion.prototype, {

    show: function(view) {
        this.close();

        // Test if it's a Backbone view.
        if (view instanceof Backbone.View) {
            // first render the Backbone view.
            view.render();
            // Insert the rendered view into de DOM.
            this.$el.html(view.el); 
        } else if (view instanceof $ || typeof view === "string") {
            this.$el.html(view);
        } else {
            throw new TypeError("DisplayRegion#show: invalid type for `view`.");
        }
    },

    close: function() {
        this.$el.empty();
    },

    setElement: function(element) {
        this.$el = $(element);
        this.el = this.$el[0];

        return this;
    }
});

DisplayRegion.extend = activities.helpers.extend;
activities.DisplayRegion = DisplayRegion;

// activities.ActivityManager
// --------------------------
function ActivityManager(displayRegion) {
    this._displayRegion = displayRegion;
    this._matchs = [];
}

_.extend(ActivityManager.prototype, {

    eventBus: activities.getEventBus(),

    // Registers activities to this `ActivityManager`. It can receive a single
    // `Activity` or an array of them.
    register: function(ActivityClass) {
        var i=0, len;

        // If we received an array of activities, register each one.
        if (isArray(ActivityClass)) {
            len = ActivityClass.length;

            for (; i<len; i++) {
                this._register(ActivityClass[i]);
            }

            return;
        }
        
        // We received a single `Activity` to register if we've got to this
        // step.
        return this._register(ActivityClass);
    },

    // Registers a single `Activity` to this `ActivityManager`.
    _register: function(ActivityClass) {
        var i=0, len, PlaceClass, match, placeClasses;

        // We get the activity's place or places.
        placeClasses = getPlaces(ActivityClass);

        len = placeClasses.length;

        // Registering a match between an ´Activity´ and a ´Place´.
        for (; i<len; i++) {
            PlaceClass = placeClasses[i];
            match = new activities.Match(PlaceClass, ActivityClass);

            this._matchs.push(match);
        }
    },

    // For a given `Place` instance, try to find an activity match.
    _findMatch: function(place) {
        var match, _i, _len, _ref;

        _ref = this._matchs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            match = _ref[_i];

            if (match.test(place)) {
                return match;
            }
        }

        // No match found.
        return false;
    },

    _createPlace: function(path) {
        var match = this._findMatch(path);

        if (match instanceof activities.Match) {
            return match.buildPlace(path);
        }

        // No match found.
        return false;
    },

    reset: function() {
        this._displayRegion && this._displayRegion.close();
        this._currentActivity = null;
        this._currentPlace = null;
    },

    // Loads an activity from a place, returns a promise that indicates when
    // the display region had it's content loaded.
    load: function(place) {
        var activity, mayStopNext = true, match,
            // Helper used to respect the method's interface.
            resolvedPromise = activities.helpers.resolvedPromise;

        // Try to find an activity to match the current place.
        match = this._findMatch(place);

        // No match was found so we reset the activity manager.
        if (!match) {
            this.reset();
            return resolvedPromise;
        }
        
        // If the new place equals the last one, no activity is loaded.
        if (place.equals(this._currentPlace)) {
            return resolvedPromise;
        }

        // Store the current valid `Place` instance.
        this._currentPlace = place;

        // Create a new activity for the current place.
        activity = this._createActivity(match.Activity, place);

        // Perform some deactivation tasks over the previous activity.
        this._deactivate(this._currentActivity);

        // Store the new activity as the current one.
        this._currentActivity = activity;
        
        // Perform some activation tasks for the new activity 
        return this._activate(activity);
    },

    _createActivity: function(ActivityClass, place) {
        return new ActivityClass(place);
    },

    _activate: function(activity) {
        var _self = this, 
            // Object that will recieve the activity's callback.
            protectedDisplay = new ProtectedDisplay(this);

        // When the activity loads a view within the display region the promise
        // will be resolved.
        this._promise = protectedDisplay.getPromise();

        // Set a flag indicating that an activity is in the process of being
        // started.
        this._startingNext = true;

        // When the an activity is started we unset this flag.
        $.when(this._promise).then(function() {
            _self._startingNext = false;
        });

        // Starting our new activity.
        activity.start(protectedDisplay);
        
        // returning the promise, so the 'loader' can know when the activity
        // finishes loading.
        return this._promise;
    },

    _deactivate: function(activity) {
        var _self = this;

        if (activity) {
            // The current activity is in the process of being started.
            if (this._startingNext) {
                // There's an Activity in the process of being started, so we
                // should cancel it before starting the next activity.
                activity.cancel();
            } else {
                // Stop the running `Activity`.
                activity.stop();
            }
        }
    },

    mayStopCurrentActivity: function() {
        // If the current activity is loading it may be stopped.
        if (!this._currentActivity || this._startingNext) {
            return true;
        }

        // Asking the current activity if it may be stopped.
        return this._currentActivity.mayStop();
    },

    showView: function(view) {
        if (this._displayRegion) {
            this._displayRegion.show(view);
        }
    },

    getCurrentActivity: function() {
        return this._currentActivity;
    },

    getCurrentPlace: function() {
        return this._currentPlace;
    },

    getDisplayRegion: function() {
        return this._displayRegion;
    }

});

var ProtectedDisplay = function(activityManager) {
    // storing the current activity to compare later
    this.activity = activityManager.getCurrentActivity();
    this.activityManager = activityManager;

    this._deferred = $.Deferred();
    // Promise to inform the activity manager that the activity has finished
    // loading.
    this._promise = this._deferred.promise();
}

_.extend(ProtectedDisplay.prototype, { 
    setView: function(view) {
        var activityManager = this.activityManager;

        if (this.activity == activityManager.getCurrentActivity()) {
            activityManager.showView(view);
            this._deferred.resolve(activityManager._currentPlace);
        }
    },

    getPromise: function() {
        return this._promise;
    },

    finish: function() {
        this._deferred.resolve();
    }
});

activities.ActivityManager = ActivityManager;
activities.ProtectedDisplay = ProtectedDisplay;
// activities.Application
// ----------------------
function Application() {
    this._managers = [];

    this._bindEvents();
}

_.extend(Application.prototype, Backbone.Events, {

    eventBus: activities.getEventBus(),

    _bindEvents: function() {
        this.eventBus.bind("placeChangeRequest", this._onPlaceChangeRequest, this);
        this.eventBus.bind("historyChange", this._onHistoryChange, this);
    },

    _unbindEvents: function() {
        this.eventBus.unbind("placeChangeRequest", this._onPlaceChangeRequest);
        this.eventBus.unbind("historyChange", this._onHistoryChange);
    },

    register: function(manager) {
        this._managers.push(manager);
    },

    _mayStop: function() {
        var _i, _len=this._managers.length, manager;

        for (_i=0; _i<_len; _i++) {
            manager = this._managers[_i];

            if (!manager.mayStop()) {
                return false;
            }
        }

        return true;
    },

    _onHistoryChange: function(path) {
        var place = this._createPlace(path);
        
        if (!(place instanceof activities.Place)) {
            this.trigger("placeNotFound", path);
            return;
        }

        this._currentPlace = place;
        
        this._triggerPlaceChange(place);
    },

    _onPlaceChangeRequest: function(place) {

        // Our activity managers didn't let us load a new place.
        if (!this._mayLoadPlace(place)) {
            return;
        }

        this._triggerPlaceChange(place);

        this._navigate(place);
    },

    _mayLoadPlace: function(place) {
        var self = this, _i, _len=this._managers.length, 
            manager;

        // First check if we are trying to load same place
        if(place.equals(this._currentPlace)) {
            return false
        }

        // Then check if we may stop all current activities
        for (_i=0; _i<_len; _i++) {
            manager = this._managers[_i];

            if (!manager.mayStopCurrentActivity()) {
                return false;
            }
        }

        return true;
    },

    _triggerPlaceChange: function(place) {
        var self = this;

        this.trigger("beforePlaceChange");

        this._loadManagers(place, function() {
            self.trigger("placeChange", place);
        });
    },

    _loadManagers: function(place, callback) {
        var _i, _len=this._managers.length, 
            manager, promise, promises=[];

        // Try to load an activity in each activity manager
        for (_i=0; _i<_len; _i++) {
            manager = this._managers[_i];
            promise = manager.load(place);
            promises.push(promise);
        }

        // When all managers loaded their activities we invoke the callback
        // function.
        $.when.apply(null, promises).then(callback);
    },

    _navigate: function(place) {
        this._currentPlace = place;

        // Trigger a url change (without triggerring the `route` event).
        activities.history.navigate(place.getRoute(), { navigate: false });
    },

    getCurrentPlace: function() {
        return this._currentPlace;
    },

    _createPlace: function(path) {
        var _i, _len=this._managers.length, 
            manager, place;
                   
        for (_i=0; _i<_len; _i++) {
            manager = this._managers[_i];
            place = manager._createPlace(path);

            if (place) {
                break;
            }
        }

        return place;
    }
});

activities.Application = Application;
}).call(this, this.jQuery || this.Zepto);

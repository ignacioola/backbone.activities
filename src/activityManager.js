// activities.ActivityManager
// --------------------------
function ActivityManager(DisplayRegion) {
    this.DisplayRegion = DisplayRegion;
    this._matchs = [];
}

_.extend(ActivityManager.prototype, {

    eventBus: activities.getEventBus(),

    register: function(ActivityClass) {
        var i=0, len, PlaceClass, match;
        var placeClasses = activities.helpers.getPlaces(ActivityClass);

        len = placeClasses.length;

        // Registering in `Backbone.history` a `Route` for every `Place` 
        // within the registered `Activity`
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


                // When history is started we don't have the corresponding
                // `Place` for the current route, so we try to build it from
                // the pattern and path.
                if (typeof place === "string") {
                    // We replace the 'string' place with an instance of
                    // `Place`.
                    place = match.buildPlace(place);
                }

                return match;
            }
        }

        // No match found.
        return false;
    },

    reset: function() {
        this.displayRegion.close();
        this.currentActivity = null;
        this._lastMatch = null;
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

        // If the new match equals the last match no activity is loaded.
        if (this._lastMatch === match) {
            return resolvedPromise;
        }

        // There's a new found match, so we keep a reference to it.
        this._lastMatch = match;

        // Create a new activity for the current place.
        activity = new match.Activity(place);

        // Perform some deactivation tasks over the previous activity.
        this._deactivate(this.currentActivity);

        // Mark the the activated activity as the current one.
        this.currentActivity = activity;
        
        // Perform some activation tasks for the new activity 
        return this._activate(activity);
    },

    _activate: function(activity) {
        var _self = this;

        this.displayRegion = new this.DisplayRegion();

        // When the activity loads a view within the display region the promise
        // will be resolved.
        this._promise = this.displayRegion.loaded();

        // Set a flag indicating that an activity is in the process of being
        // started.
        this._startingNext = true;

        // When the an activity is started we unset this flag.
        $.when(this._promise).then(function() {
            _self._startingNext = false;
        });

        // Starting our new activity.
        activity.start(this.displayRegion);
        
        // returning the promise, so the 'loader' can know when the activity
        // finishes loading.
        return this._promise;
    },

    _deactivate: function(activity) {
        var _self = this;

        if (activity) {
            // The current activity is in the process of being started.
            if (this._startingNext) {
                // This is to prevent any possible attemp to set this
                // displayRegion's content by calling it's 'show' method.
                this.displayRegion.invalidate();
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

        if (!this.currentActivity || this._startingNext) {
            return true;
        }

        return this.currentActivity.mayStop();
    }

});

activities.ActivityManager = ActivityManager;

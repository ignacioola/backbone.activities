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

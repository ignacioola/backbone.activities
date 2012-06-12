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

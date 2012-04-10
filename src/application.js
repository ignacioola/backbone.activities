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
        this._triggerPlaceChange(path);
    },

    _onPlaceChangeRequest: function(place) {

        // Our activity managers didn't let us load a new place.
        if (!this._mayLoadPlace()) {
            return;
        }

        this._triggerPlaceChange(place);

        this._navigate(place);
    },

    _mayLoadPlace: function() {
        var self = this, _i, _len=this._managers.length, 
            manager;

        // First check if we may stop all current activities
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
        // Trigger a url change (without triggerring the `route` event.
        activities.history.navigate(place.getRoute(), { navigate: false });
    }
});

activities.Application = Application;

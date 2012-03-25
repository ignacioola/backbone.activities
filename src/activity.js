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

// Event Bus
// ---------
//
// Global eventBus used to communicate between modules.
var eventBus = {};

_.extend(eventBus, Backbone.Events);

activities.getEventBus = function() {
    return eventBus;
};


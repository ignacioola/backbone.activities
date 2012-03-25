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


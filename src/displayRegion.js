// activities.DisplayRegion
// ------------------------
var DisplayRegion = function(options) {

    options = options || {};

    // TODO : throw an exception if no el is provided
    this.setElement(options.el || this.el);

    this.loaded();
}

_.extend(DisplayRegion.prototype, {

    show: function(view) {
        if (!this._deferred) {
            return;
        }

        this.close();

        if (view instanceof Backbone.View) {
            this.$el.html(view.el); 
        } else if (view instanceof $ || typeof view === "string") {
            this.$el.html(view);
        } else {
            throw new TypeError("DisplayRegion#show: invalid type for `view`.");
        }

        this.resolve();
    },

    close: function() {
        this.$el.empty();
    },

    loaded: function() {
        var deferred = $.Deferred(),
            promise = deferred.promise();

        this._deferred = deferred;

        return promise;
    },

    invalidate: function() {
        if (this._deferred) {
            this._deferred.reject();
            this._deferred = null;
        }
    },

    resolve: function() {
        if (this._deferred) {
            this._deferred.resolve();
            this._deferred = null;
        }
    },

    setElement: function(element) {
        this.$el = $(element);
        this.el = this.$el[0];

        return this;
    }
});

DisplayRegion.extend = activities.helpers.extend;
activities.DisplayRegion = DisplayRegion;


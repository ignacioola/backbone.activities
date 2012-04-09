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


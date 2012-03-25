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

activities.helpers.extend = Backbone.View.extend;
activities.helpers.getPlaces = getPlaces;
// jQuery's `$.when` method treates any non deferred objects that it's passed
// as a resolved deferred.
activities.helpers.resolvedPromise = null;


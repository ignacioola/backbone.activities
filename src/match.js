// activities.Match
// ----------------

// Relates an ´Activity´ subclass to a ´Place´ subclass.
function Match(Place, Activity) {
    this.Place = Place;
    this.Activity = Activity;

    // every place must have a ´pattern´
    this.pattern = Place.prototype.pattern;
}

_.extend(Match.prototype, {

    // Tests a if a place is instance of our ´Place´ class.
    test: function(place) {
        var route, params;

        if (place instanceof this.Place) {
            return true;
        }
        
        this.route = new activities.Route(this.pattern);

        return this.route.test(place);
    },

    // Builds a place from a `string` path.
    buildPlace: function(path) {
        var params;

        if (!this.route) {
            throw new Error("place can only be built when the original place is a string");
        }

        params = this.route.extractParameters(path);
        return new this.Place(params);
    }

});

activities.Match = Match;


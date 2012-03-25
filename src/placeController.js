// Place Controller
// ----------------
var placeController = {

    eventBus: activities.getEventBus(),
   
    goTo: function(place) {
        this.eventBus.trigger("placeChangeRequest", place);
    }

};

activities.getPlaceController = function() {
    return placeController;
}


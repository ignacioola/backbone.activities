Backbone.activities
===================

**Backbone.activities** is a framework for browser history management inspired
on GWT's "Places & Activities" framework. It allows you to create bookmarkeable URLs
within your application, thus allowing browser's back button and bookmarks to 
work as users expect. It can be also used for MVP development.

Check out the [API](https://github.com/ignacioola/backbone.activities/wiki)
docs.

## Download

* Development: [backbone.activities.js](http://github.com)
* Production: [backbone.activities.min.js](http://github.com)

## How to use

```javascript
// Create an activities application.
var app = new Backbone.activities.Application();

// Create a DisplayRegion.
var mainDisplayRegion = new Backbone.activities.DisplayRegion($("#main-region"));

// Create an ActivityManager for each display region.
var mainActivityManager = new Backbone.activities.ActivityManager(mainDisplayRegion);
app.register(mainActivityManager);

// Create Place and Activity classes.
var InitPlace = Backbone.activities.Place.extend({
    pattern: ""
});

var ItemPlace = Backbone.activities.Place.extend({
    pattern: "/items/:id"
});

var ItemMainActivity = Backbone.activities.Activity.extend({
    place: ItemPlace,

    start: function(display) { 
        display.setView(new ItemView().render());
    },

    mayStop: function() {
        return confirm("Are you sure you want to leave this page?");
    }
});

// Register your activities.
mainActivityManager.register(ItemMainActivity);

// Start history tracking.
Backbone.activities.history.start({ pushState: true });
```

Trigger a place and watch your content change

```javascript
var placeController = Backbone.activities.getPlaceController();
placeController.goTo(new ItemPlace({ id: 1 }));
```

## Events

The `Application` object implements `Backbone.Events` and triggers the following events:

* 'beforePlaceChange': fired before triggering a place change.

* 'placeChange': fired after a place change and when all the ActivityManagers have finished loading their activities.

* 'placeNotFound': fired when there's no `Place` matching the current route.

Example: 

```javascript
app.on('placeChange', function(place) {
    console.log('The current place is: ' + place.getRoute());
});
```

## Recommendations

### Use the command pattern

If you have several activities running at the same time for a given place, this
could result in several requests done at the same time.

To avoid this behavior you can use the command pattern. With this
pattern you can provide your app of:

* Request batching.

* Request caching.

* Centralized faliure handling.

So, for example. Instead of doing this:

```javascript
var MyActivity = activities.Activity.extend({

    start: function(display) {
        
        $.get('/items', function(data) {
            // custom logic
        });
    }

    // ...
});
```

You should be doing something like this:

```javascript
var MyActivity = activities.Activity.extend({

    start: function(display) {
        var requestManager = App.requestManager;

        var request = new requests.ItemsRequest(function() {
            // custom logic
        });

        requestManager.execute(request);
    }

    // ...
});
```

Where the `requestManager` object would be en charge of batching and caching
requests.

### Use the stop callback in your activities

Don't forget to unbind from registered events in every activity, by overriding
this method.

```javascript
var MyActivity = activities.Activity.extend({

    start: function(display) {
        // custom logic

        this.mediator.on("customEvent", this.callback);
    },
    
    stop: function() {
        this.mediator.off("customEvent");
    }

    // ...
});
```

### Always be decoupling

Have your activities be self-sufficient. They shouldn`t rely on other parts of 
the application to have their tasks done. You can achieve this using a 
combination of:

* The mediator pattern.

* MVP pattern for your views.

### User-validated place loading

When a user triggers a new place, he may not completed some task in the current
one, so for instance you can ask the user for confirmation to load a new
place if he has unsaved changes.

```javascript
var MyActivity = activities.Activity.extend({
    start: function(display) {
        // custom logic
    },
    
    mayStop: function() {
        return confirm("Are you sure you want to navigate out of this view?");
    }
});
```

The `mayStop` method will be called when the application wants to load another place
to ask for the current activity's confirmation.

## Requirements

* Backbone v0.9.2
* Underscore v1.3.1
* jQuery v1.7.2


## Runing the tests

```
make test
```

## Building the source

```
make build
```

## Links

* [GWT Development with Activities and Places](https://developers.google.com/web-toolkit/doc/latest/DevGuideMvpActivitiesAndPlaces).

## Changelog

* **v0.2.0** Added ProtectedDisplayRegion.
* **v0.3.0** `ActivityManager.register` now accepts a list of activities.

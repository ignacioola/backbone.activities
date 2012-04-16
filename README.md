Backbone.activities
===================

[ UNDER DEVELOPMENT ]

**Backbone.activities** is a framework for browser history management inspired
on GWT's "Places & Activities" framework. It allows you to create bookmarkeable URLs
within your application, thus allowing browser's back button and bookmarks to 
work as users expect. It can be also used for MVP development.

Check out the [API](https://github.com/ignacioola/backbone.activities/wiki)
docs.

## How to use

Create an activities application.

```javascript
var app = new Backbone.activities.Application();
```

Create a DisplayRegion.

```javascript
var mainDisplayRegion = new Backbone.activities.DisplayRegion($("#main-region"));
```

Create an ActivityManager for each display region.

```javascript
var mainActivityManager = new Backbone.activities.ActivityManager(mainDisplayRegion);
app.register(mainActivityManager);
```

Create Place and Activity classes.

```javascript
var InitPlace = Backbone.activities.Place.extend({
    pattern: ""
});

var ItemPlace = Backbone.activities.Place.extend({
    pattern: "/items/:id"
});

var ItemMainActivity = Backbone.activities.Activity.extend({
    place: ItemPlace,

    start: function(displayRegion) { 
        displayRegion.setView(new ItemView().render());
    },

    mayStop: function() {
        return confirm("Are you sure you want to leave this page?");
    }
});
```

Register your activities.

```javascript
mainActivityManager.register(ItemMainActivity);
```

Start history tracking.

```javascript
Backbone.activities.history.start({ pushState: true });
```

Trigger a place and watch your content change

```javascript
var placeController = Backbone.activities.getPlaceController();
placeController.goTo(new ItemPlace({ id: 1 }));
```

## TODO

* Testing.
* More examples.

## Links

* [GWT Development with Activities and Places](https://developers.google.com/web-toolkit/doc/latest/DevGuideMvpActivitiesAndPlaces).

## Changelog

* **v0.2.0** Added ProtectedDisplayRegion.

Backbone.activities
===================

**Backbone.activities** is a framework for browser history management inspired
on GWT's "Places & Activities" framework. It allows you to create bookmarkeable URLs
within your application, thus allowing browser's back button and bookmarks to 
work as users expect. It can be also used for MVP development.


## How to use

1\. Create an activities application.

```javascript
var app = new Backbone.activities.Application();
```

2\. Create DisplayRegion classes.

```javascript
var mainDisplayRegion = Backbone.activities.DisplayRegion.extend({
    el:$("#main-region"))
});
```

3\. Create an ActivityManager for each display region.

```javascript
var mainActivityManager = new Backbone.activities.ActivityManager(mainDisplayRegion);
app.register(mainActivityManager);
```

4\. Create Place and Activity classes.

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
        displayRegion.show(new ItemView().render());
    },

    mayStop: function() {
        return confirm("Are you sure you want to leave this page?");
    }
});
```

5\. Register your activities.

```javascript
mainActivityManager.register(ItemMainActivity);
```

6\. Start history tracking.

```javascript
Backbone.activities.history.start({ pushState: true });
```

7\. Trigger a place and watch your content change

```javascript
var placeController = Backbone.activities.getPlaceController();
placeController.goTo(new ItemPlace({ id: 1 }));
```

## TODO

* API docs.
* Testing

## Links

* [GWT Development with Activities and Places](https://developers.google.com/web-toolkit/doc/latest/DevGuideMvpActivitiesAndPlaces).

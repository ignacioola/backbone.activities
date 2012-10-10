# Changelog

## v0.4 (2012-10-9)
* Changed method name DisplayRegion.show for DisplayRegion.display.
* Stopped rendering Backbone Views in DisplayRegion.display, now it has to manually be rendered from outside Backbone.activities.
* Added `region` property to a ProtectedDispplayRegion.
* ActivityManager now hides DisplayRegion\'s main element when the current Place doesn\'t have a match for the ActivityManager.
* Added paramater `resolve` to ProtectedDisplayRegion.setView for manually stopping the deferred from being resolved.
* Fixed tests.

## v0.3.2 (2012-08-27)
* Added method getRegion to protected display.
* added parameter to 'beforePlaceChange' event

## v0.3.1 (2012-06-12)
* Fixed bug: check if trying to load same place onMayLoad 

## v0.3.0 
* `ActivityManager.register` now accepts a list of activities.

## v0.2.0 
* Added ProtectedDisplayRegion.



SRC = src/start.js src/helpers.js src/eventBus.js src/history.js src/placeController.js src/route.js src/place.js src/activity.js src/match.js src/displayRegion.js src/activityManager.js src/application.js src/end.js

build: $(SRC)
	cat $^ > dist/backbone.activities.js
	./node_modules/uglify-js/bin/uglifyjs dist/backbone.activities.js > dist/backbone.activities.min.js

test:
	@./node_modules/.bin/mocha \
		--reporter list \
		--growl \
		test/tests.js

test-debug:
	make build
	@./node_modules/.bin/mocha \
		--reporter list \
		--growl \
		debug \
		test/tests.js

.PHONY: test

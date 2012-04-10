sinon = require('sinon');
jsdom = require('jsdom');
expect = require('expect.js');

require('./env');

describe( 'Backbone.activities', function () {

    var displayRegion = new activities.DisplayRegion($('#main'));
    var placeController = activities.getPlaceController();
    var FakePlace = activities.Place.extend({ pattern: '/fake' });

    describe('namespace', function () {
        it('should exist an activities namespace', function () {
            expect( activities ).to.be.a('object');
            expect( Backbone.activities ).to.be.a('object');
        });
    });

    describe('activities.DisplayRegion', function() {

        beforeEach(function() {
            this.displayRegion = new activities.DisplayRegion($('#main'));
        });

        it('should exist a DisplayRegion', function() {
            expect( activities.DisplayRegion ).to.be.a('function');
        });

        it('should have set the required element references', function() {
            expect( this.displayRegion.$el instanceof jQuery ).to.be.ok();
        });

        it('should render the view', function() {
            this.displayRegion.show('test');
            expect( $('#main').html() ).to.equal('test');
        });
    });

    describe('activities.Application', function () {

        beforeEach(function() {
            this.app = new activities.Application();
            this.am = new activities.ActivityManager(displayRegion);
            this.app.register(this.am);
        });

        afterEach(function() {
            this.app._unbindEvents();
            delete this.app;
            delete this.am;
        });

        it('should exist an Application class', function () {
            expect( activities.Application ).to.be.a('function');
        });

        it('should have registered an activity manager.',
            function() {
                // this property holds the registered managers.
                expect( this.app._managers.length ).to.be(1);
            }
        );

        it('should recieve a callback when a place change request is triggered.',
            sinon.test(function() {
                var spy = this.spy(this.app, '_onPlaceChangeRequest');

                // Re-binding events because the spy redefines the callback
                // function.
                this.app._unbindEvents();
                this.app._bindEvents();

                // trigger a place change request.
                placeController.goTo(new FakePlace());

                expect( spy.calledOnce ).to.be( true );
            })
        );

        it('should navigate to the given place when a place change is triggered.',
            sinon.test(function() {
                var spy = this.spy(this.app, '_navigate'),
                    place = new FakePlace();

                // trigger a place change request.
                placeController.goTo(place);

                expect( spy.calledOnce ).to.be( true );
                expect( spy.calledWith(place) ).to.be( true );
            })
        );

        it('should trigger a before place change event.',
            sinon.test(function() {
                var spy = this.spy(),
                    place = new FakePlace();

                this.app.bind("beforePlaceChange", spy);

                // trigger a place change request.
                placeController.goTo(place);

                expect( spy.calledOnce ).to.be( true );
            })
        );

        it('should ask all the activity managers for permission to stop the current activity',
            sinon.test(function() {
                var dr = new activities.DisplayRegion($("<div>")); 
                var am = new activities.ActivityManager(dr);

                this.app.register(am);

                // adding an extra ActivityManager to spy on
                var spy = this.spy(am, 'mayStopCurrentActivity');
                // spying on the already loaded ActivityManager
                var spy2 = this.spy(this.am, 'mayStopCurrentActivity');

                // trigger a place change request.
                placeController.goTo(new FakePlace);

                expect( spy.calledOnce ).to.be( true );
                expect( spy2.calledOnce ).to.be( true );
            })
        );

        it('should trigger a place change event when all activity manager have loaded their activities.',
            sinon.test(function() {
                var dr = new activities.DisplayRegion($("<div>")); 
                var am = new activities.ActivityManager(dr);

                var resolvedDeferred = null;
                var stub = this.stub(am, 'load').returns(resolvedDeferred);
                var stub2 = this.stub(this.am, 'load').returns(resolvedDeferred);

                this.app.register(am);

                var spy = this.spy();
                this.app.on('placeChange', spy);

                // trigger a place change request.
                placeController.goTo(new FakePlace);

                expect( spy.calledOnce ).to.be( true );
            })
        );

        it('should load a place in each activity manager.',
            sinon.test(function() {
                var dr = new activities.DisplayRegion($("<div>")); 
                var am = new activities.ActivityManager(dr);

                var spy = this.spy(am, 'load');
                var spy2 = this.spy(this.am, 'load');

                this.app.register(am);

                var place = new FakePlace;

                // trigger a place change request.
                placeController.goTo( place );

                expect( spy.calledWith(place) ).to.be( true );
                expect( spy2.calledWith(place) ).to.be( true );

            })
        );
    });
    
    describe('activities.ActivityManager', function() {

        /*
        it('should register an activity.', function() {

        });
        
        it('should start an activity when a valid place is loaded', function() {

        });

        it('should stop the current activity before a new activity is started', function() {
            
        });

        it('should ask the current activity if it may stop before stoping it', function() {

        });

        it('should cancel the current activity if this one is still loading before a new activity is cancelled', function() {

        });

        it('shouldn\'t start/stop/cancel any activity if the place loaded is the same as the last one', function() {

        });

        it('should reset the display region if no match is found.', function() {

        });

        it('should set the view into the display region when the activity finishes', function() {

        });

        */
    });
});

sinon = require('sinon');
jsdom = require('jsdom');
expect = require('expect.js');

require('./env');

describe( 'Backbone.activities', function () {

    var displayRegion = new activities.DisplayRegion($('#main'));
    var placeController = activities.getPlaceController();

    var fakePath = '/fake';
    var FakePlace = activities.Place.extend({ pattern: fakePath });
    var FakePlace2 = activities.Place.extend({ pattern: '/fake2' });

    var FakeActivity = activities.Activity.extend({
        place: FakePlace
    });

    var FakeActivity2 = activities.Activity.extend({
        place: FakePlace2
    });

    var MultiPlaceFakeActivity = activities.Activity.extend({
        place: [ FakePlace, FakePlace2 ]
    });

    var fakePlace = new FakePlace;
    var fakePlace2 = new FakePlace2;


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

        it('should exist DisplayRegion.', function() {
            expect( activities.DisplayRegion ).to.be.a('function');
        });

        it('should have set the required element references.', function() {
            expect( this.displayRegion.$el instanceof jQuery ).to.be.ok();
        });

        it('should render the view.', function() {
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

        it('should call the callback fn with a Place instance when a history change is triggered with a valid path.',
            sinon.test(function() {
                var spy = sinon.spy();

                this.am.register(FakeActivity);
                this.app.on("placeChange", spy);

                var stub = this.stub(this.app, '_loadManagers', function(place, callback) {
                    callback(place);
                });

                this.app._onHistoryChange(fakePath);

                expect( spy.calledOnce ).to.be( true );

                var args = spy.args[0];

                expect( args[0] instanceof FakePlace ).to.be( true );

                this.app._loadManagers.restore();
                this.app.off("placeChange", spy );
            })
        );
    });
    
    describe('activities.ActivityManager', function() {

        beforeEach(function() {
            this.am = new activities.ActivityManager(displayRegion);
        });

        afterEach(function() {
            delete this.am;
        });

        it('should store the `DisplayRegion` passed in the constructor.', sinon.test(function() {
            var dr = this.am.getDisplayRegion();

            expect( dr === displayRegion ).to.be( true );
        }));

        it('should register an activity with one place.', sinon.test(function() {
            this.am.register(FakeActivity);

            expect( this.am._matchs.length ).to.be( 1 );
            expect( this.am._matchs[0] instanceof activities.Match ).to.be( true );
        }));

        it('should register an activity with more than one place.', sinon.test(function() {
            this.am.register(MultiPlaceFakeActivity);

            expect( this.am._matchs.length ).to.be( 2 );
        }));

        it('should register a list of activities.', sinon.test(function() {
            this.am.register([FakeActivity, MultiPlaceFakeActivity]);

            // One match for the first activity and two for the second.
            expect( this.am._matchs.length ).to.be( 3 );
        }));

        it('should store the place when a valid one is loaded.', sinon.test(function() {
            this.am.register(FakeActivity);
            this.am.load( fakePlace );

            var currentPlace = this.am.getCurrentPlace();

            expect( currentPlace === fakePlace ).to.be( true );
        }));
        
        it('shouldn\'t be any activity loaded when it initializes.', sinon.test(function() {
            this.am.register([FakeActivity, MultiPlaceFakeActivity]);

            var currentActivity = this.am.getCurrentActivity();

            // It should not be an activity loaded in the beggining.
            expect( currentActivity ).to.be( undefined );
        }));

        it('should create a new activity when a valid place is loaded.', sinon.test(function() {
            this.am.register([FakeActivity, MultiPlaceFakeActivity]);

            var spy = this.spy(this.am, '_createActivity');

            // We load a new `Place`.
            this.am.load( fakePlace );

            var args = spy.args[0];

            expect( spy.calledOnce ).to.be( true );
            expect( args[0] ==  FakeActivity ).to.be( true );
            expect( args[1] === fakePlace ).to.be( true );
        }));


        it('should start an activity when a valid place is loaded.', sinon.test(function() {
            this.am.register(FakeActivity);
            
            var activity = new FakeActivity(fakePlace);

            this.stub(this.am, '_createActivity').returns(activity);
            var spy = this.spy(activity, 'start');

            this.am.load(fakePlace);

            expect( spy.calledOnce ).to.be( true );
        }));

        it('should start an activity passing a ProtectedDisplay.', sinon.test(function() {
            this.am.register(FakeActivity);
            
            var activity = new FakeActivity(fakePlace);

            this.stub(this.am, '_createActivity').returns(activity);
            var spy = this.spy(activity, 'start');

            this.am.load(fakePlace);

            expect( spy.args[0][0] instanceof activities.ProtectedDisplay ).to.be( true );
        }));

        it('should stop the current activity before a new activity is started.', sinon.test(function() {
            this.am.register([FakeActivity, FakeActivity2]);

            var activity = new FakeActivity(fakePlace);

            var stub = this.stub(activity, 'start', function(display) { 
                display.finish() 
            });

            var spy = this.spy(activity, 'stop');
            this.stub(this.am, '_createActivity').returns(activity);

            this.am.load(fakePlace);
            this.am._createActivity.restore();
            this.am.load(fakePlace2);
            
            expect( spy.calledOnce ).to.be( true );
        }));

        it('should cancel the current activity if this one is still loading before a new activity is started.', sinon.test(function() {
            this.am.register([FakeActivity, FakeActivity2]);

            var activity = new FakeActivity(fakePlace);
            var spy = this.spy(activity, 'cancel');
            this.stub(this.am, '_createActivity').returns(activity);

            this.am.load(fakePlace);

            var activity2 = new FakeActivity2(fakePlace2);
            var spy2 = this.spy(activity, 'start');

            this.am._createActivity.restore();
            this.stub(this.am, '_createActivity').returns(activity2);

            this.am.load(fakePlace2);

            expect( spy.calledOnce ).to.be( true );
            expect( spy.calledBefore(spy2) ).to.be( true );
        }));

        it('shouldn\'t create an activity if the place loaded is the same as the last one.', sinon.test(function() {
            this.am.register([FakeActivity, FakeActivity2]);

            this.am.load(fakePlace);
            var spy = this.spy(this.am, '_createActivity');

            this.am.load(fakePlace);

            expect( spy.called ).to.be( false );
        }));

        it('should reset the ActivityManager if there\`s no match for the loaded place.', sinon.test(function() {
            this.am.register(FakeActivity);

            var spy = this.spy(this.am, 'reset');
            this.am.load(fakePlace2);

            expect( spy.calledOnce ).to.be( true );
        }));


        describe('activities.ProtectedDisplay', function() {
            beforeEach(function() {
                this.pd = new activities.ProtectedDisplay(this.am);
            });
        
            it('should set the ActivityManager\'s view.', sinon.test(function() {
                var view = 'test view';

                var spy = this.spy(this.am, 'showView');

                this.pd.setView(view);

                expect( spy.calledWith(view) ).to.be( true );
            }));
        });
    });

});

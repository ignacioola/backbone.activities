sinon = require('sinon');
jsdom = require('jsdom');
expect = require('expect.js');

require('./env');

describe( 'Backbone.activities', function () {

    describe('namespace', function () {
        it('should exist an activities namespace', function () {
            expect( activities ).to.be.a('object');
            expect( Backbone.activities ).to.be.a('object');
        });
    });

    describe('activities.DisplayRegion', function() {

        beforeEach(function() {
            this.displayRegion = new activities.DisplayRegion({
                el: $('#main')
            });
        });

        it('should exist a DisplayRegion', function() {
            expect( activities.DisplayRegion ).to.be.a('function');
        });

        it('should render the a view', function() {
            this.displayRegion.show('test');
            expect( $('#main').html() ).to.equal('test');
        });

        it('should resolve the deferred when show() called', function(done) {

            $.when(this.displayRegion.loaded()).then(function(d) {
                expect( true ).to.be.ok();
                done();
            });

            this.displayRegion.show('test');
        });
    });

    describe('activities.Application', function () {
        it('should exist an Application', function () {
            expect( activities.Application ).to.be.a('function');
        });

        it('should set the right url when a placeChangeRequest is triggered',
            function() {
                // TODO
            }
        );
    });
});

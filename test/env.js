document = require("jsdom").jsdom("\
<html>\
    <head></head>\
    <body>\
        <div id='main'></div>\
    </body>\
</html>\
");

global.window = document.createWindow();


jQuery = require("jquery");
$ = global.jQuery;
_ = require("underscore")._;
Backbone = require("backbone");
activities = require('../dist/backbone.activities');

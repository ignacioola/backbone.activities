var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;
var namedParam = /:(\w+)/g;

// activities.Route
// ----------------
function Route(pattern) {
    this.pattern = pattern;

    this._addParamName = _.bind(this._addParamName, this);
    this.paramNames = [];
    this.regExp = this._routeToRegExp(pattern);
}

Route.prototype._routeToRegExp = function(pattern) {
    var _pattern;

    _pattern = pattern.replace(escapeRegExp, '\\$&')
                      .replace(namedParam, this._addParamName);

    //return new RegExp('^' + _pattern + '(?=\\?|$)');
    return new RegExp('^' + _pattern + '$');
}

Route.prototype._extractParameters = function(path) {
    var index, match, matches, paramName, params, _len, _ref;
    params = {};
    matches = this.regExp.exec(path);
    
    _ref = matches.slice(1);
    for (index = 0, _len = _ref.length; index < _len; index++) {
        match = _ref[index];
        paramName = this.paramNames[index];
        params[paramName] = match;
    }
    return params;
};

Route.prototype._addParamName = function(match, paramName) {
    this.paramNames.push(paramName);

    //return '([\\w-]+)';
    return '([^\/]+)';
};


Route.prototype.test = function(path) {
    var matched;

    matched = this.regExp.test(escape(path));
    if (!matched) return false;

    return true;
};

activities.Route = Route;


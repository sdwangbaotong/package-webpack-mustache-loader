'use strict';

var loaderUtils = require('loader-utils');
var Hogan = require('hogan.js');
var minifier = require('html-minifier');
var path = require('path');

// https://github.com/kangax/html-minifier#options-quick-reference
var minifierDefaults = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    caseSensitive: true
};

var extend = function(target, source) {
    target = JSON.parse(JSON.stringify(target));

    Object.keys(source).forEach(function(key) {
        target[key] = source[key];
    });

    return target;
};

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);
    var fileName = path.basename(this.resourcePath, '.mustache');

    if (this.cacheable) {
        this.cacheable();
    }

    // minify?
    if (query.minify) {
        // `?minify`
        var minifierOptions = minifierDefaults;

        // `?{minify:{...}}`
        if (Object.prototype.toString.call(query.minify) === '[object Object]') {
            minifierOptions = extend(minifierOptions, query.minify);
        }

        source = minifier.minify(source, minifierOptions);
    }

    var compiledTxt = Hogan.compile(source, {
            asString: 1
        }),
        compiled = ';window.QTMPL=window.QTMPL||{}; window.QTMPL["' + fileName + '"] = new window.Hogan.Template(' + compiledTxt + ');';
    
    var mustacheOutput = compiled + '\nif(typeof module !== "undefined") module.exports = window.QTMPL["' + fileName + '"]';

    return mustacheOutput;
};
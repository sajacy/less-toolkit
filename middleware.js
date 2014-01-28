var path = require("path");
var url = require("url");
var processor = require("./processor");

// This middleware works with Express to compile LESS files.
// 
// Options:
//  - "middleware_match": ...
//  - "middleware_map"  : ...
//  - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).
/* Middleware */

// Default configuration
var _defaults = {
    // default matcher assumes requests for CSS
    "middleware_match": function(raw_url) {
        return /\.css$/.test(url.parse(raw_url).pathname);
    },
    // default mapper assumes CSS and LESS are side-by-side in directory
    "middleware_map": function(raw_url, pathname) { 
        return { 
            "input": path.join(__dirname, pathname).replace(/\.css$/, ".less"), 
            "output": path.join(__dirname, pathname)
        };
    },
    "less": {} 
};

module.exports = function(options) {

    // copy defaults onto options
    options = options || {};
    for(var p in _defaults) {
        if(_defaults.hasOwnProperty(p) && !options.hasOwnProperty(p)) { options[p] = _defaults[p]; }
    }

    // return handler 
    return function (req, res, next) {

        var pathname = url.parse(req.url).pathname;
        if(options.middleware_match(req.url) || /\.css$/.test(pathname)) {

            var io = options.middleware_map(req.url, pathname);
            processor.generate(io.input, io.output, options, next);
        } else {
            next();
        }
    };
}

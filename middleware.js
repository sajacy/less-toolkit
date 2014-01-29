var path = require("path");
var url = require("url");
var processor = require("./processor");

// This middleware works with Express to compile LESS files.
// 
// Options:
//  - "middleware_match": ...
//  - "middleware_map"  : ...
//  - "base" : The base input directory to map URLs to LESS files.  See the [tests](./test/middleware.js) for usage details.
//  - "base_out" : The base output directory to map URLs to CSS files.
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

function map_generator(base_in, base_out) {
    return function(raw_url, pathname) { 
        return { 
            "input": path.join(base_in, pathname).replace(/\.css$/, ".less"), 
            "output": path.join(base_out || base_in, pathname)
        };
    };
}

module.exports = function(options) {

    // ensure options
    options = options || {};

    // helper function can generate a mapper, given some base directories
    if(!options.hasOwnProperty("middleware_map") && options.base) {
        options["middleware_map"] = map_generator(options.base, options.base_out);
    }

    // copy defaults onto options
    for(var p in _defaults) {
        if(_defaults.hasOwnProperty(p) && !options.hasOwnProperty(p)) { options[p] = _defaults[p]; }
    }

    // return handler 
    return function (req, res, next) {

        var pathname = url.parse(req.url).pathname;
        if(options.middleware_match(req.url)) {

            var io = options.middleware_map(req.url, pathname);
            processor.generate(io.input, io.output, options, next);
        } else {
            next();
        }
    };
}

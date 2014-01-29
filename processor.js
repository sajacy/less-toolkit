var less = require("less");
var fs = require("fs");
var path = require("path");

// Resolves the input and output arguments to one or more pairs of (CSS, LESS) filenames.
//
// Options properties are: 
//  - "debug": Enables debugging output
//  - "force": Forces overwrite of any existing CSS files
//  - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).
//
// Callback is called (with no arguments) when all inputs are processed.
var resolve = module.exports.resolve = function(input, output, options, callback) {

    if(input.length == 0) {
        console.warn("Warning: Unknown input.");
        callback();
        return;
    }

    if(options.debug) {
        console.info("Resolving, Input: " + input + ", Output: " + output);
    }

    options = options || {};

    if(/\.less$/.test(input)) {
        if(/\.css$/.test(output)) {
            // * inputname.LESS -> outputname.CSS
            generate(input, output, options, callback);
        } else {
            // * assume the output should have same name, placed in output dir or place next to input with same name.
            var isDirectory = false;
            try {
                isDirectory = fs.statSync(output).isDirectory();
            } catch(ex) {
                console.error(ex);
            }

            var newout = isDirectory ? path.join(output, path.basename(input.replace(/\.less$/, ".css"))) : input.replace(/\.less$/, ".css");
            resolve(input, newout, options, callback);
        }
    } else {
        // * is it a directory? read *.less files
        if(fs.statSync(input).isDirectory() && fs.statSync(output).isDirectory()) {
            fs.readdir(input, function(err, files) {
                if(err) {
                    console.error(err);
                    callback();
                    return;
                }

                // * LESS files: end in .less and not directories
                var less = files.filter(function(f) { return /\.less$/.test(f) && !fs.statSync(path.join(input, f)).isDirectory(); });
                
                // * only callback after all files are processed 
                var counter = 0, cbjoin = function() { if(++counter == less.length) { callback(); } };

                less.forEach(function(f) {
                    var inf = path.join(input, f);
                    var outf = path.join(output || input, f).replace(/\.less$/, ".css");
                    resolve(inf, outf, options, cbjoin);
            
                });    

                // * continue if no less files found.
                if(less.length == 0) {
                    console.warn("No LESS files found in directory: " + input);
                    callback();
                }
            });
        } else {
            // * if input is a path, output must be a path.
            console.error("Input and Output must be a path.");
            callback();
        }
    }
}

// Generates CSS from an input LESS.
var generate = module.exports.generate = function(input, output, options, callback) {

    // * compatibility for older Node.JS versions
    var exists = fs.exists || path.exists;

    exists(output, function(css_exists) {
        // * check if CSS file exists or should be overwritten
        if(!css_exists || options.force) {
            if(options.debug && options.force) {
                console.info("Output already exists.  Overwriting.");
            }
            exists(input, function(less_exists) {
                if(less_exists) {
                    generateNoCheck(input, output, options.less || {}, callback);
                } else {
                    // * no LESS file, just continue.
                    if(options.debug) {
                        console.info("Files not found, Input: " + input + ", Output: " + output);
                    }
                    callback();
                }
            });
        } else {
            // * CSS already exists, just continue.
            if(options.debug) {
                console.info("Output file already exists. Skipping.");
            }
            callback();
        }
    });
};

// A simple wrapper around less.Parser
// If you just want to pipe I/O through the parser, consider this an example implementation.
var generateNoCheck = module.exports.generateNoCheck = function(input, output, less_options, callback) {
    less_options.filename = input;
    var parser = new less.Parser(less_options);
    
    fs.readFile(input, 'utf8', function(err, str){
        if(err) { 
            console.error(err); 
            callback(); 
            return;
        }
        try {
            parser.parse(str, function(err, tree) {
                    if(err) { 
                        console.error(err);
                        callback();
                        return; 
                    }
                    var css = tree.toCSS(less_options);
                    fs.writeFile(output, css, 'utf8', callback);
            });
        } catch(ex) {
            console.error(ex);
            callback();
        }
    });
};

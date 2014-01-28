var processor = require("./processor");

// This is a simple command-line wrapper around the processor, 
// supporting the following variations of inputs and outputs:
//
// ````
// inputfile.LESS -> outputfile.CSS
// inputfile.LESS -> /output/path
// /input/path -> /output/path
// ```
//
// The optional third argument specifies the options file (a Node.JS module).
// Options:
//  - "watcher_match_pattern": filter for file names 
//  - "debug": Enables debugging output
//  - "force": Forces overwrite of any existing CSS files
//  - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).
//
/* Command Line Interface */
function CLI(callback) {
    if(process.argv.length < 3) {
        console.log("Usage: node cli /path/to/input.less /path/to/output.css options.js");
        return;
    }
    var input = process.argv[2] || "",
    output = process.argv[3] || "",
    optionsjs = process.argv[4] || "",
    options = (optionsjs.length > 0) ? require(optionsjs) : {};

    processor.resolve(input, output, options, callback);
}

CLI(function() { console.log("Done."); });

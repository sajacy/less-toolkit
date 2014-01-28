var processor = require("./processor");
var fs = require("fs");

// This is a daemon that watches one or more directories for changes.
// It takes four arguments, supporting the following variations of inputs and outputs:
//
// ````
// inputfile.LESS -> outputfile.CSS
// inputfile.LESS -> /output/path
// /input/path -> /output/path
// ```
// 
// The optional third argument is a colon-delimited list of other 
// directories to watch (typically for LESS includes)
//
// The optional fourth argument specifies the options file (a Node.JS module).
// Options:
//  - "watcher_match_pattern": filter for file names 
//  - "debug": Enables debugging output
//  - "force": Forces overwrite of any existing CSS files
//  - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).
//
// Limitations: It doesn't watch subdirectories, so list out all paths.

/* File Watcher */
function Watcher(callback) {
    if(process.argv.length < 3) {
        console.log("Usage: node watcher /input/path /output/path /includes:/includes/subdir options.js");
        return;
    }

    var input = process.argv[2] || "",
    output = process.argv[3] || "",
    watchdirs = [input].concat((process.argv[4] || "").split(":")).filter(function(o) { return o.length > 0 }),
    optionsjs = process.argv[5] || "",
    options = (optionsjs.length > 0) ? require(optionsjs) : {},

    // Handler for file watcher-raised events 
    changeHandler = function(event, filename) {
        // * only process files that match the configured pattern (default: .less)
        if((options.watcher_match_pattern || /\.less$/).test(filename)) {

            if(options.debug) {
                console.info("Changed: " + input, [new Date().toISOString(), event, filename].join(" "));
            }
        
            // * flag the input as dirty (needs to be processed)
            isDirty = true;
            
            // * process if dirty
            if(!isProcessing) {
                processDirty();

                // * flag the file/directory as no longer dirty because we've already started processing. 
                // (Subsequent file changes will reflag dirty as necessary, regardless of processing status.)
                isDirty = false;
            }
        }
    },

    // Utility function for processing dirty files
    processDirty = function() {
        if(isDirty) {
            // * flag the process as busy
            isProcessing = true;

            processor.resolve(input, output, options, function() {  
                // * no longer busy
                isProcessing = false;
                
                // * if more file change events came in while we were processing, we might be dirty, so reprocess
                processDirty();
            });
        }
    },
    watchers = [];
    
    // Create a file watcher for each input directory
    // and save them to the `watchers` array.
    Array.prototype.push.apply(watchers, watchdirs.map(function(o) {
        var w = null;
        try {
            w = { "dir": o, "fs_watcher": fs.watch(o, changeHandler) }
        } catch(ex) {
            console.error(ex);
        }
        return w;
    }).filter(function(o) { return o != null; }));

    console.log("Watching " + watchers.length + " directories:\r\n", watchers.map(function(o) { return o.dir }).join("\r\n"));
}

// Global flags to maintain processing state
var isDirty = false;
var isProcessing = false;

Watcher();

var should = require('should');
var fs = require("fs");
var path = require("path");

var processor = require("../processor.js")

describe("Middleware", function() {
    describe("#handler()", function() {

        // clean up output directory
        beforeEach(function() {
            var files = fs.readdirSync("./css");
            files.forEach(function(f) {
                fs.unlinkSync(path.join("./css", f));
            });
        });

        it("should produce a CSS file, given a simple request for a CSS file", function(done) {
    
            var handler = require("../index").middleware({
                "base": "./less",
                "base_out": "./css"
            });

            var req = { url: "/example.css" }, res = {};

            handler(req, res, function() {
                
                var output = fs.readFileSync("./css/example.css", "utf8"),
                expected = fs.readFileSync("./expected/example.css", "utf8");
            
                (output).should.equal(expected);
                done();
            });
        });

        it("should produce a CSS file, given a complex request for a CSS file", function(done) {
    
            var map = { 
                "A": { input: "./less/example.less", output: "./css/complex.css" },
                "B": { input: "./less/example2.less", output: "./css/complex2.css" } 
            };

            var handler = require("../index").middleware({
                "middleware_match" : function(raw_url) {
                    return true;
                },
                "middleware_map" : function(raw_url, pathname) { 
                    return { input: "./less/example.less", output: "./css/complex.css" };
                }
            });

            var req = { url: "/some/path/prefix/A" }, res = {};

            handler(req, res, function() {
                
                var output = fs.readFileSync("./css/complex.css", "utf8"),
                expected = fs.readFileSync("./expected/example.css", "utf8");
            
                (output).should.equal(expected);
                done();
            });
        });
    });
});


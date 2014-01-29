var should = require('should');
var fs = require("fs");
var path = require("path");

var processor = require("../processor.js")

describe("Processor", function() {
    describe("#resolve()", function() {
        
        // clean up output directory
        beforeEach(function() {
            var files = fs.readdirSync("./css");
            files.forEach(function(f) {
                fs.unlinkSync(path.join("./css", f));
            });
        });

        it("should produce a CSS file, given a LESS file", function(done) {
            var inputFile = "less/example.less", 
            outputFile = "css/actual.css",
            expected = fs.readFileSync("expected/example.css", "utf8");
            
            processor.resolve(inputFile, outputFile, { "force": true }, function() {
                var output = fs.readFileSync(outputFile, "utf8"); 
                
                // assert correct value of side effect
                (output).should.equal(expected);
                done();
            });
        });

        it("should produce multiple CSS files from a LESS directory", function(done) {
            var inputPath = "./less", 
            outputPath = "./css"

            processor.resolve(inputPath, outputPath, { "force": true }, function() {
                var files = fs.readdirSync(outputPath);
                
                files.forEach(function(f) {
                    var o = fs.readFileSync(path.join(outputPath, f), "utf8"),
                    o_expected = fs.readFileSync(path.join("./expected", f), "utf8");

                    // assert correct value of side effect
                    (o).should.equal(o_expected);
                });
                
                // assert multiple files
                (files).length.should.be.greaterThan(1);
                done();
            });
        });
    });
});

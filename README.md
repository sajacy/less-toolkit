less-toolkit
============

This is a bundle of Node.JS developer utilities for working with LESS files.

The utilities included:

 - [CLI](#cli)
 - [File Watcher](#file-watcher)
 - [Middleware](#middleware)
 - [Processor Library](#processor-library)


#### CLI 
A simple command-line interface for processing less files.  It can take a file or path and output CSS in a target directory.  The options for compilation are read from a configuration file.

Usage:
```
$ node cli /path/to/input.less /path/to/output.css options.js
```

The inputs and outputs can be any the following variations:

```
inputfile.LESS -> outputfile.CSS
inputfile.LESS -> /output/path
/input/path -> /output/path
```

The optional fourth argument specifies an options file (for example, [development](./config/development.js))

Options:
 - "debug": Enables debugging output
 - "force": Forces overwrite of any existing CSS files
 - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).


[Source documentation](docs/cli.html)


#### File Watcher 
A simple file watching daemon.

Usage:
```
$ node watcher /input/path /output/path /includes:/includes/subdir options.js &
```

The inputs and outputs can be any the following variations:


```
inputfile.LESS -> outputfile.CSS
inputfile.LESS -> /output/path
/input/path -> /output/path
```

The optional third argument is a colon-delimited list of other directories to watch (typically for LESS includes)

The optional fourth argument specifies an options file (for example, [development](./config/development.js))

Options:
 - "watcher_match_pattern": filter for file names 
 - "debug": Enables debugging output
 - "force": Forces overwrite of any existing CSS files
 - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).

[Source documentation](docs/watcher.html)


#### Middleware 
A simple Express-compatible middleware.

Usage:
```javascript
...
app.use(require("less-toolkit").middleware({ "less": { "compress": true } }));
...
```

Options:
 - "debug": Enables debugging output
 - "force": Forces overwrite of any existing CSS files
 - "less" : An object passed directly to the [less Parser](https://github.com/less/less.js/#configuration).
 - "middleware_match": a function that returns true if the given URL should be handled by the middleware

```javascript 
    function(raw_url) {
        return /\.css$/.test(url.parse(raw_url).pathname);
    }
```

 - "middleware_map": a function that defines pairs of input / output for the given URL

```javascript 
    function(raw_url, pathname) { 
        return { 
            "input": path.join(__dirname, pathname).replace(/\.css$/, ".less"), 
            "output":  path.join(__dirname, pathname)
        }
    }
```

[Source documentation](docs/middleware.html)


#### Processor library
A simple wrapper around the core Less parser.  It takes an input, output, compilation options, and callback function.
This library is re-used by the CLI, File Watcher, and Middleware.


[Source documentation](docs/processor.html)


[License](LICENSE)
=====================
MIT

# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Features
* autocomplete
* format code
* outline view
* syntax highlighting

## Roadmap
* warning/error markers
* follow references
* compile-on-save

## Developing

### Tools
* [Eclipse](http://www.eclipse.org/downloads/)
* [Eclipse Checkstyle plug-in](http://eclipse-cs.sourceforge.net/)
* [Eclipse FindBugs plug-in](http://findbugs.sourceforge.net/)
* [Grunt](http://gruntjs.com/)
* [Maven](http://maven.apache.org/)
* [Node.js](http://nodejs.org/)

### Initial Setup
    git clone git@github.com:palantir/eclipse-typescript.git
    git submodule init
    git submodule update
    npm install

### Building
    grunt
    mvn install

### Contributing
* Ensure there are no warnings/errors in Eclipse (with Checkstyle and FindBugs installed)
* Ensure the Grunt and Maven builds succeed
* Submit a pull request

# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Features
* autocomplete
* syntax highlighting

## Roadmap
* JSDoc assistance (fill in parameter names for functions for example)
* organize references (similar to organizing imports for Java code)
* warning/error markers
* follow references
* compile-on-save
* display documentation during auto-complete and on hover
* code formatter

## Developing

### Tools
* [Eclipse](http://www.eclipse.org/downloads/)
* [Eclipse Checkstyle plug-in](http://eclipse-cs.sourceforge.net/)
* [Eclipse FindBugs plug-in](http://findbugs.sourceforge.net/)
* [Grunt](http://gruntjs.com/)
* [Maven](http://maven.apache.org/)
* [Node.js](http://nodejs.org/)

### Initial Setup
* Clone the repository
* Run `git submodule init`
* Run `git submodule update`
* Run `npm install`

### Building
* Run `grunt`
* Run `mvn install`

### Contributing
* Ensure there are no warnings/errors in Eclipse (with Checkstyle and FindBugs installed)
* Ensure the Grunt and Maven builds succeed
* Submit a pull request

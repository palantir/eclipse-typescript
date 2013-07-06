# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Features
* auto-completion
* syntax highlighting

## Roadmap
* JSDoc assistance (fill in parameter names for functions for example)
* organize references (similar to organizing imports for Java code)
* warning/error markers
* follow references
* build on save?
* display documentation during auto-complete and on hover
* code formatter

## Building and Installing
* Clone the repository
* Install [Maven](http://maven.apache.org/)
* Install [Grunt](http://gruntjs.com/)
* Run `npm install`
* Run `grunt --force` (currently we have to force the build even if there are errors)
* Run `mvn install`

## Contributing
### Java
* Install the [Eclipse Checkstyle plug-in](http://eclipse-cs.sourceforge.net/)
* Install the [Eclipse FindBugs plug-in](http://findbugs.sourceforge.net/)
* Ensure there are no warnings/errors (in the Problems view)

Please build the changes via Grunt and Maven and if they succeed submit a pull request.

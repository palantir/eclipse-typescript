Eclipse TypeScript Plug-in
==================

An Eclipse plug-in for developing in the TypeScript language.

Features
--------
* auto-completion
* syntax highlighting

Roadmap
-------
* JSDoc assistance (fill in parameter names for functions for example)
* organize references (similar to organizing imports for Java code)
* warning/error markers
* follow references
* build on save?
* display documentation during auto-complete and on hover
* code formatter

Building and Installing
-----------------
* Install [Maven](http://maven.apache.org/)
* Install [Grunt](http://gruntjs.com/)
* Run grunt --force.  Currently we have to force the build even if there are errors.
* Run mvn install

Contributing
------------
* Install the [Eclipse Checkstyle plug-in](http://eclipse-cs.sourceforge.net/)
* Install the [Eclipse FindBugs plug-in](http://findbugs.sourceforge.net/)
* Ensure there are no warnings/errors (in the Problems view)
* Submit a pull request

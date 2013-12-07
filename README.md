# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

Please note: the current version of this plug-in (0.9.5) is less than the previous one (1.0.0) so updating to the latest release will require uninstalling the previous version and then re-installing.  The version was downgraded both to more closely match the corresponding version of TypeScript used by the plug-in and also to prevent automatic updates since there were many breaking changes to TypeScript's type system in version 0.9.5.

## Installation
1. Install [Node.js](http://nodejs.org/)
1. Open Eclipse and go to Help->Install New Software
1. Add the update site: http://eclipse-update.palantir.com/eclipse-typescript/
1. Reboot Eclipse
1. (optional) Right-click on a project and select Configure->Enable TypeScript Builder

## Features
* code completion
* compile-on-save
* error annotations/markers
* find references
* format code
* highlight matching brace
* mark occurrences
* open definition
* outline view
* quick outline
* rename refactor
* syntax highlighting
* toggle comments

## Additional Information
* Eclipse Kepler (4.3) is currently the only supported version
    * if this is a problem for your project, please let us know and we'll look into supporting older versions as well
* Eclipse must be running via Java 6+
* [Wiki](https://github.com/palantir/eclipse-typescript/wiki) (contains information about developing the plug-in)

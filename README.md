# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Installation
1. Install [Node.js](http://nodejs.org/)
1. Open Eclipse and go to Help->Install New Software
1. Add the update site: http://eclipse-update.palantir.com/eclipse-typescript/
1. Reboot Eclipse

### Enabling the Builder
1. Switch to the Navigator view
1. Right-click on a project containing TypeScript files
1. Select Configure->Enable TypeScript Builder

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
* rename refactor
* syntax highlighting
* toggle comments

## Roadmap
* quick outline
* save actions (format on save)
* type hierarchy

Waiting on TypeScript support:
* jsdoc assistance
* search

## Additional Information
* Eclipse Kepler (4.3) is currently the only supported version
    * if this is a problem for your project, please let us know and we'll look into supporting older versions as well
* Eclipse must be running via Java 6+
* [Wiki](https://github.com/palantir/eclipse-typescript/wiki) (contains information about developing the plug-in)

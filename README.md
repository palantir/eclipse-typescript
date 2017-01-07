# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Installation
1. Install [Node.js](http://nodejs.org/)
1. Open Eclipse and go to Help->Install New Software
1. Add the update site: http://eclipse-update.palantir.com/eclipse-typescript/
1. Reboot Eclipse
1. (optional) Right-click on a project and select Configure->Enable TypeScript Builder

## Features
* code completion
* compile-on-save
* cross-project compilation
* error annotations/markers
* find references
* format code
* highlight matching brace
* hover for JSDoc
* mark occurrences
* open definition
* outline view
* quick outline
* rename refactor
* syntax highlighting
* task tags
* toggle comments

## Additional Information
* Eclipse Kepler (4.3) and Luna (4.4) are supported
* Eclipse must be running via Java 6+
* [Wiki](https://github.com/palantir/eclipse-typescript/wiki) (contains information about developing the plug-in)

## Development
### Update Typescript
* Clone Typescript into a sibling folder
* Run `npm install` in the Typescript project
* Run `npm install dos2unix jake`
* Update Typescript branch in `./scripts/updateTypeScript.sh`
* Run `./scripts/updateTypeScript.sh`

### Build and Test
* Run `maven package`
* Install zip in Eclipse following `Install New Software...` -> `Add...` -> `Archive...`

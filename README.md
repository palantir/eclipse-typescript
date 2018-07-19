# Eclipse TypeScript Plug-in

An Eclipse plug-in for developing in the TypeScript language.

## Installation
1. Install [Node.js](http://nodejs.org/)
1. Open Eclipse and go to Help->Install New Software
1. Add the update site: http://eclipse-update.palantir.com/eclipse-typescript/
1. Restart Eclipse
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
* Eclipse Luna (4.4) Neon (4.5) Oxygen (4.6)
* Eclipse must be running via Java 8+
* [Wiki](https://github.com/palantir/eclipse-typescript/wiki) (contains information about developing the plug-in)

## Development
### Update Typescript
* For 100% working result, If your not in Linux use Cygwin shell (download dos2unix).
* Clone Typescript into a sibling folder
* Manually checkout latest branch. This is simpler and 100% sure.
* Run `npm install` in the Typescript project
* Run `npm install -g dos2unix jake`
* In script directory Run `./updateTypeScript.sh`

### now build Eclipse plugin and Test
* Update package.json for new version.
* Run `mvn versions:set -DnewVersion=x.x.x -DgenerateBackupPoms=false -U`
* Run `update_version.sh old_version new_version` This is to change all version ".qualifier"
* Run `npm install`
* Run `grunt`
* Run `mvn package`
* Install zip in Eclipse following `Install New Software...` -> `Add...` -> `Archive...`

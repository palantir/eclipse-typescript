/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="languageServiceHost.ts" />


namespace Bridge {

    export class LanguageEndpoint {

        private documentRegistry: ts.DocumentRegistry;
        private exportedFolderNames: { [projectName: string]: string[] };
        private projectFileInfos: { [projectName: string]: { [fileName: string]: FileInfo } };
        private allFileInfos: { [fileName: string]: FileInfo };
        private languageServices: { [serviceKey: string]: ts.LanguageService };

        constructor() {
            this.documentRegistry = ts.createDocumentRegistry();
            this.exportedFolderNames = Object.create(null);
            this.allFileInfos = Object.create(null);
            this.languageServices = Object.create(null);
            this.projectFileInfos = Object.create(null);
        }

        public cleanProject(projectName: string) {
            if (this.isProjectInitialized(projectName)) {

                delete this.exportedFolderNames[projectName];
                delete this.projectFileInfos[projectName];
                delete this.languageServices[projectName];
            }
        }

        public initializeProject(
            projectName: string,
            compilationSettings: ts.CompilerOptions,
            referencedProjectNames: string[],
            exportedFolderNames: string[],
            files: { [fileName: string]: string }) {
            
            this.cleanProject(projectName);
            this.exportedFolderNames[projectName] = exportedFolderNames;

            this.languageServices[projectName] = this.createProjectLanguageService(projectName, compilationSettings, referencedProjectNames);
            this.addFiles(projectName, files);
        }

        public isProjectInitialized(projectName: string) {
            return this.languageServices[projectName] !== undefined;
        }

        public initializeIsolatedLanguageService(serviceKey: string, fileName: string, fileContents: string) {
            this.languageServices[serviceKey] = this.createIsolatedLanguageService(fileName);

            this.allFileInfos[fileName] = new FileInfo(fileContents, null, null);
        }

        public closeIsolatedLanguageService(serviceKey: string, fileName: string) {
            delete this.allFileInfos[fileName];
            delete this.languageServices[serviceKey];
        }

        public getAllTodoComments(projectName: string) {
            var todos: { [fileName: string]: TodoCommentEx[] } = {};
            Object.keys(this.projectFileInfos[projectName])
                .forEach((fileName) => {
                    todos[fileName] = this.getTodoComments(projectName, fileName);
                });
            return todos;
        }

        public getAllDiagnostics(projectName: string) {
            var diagnostics: { [fileName: string]: DiagnosticEx[] } = Object.create(null);

            Object.keys(this.projectFileInfos[projectName])
                .forEach((fileName) => {
                    diagnostics[fileName] = this.getDiagnostics(projectName, fileName, true);
                });

            return diagnostics;
        }

        public getDiagnostics(serviceKey: string, fileName: string, semantic: boolean): DiagnosticEx[] {
            var diagnostics = this.languageServices[serviceKey].getSyntacticDiagnostics(fileName);

            if (semantic && diagnostics.length === 0) {
                diagnostics = this.languageServices[serviceKey].getSemanticDiagnostics(fileName);
            }

            return diagnostics.map((diagnostic) => {
                return {
                    start: diagnostic.start,
                    length: diagnostic.length,
                    line: diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line,
                    text: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
                };
            });
        }

        public getEmitOutput(serviceKey: string, fileName: string) {
            return this.languageServices[serviceKey].getEmitOutput(fileName).outputFiles;
        }

        public findReferences(serviceKey: string, fileName: string, position: number) {
            var languageService = this.languageServices[serviceKey];
            var references = languageService.getReferencesAtPosition(fileName, position);

            return references.map((reference) => {
                var sourceFile = languageService.getSourceFile(reference.fileName);
                var lineNumber = sourceFile.getLineAndCharacterOfPosition(reference.textSpan.start).line;
                var lineStart = sourceFile.getPositionOfLineAndCharacter(lineNumber, 0);
                var lineEnd = sourceFile.getPositionOfLineAndCharacter(lineNumber + 1, 0);
                var line = sourceFile.text.substring(lineStart, lineEnd);

                return {
                    fileName: reference.fileName,
                    line: line,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    textSpan: reference.textSpan
                };
            });
        }

        public findRenameLocations(serviceKey: string, fileName: string, position: number, findInStrings: boolean, findInComments: boolean) {
            return this.languageServices[serviceKey].findRenameLocations(fileName, position, findInStrings, findInComments);
        }

        public getBraceMatchingAtPosition(serviceKey: string, fileName: string, position: number) {
            return this.languageServices[serviceKey].getBraceMatchingAtPosition(fileName, position);
        }

        public getCompletionsAtPosition(serviceKey: string, fileName: string, position: number) {
            var completions = this.languageServices[serviceKey].getCompletionsAtPosition(fileName, position);

            if (completions != null) {
                // filter out the keyword & primitive entries
                var filteredEntries = completions.entries.filter((entry) => {
                    if (entry.kind === ts.ScriptElementKind.keyword
                        || entry.kind === ts.ScriptElementKind.primitiveType) {
                        return false;
                    }

                    return true;
                });

                // get the details for each entry
                var detailEntries = filteredEntries.map((entry) => {
                    return this.languageServices[serviceKey].getCompletionEntryDetails(fileName, position, entry.name);
                });

                // remove null entries
                detailEntries = detailEntries.filter((detailEntry) => detailEntry != null);

                return {
                    entries: detailEntries,
                    isMemberCompletion: completions.isMemberCompletion,
                    isNewIdentifierLocation: completions.isNewIdentifierLocation
                };
            }

            return null;
        }

        public getDefinitionAtPosition(serviceKey: string, fileName: string, position: number) {
            return this.languageServices[serviceKey].getDefinitionAtPosition(fileName, position);
        }

        public getDocumentHighlights(serviceKey: string, fileName: string, position: number, filesToSearch: string[]) {
            return this.languageServices[serviceKey].getDocumentHighlights(fileName, position, filesToSearch);
        }

        public getFormattingEditsForRange(serviceKey: string, fileName: string, start: number, end: number, options: ts.FormatCodeOptions) {
            return this.languageServices[serviceKey].getFormattingEditsForRange(fileName, start, end, options);
        }

        public getIndentationAtPosition(serviceKey: string, fileName: string, position: number, options: ts.EditorOptions) {
            return this.languageServices[serviceKey].getIndentationAtPosition(fileName, position, options);
        }

        public getNameOrDottedNameSpan(serviceKey: string, fileName: string, startPos: number, endPos: number) {
            return this.languageServices[serviceKey].getNameOrDottedNameSpan(fileName, startPos, endPos);
        }

        public getNavigationBarItems(serviceKey: string, fileName: string) {
            return this.languageServices[serviceKey].getNavigationBarItems(fileName);
        }

        public getQuickInfoAtPosition(serviceKey: string, fileName: string, position: number) {
            return this.languageServices[serviceKey].getQuickInfoAtPosition(fileName, position);
        }

        public getTodoComments(serviceKey: string, filename: string) {
            var descriptors = [
                { text: "TODO", priority: 0 },
                { text: "FIXME", priority: 1 },
                { text: "XXX", priority: 2 }
            ];

            var todos = this.languageServices[serviceKey].getTodoComments(filename, descriptors);
            if (todos.length > 0) {
                var sourceFile = this.languageServices[serviceKey].getSourceFile(filename);

                return todos.map((todo) => {
                    return {
                        start: todo.position,
                        line: sourceFile.getLineAndCharacterOfPosition(todo.position).line,
                        priority: todo.descriptor.priority,
                        text: todo.message
                    };
                });
            }

            return [];
        }

        public editFile(fileName: string, offset: number, length: number, text: string) {
            this.allFileInfos[fileName].editContents(offset, length, text);
        }

        public setFileOpen(fileName: string, open: boolean) {
            var fileInfo = this.allFileInfos[fileName];

            // the file may have been deleted previously, so only process this call if the file exists
            if (fileInfo != null) {
                fileInfo.setOpen(open);
            }
        }

        public setLibContents(libContents: string, libES6Contents: string) {
            var libFileInfo = new FileInfo(libContents, null, null);
            this.allFileInfos[LIB_FILE_NAME] = libFileInfo;

            var libES6FileInfo = new FileInfo(libES6Contents, null, null);
            this.allFileInfos[LIB_ES6_FILE_NAME] = libES6FileInfo;
        }

        public updateFiles(projectName: string, deltas: IFileDelta[]) {
            deltas.forEach((delta) => {
                var fileName = delta.fileName;

                switch (delta.delta) {
                    case "ADDED":
                    case "CHANGED":
                        var fileInfo = this.allFileInfos[fileName];

                        if (fileInfo !== undefined) {
                            // only update files not currently open in an editor
                            if (!fileInfo.getOpen()) {
                                var contents = readFileContents(fileInfo.getPath());

                                fileInfo.updateFile(contents);
                            }
                        } else {
                            var filePath = delta.filePath;
                            var contents = readFileContents(filePath);

                            this.pushFile(projectName, fileName, contents, filePath);
                        }
                        break;
                    case "REMOVED":
                        var fileInfo: FileInfo = this.allFileInfos[fileName];
                        if (fileInfo != null) {
                            delete this.allFileInfos[fileName];
                            if (fileInfo.getProjectName() != null) {
                                delete this.projectFileInfos[fileInfo.getProjectName()][fileName];
                            }
                        }
                        break;
                }
            });
        }

        private addFiles(projectName: string, files: { [fileName: string]: string }) {
            for (var fileName in files) {
                if (files.hasOwnProperty(fileName)) {
                    var filePath = files[fileName];

                    // read the file
                    try {
                        var contents = readFileContents(filePath);
                    } catch (e) {
                        // ignore failures (they are likely due to the workspace being out-of-sync)
                        continue;
                    }

                    // cache the file
                    this.pushFile(projectName, fileName, contents, filePath);
                }
            }
        }

        private pushFile(projectName: string, fileName: string, contents: string, filePath: string): void {
            if (this.projectFileInfos[projectName] == null) {
                this.projectFileInfos[projectName] = Object.create(null);
            }

            var fileInfo = new FileInfo(contents, filePath, projectName);
            this.projectFileInfos[projectName][fileName] = fileInfo;
            this.allFileInfos[fileName] = fileInfo;
        }

        private createLanguageService(
            compilationSettings: ts.CompilerOptions,
            fileFilter: (fileName: string) => boolean) {
            var host = new LanguageServiceHost(compilationSettings, fileFilter, this.allFileInfos);

            return ts.createLanguageService(host, this.documentRegistry);
        }

        private createProjectLanguageService(projectName: string, compilationSettings: ts.CompilerOptions, referencedProjectNames: string[]) {
            var defaultLibFileName = ts.getDefaultLibFileName(compilationSettings);

            var fileFilter = (fileName: string) => {
                if (fileName === defaultLibFileName) {
                    return !compilationSettings.noLib;
                }

                return this.isSourceFile(projectName, fileName) || this.isReferencedFile(referencedProjectNames, fileName);
            }

            return this.createLanguageService(compilationSettings, fileFilter);
        }

        private createIsolatedLanguageService(fileName: string) {
            var compilationSettings: ts.CompilerOptions = {};
            var singleFileFilter = (fileName2: string) => {
                return fileName2 === fileName;
            }

            return this.createLanguageService(compilationSettings, singleFileFilter);
        }

        private isReferencedFile(referencedProjectNames: string[], fileName: string) {
            return referencedProjectNames.some((referencedProjectName: string) => {
                return this.isExportedFile(referencedProjectName, fileName);
            });
        }

        private isExportedFile(projectName: string, fileName: string) {
            return this.exportedFolderNames[projectName].some((exportedFolderName) => {
                return folderContains(exportedFolderName, fileName);
            });
        }

        private isSourceFile(projectName: string, fileName: string) {
            var projectSourceFiles: { [fileName: string]: FileInfo } = this.projectFileInfos[projectName];
            return projectSourceFiles[fileName] != null;
        }
    }

    function folderContains(folderName: string, fileName: string) {
        return fileName.indexOf(folderName) == 0;
    }

    function readFileContents(fileName: string) {
        var fs = require("fs");
        var options = { encoding: "utf8" };

        return fs.readFileSync(fileName, options);
    }

    export interface DiagnosticEx {
        length: number;
        line: number;
        start: number;
        text: string;
    }

    export interface TodoCommentEx {
        start: number;
        line: number;
        priority: number;
        text: string;
    }

    export interface IFileDelta {
        delta: string;
        fileName: string;
        filePath: string;
    }
}

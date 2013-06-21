var TypeScript;
(function (TypeScript) {
    var SourceMapPosition = (function () {
        function SourceMapPosition() {
        }
        return SourceMapPosition;
    })();
    TypeScript.SourceMapPosition = SourceMapPosition;

    var SourceMapping = (function () {
        function SourceMapping() {
            this.start = new SourceMapPosition();
            this.end = new SourceMapPosition();
            this.nameIndex = -1;
            this.childMappings = [];
        }
        return SourceMapping;
    })();
    TypeScript.SourceMapping = SourceMapping;

    var SourceMapper = (function () {
        function SourceMapper(tsFileName, jsFileName, sourceMapFileName, jsFile, sourceMapOut, emitFullPathOfSourceMap) {
            this.sourceMapFileName = sourceMapFileName;
            this.jsFile = jsFile;
            this.sourceMapOut = sourceMapOut;
            this.sourceMappings = [];
            this.currentMappings = [];
            this.names = [];
            this.currentNameIndex = [];
            this.currentMappings.push(this.sourceMappings);

            jsFileName = TypeScript.switchToForwardSlashes(jsFileName);
            this.jsFileName = TypeScript.getPrettyName(jsFileName, false, true);

            var removalIndex = jsFileName.lastIndexOf(this.jsFileName);
            var fixedPath = jsFileName.substring(0, removalIndex);

            if (emitFullPathOfSourceMap) {
                if (jsFileName.indexOf("://") === -1) {
                    jsFileName = "file:///" + jsFileName;
                }
                this.jsFileName = jsFileName;
            }

            this.tsFileName = TypeScript.getRelativePathToFixedPath(fixedPath, tsFileName);
        }
        SourceMapper.emitSourceMapping = function (allSourceMappers) {
            var sourceMapper = allSourceMappers[0];
            sourceMapper.jsFile.WriteLine("//@ sourceMappingURL=" + sourceMapper.jsFileName + SourceMapper.MapFileExtension);

            var sourceMapOut = sourceMapper.sourceMapOut;
            var mappingsString = "";
            var tsFiles = [];

            var prevEmittedColumn = 0;
            var prevEmittedLine = 0;
            var prevSourceColumn = 0;
            var prevSourceLine = 0;
            var prevSourceIndex = 0;
            var prevNameIndex = 0;
            var namesList = [];
            var namesCount = 0;
            var emitComma = false;

            var recordedPosition = null;
            for (var sourceMapperIndex = 0; sourceMapperIndex < allSourceMappers.length; sourceMapperIndex++) {
                sourceMapper = allSourceMappers[sourceMapperIndex];

                var currentSourceIndex = tsFiles.length;
                tsFiles.push(sourceMapper.tsFileName);

                if (sourceMapper.names.length > 0) {
                    namesList.push.apply(namesList, sourceMapper.names);
                }

                var recordSourceMapping = function (mappedPosition, nameIndex) {
                    if (recordedPosition !== null && recordedPosition.emittedColumn === mappedPosition.emittedColumn && recordedPosition.emittedLine === mappedPosition.emittedLine) {
                        return;
                    }

                    if (prevEmittedLine !== mappedPosition.emittedLine) {
                        while (prevEmittedLine < mappedPosition.emittedLine) {
                            prevEmittedColumn = 0;
                            mappingsString = mappingsString + ";";
                            prevEmittedLine++;
                        }
                        emitComma = false;
                    } else if (emitComma) {
                        mappingsString = mappingsString + ",";
                    }

                    mappingsString = mappingsString + TypeScript.Base64VLQFormat.encode(mappedPosition.emittedColumn - prevEmittedColumn);
                    prevEmittedColumn = mappedPosition.emittedColumn;

                    mappingsString = mappingsString + TypeScript.Base64VLQFormat.encode(currentSourceIndex - prevSourceIndex);
                    prevSourceIndex = currentSourceIndex;

                    mappingsString = mappingsString + TypeScript.Base64VLQFormat.encode(mappedPosition.sourceLine - 1 - prevSourceLine);
                    prevSourceLine = mappedPosition.sourceLine - 1;

                    mappingsString = mappingsString + TypeScript.Base64VLQFormat.encode(mappedPosition.sourceColumn - prevSourceColumn);
                    prevSourceColumn = mappedPosition.sourceColumn;

                    if (nameIndex >= 0) {
                        mappingsString = mappingsString + TypeScript.Base64VLQFormat.encode(namesCount + nameIndex - prevNameIndex);
                        prevNameIndex = namesCount + nameIndex;
                    }

                    emitComma = true;
                    recordedPosition = mappedPosition;
                };

                var recordSourceMappingSiblings = function (sourceMappings) {
                    for (var i = 0; i < sourceMappings.length; i++) {
                        var sourceMapping = sourceMappings[i];
                        recordSourceMapping(sourceMapping.start, sourceMapping.nameIndex);
                        recordSourceMappingSiblings(sourceMapping.childMappings);
                        recordSourceMapping(sourceMapping.end, sourceMapping.nameIndex);
                    }
                };

                recordSourceMappingSiblings(sourceMapper.sourceMappings);
                namesCount = namesCount + sourceMapper.names.length;
            }

            sourceMapOut.Write(JSON2.stringify({
                version: 3,
                file: sourceMapper.jsFileName,
                sources: tsFiles,
                names: namesList,
                mappings: mappingsString
            }));

            sourceMapOut.Close();
        };
        SourceMapper.MapFileExtension = ".map";
        return SourceMapper;
    })();
    TypeScript.SourceMapper = SourceMapper;
})(TypeScript || (TypeScript = {}));

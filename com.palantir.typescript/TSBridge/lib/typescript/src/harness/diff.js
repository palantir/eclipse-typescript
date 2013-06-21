var Diff;
(function (Diff) {
    (function (SegmentType) {
        SegmentType[SegmentType["Unchanged"] = 0] = "Unchanged";
        SegmentType[SegmentType["Added"] = 1] = "Added";
        SegmentType[SegmentType["Removed"] = 2] = "Removed";
        SegmentType[SegmentType["MovedFrom"] = 3] = "MovedFrom";

        SegmentType[SegmentType["MovedTo"] = 4] = "MovedTo";
    })(Diff.SegmentType || (Diff.SegmentType = {}));
    var SegmentType = Diff.SegmentType;

    (function (UnicodeCategory) {
        UnicodeCategory[UnicodeCategory["SpaceSeparator"] = 0] = "SpaceSeparator";

        UnicodeCategory[UnicodeCategory["LowercaseLetter"] = 1] = "LowercaseLetter";
    })(Diff.UnicodeCategory || (Diff.UnicodeCategory = {}));
    var UnicodeCategory = Diff.UnicodeCategory;

    var Segment = (function () {
        function Segment(content, type) {
            if (typeof content === "undefined") { content = ''; }
            if (typeof type === "undefined") { type = SegmentType.Unchanged; }
            this.content = content;
            this.type = type;
        }
        return Segment;
    })();
    Diff.Segment = Segment;

    var Region = (function () {
        function Region(index, length, type) {
            this.index = index;
            this.length = length;
            this.type = type;
        }
        return Region;
    })();
    Diff.Region = Region;

    var Chunk = (function () {
        function Chunk(content, delimiterContent) {
            this.content = content;
            this.delimiterContent = delimiterContent;
            this.hashCode = "~!!" + content;
            this.matchingIndex = -1;
            this.innerDiff = null;
        }
        Chunk.prototype.mergedContent = function () {
            return this.content + this.delimiterContent;
        };

        Chunk.prototype.equals = function (otherChunk) {
            if (otherChunk === null)
                throw new Error("otherChunk is null");

            if (this.hashCode != otherChunk.hashCode)
                return false;
            return this.content === otherChunk.content;
        };

        Chunk.isDelimiter = function (c, delimiters) {
            return delimiters.indexOf(c) >= 0;
        };

        Chunk.Split = function (content, delimiters) {
            var set = [];

            var currentIndex, currentLength;
            var index = 0;
            var length = content.length;
            var delimiterCount = 0;
            while (index < length) {
                currentIndex = index;
                currentLength = 0;

                while (index < length && !Chunk.isDelimiter(content.substr(index, 1), delimiters)) {
                    currentLength++;
                    index++;
                }

                delimiterCount = 0;
                while (index < length && Chunk.isDelimiter(content.substr(index, 1), delimiters)) {
                    currentLength++;
                    index++;
                    delimiterCount++;
                }

                set.push(new Chunk(content.substr(currentIndex, currentLength - delimiterCount), content.substr(currentIndex + currentLength - delimiterCount, delimiterCount)));
            }

            return set;
        };

        Chunk.SplitSeparateDelimiters = function (content, delimiters) {
            if (content === null || content.length === 0)
                return [];
            var set = [];
            var wantDelimiter = Chunk.isDelimiter(content[0], delimiters);

            var currentIndex, currentLength;
            var index = 0;
            var length = content.length;
            while (index < length) {
                currentIndex = index;
                currentLength = 0;

                while (index < length && wantDelimiter === Chunk.isDelimiter(content[index], delimiters)) {
                    currentLength++;
                    index++;
                }

                wantDelimiter = !wantDelimiter;

                set.push(new Chunk(content.substr(currentIndex, currentLength), ''));
            }

            return set;
        };

        Chunk.SplitInner = function (content) {
            return Chunk.SplitCategory(content);
        };

        Chunk.SplitCategory = function (content) {
            if (content === null || content.length === 0)
                return [];

            var set = [];
            var categoryToMatch = Chunk.GetCategory(content[0]);

            var currentIndex, currentLength;
            var index = 0;
            var length = content.length;
            while (index < length) {
                currentIndex = index;
                currentLength = 1;
                index++;

                while (index < length && Chunk.CategoryMatches(Chunk.GetCategory(content[index]), categoryToMatch)) {
                    currentLength++;
                    index++;
                }

                if (index < length)
                    categoryToMatch = Chunk.GetCategory(content[index]);

                set.push(new Chunk(content.substr(currentIndex, currentLength), ''));
            }

            return set;
        };

        Chunk.CategoryMatches = function (left, right) {
            if (left === UnicodeCategory.SpaceSeparator || right === UnicodeCategory.SpaceSeparator)
                return false;

            return left === right;
        };

        Chunk.GetCategory = function (c) {
            if (c === ' ' || c === '\r' || c === '\n' || c === '\t') {
                return UnicodeCategory.SpaceSeparator;
            } else {
                return UnicodeCategory.LowercaseLetter;
            }
        };

        Chunk.SplitEveryChar = function (content) {
            var set = [];
            for (var i = 0; i < content.length; ++i) {
                set.push(new Chunk(content[i], ''));
            }

            return set;
        };

        Chunk.prototype.toString = function () {
            return 'NYI?';
        };
        return Chunk;
    })();
    Diff.Chunk = Chunk;

    var UniquenessEntry = (function () {
        function UniquenessEntry(index, content) {
            this.index = index;
            this.content = content;
            this.MatchCount = 1;
        }
        UniquenessEntry.prototype.equals = function (other) {
            return this.content === other.content;
        };

        UniquenessEntry.prototype.Increment = function () {
            this.MatchCount++;
        };
        return UniquenessEntry;
    })();

    var SegmentBuilder = (function () {
        function SegmentBuilder() {
            this.segmentSet = [];
        }
        SegmentBuilder.prototype.AddSegment = function (content, type) {
            if (this.segmentExists && this.currentType === type) {
                this.currentContent += content;
            } else {
                if (this.segmentExists) {
                    var currentSegment = new Segment();
                    currentSegment.content = this.currentContent;
                    currentSegment.type = this.currentType;
                    this.segmentSet.push(currentSegment);
                }

                this.segmentExists = true;
                this.currentContent = content;
                this.currentType = type;
            }
        };

        SegmentBuilder.prototype.FlushSegment = function () {
            if (this.segmentExists) {
                this.segmentExists = false;
                var currentSegment = new Segment();
                currentSegment.content = this.currentContent;
                currentSegment.type = this.currentType;
                this.segmentSet.push(currentSegment);
            }
        };

        SegmentBuilder.prototype.GetSegments = function () {
            this.FlushSegment();
            return this.segmentSet;
        };
        return SegmentBuilder;
    })();

    var InnerDiff = (function () {
        function InnerDiff(oldContent, newContent) {
            var oldChunks = Chunk.SplitInner(oldContent);
            var newChunks = Chunk.SplitInner(newContent);

            StringDiff.Compare(oldChunks, 0, oldChunks.length - 1, newChunks, 0, newChunks.length - 1);

            this.Segments = StringDiff.CompressArraysToSegments(oldChunks, newChunks);
        }
        return InnerDiff;
    })();
    Diff.InnerDiff = InnerDiff;

    var StringDiff = (function () {
        function StringDiff(oldContent, newContent, includeUnchangedRegions) {
            if (typeof includeUnchangedRegions === "undefined") { includeUnchangedRegions = true; }
            this.includeUnchangedRegions = includeUnchangedRegions;
            this.regionsGenerated = false;
            this.segmentSet = [];

            var delimitersToUse = '\n\r';
            var useNestedAlgorithm = true;

            var oldChunks = Chunk.Split(oldContent, delimitersToUse.split(''));
            var newChunks = Chunk.Split(newContent, delimitersToUse.split(''));

            StringDiff.Compare(oldChunks, 0, oldChunks.length - 1, newChunks, 0, newChunks.length - 1);
            if (useNestedAlgorithm)
                StringDiff.PerformNestedDiff(oldChunks, newChunks);

            this.segmentSet = StringDiff.CompressArraysToSegments(oldChunks, newChunks);

            this.GenerateStringsAndRegions();
        }
        StringDiff.Compare = function (oldContent, oldStart, oldEnd, newContent, newStart, newEnd) {
            var oldTable = StringDiff.BuildUniquenessTable(oldContent, oldStart, oldEnd);
            var newTable = StringDiff.BuildUniquenessTable(newContent, newStart, newEnd);

            for (var i = newStart; i <= newEnd; ++i) {
                var newEntries = (newTable[newContent[i].hashCode]);
                var oldEntries = (oldTable[newContent[i].hashCode]);

                if (newEntries && oldEntries) {
                    var foundIt = false;
                    for (var x = 0; x < newEntries.length; x++) {
                        var newEntry = newEntries[x];
                        for (var y = 0; y < oldEntries.length; y++) {
                            var oldEntry = oldEntries[y];

                            if (newEntry && oldEntry && newEntry.MatchCount === 1 && oldEntry.MatchCount === 1 && (newEntry.content.localeCompare(oldEntry.content) === 0)) {
                                var oldIndex = oldEntry.index;
                                newContent[i].matchingIndex = oldIndex;
                                oldContent[oldIndex].matchingIndex = i;
                                foundIt = true;
                                break;
                            }
                        }
                        if (foundIt)
                            break;
                    }
                }
            }

            if (oldStart <= oldEnd && newStart <= newEnd) {
                StringDiff.TryMatch(oldContent, oldStart, newContent, newStart);
                StringDiff.TryMatch(oldContent, oldEnd, newContent, newEnd);
            }

            for (i = newStart; i < newEnd; ++i) {
                var j = newContent[i].matchingIndex;

                if (j != -1 && j < oldEnd && j >= oldStart) {
                    if (oldContent[j].matchingIndex === i) {
                        StringDiff.TryMatch(oldContent, j + 1, newContent, i + 1);
                    }
                }
            }

            for (i = newEnd; i > newStart; --i) {
                j = newContent[i].matchingIndex;

                if (j != -1 && j <= oldEnd && j > oldStart) {
                    if (oldContent[j].matchingIndex === i) {
                        StringDiff.TryMatch(oldContent, j - 1, newContent, i - 1);
                    }
                }
            }
        };

        StringDiff.TryMatch = function (oldContent, oldIndex, newContent, newIndex) {
            var newChunk = newContent[newIndex];
            var oldChunk = oldContent[oldIndex];

            if (newChunk.matchingIndex === -1 && oldChunk.matchingIndex === -1) {
                if (newChunk.content === oldChunk.content) {
                    newChunk.matchingIndex = oldIndex;
                    oldChunk.matchingIndex = newIndex;
                }
            }
        };

        StringDiff.BuildUniquenessTable = function (content, start, end) {
            var table = {};
            for (var i = start; i <= end; ++i) {
                var entries = table[content[i].hashCode];
                if (!entries) {
                    entries = [];
                }

                var hasMatch = false;
                for (var k = 0; k < entries.length; k++) {
                    if (entries[k].content.localeCompare(content[i].content) === 0) {
                        hasMatch = true;
                        entries[k].Increment();
                        break;
                    }
                }

                if (!hasMatch) {
                    var newEntry = new UniquenessEntry(i, content[i].content);
                    entries.push(newEntry);
                }

                table[content[i].hashCode] = entries;
            }

            return table;
        };

        StringDiff.PerformNestedDiff = function (oldContent, newContent) {
            if (oldContent.length > 0 && newContent.length > 0) {
                StringDiff.TryInnerMatch(oldContent, 0, newContent, 0);
                StringDiff.TryInnerMatch(oldContent, oldContent.length - 1, newContent, newContent.length - 1);
            }

            for (var i = 0; i < newContent.length - 1; ++i) {
                var j = newContent[i].matchingIndex;

                if (j != -1 && j < oldContent.length - 1 && j >= 0) {
                    if (oldContent[j].matchingIndex === i) {
                        StringDiff.TryInnerMatch(oldContent, j + 1, newContent, i + 1);
                    }
                }
            }

            for (i = newContent.length - 1; i > 0; --i) {
                j = newContent[i].matchingIndex;

                if (j != -1 && j < oldContent.length && j > 0) {
                    if (oldContent[j].matchingIndex === i) {
                        StringDiff.TryInnerMatch(oldContent, j - 1, newContent, i - i);
                    }
                }
            }
        };

        StringDiff.TryInnerMatch = function (oldContent, oldIndex, newContent, newIndex) {
            var newChunk = newContent[newIndex];
            var oldChunk = oldContent[oldIndex];

            if (newChunk.matchingIndex === -1 && oldChunk.matchingIndex === -1) {
                var difference = new InnerDiff(oldContent[oldIndex].content, newContent[newIndex].content);
                if (StringDiff.AreSimilarEnough(difference)) {
                    newChunk.innerDiff = difference;
                    oldChunk.innerDiff = difference;

                    newChunk.matchingIndex = oldIndex;
                    oldChunk.matchingIndex = newIndex;
                }
            }
        };

        StringDiff.AreSimilarEnough = function (difference) {
            var identicalChars = 0;
            var differentChars = 0;

            var addedCount = 0;
            var removedCount = 0;
            var movedCount = 0;

            for (var i = 0; i < difference.Segments.length; i++) {
                var s = difference.Segments[i];

                switch (s.type) {
                    case SegmentType.Added:
                        addedCount++;
                        break;
                    case SegmentType.Removed:
                        removedCount++;
                        break;
                    case SegmentType.MovedFrom:
                        movedCount++;
                        break;
                    case SegmentType.MovedTo:
                        movedCount++;
                        break;
                }

                if (s.content.trim().length === 0)
                    continue;

                if (s.type === SegmentType.Unchanged)
                    identicalChars += s.content.length * 2; else
                    differentChars += s.content.length;
            }

            var totalChars = identicalChars + differentChars;

            if (totalChars === 0)
                return true;

            if (removedCount === 0 && movedCount === 0)
                return true;
            if (addedCount === 0 && movedCount === 0)
                return true;

            return (identicalChars / totalChars) > 0.50;
        };

        StringDiff.CompressArraysToSegments = function (oldContent, newContent) {
            var builder = new SegmentBuilder();

            var oldIndex = 0;
            var newIndex = 0;

            while (oldIndex < oldContent.length && newIndex < newContent.length) {
                if (oldContent[oldIndex].matchingIndex === newIndex) {
                    if (newContent[newIndex].innerDiff === null) {
                        builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.Unchanged);
                    } else {
                        for (var i = 0; i < newContent[newIndex].innerDiff.Segments.length; i++) {
                            var s = newContent[newIndex].innerDiff.Segments[i];
                            builder.AddSegment(s.content, s.type);
                        }
                    }

                    oldIndex++;
                    newIndex++;
                } else if (oldContent[oldIndex].matchingIndex === -1) {
                    builder.AddSegment(oldContent[oldIndex].mergedContent(), SegmentType.Removed);
                    oldIndex++;
                } else if (newContent[newIndex].matchingIndex === -1) {
                    builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.Added);
                    newIndex++;
                } else if (oldContent[oldIndex].matchingIndex < newIndex) {
                    builder.AddSegment(oldContent[oldIndex].mergedContent(), SegmentType.MovedFrom);
                    oldIndex++;
                } else if (newContent[newIndex].matchingIndex < oldIndex) {
                    builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.MovedTo);
                    newIndex++;
                } else {
                    var linesOnLeftBeforeUnchanged = newContent[newIndex].matchingIndex - oldIndex;
                    var linesOnRightBeforeUnchanged = oldContent[oldIndex].matchingIndex - newIndex;

                    if (linesOnLeftBeforeUnchanged < linesOnRightBeforeUnchanged) {
                        builder.AddSegment(oldContent[oldIndex].mergedContent(), SegmentType.MovedFrom);

                        oldIndex++;
                    } else {
                        builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.MovedTo);

                        newIndex++;
                    }
                }
            }

            while (oldIndex < oldContent.length) {
                if (oldContent[oldIndex].matchingIndex === -1) {
                    builder.AddSegment(oldContent[oldIndex].mergedContent(), SegmentType.Removed);
                } else {
                    builder.AddSegment(oldContent[oldIndex].mergedContent(), SegmentType.MovedFrom);
                }

                oldIndex++;
            }

            while (newIndex < newContent.length) {
                if (newContent[newIndex].matchingIndex === -1) {
                    builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.Added);
                } else {
                    builder.AddSegment(newContent[newIndex].mergedContent(), SegmentType.MovedTo);
                }
                newIndex++;
            }

            return builder.GetSegments();
        };

        StringDiff.prototype.GenerateStringsAndRegions = function () {
            if (this.regionsGenerated === false) {
                this.regionsGenerated = true;
                var MergedHtml = '';
                var MergedText = '';
                var OldText = '';
                var NewText = '';
                var Regions = [];

                MergedHtml += StringDiff.htmlPrefix();

                for (var i = 0; i < this.segmentSet.length; i++) {
                    var segment = this.segmentSet[i];

                    var newRegion = new Region(MergedText.length, segment.content.length, segment.type);

                    Regions.push(newRegion);
                    MergedText += segment.content;

                    switch (segment.type) {
                        case SegmentType.Added:
                            OldText += (StringDiff.whitespaceEquivalent(segment.content));
                            NewText += (segment.content);
                            MergedHtml += (StringDiff.addedStringHtml(segment.content));
                            break;
                        case SegmentType.MovedTo:
                            OldText += (StringDiff.whitespaceEquivalent(segment.content));
                            NewText += (segment.content);
                            MergedHtml += (StringDiff.movedToStringHtml(segment.content));
                            break;
                        case SegmentType.Removed:
                            OldText += (segment.content);
                            NewText += (StringDiff.whitespaceEquivalent(segment.content));
                            MergedHtml += (StringDiff.removedStringHtml(segment.content));
                            break;
                        case SegmentType.MovedFrom:
                            OldText += (segment.content);
                            NewText += (StringDiff.whitespaceEquivalent(segment.content));
                            MergedHtml += (StringDiff.movedFromStringHtml(segment.content));
                            break;
                        default:
                            OldText += (segment.content);
                            NewText += (segment.content);

                            if (this.includeUnchangedRegions) {
                                MergedHtml += (StringDiff.unchangedStringHtml(segment.content));
                            }

                            break;
                    }
                }

                MergedHtml += StringDiff.htmlSuffix();

                this.mergedHtml = MergedHtml;
                this.mergedOutput = MergedText;
                this.oldOutput = OldText;
                this.newOutput = NewText;
                this.regions = Regions;
            }
        };

        StringDiff.htmlPrefix = function () {
            var content = '';

            return content;
        };

        StringDiff.htmlSuffix = function () {
            return '';
        };

        StringDiff.addedStringHtml = function (text) {
            return "<span class=\"new\">" + StringDiff.fullHtmlEncode(text) + "</span>";
        };

        StringDiff.removedStringHtml = function (text) {
            return "<span class=\"old\">" + StringDiff.fullHtmlEncode(text) + "</span>";
        };

        StringDiff.movedFromStringHtml = function (text) {
            return "<span class=\"from\">" + StringDiff.fullHtmlEncode(text) + "</span>";
        };

        StringDiff.movedToStringHtml = function (text) {
            return "<span class=\"to\">" + StringDiff.fullHtmlEncode(text) + "</span>";
        };

        StringDiff.unchangedStringHtml = function (text) {
            return StringDiff.fullHtmlEncode(text);
        };

        StringDiff.fullHtmlEncode = function (text) {
            return text.replace('<', '&lt;').replace(/\n/g, '<br>').replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        };

        StringDiff.whitespaceEquivalent = function (input) {
            return input.replace(/./g, ' ');
        };
        return StringDiff;
    })();
    Diff.StringDiff = StringDiff;

    var HtmlBaselineReport = (function () {
        function HtmlBaselineReport(reportFileName) {
            this.reportFileName = reportFileName;
            this.reportContent = null;
            var htmlTrailer = '</body></html>';

            if (Environment.fileExists(this.reportFileName)) {
                this.reportContent = Environment.readFile(this.reportFileName).contents();
            } else {
                this.reportContent = HtmlBaselineReport.htmlLeader;
            }
        }
        HtmlBaselineReport.prototype.reset = function () {
            if (Environment.fileExists(this.reportFileName)) {
                Environment.deleteFile(this.reportFileName);
            }

            this.reportContent = HtmlBaselineReport.htmlLeader;
        };

        HtmlBaselineReport.prototype.addDifference = function (description, expectedFileName, actualFileName, expected, actual, includeUnchangedRegions) {
            var diff = new Diff.StringDiff(expected, actual, includeUnchangedRegions);

            var header = "";
            if (description !== "") {
                header = '<h2>' + description + '</h2>';
            }

            header += '<h4>Left file: ' + expectedFileName + '; Right file: ' + actualFileName + '</h4>';

            this.reportContent = this.reportContent.replace(HtmlBaselineReport.htmlTrailer, '');

            this.reportContent += header + '<div class="code">' + diff.mergedHtml + '</div>' + '<hr>';
            this.reportContent += HtmlBaselineReport.htmlTrailer;

            Environment.writeFile(this.reportFileName, this.reportContent, false);
        };
        HtmlBaselineReport.htmlTrailer = '</body></html>';
        HtmlBaselineReport.htmlLeader = '<html><head><title>Baseline Report</title>' + '\r\n' + ("<style>") + '\r\n' + (".code { font: 9pt 'Courier New'; }") + '\r\n' + (".old { background-color: #EE1111; }") + '\r\n' + (".new { background-color: #FFFF11; }") + '\r\n' + (".from { background-color: #EE1111; color: #1111EE; }") + '\r\n' + (".to { background-color: #EEEE11; color: #1111EE; }") + '\r\n' + ("h2 { margin-bottom: 0px; }") + '\r\n' + ("h2 { padding-bottom: 0px; }") + '\r\n' + ("h4 { font-weight: normal; }") + '\r\n' + ("</style>");
        return HtmlBaselineReport;
    })();
    Diff.HtmlBaselineReport = HtmlBaselineReport;
})(Diff || (Diff = {}));

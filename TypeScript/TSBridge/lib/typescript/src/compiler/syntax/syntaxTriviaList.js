var TypeScript;
(function (TypeScript) {
    (function (Syntax) {
        Syntax.emptyTriviaList = {
            kind: function () {
                return TypeScript.SyntaxKind.TriviaList;
            },
            count: function () {
                return 0;
            },
            syntaxTriviaAt: function (index) {
                throw TypeScript.Errors.argumentOutOfRange("index");
            },
            last: function () {
                throw TypeScript.Errors.argumentOutOfRange("index");
            },
            fullWidth: function () {
                return 0;
            },
            fullText: function () {
                return "";
            },
            hasComment: function () {
                return false;
            },
            hasNewLine: function () {
                return false;
            },
            hasSkippedToken: function () {
                return false;
            },
            toJSON: function (key) {
                return [];
            },
            collectTextElements: function (elements) {
            },
            toArray: function () {
                return [];
            },
            concat: function (trivia) {
                return trivia;
            }
        };

        function concatTrivia(list1, list2) {
            if (list1.count() === 0) {
                return list2;
            }

            if (list2.count() === 0) {
                return list1;
            }

            var trivia = list1.toArray();
            trivia.push.apply(trivia, list2.toArray());

            return triviaList(trivia);
        }

        function isComment(trivia) {
            return trivia.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia || trivia.kind() === TypeScript.SyntaxKind.SingleLineCommentTrivia;
        }

        var SingletonSyntaxTriviaList = (function () {
            function SingletonSyntaxTriviaList(item) {
                this.item = item;
            }
            SingletonSyntaxTriviaList.prototype.kind = function () {
                return TypeScript.SyntaxKind.TriviaList;
            };

            SingletonSyntaxTriviaList.prototype.count = function () {
                return 1;
            };

            SingletonSyntaxTriviaList.prototype.syntaxTriviaAt = function (index) {
                if (index !== 0) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.item;
            };

            SingletonSyntaxTriviaList.prototype.last = function () {
                return this.item;
            };

            SingletonSyntaxTriviaList.prototype.fullWidth = function () {
                return this.item.fullWidth();
            };

            SingletonSyntaxTriviaList.prototype.fullText = function () {
                return this.item.fullText();
            };

            SingletonSyntaxTriviaList.prototype.hasComment = function () {
                return isComment(this.item);
            };

            SingletonSyntaxTriviaList.prototype.hasNewLine = function () {
                return this.item.kind() === TypeScript.SyntaxKind.NewLineTrivia;
            };

            SingletonSyntaxTriviaList.prototype.hasSkippedToken = function () {
                return this.item.kind() === TypeScript.SyntaxKind.SkippedTokenTrivia;
            };

            SingletonSyntaxTriviaList.prototype.toJSON = function (key) {
                return [this.item];
            };

            SingletonSyntaxTriviaList.prototype.collectTextElements = function (elements) {
                (this.item).collectTextElements(elements);
            };

            SingletonSyntaxTriviaList.prototype.toArray = function () {
                return [this.item];
            };

            SingletonSyntaxTriviaList.prototype.concat = function (trivia) {
                return concatTrivia(this, trivia);
            };
            return SingletonSyntaxTriviaList;
        })();

        var NormalSyntaxTriviaList = (function () {
            function NormalSyntaxTriviaList(trivia) {
                this.trivia = trivia;
            }
            NormalSyntaxTriviaList.prototype.kind = function () {
                return TypeScript.SyntaxKind.TriviaList;
            };

            NormalSyntaxTriviaList.prototype.count = function () {
                return this.trivia.length;
            };

            NormalSyntaxTriviaList.prototype.syntaxTriviaAt = function (index) {
                if (index < 0 || index >= this.trivia.length) {
                    throw TypeScript.Errors.argumentOutOfRange("index");
                }

                return this.trivia[index];
            };

            NormalSyntaxTriviaList.prototype.last = function () {
                return this.trivia[this.trivia.length - 1];
            };

            NormalSyntaxTriviaList.prototype.fullWidth = function () {
                return TypeScript.ArrayUtilities.sum(this.trivia, function (t) {
                    return t.fullWidth();
                });
            };

            NormalSyntaxTriviaList.prototype.fullText = function () {
                var result = "";

                for (var i = 0, n = this.trivia.length; i < n; i++) {
                    result += this.trivia[i].fullText();
                }

                return result;
            };

            NormalSyntaxTriviaList.prototype.hasComment = function () {
                for (var i = 0; i < this.trivia.length; i++) {
                    if (isComment(this.trivia[i])) {
                        return true;
                    }
                }

                return false;
            };

            NormalSyntaxTriviaList.prototype.hasNewLine = function () {
                for (var i = 0; i < this.trivia.length; i++) {
                    if (this.trivia[i].kind() === TypeScript.SyntaxKind.NewLineTrivia) {
                        return true;
                    }
                }

                return false;
            };

            NormalSyntaxTriviaList.prototype.hasSkippedToken = function () {
                for (var i = 0; i < this.trivia.length; i++) {
                    if (this.trivia[i].kind() === TypeScript.SyntaxKind.SkippedTokenTrivia) {
                        return true;
                    }
                }

                return false;
            };

            NormalSyntaxTriviaList.prototype.toJSON = function (key) {
                return this.trivia;
            };

            NormalSyntaxTriviaList.prototype.collectTextElements = function (elements) {
                for (var i = 0; i < this.trivia.length; i++) {
                    (this.trivia[i]).collectTextElements(elements);
                }
            };

            NormalSyntaxTriviaList.prototype.toArray = function () {
                return this.trivia.slice(0);
            };

            NormalSyntaxTriviaList.prototype.concat = function (trivia) {
                return concatTrivia(this, trivia);
            };
            return NormalSyntaxTriviaList;
        })();

        function triviaList(trivia) {
            if (trivia === undefined || trivia === null || trivia.length === 0) {
                return TypeScript.Syntax.emptyTriviaList;
            }

            if (trivia.length === 1) {
                return new SingletonSyntaxTriviaList(trivia[0]);
            }

            return new NormalSyntaxTriviaList(trivia);
        }
        Syntax.triviaList = triviaList;

        Syntax.spaceTriviaList = triviaList([TypeScript.Syntax.spaceTrivia]);
    })(TypeScript.Syntax || (TypeScript.Syntax = {}));
    var Syntax = TypeScript.Syntax;
})(TypeScript || (TypeScript = {}));

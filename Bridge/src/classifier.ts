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

///<reference path='../typescript/src/services/classifier.ts' />

module Bridge {

    export class ClassifierService {

        private classifier: Services.Classifier;

        constructor() {
            this.classifier = new Services.Classifier(new TypeScript.NullLogger());
        }

        public getClassificationsForLines(lines: string[], lexState: Services.EndOfLineState): Services.ClassificationResult[] {
            var lastLexState = lexState;
            var results = [];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var classificationResult = this.classifier.getClassificationsForLine(line, lastLexState);

                results.push(classificationResult);

                lastLexState = classificationResult.finalLexState;
            }

            return results;
        }
    }
}

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

        public getClassificationsForLines(lines: string[], lexState: Services.EndOfLineState): ClassificationResults {
            var line: string;
            var localLexState: Services.EndOfLineState = lexState;
            var classificationResult: Services.ClassificationResult;
            var results: Services.ClassificationResult[] = [];

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];
                classificationResult = this.classifier.getClassificationsForLine(line, localLexState);
                results.push(classificationResult);
                localLexState = classificationResult.finalLexState;
            }

            return {"results" : results};
        }
    }

    export interface ClassificationResults {
        results: Services.ClassificationResult[];
    }
}
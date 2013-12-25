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

package com.palantir.typescript.text;

/**
 * Defines the definition IDs for the TypeScript editor actions.
 *
 * @author dcicerone
 */
public interface ITypeScriptActionDefinitionIds {

    String FIND_REFERENCES = "com.palantir.typescript.text.findReferences";
    String FORMAT = "com.palantir.typescript.text.format";
    String GO_TO_MATCHIING_BRACKET = "com.palantir.typescript.text.goToMatchingBracket";
    String OPEN_DEFINITION = "com.palantir.typescript.text.openDefinition";
    String QUICK_OUTLINE = "com.palantir.typescript.text.quickOutline";
    String RENAME = "com.palantir.typescript.text.rename";
    String TOGGLE_COMMENT = "com.palantir.typescript.text.toggleComment";
}

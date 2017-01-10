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

package com.palantir.typescript.services.language;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.base.StandardSystemProperty;

/**
 * Corresponds to the class with the same name in TypeScript.
 *
 * @author Rouche
 */
public final class JSDocTagInfo {

    private final String name;
    private final String text;

    public JSDocTagInfo(
            @JsonProperty("name") String name,
            @JsonProperty("text") String text) {
        checkNotNull(name);

        this.name = name;
        this.text = text;
    }

    public String getName() {
        return this.name;
    }

    public String getText() {
        return this.text;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("name", this.name)
            .add("text", this.text)
            .toString();
    }

    public static String getText(List<JSDocTagInfo> parts) {
        checkNotNull(parts);

        StringBuilder displayText = new StringBuilder();

        for (JSDocTagInfo part : parts) {
            displayText.append(part.getName());
            if(part.getText() != null && part.getText().trim().length() > 0) {
                displayText.append(" ");
                displayText.append(part.getText());
            }
            displayText.append(StandardSystemProperty.LINE_SEPARATOR.value());
        }

        return displayText.toString();
    }
}

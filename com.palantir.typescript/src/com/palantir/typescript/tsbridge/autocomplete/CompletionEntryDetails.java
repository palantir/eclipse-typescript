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

package com.palantir.typescript.tsbridge.autocomplete;

import java.util.List;

import org.eclipse.core.runtime.Assert;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

/**
 * Port of the CompletionEntryDetails class from TypeScript.
 *
 * @author tyleradams
 */
public final class CompletionEntryDetails {
    private final String undefined = "UNDEFINED";
    private String name = "UNASSIGNED";
    private String type = "UNASSIGNED";
    private String kind = "UNASSIGNED";
    private String kindModifiers = "UNASSIGNED";
    private String fullSymbolName = "UNASSIGNED";
    private String docComment = "UNASSIGNED";
    private List<String> args;

    public CompletionEntryDetails() {

    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        if (name == null) {
            name = this.undefined; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        }
        this.name = name;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        if (type == null) {
            type = ""; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        }
        this.type = type;
    }

    private void setArgs() {
        String delims = "[ ,:()]";
        List<String> tokens = Lists.newArrayList(this.type.split(delims));
        while (tokens.remove("")) {
        }
        if (tokens.size() == 0) {
            this.args = tokens;
            return;
        }
        tokens.remove(tokens.size() - 1);
        Assert.isTrue((tokens.size() % 2) == 0);
        int numberOfTokens = tokens.size() / 2;
        for (int i = 1; i <= numberOfTokens; i++) {
            tokens.remove(i);
        }
        this.args = tokens;

    }

    public List<String> getArgs() {
        return this.args;
    }

    public boolean hasArgs() {
        Preconditions.checkNotNull(this.args);
        return this.args.size() > 0;
    }

    public String getKind() {
        return this.kind;
    }

    public void setKind(String kind) {
        if (kind == null)
            kind = this.undefined; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        this.kind = kind;
        if (this.kind.equals("method")) {
            setArgs();
        }

    }

    public String getKindModifiers() {
        return this.kindModifiers;
    }

    public void setKindModifiers(String kindModifiers) {
        if (kindModifiers == null)
            kindModifiers = this.undefined; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        this.kindModifiers = kindModifiers;

    }

    public String getFullSymbolName() {
        return this.fullSymbolName;
    }

    public void setFullSymbolName(String fullSymbolName) {
        if (fullSymbolName == null)
            fullSymbolName = this.undefined; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        this.fullSymbolName = fullSymbolName;
    }

    public String getDocComment() {
        return this.docComment;
    }

    public void setDocComment(String docComment) {
        if (docComment == null)
            docComment = this.undefined; //HACKHACK: This is a bandaid covering up getting back null objects from the Bridge.
        this.docComment = docComment;
    }

}

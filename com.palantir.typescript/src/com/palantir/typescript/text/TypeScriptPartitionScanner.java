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

import java.util.List;

import org.eclipse.jface.text.rules.IPredicateRule;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.MultiLineRule;
import org.eclipse.jface.text.rules.RuleBasedPartitionScanner;
import org.eclipse.jface.text.rules.Token;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

/**
 * Determines the rules used to divide source files into different Partitions.
 *
 * @author tyleradams
 */
public final class TypeScriptPartitionScanner extends RuleBasedPartitionScanner {

    protected static final String MULTILINE_COMMENT = "__typescript_multiline_comment";
    protected static final String JSDOC = "__javascript_JSDoc";
    protected static final List<String> TYPE_SCRIPT_PARTITION_TYPES = ImmutableList.of(MULTILINE_COMMENT, JSDOC);

    public TypeScriptPartitionScanner() {

        List<IPredicateRule> rulesList = Lists.newArrayList();
        IToken token;

        token = new Token(JSDOC);
        rulesList.add(new MultiLineRule("/**", "*/", token, (char) 0, true));

        token = new Token(MULTILINE_COMMENT);
        rulesList.add(new MultiLineRule("/*", "*/", token, (char) 0, true));

        IPredicateRule[] rules = new IPredicateRule[rulesList.size()];
        rulesList.toArray(rules);

        this.setPredicateRules(rules);
    }
}

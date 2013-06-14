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

package com.palantir.typescript.editors;

import java.util.ArrayList;
import java.util.List;

import org.eclipse.jface.text.rules.IPredicateRule;
import org.eclipse.jface.text.rules.RuleBasedPartitionScanner;

/**
 * Determines the rules used to divide source files into different Partitions.
 *
 * @author tyleradams
 */
public final class TypeScriptPartitionScanner extends RuleBasedPartitionScanner {

    public TypeScriptPartitionScanner() {
        List<IPredicateRule> rulesList = new ArrayList<>();

        IPredicateRule[] rules = new IPredicateRule[rulesList.size()];
        rulesList.toArray(rules);

        this.setPredicateRules(rules);
    }
}

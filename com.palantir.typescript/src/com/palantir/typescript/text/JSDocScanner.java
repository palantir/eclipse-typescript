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

import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IRule;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.IWordDetector;
import org.eclipse.jface.text.rules.RuleBasedScanner;
import org.eclipse.jface.text.rules.SingleLineRule;
import org.eclipse.jface.text.rules.Token;
import org.eclipse.jface.text.rules.WhitespaceRule;
import org.eclipse.jface.text.rules.WordRule;
import org.eclipse.swt.SWT;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

/**
 * This class Parses partitions of JSDoc.
 *
 * @author tyleradams
 */
public class JSDocScanner extends RuleBasedScanner {

    public JSDocScanner(ColorManager manager) {
        Preconditions.checkNotNull(manager);

        List<String> tagList = Lists.newArrayList(
            "@author",
            "@constructor",
            "@deprecated",
            "@exception",
            "@param",
            "@private",
            "@return",
            "@see",
            "@this",
            "@throws",
            "@version"
            );
        IToken defaultToken = new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.JS_DEFAULT)));
        this.setDefaultReturnToken(defaultToken);

        IToken tags = new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.JSDOC_TAG), null, SWT.BOLD));
        IToken htmlMarkup = new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.JSDOC_MARKUP)));
        IToken link = new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.JSDOC_LINK)));

        List ruleList = Lists.newArrayList();
        ruleList.add(new SingleLineRule("<", ">", htmlMarkup));
        ruleList.add(new SingleLineRule("{", "}", link));
        ruleList.add(new WhitespaceRule(new TypeScriptWhitespaceDetector()));
        WordRule wordRule = new WordRule(new JSDocWordDetector());

        for (String tag : tagList) {
            wordRule.addWord(tag, tags);
        }
        ruleList.add(wordRule);

        IRule[] rules = new IRule[ruleList.size()];
        ruleList.toArray(rules);
        setRules(rules);

    }

    private static class JSDocWordDetector implements IWordDetector {

        @Override
        public boolean isWordStart(char c) {
            return (c == '@');
        }

        @Override
        public boolean isWordPart(char c) {
            return Character.isLetter(c);
        }
    }
}

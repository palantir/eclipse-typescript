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

import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IRule;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.RuleBasedScanner;
import org.eclipse.jface.text.rules.Token;

import com.google.common.base.Preconditions;

/**
 * This class parses comment partition sections.
 *
 * @author tyleradams
 */
public class CommentScanner extends RuleBasedScanner {

    public CommentScanner(ColorManager manager) {
        Preconditions.checkNotNull(manager);

        IToken defaultToken = new Token(new TextAttribute(manager.getColor(TypeScriptColorConstants.COMMENT)));
        this.setDefaultReturnToken(defaultToken);

        setRules(new IRule[0]);
    }

}

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

import org.eclipse.jface.text.contentassist.CompletionProposal;
import org.eclipse.jface.text.contentassist.ICompletionProposal;
import org.eclipse.jface.text.contentassist.IContextInformation;
import org.eclipse.swt.graphics.Image;

import com.google.common.base.Preconditions;
import com.palantir.typescript.bridge.language.CompletionEntryDetails;

/**
 * This class handles all of the details behind creating an eclipse CompletionProposal object out of
 * a TypeScript CompletionEntryDetails object.
 *
 * @author tyleradams
 */
public final class CompletionEntryDetailsProposal {
    private final CompletionEntryDetails completionEntryDetails;
    private final IconFetcher iconFetcher;

    public CompletionEntryDetailsProposal(CompletionEntryDetails completionEntryDetails) {
        Preconditions.checkNotNull(completionEntryDetails);

        this.completionEntryDetails = completionEntryDetails;
        this.iconFetcher = IconFetcher.getInstance();
    }

    public ICompletionProposal getCompletionProposal(int offset, String prefix) {
        Preconditions.checkArgument(offset >= 0);
        Preconditions.checkNotNull(prefix);

        return new CompletionProposal(this.getReplacementString(prefix),
            this.getReplacementOffset(offset), this.getReplacementLength(),
            this.getCursorProposal(prefix), this.getIcon(),
            this.getDisplayString(), this.getContextInfo(),
            this.getAdditionalProposalInfo());
    }

    private String getReplacementString(String prefix) {
        Preconditions.checkNotNull(prefix);

        int prefixLength = prefix.length();
        if (this.completionEntryDetails.getKind().equals(("method")) || this.completionEntryDetails.getKind().equals("function")) {
            String replacement = this.completionEntryDetails.getName().substring(prefixLength);
            String argString = "()";
            replacement += argString;
            return replacement;
        } else {
            return this.completionEntryDetails.getName().substring(prefixLength);
        }
    }

    private int getReplacementOffset(int offset) {
        return offset;
    }

    private int getReplacementLength() {
        return 0;
    }

    private int getCursorProposal(String prefix) {
        Preconditions.checkNotNull(prefix);

        String replacement = this.getReplacementString(prefix);
        if (this.completionEntryDetails.getKind().equals(("method")) || this.completionEntryDetails.getKind().equals("function")) {
            if (this.completionEntryDetails.hasArgs()) {
                return this.completionEntryDetails.getName().length() - prefix.length() + 1;
            } else {
                return this.completionEntryDetails.getName().length() - prefix.length() + 2;
            }
        }
        return replacement.length();
    }

    private Image getIcon() {
        return this.iconFetcher.getDefaultIcon();
    }

    private String getDisplayString() {
        String display = "";
        if (this.completionEntryDetails.getKind().equals("method") || this.completionEntryDetails.getKind().equals("function")) {
            display += this.completionEntryDetails.getName();
            display += this.completionEntryDetails.getType();
        } else if(this.completionEntryDetails.getKind().equals("keyword")) {
            display += this.completionEntryDetails.getName();
            display += " : keyword";

        } else {
            display += this.completionEntryDetails.getName();
            display += " : " + this.completionEntryDetails.getType();
        }
        return display;
    }

    private IContextInformation getContextInfo() {
        return null;
    }

    private String getAdditionalProposalInfo() {
        return this.completionEntryDetails.getDocComment();
    }

}

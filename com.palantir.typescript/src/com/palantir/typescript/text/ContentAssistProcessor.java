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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.contentassist.CompletionProposal;
import org.eclipse.jface.text.contentassist.ContentAssistEvent;
import org.eclipse.jface.text.contentassist.ContextInformationValidator;
import org.eclipse.jface.text.contentassist.ICompletionListener;
import org.eclipse.jface.text.contentassist.ICompletionProposal;
import org.eclipse.jface.text.contentassist.IContentAssistProcessor;
import org.eclipse.jface.text.contentassist.IContextInformation;
import org.eclipse.jface.text.contentassist.IContextInformationValidator;
import org.eclipse.swt.graphics.Image;

import com.google.common.base.CharMatcher;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.Images;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.language.CompletionEntryDetails;
import com.palantir.typescript.services.language.CompletionInfoEx;

/**
 * This class deals with making auto completions.
 *
 * @author tyleradams
 */
public final class ContentAssistProcessor implements ICompletionListener, IContentAssistProcessor {

    private static final CharMatcher NON_IDENTIFIER = CharMatcher.whitespace().or(CharMatcher.anyOf("(){}[]+-/*=%!<>?&|,;"));

    private final TypeScriptEditor editor;

    private char[] completionAutoActivationCharacters;
    private CompletionInfoEx currentCompletionInfo;
    private int currentOffset;

    public ContentAssistProcessor(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.completionAutoActivationCharacters = new char[] { '.' };
        this.editor = editor;
    }

    @Override
    public void assistSessionStarted(ContentAssistEvent event) {
    }

    @Override
    public void assistSessionEnded(ContentAssistEvent event) {
        this.currentCompletionInfo = null;
    }

    @Override
    public ICompletionProposal[] computeCompletionProposals(ITextViewer viewer, int offset) {
        checkNotNull(viewer);
        checkArgument(offset >= 0);

        // get the completion info
        if (this.currentCompletionInfo == null || offset < this.currentOffset) {
            try {
                this.currentCompletionInfo = this.editor.getLanguageService().getCompletionsAtPosition(offset);
                this.currentOffset = this.getOffset(offset);
            } catch (RuntimeException e) {
                Status status = new Status(IStatus.ERROR, TypeScriptPlugin.ID, e.getMessage(), e);

                // log the exception
                TypeScriptPlugin.getDefault().getLog().log(status);
            }
        }

        // create the completion proposals from the completion entries
        List<CompletionProposal> proposals = Lists.newArrayList();
        if (this.currentCompletionInfo != null) {
            ImmutableList<CompletionEntryDetails> entries = this.currentCompletionInfo.getEntries();

            // get the current prefix
            String prefix;
            try {
                prefix = this.editor.getDocument().get(this.currentOffset, offset - this.currentOffset);
            } catch (BadLocationException e) {
                throw new RuntimeException(e);
            }
            PrefixMatcher prefixMatcher = new PrefixMatcher(prefix);

            for (CompletionEntryDetails entry : entries) {
                String replacementString = entry.getName();

                // filter the entries to only include the ones matching the current prefix
                if (prefixMatcher.matches(replacementString)) {
                    int replacementOffset = this.currentOffset;
                    int replacementLength = offset - this.currentOffset;
                    int cursorPosition = replacementString.length();
                    Image image = Images.getImage(entry.getKind(), entry.getKindModifiers());
                    String displayString = entry.getName() + " " + entry.getDisplayParts();
                    IContextInformation contextInformation = null;
                    String additionalProposalInfo = entry.getDocumentation();
                    CompletionProposal proposal = new CompletionProposal(replacementString, replacementOffset, replacementLength,
                        cursorPosition, image, displayString, contextInformation, additionalProposalInfo);

                    proposals.add(proposal);
                }
            }
        }

        return proposals.toArray(new ICompletionProposal[proposals.size()]);
    }

    @Override
    public IContextInformation[] computeContextInformation(ITextViewer viewer, int offset) {
        return null;
    }

    @Override
    public char[] getCompletionProposalAutoActivationCharacters() {
        return this.completionAutoActivationCharacters.clone();
    }

    public void setCompletionProposalAutoActivationCharacters(String completionAutoActivationCharacters) {
        checkNotNull(completionAutoActivationCharacters);

        this.completionAutoActivationCharacters = completionAutoActivationCharacters.toCharArray();
    }

    @Override
    public char[] getContextInformationAutoActivationCharacters() {
        return null;
    }

    @Override
    public IContextInformationValidator getContextInformationValidator() {
        return new ContextInformationValidator(this);
    }

    @Override
    public String getErrorMessage() {
        return null;
    }

    @Override
    public void selectionChanged(ICompletionProposal proposal, boolean smartToggle) {
    }

    private int getOffset(int offset) {
        if (this.currentCompletionInfo != null) {
            boolean memberCompletion = this.currentCompletionInfo.isMemberCompletion();

            try {
                for (int i = offset - 1; i >= 0; i--) {
                    char character = this.editor.getDocument().getChar(i);

                    if ((memberCompletion && character == '.') ||
                            (!memberCompletion && NON_IDENTIFIER.matches(character))) {
                        return i + 1;
                    }
                }
            } catch (BadLocationException e) {
                throw new RuntimeException(e);
            }
        }

        return 0;
    }
}

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

import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.contentassist.CompletionProposal;
import org.eclipse.jface.text.contentassist.ICompletionProposal;
import org.eclipse.jface.text.contentassist.IContentAssistProcessor;
import org.eclipse.jface.text.contentassist.IContextInformation;
import org.eclipse.jface.text.contentassist.IContextInformationValidator;
import org.eclipse.swt.graphics.Image;
import org.eclipse.ui.IPathEditorInput;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.language.CompletionEntryDetails;
import com.palantir.typescript.bridge.language.CompletionInfo;
import com.palantir.typescript.bridge.language.ScriptElementKind;

/**
 * This class deals with making auto completions.
 *
 * @author tyleradams
 */
public final class ContentAssistProcessor implements IContentAssistProcessor {

    private final TypeScriptEditor editor;

    public ContentAssistProcessor(TypeScriptEditor editor) {
        checkNotNull(editor);

        this.editor = editor;
    }

    @Override
    public ICompletionProposal[] computeCompletionProposals(ITextViewer viewer, int offset) {
        checkNotNull(viewer);
        checkArgument(offset >= 0);

        IPathEditorInput editorInput = (IPathEditorInput) this.editor.getEditorInput();
        String fileName = editorInput.getPath().toOSString();
        CompletionInfo completionInfo = this.editor.getLanguageService().getCompletionsAtPosition(fileName, offset);

        // create the completion proposals from the completion entries
        List<CompletionProposal> proposals = Lists.newArrayList();
        if (completionInfo != null) {
            ImmutableList<CompletionEntryDetails> entries = completionInfo.getEntries();
            String text = completionInfo.getText();

            for (CompletionEntryDetails entry : entries) {
                String replacementString = entry.getName();
                int replacementOffset = offset - text.length();
                int replacementLength = text.length();
                int cursorPosition = replacementString.length();
                Image image = entry.getImage();
                String displayString = getDisplayString(entry);
                IContextInformation contextInformation = null;
                String additionalProposalInfo = entry.getDocComment();
                CompletionProposal proposal = new CompletionProposal(replacementString, replacementOffset, replacementLength,
                    cursorPosition,
                    image, displayString, contextInformation, additionalProposalInfo);

                proposals.add(proposal);
            }
        }

        return proposals.toArray(new ICompletionProposal[proposals.size()]);
    }

    @Override
    public IContextInformation[] computeContextInformation(ITextViewer viewer, int offset) {
        return new IContextInformation[] {};
    }

    @Override
    public char[] getCompletionProposalAutoActivationCharacters() {
        return new char[] { '.' };
    }

    @Override
    public char[] getContextInformationAutoActivationCharacters() {
        return new char[] {};
    }

    @Override
    public IContextInformationValidator getContextInformationValidator() {
        return null;
    }

    @Override
    public String getErrorMessage() {
        return null;
    }

    private static String getDisplayString(CompletionEntryDetails completion) {
        String displayString = completion.getName();
        String type = completion.getType();

        if (type != null) {
            ScriptElementKind kind = completion.getKind();

            if (kind == ScriptElementKind.LOCAL_FUNCTION_ELEMENT
                    || kind == ScriptElementKind.MEMBER_FUNCTION_ELEMENT
                    || kind == ScriptElementKind.FUNCTION_ELEMENT) {
                displayString += type;
            } else if (kind == ScriptElementKind.LOCAL_VARIABLE_ELEMENT
                    || kind == ScriptElementKind.MEMBER_VARIABLE_ELEMENT
                    || kind == ScriptElementKind.VARIABLE_ELEMENT) {
                displayString += ": " + type;
            }
        }

        return displayString;
    }
}

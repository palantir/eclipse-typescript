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

import org.eclipse.core.runtime.IPath;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.contentassist.ICompletionProposal;
import org.eclipse.jface.text.contentassist.IContentAssistProcessor;
import org.eclipse.jface.text.contentassist.IContextInformation;
import org.eclipse.jface.text.contentassist.IContextInformationValidator;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.part.FileEditorInput;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.palantir.typescript.Activator;
import com.palantir.typescript.bridge.language.AutoCompleteResult;
import com.palantir.typescript.bridge.language.AutoCompleteService;
import com.palantir.typescript.bridge.language.CompletionEntryDetails;
import com.palantir.typescript.bridge.language.CompletionEntryDetailsProposal;
import com.palantir.typescript.bridge.language.DetailedAutoCompletionInfo;

/**
 * This class deals with making auto completions.
 *
 * @author tyleradams
 */
public final class TypeScriptCompletionProcessor implements IContentAssistProcessor {
    private final LocalValidator localContextInformationValidator;

    public TypeScriptCompletionProcessor() {
        this.localContextInformationValidator = new LocalValidator();
    }

    @Override
    public ICompletionProposal[] computeCompletionProposals(ITextViewer viewer,
            int offset) {
        Preconditions.checkNotNull(viewer);
        Preconditions.checkArgument(offset >= 0);

        IPath filePath = getFilePath();
        String file = filePath.toOSString();
        String fileContents = viewer.getDocument().get();
        AutoCompleteService autoCompleteService = Activator.getBridge().getAutoCompleteService();

        AutoCompleteResult autoCompleteResult = autoCompleteService.autoComplete(file, offset, fileContents);
        if (autoCompleteResult == null) {
            return null;
        }

        DetailedAutoCompletionInfo autoCompletionInfo = autoCompleteResult.getAutoCompletionInfo();
        if (autoCompletionInfo == null) {
            return null;
        }
        CompletionEntryDetails[] rawCompletionEntryDetails = autoCompletionInfo.getEntries();
        if (rawCompletionEntryDetails == null) {
            return null;
        }
        List<CompletionEntryDetailsProposal> smartProposals = Lists.newArrayList();
        for (CompletionEntryDetails entry : rawCompletionEntryDetails) {
            smartProposals.add(new CompletionEntryDetailsProposal(entry));
        }
        List<ICompletionProposal> result = Lists.newArrayList();
        for (CompletionEntryDetailsProposal proposal : smartProposals) {
            result.add(proposal.getCompletionProposal(offset, autoCompletionInfo.getPruningPrefix()));
        }
        ICompletionProposal[] retu = new ICompletionProposal[result.size()];
        result.toArray(retu);
        return retu;
    }

    @Override
    public IContextInformation[] computeContextInformation(ITextViewer viewer,
            int offset) {
        return new IContextInformation[] {};
    }

    @Override
    public char[] getCompletionProposalAutoActivationCharacters() {
        char[] retu = { '.' };
        return retu;
    }

    @Override
    public char[] getContextInformationAutoActivationCharacters() {
        char[] retu = {};
        return retu;
    }

    @Override
    public String getErrorMessage() {
        return null;
    }

    @Override
    public IContextInformationValidator getContextInformationValidator() {
        return this.localContextInformationValidator;
    }

    private IPath getFilePath() {
        IWorkbench workbench = PlatformUI.getWorkbench();
        if (workbench == null) {
            return null;
        }

        IWorkbenchWindow window = workbench.getActiveWorkbenchWindow();
        if (window == null) {
            return null;
        }

        IWorkbenchPage activePage = window.getActivePage();
        if (activePage == null) {
            return null;
        }

        IEditorPart editor = activePage.getActiveEditor();
        if (editor == null) {
            return null;
        }

        IEditorInput input = editor.getEditorInput();
        if (input instanceof FileEditorInput) {
            IPath path = ((FileEditorInput) input).getPath();
            return path;
        }
        return null;
    }

    private final class LocalValidator implements IContextInformationValidator {
        @Override
        public boolean isContextInformationValid(int offset) {
            return false;
        }

        @Override
        public void install(IContextInformation info, ITextViewer viewer,
                int offset) {
        }
    }

}

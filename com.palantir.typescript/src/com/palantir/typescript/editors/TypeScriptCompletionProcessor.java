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

import java.util.List;

import org.eclipse.core.runtime.IPath;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.contentassist.CompletionProposal;
import org.eclipse.jface.text.contentassist.ContentAssistant;
import org.eclipse.jface.text.contentassist.ICompletionProposal;
import org.eclipse.jface.text.contentassist.IContentAssistProcessor;
import org.eclipse.jface.text.contentassist.IContentAssistant;
import org.eclipse.jface.text.contentassist.IContextInformation;
import org.eclipse.jface.text.contentassist.IContextInformationValidator;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.graphics.RGB;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.part.FileEditorInput;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.palantir.typescript.tsbridge.TypeScriptBridge;
import com.palantir.typescript.tsbridge.autocomplete.AutoCompleteResult;
import com.palantir.typescript.tsbridge.autocomplete.AutoCompleteService;
import com.palantir.typescript.tsbridge.autocomplete.CompletionEntryDetails;
import com.palantir.typescript.tsbridge.autocomplete.IDetailedAutoCompletionInfo;

/**
 * This class deals with making auto completions.
 *
 * @author tyleradams
 */
public final class TypeScriptCompletionProcessor implements IContentAssistProcessor {
    private final ColorManager colorManager;
    private final LocalValidator localContextInformationValidator;

    public TypeScriptCompletionProcessor() {
        this.colorManager = new ColorManager();
        this.localContextInformationValidator = new LocalValidator();
    }

    @Override
    public ICompletionProposal[] computeCompletionProposals(ITextViewer viewer,
            int offset) {
        Preconditions.checkNotNull(viewer);
        Preconditions.checkArgument(offset >= 0);

        IPath filePath = getFilePath();
        String fileName = getFileName(filePath);
        String fileContents = viewer.getDocument().get();
        String filePathRoot = getFilePathRoot(filePath);
        boolean isMemberCompletion = false;
        AutoCompleteService autoCompleteService = TypeScriptBridge.getBridge().getAutoCompleteService();
        AutoCompleteResult autoCompleteResult = autoCompleteService.safeAutoComplete(fileName, offset, isMemberCompletion, filePathRoot,
            fileContents);
        IDetailedAutoCompletionInfo autoCompletionInfo = autoCompleteResult.getAutoCompletionInfo();
        if (autoCompletionInfo == null) {
            return null;
        }
        CompletionEntryDetails[] smartProposals = autoCompletionInfo.getEntries();
        Image img = null;
        String replacement = null;
        String display = null;
        String additionalProposalInfo = null;
        IContextInformation contextInfo = null;
        TypeScriptIconFetcher iconFetcher = new TypeScriptIconFetcher();
        int cursorProposal;

        if (smartProposals == null) {
            return null;
        }

        List<ICompletionProposal> result = Lists.newArrayList();
        for (int i = 0; i < smartProposals.length; i++) {
            replacement = getReplacementString(smartProposals[i], autoCompletionInfo.getPruningPrefix());
            display = getDisplayString(smartProposals[i]);
            cursorProposal = getCursorProposal(smartProposals[i], replacement, autoCompletionInfo.getPruningPrefix());
            additionalProposalInfo = getAdditionalProposalInfo(smartProposals[i]);
            img = iconFetcher.getDefaultIcon();
            result.add(new CompletionProposal(replacement, offset, 0, cursorProposal, img, display, contextInfo,
                additionalProposalInfo));
        }
        ICompletionProposal[] retu = new ICompletionProposal[result.size()];
        result.toArray(retu);
        return retu;
    }

    private int getCursorProposal(CompletionEntryDetails completionEntryDetail, String replacement, String prefix) {
        Preconditions.checkNotNull(completionEntryDetail);
        Preconditions.checkNotNull(replacement);
        Preconditions.checkNotNull(prefix);

        if (completionEntryDetail.getKind().equals(("method")) || completionEntryDetail.getKind().equals("function")) {
            if (completionEntryDetail.hasArgs()) {
                return completionEntryDetail.getName().length() - prefix.length() + 1;
            } else {
                return completionEntryDetail.getName().length() - prefix.length() + 2;
            }
        }
        return replacement.length();
    }

    private String getAdditionalProposalInfo(CompletionEntryDetails completionEntryDetail) {
        Preconditions.checkNotNull(completionEntryDetail);

        return completionEntryDetail.getDocComment();
    }

    private String getReplacementString(CompletionEntryDetails completionEntryDetail, String prefix) {
        Preconditions.checkNotNull(completionEntryDetail);
        Preconditions.checkNotNull(prefix);

        int prefixLength = prefix.length();
        if (completionEntryDetail.getKind().equals(("method")) || completionEntryDetail.getKind().equals("function")) {
            String replacement = completionEntryDetail.getName().substring(prefixLength);
            String argString = "()";
            replacement += argString;
            return replacement;
        } else {
            return completionEntryDetail.getName().substring(prefixLength);
        }
    }

    private String getDisplayString(CompletionEntryDetails completionEntryDetail) {
        Preconditions.checkNotNull(completionEntryDetail);

        String display = "";
        if (completionEntryDetail.getKind().equals("method") || completionEntryDetail.getKind().equals("function")) {
            display += completionEntryDetail.getName();
            display += completionEntryDetail.getType();
        } else {
            display += completionEntryDetail.getName();
            display += " : " + completionEntryDetail.getType();
        }
        return display;
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

    public IContentAssistant getContentAssistant(ISourceViewer sourceViewer) {
        Preconditions.checkNotNull(sourceViewer);

        ContentAssistant assistant = new ContentAssistant();
        assistant.enableAutoActivation(true);
        assistant.setAutoActivationDelay(500);
        assistant.setProposalPopupOrientation(IContentAssistant.PROPOSAL_OVERLAY);
        assistant.setContextInformationPopupOrientation(IContentAssistant.CONTEXT_INFO_ABOVE);
        assistant.setContextInformationPopupBackground(this.colorManager.getColor(new RGB(150, 150, 0)));

        return assistant;
    }

    private IPath getFilePath() {
        IWorkbench workbench = PlatformUI.getWorkbench();
        if (workbench == null) return null;

        IWorkbenchWindow window = workbench.getActiveWorkbenchWindow();
        if (window == null) return null;

        IWorkbenchPage activePage = window.getActivePage();
        if (activePage == null) return null;

        IEditorPart editor = activePage.getActiveEditor();
        if (editor == null) return null;

        IEditorInput input = editor.getEditorInput();
        if (input instanceof FileEditorInput) {
            IPath path = ((FileEditorInput) input).getPath();
            return path;
        }
        return null;
    }

    private String getFileName(IPath path) {
        Preconditions.checkNotNull(path);

        return path.lastSegment();
    }

    private String getFilePathRoot(IPath path) {
        Preconditions.checkNotNull(path);

        String rootPath = "";
        for (int i = 0; i < path.segmentCount() - 1; i++) {
            rootPath += "/" + path.segment(i);
        }
        rootPath += "/";
        return rootPath;
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

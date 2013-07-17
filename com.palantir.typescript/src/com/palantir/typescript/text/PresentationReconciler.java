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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.TextPresentation;
import org.eclipse.jface.text.presentation.IPresentationDamager;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.presentation.IPresentationRepairer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.StyleRange;
import org.eclipse.swt.graphics.Color;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.palantir.typescript.Activator;
import com.palantir.typescript.bridge.classifier.ClassificationInfo;
import com.palantir.typescript.bridge.classifier.ClassificationResult;
import com.palantir.typescript.bridge.classifier.EndOfLineState;
import com.palantir.typescript.bridge.classifier.TokenClass;

/**
 * The presentation reconciler performs syntax highlighting.
 *
 * @author dcicerone
 */
public final class PresentationReconciler implements IPresentationReconciler {

    private final ImmutableMap<TokenClass, TextAttribute> classificationTextAttributes;
    private final Map<Integer, EndOfLineState> finalLexStates;

    private ITextListener listener;
    private ITextViewer viewer;

    public PresentationReconciler(ColorManager colorManager) {
        checkNotNull(colorManager);

        this.classificationTextAttributes = createClassificationTextAttributes(colorManager);
        this.listener = new MyTextListener();
        this.finalLexStates = Maps.newTreeMap();
    }

    @Override
    public void install(ITextViewer textViewer) {
        checkNotNull(textViewer);

        this.viewer = textViewer;
        this.viewer.addTextListener(this.listener);

        // do the initial syntax highlighting
        IDocument document = this.viewer.getDocument();
        if (document != null) {
            Region region = new Region(0, document.getLength());
            TextPresentation presentation = this.createPresentation(region, null);

            this.viewer.changeTextPresentation(presentation, false);
        }
    }

    @Override
    public void uninstall() {
        this.viewer.removeTextListener(this.listener);
        this.viewer = null;
    }

    @Override
    public IPresentationDamager getDamager(String contentType) {
        throw new UnsupportedOperationException();
    }

    @Override
    public IPresentationRepairer getRepairer(String contentType) {
        throw new UnsupportedOperationException();
    }

    /**
     * Processes the text event and updates the syntax highlighting as necessary.
     */
    private void processEvent(TextEvent event) {
        IRegion damagedRegion = this.getDamagedRegion(event);
        EndOfLineState lastDamagedLexState = this.updateFinalLexStates(event, damagedRegion);
        TextPresentation presentation = this.createPresentation(damagedRegion, lastDamagedLexState);

        this.viewer.changeTextPresentation(presentation, false);
    }

    /**
     * Gets the damaged region by selecting the whole lines touched by the text edit.
     */
    private IRegion getDamagedRegion(TextEvent event) {
        IDocument document = this.viewer.getDocument();
        int offset = event.getOffset();
        String text = event.getText();
        int length = text != null ? text.length() : 0;

        try {
            IRegion startLineInfo = document.getLineInformationOfOffset(offset);
            IRegion endLineInfo = document.getLineInformationOfOffset(offset + length);

            int startOffset = startLineInfo.getOffset();
            int endOffset = endLineInfo.getOffset() + endLineInfo.getLength();

            // a region of length 0 doesn't work, so we need to damage the next line as well
            if (startOffset == endOffset) {
                int line = document.getLineOfOffset(endOffset);
                String lineDelimiter = document.getLineDelimiter(line);

                if (startOffset + lineDelimiter.length() < document.getLength()) {
                    IRegion nextLineInfo = document.getLineInformation(line + 1);

                    endOffset = nextLineInfo.getOffset() + nextLineInfo.getLength();
                } else {
                    endOffset = document.getLength();
                }
            }

            return new Region(startOffset, endOffset - startOffset);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private EndOfLineState updateFinalLexStates(TextEvent event, IRegion damagedRegion) {
        int offset = event.getOffset();
        String replacedText = event.getReplacedText();
        int oldLength = replacedText != null ? replacedText.length() : 0;
        String text = event.getText();
        int newLength = text != null ? text.length() : 0;
        int damagedOffset = damagedRegion.getOffset();
        int damagedLength = oldLength + offset - damagedOffset;
        int delta = newLength - oldLength;
        EndOfLineState lastDamagedLexState = null;

        // determine which final lex states are impacted and remove them or update them as appropriate
        Map<Integer, EndOfLineState> newFinalLexStates = Maps.newHashMap();
        Iterator<Entry<Integer, EndOfLineState>> it = this.finalLexStates.entrySet().iterator();
        while (it.hasNext()) {
            Entry<Integer, EndOfLineState> entry = it.next();
            Integer entryOffset = entry.getKey();

            // entry is after the beginning of the damaged region
            if (entryOffset >= damagedOffset) {
                EndOfLineState lexState = entry.getValue();

                it.remove();

                if (entryOffset <= damagedOffset + damagedLength) {
                    // remove the entry but keep track of its lex state
                    lastDamagedLexState = lexState;
                } else {
                    // update the entry since it occurs after the damaged area
                    newFinalLexStates.put(entryOffset + delta, lexState);
                }
            }
        }
        this.finalLexStates.putAll(newFinalLexStates);

        return lastDamagedLexState;
    }

    private TextPresentation createPresentation(IRegion damagedRegion, EndOfLineState lastDamagedLexState) {
        TextPresentation presentation = new TextPresentation();
        IDocument document = this.viewer.getDocument();
        int offset = damagedRegion.getOffset();
        int length = damagedRegion.getLength();

        try {
            int startLine = document.getLineOfOffset(offset);
            int endLine = document.getLineOfOffset(offset + length);

            this.classifyLines(presentation, startLine, endLine, lastDamagedLexState);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }

        return presentation;
    }

    private void classifyLines(TextPresentation presentation, int startLine, int endLine, EndOfLineState lastDamagedLexState)
            throws BadLocationException {
        IDocument document = this.viewer.getDocument();

        // get the lines
        List<String> lines = Lists.newArrayList();
        for (int i = startLine; i <= endLine; i++) {
            IRegion lineInfo = document.getLineInformation(i);
            String line = document.get(lineInfo.getOffset(), lineInfo.getLength());

            lines.add(line);
        }

        // get the previous line's final lex state (if available)
        EndOfLineState lexState = EndOfLineState.START;
        if (startLine > 0 && !this.finalLexStates.isEmpty()) {
            int previousLineOffset = document.getLineOffset(startLine - 1);

            lexState = this.finalLexStates.get(previousLineOffset);
        }

        boolean lastLexStateDiffers = false;
        List<ClassificationResult> results = Activator.getBridge().getClassifier().getClassificationsForLines(lines, lexState);
        for (int i = 0; i < results.size(); i++) {
            int line = startLine + i;
            int lineOffset = document.getLineOffset(line);
            ClassificationResult result = results.get(i);
            EndOfLineState finalLexState = result.getFinalLexState();

            // add the style ranges for the classified text
            int currentOffset = lineOffset;
            for (ClassificationInfo entry : result.getEntries()) {
                TokenClass classification = entry.getClassification();
                int length = entry.getLength();

                this.addStyleRange(presentation, currentOffset, length, classification);
                currentOffset += length;
            }

            // store the new final lex state
            this.finalLexStates.put(lineOffset, finalLexState);

            lastLexStateDiffers = (lastDamagedLexState != null && finalLexState != lastDamagedLexState);
        }

        // re-classify the rest of the lines in the document if the last damaged lex state and last repaired lex state are different
        if (lastLexStateDiffers) {
            int lastLine = document.getLineOfOffset(document.getLength());

            if (endLine < lastLine) {
                this.classifyLines(presentation, endLine + 1, lastLine, null);
            }
        }
    }

    private void addStyleRange(TextPresentation presentation, int offset, int length, TokenClass classification) {
        TextAttribute textAttribute = this.classificationTextAttributes.get(classification);
        Color foreground = textAttribute.getForeground();
        Color background = textAttribute.getBackground();
        int fontStyle = textAttribute.getStyle();
        StyleRange styleRange = new StyleRange(offset, length, foreground, background, fontStyle);

        presentation.addStyleRange(styleRange);
    }

    private static ImmutableMap<TokenClass, TextAttribute> createClassificationTextAttributes(ColorManager manager) {
        ImmutableMap.Builder<TokenClass, TextAttribute> classAttributes = ImmutableMap.builder();

        classAttributes.put(TokenClass.PUNCTUATION, new TextAttribute(manager.getColor(ColorConstants.PUNCTUATION)));
        classAttributes.put(TokenClass.KEYWORD, new TextAttribute(manager.getColor(ColorConstants.KEYWORD), null, SWT.BOLD));
        classAttributes.put(TokenClass.OPERATOR, new TextAttribute(manager.getColor(ColorConstants.OPERATOR)));
        classAttributes.put(TokenClass.COMMENT, new TextAttribute(manager.getColor(ColorConstants.COMMENT)));
        classAttributes.put(TokenClass.WHITESPACE, new TextAttribute(manager.getColor(ColorConstants.WHITESPACE)));
        classAttributes.put(TokenClass.IDENTIFIER, new TextAttribute(manager.getColor(ColorConstants.IDENTIFIER)));
        classAttributes.put(TokenClass.NUMBER_LITERAL, new TextAttribute(manager.getColor(ColorConstants.NUMBER_LITERAL)));
        classAttributes.put(TokenClass.STRING_LITERAL, new TextAttribute(manager.getColor(ColorConstants.STRING_LITERAL)));
        classAttributes.put(TokenClass.REG_EXP_LITERAL, new TextAttribute(manager.getColor(ColorConstants.REG_EXP_LITERAL)));

        return classAttributes.build();
    }

    private final class MyTextListener implements ITextListener {
        @Override
        public void textChanged(TextEvent event) {
            PresentationReconciler.this.processEvent(event);
        }
    }
}

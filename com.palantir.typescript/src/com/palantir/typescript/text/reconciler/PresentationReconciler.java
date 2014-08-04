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

package com.palantir.typescript.text.reconciler;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.eclipse.jface.resource.StringConverter;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.ITextViewer;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.TextPresentation;
import org.eclipse.jface.text.presentation.IPresentationDamager;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.presentation.IPresentationRepairer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.StyleRange;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.RGB;
import org.eclipse.swt.widgets.Display;

import com.google.common.base.CaseFormat;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.palantir.typescript.TypeScriptPlugin;
import com.palantir.typescript.services.classifier.ClassificationInfo;
import com.palantir.typescript.services.classifier.ClassificationResult;
import com.palantir.typescript.services.classifier.Classifier;
import com.palantir.typescript.services.classifier.EndOfLineState;
import com.palantir.typescript.services.classifier.TokenClass;

/**
 * The presentation reconciler performs syntax highlighting.
 *
 * @author dcicerone
 */
public final class PresentationReconciler implements IPresentationReconciler {

    private static final LoadingCache<RGB, Color> COLORS = CacheBuilder.newBuilder().build(new CacheLoader<RGB, Color>() {
        @Override
        public Color load(RGB rgb) throws Exception {
            return new Color(Display.getCurrent(), rgb);
        }
    });

    private final Map<Integer, EndOfLineState> finalLexStates;

    private Classifier classifier;
    private ITextListener listener;
    private ITextViewer viewer;

    public PresentationReconciler() {
        this.classifier = TypeScriptPlugin.getDefault().getClassifier();
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
        int documentLength = document.getLength();
        int offset = event.getOffset();
        int length = event.getLength();
        String text = event.getText();

        // redraw state change - re-classify the entire document
        if (event.getDocumentEvent() == null && offset == 0 && length == 0) {
            this.finalLexStates.clear();

            return new Region(0, documentLength);
        }

        try {
            IRegion startLineInfo = document.getLineInformationOfOffset(offset);
            int startOffset = startLineInfo.getOffset();
            int endOffset = offset + (text != null ? text.length() : length);
            int firstLineEndOffset = startOffset + startLineInfo.getLength();

            if (startOffset <= endOffset && endOffset <= firstLineEndOffset) {
                // single line damaged: extend the damaged region to the end of the first line
                endOffset = firstLineEndOffset;
            } else { // multiple lines damaged
                IRegion endLineInfo = document.getLineInformationOfOffset(endOffset);
                int lastLineEndOffset = endLineInfo.getOffset() + endLineInfo.getLength();

                // extend the damaged region to the end of last line
                endOffset = lastLineEndOffset;
            }

            return new Region(startOffset, endOffset - startOffset);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private EndOfLineState updateFinalLexStates(TextEvent event, IRegion damagedRegion) {
        EndOfLineState lastDamagedLexState = null;

        if (!this.finalLexStates.isEmpty()) {
            int offset = event.getOffset();
            int oldLength = event.getLength();
            String text = event.getText();
            int newLength = text != null ? text.length() : 0;
            int damagedOffset = damagedRegion.getOffset();
            int damagedLength = oldLength + offset - damagedOffset;
            int delta = newLength - oldLength;

            // determine which final lex states are impacted and remove them or update them as appropriate
            Map<Integer, EndOfLineState> newFinalLexStates = Maps.newHashMap();
            Iterator<Entry<Integer, EndOfLineState>> it = this.finalLexStates.entrySet().iterator();
            while (it.hasNext()) {
                Entry<Integer, EndOfLineState> entry = it.next();
                Integer entryOffset = entry.getKey();

                // entry is after the beginning of the damaged region
                if (entryOffset >= damagedOffset) {
                    EndOfLineState lexState = entry.getValue();

                    if (entryOffset <= damagedOffset + damagedLength) {
                        // remove the entry but keep track of its lex state
                        it.remove();
                        lastDamagedLexState = lexState;
                    } else if (delta != 0) {
                        // update the entry since it occurs after the damaged area
                        it.remove();
                        newFinalLexStates.put(entryOffset + delta, lexState);
                    }
                }
            }
            this.finalLexStates.putAll(newFinalLexStates);
        }

        return lastDamagedLexState;
    }

    private TextPresentation createPresentation(IRegion damagedRegion, EndOfLineState lastDamagedLexState) {
        TextPresentation presentation = new TextPresentation(damagedRegion, 1000);
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
        List<ClassificationResult> results = this.classifier.getClassificationsForLines(lines, lexState);
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
        Color foreground = getForegroundColor(classification);
        int fontStyle = (classification == TokenClass.KEYWORD ? SWT.BOLD : SWT.NONE);
        StyleRange styleRange = new StyleRange(offset, length, foreground, null, fontStyle);

        presentation.addStyleRange(styleRange);
    }

    private static Color getForegroundColor(TokenClass classification) {
        String camelClassificationName = CaseFormat.UPPER_UNDERSCORE.to(CaseFormat.LOWER_CAMEL, classification.name());
        String preferenceName = "syntaxColoring." + camelClassificationName + ".color";
        String colorString = TypeScriptPlugin.getDefault().getPreferenceStore().getString(preferenceName);

        if (!colorString.isEmpty()) {
            RGB rgb = StringConverter.asRGB(colorString);

            return COLORS.getUnchecked(rgb);
        }

        return null;
    }

    private final class MyTextListener implements ITextListener {
        @Override
        public void textChanged(TextEvent event) {
            PresentationReconciler.this.processEvent(event);
        }
    }
}

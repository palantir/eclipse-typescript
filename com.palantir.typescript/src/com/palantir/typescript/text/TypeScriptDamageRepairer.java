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
import org.eclipse.jface.text.DocumentEvent;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.jface.text.ITypedRegion;
import org.eclipse.jface.text.Region;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.TextPresentation;
import org.eclipse.jface.text.presentation.IPresentationDamager;
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
 * Updates syntax highlighting based on changes to the document.
 *
 * @author dcicerone
 */
public final class TypeScriptDamageRepairer implements IPresentationDamager, IPresentationRepairer {

    private final ImmutableMap<TokenClass, TextAttribute> classificationTextAttributes;
    private final Map<Integer, EndOfLineState> finalLexStates;

    private IDocument document;

    public TypeScriptDamageRepairer(ColorManager colorManager) {
        checkNotNull(colorManager);

        this.classificationTextAttributes = createClassificationTextAttributes(colorManager);
        this.finalLexStates = Maps.newHashMap();
    }

    @Override
    public void setDocument(IDocument document) {
        checkNotNull(document);

        this.document = document;
    }

    @Override
    public IRegion getDamageRegion(ITypedRegion partition, DocumentEvent event, boolean documentPartitioningChanged) {
        int offset = event.getOffset();
        int documentLength = this.document.getLength();

        // remove all final lex states after the offset
        Iterator<Entry<Integer, EndOfLineState>> it = this.finalLexStates.entrySet().iterator();
        while (it.hasNext()) {
            Entry<Integer, EndOfLineState> entry = it.next();
            Integer entryOffset = entry.getKey();

            if (entryOffset >= offset) {
                it.remove();
            }
        }

        return new Region(offset, documentLength - offset);
    }

    @Override
    public void createPresentation(TextPresentation presentation, ITypedRegion damage) {
        int offset = damage.getOffset();
        int length = damage.getLength();

        try {
            int startLine = this.document.getLineOfOffset(offset);
            int endLine = this.document.getLineOfOffset(offset + length);

            this.classifyLines(presentation, startLine, endLine);
        } catch (BadLocationException e) {
            throw new RuntimeException(e);
        }
    }

    private void classifyLines(TextPresentation presentation, int startLine, int endLine) throws BadLocationException {
        // get the lines
        List<String> lines = Lists.newArrayList();
        for (int i = startLine; i <= endLine; i++) {
            IRegion lineInfo = this.document.getLineInformation(i);
            String line = this.document.get(lineInfo.getOffset(), lineInfo.getLength());

            lines.add(line);
        }

        // get the previous line's final lex state (if available)
        EndOfLineState lexState = EndOfLineState.START;
        if (startLine > 0 && !this.finalLexStates.isEmpty()) {
            int previousLineOffset = this.document.getLineOffset(startLine - 1);

            lexState = this.finalLexStates.get(previousLineOffset);
        }

        List<ClassificationResult> results = Activator.getBridge().getClassifier().getClassificationsForLines(lines, lexState);
        for (int i = 0; i < results.size(); i++) {
            int line = startLine + i;
            int lineOffset = this.document.getLineOffset(line);
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

        classAttributes.put(TokenClass.PUNCTUATION, new TextAttribute(manager.getColor(TypeScriptColorConstants.PUNCTUATION)));
        classAttributes.put(TokenClass.KEYWORD, new TextAttribute(manager.getColor(TypeScriptColorConstants.KEYWORD), null, SWT.BOLD));
        classAttributes.put(TokenClass.OPERATOR, new TextAttribute(manager.getColor(TypeScriptColorConstants.OPERATOR)));
        classAttributes.put(TokenClass.COMMENT, new TextAttribute(manager.getColor(TypeScriptColorConstants.COMMENT)));
        classAttributes.put(TokenClass.WHITESPACE, new TextAttribute(manager.getColor(TypeScriptColorConstants.WHITESPACE)));
        classAttributes.put(TokenClass.IDENTIFIER, new TextAttribute(manager.getColor(TypeScriptColorConstants.IDENTIFIER)));
        classAttributes.put(TokenClass.NUMBER_LITERAL, new TextAttribute(manager.getColor(TypeScriptColorConstants.NUMBER_LITERAL)));
        classAttributes.put(TokenClass.STRING_LITERAL, new TextAttribute(manager.getColor(TypeScriptColorConstants.STRING_LITERAL)));
        classAttributes.put(TokenClass.REG_EXP_LITERAL, new TextAttribute(manager.getColor(TypeScriptColorConstants.REG_EXP_LITERAL)));

        return classAttributes.build();
    }
}

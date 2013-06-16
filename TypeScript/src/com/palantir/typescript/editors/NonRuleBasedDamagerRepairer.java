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
import org.eclipse.swt.custom.StyleRange;
import org.eclipse.swt.graphics.Color;

import com.google.common.base.Preconditions;

/**
 * This is used to detect the damage and repair multiline comments' text attributes.
 *
 * @author tyleradams
 */
public final class NonRuleBasedDamagerRepairer implements IPresentationDamager, IPresentationRepairer {

    /** The document this object works on. */
    private IDocument document;
    /** The default text attribute if non is returned as data by the current token. */
    private final TextAttribute defaultTextAttribute;

    public NonRuleBasedDamagerRepairer(TextAttribute defaultTextAttribute) {
        Preconditions.checkNotNull(defaultTextAttribute);

        this.defaultTextAttribute = defaultTextAttribute;
    }

    @Override
    public void setDocument(IDocument document) {
        this.document = document;
    }

    /**
     * Returns the end offset of the line that contains the specified offset or if the offset is
     * inside a line delimiter, the end offset of the next line.
     *
     * @param offset
     *            the offset whose line end offset must be computed
     * @return the line end offset for the given offset
     * @exception BadLocationException
     *                if offset is invalid in the current document
     */
    protected int endOfLineOf(int offset) throws BadLocationException {

        IRegion info = this.document.getLineInformationOfOffset(offset);
        if (offset <= info.getOffset() + info.getLength()) {
            return info.getOffset() + info.getLength();
        }

        int line = this.document.getLineOfOffset(offset);
        try {
            info = this.document.getLineInformation(line + 1);
            return info.getOffset() + info.getLength();
        } catch (BadLocationException e) {
            return this.document.getLength();
        }
    }

    @Override
    public IRegion getDamageRegion(ITypedRegion partition, DocumentEvent event, boolean documentPartitioningChanged) {
        if (!documentPartitioningChanged) {
            try {

                IRegion info = this.document.getLineInformationOfOffset(event.getOffset());
                int start = Math.max(partition.getOffset(), info.getOffset());

                int end = event.getOffset() + (event.getText() == null ? event.getLength() : event.getText().length());

                if (info.getOffset() <= end && end <= info.getOffset() + info.getLength()) {
                    // optimize the case of the same line
                    end = info.getOffset() + info.getLength();
                } else {
                    end = endOfLineOf(end);
                }

                end = Math.min(partition.getOffset() + partition.getLength(), end);
                return new Region(start, end - start);
            } catch (BadLocationException e) {
            }
        }

        return partition;
    }

    @Override
    public void createPresentation(TextPresentation presentation, ITypedRegion region) {
        addRange(presentation, region.getOffset(), region.getLength(), this.defaultTextAttribute);
    }

    /**
     * Adds style information to the given text presentation.
     *
     * @param presentation
     *            the text presentation to be extended
     * @param offset
     *            the offset of the range to be styled
     * @param length
     *            the length of the range to be styled
     * @param attribute
     *            the attribute describing the style of the range to be styled
     */
    protected void addRange(TextPresentation presentation, int offset, int length, TextAttribute attribute) {
        Preconditions.checkArgument(length >= 0);

        if (attribute != null) {
            Color foreground = attribute.getForeground();
            Color background = attribute.getForeground();
            int style = attribute.getStyle();
            presentation.addStyleRange(new StyleRange(offset, length, foreground, background, style));
        }
    }
}

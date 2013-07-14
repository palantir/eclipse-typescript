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

import org.eclipse.core.runtime.CoreException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentPartitioner;
import org.eclipse.jface.text.rules.FastPartitioner;
import org.eclipse.ui.editors.text.FileDocumentProvider;

/**
 * The Document Provider manages the actual documents and how they're processed (i.e. partitioned)
 * in the editor.
 *
 * @author tyleradams
 */
public final class TypeScriptDocumentProvider extends FileDocumentProvider {

    @Override
    protected IDocument createDocument(Object element) throws CoreException {
        IDocument document = super.createDocument(element);

        if (document != null) {
            String[] partitionTypes = new String[TypeScriptPartitionScanner.TYPE_SCRIPT_PARTITION_TYPES.size()];
            TypeScriptPartitionScanner.TYPE_SCRIPT_PARTITION_TYPES.toArray(partitionTypes);
            TypeScriptPartitionScanner partitionScanner = new TypeScriptPartitionScanner();
            IDocumentPartitioner partitioner = new FastPartitioner(partitionScanner, partitionTypes);
            document.setDocumentPartitioner(partitioner);
            partitioner.connect(document);
        }

        return document;
    }
}

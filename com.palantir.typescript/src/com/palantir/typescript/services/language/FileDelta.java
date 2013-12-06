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

package com.palantir.typescript.services.language;

import static com.google.common.base.Preconditions.checkNotNull;

import org.eclipse.core.resources.IFile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.palantir.typescript.EclipseResources;

/**
 * A file delta.
 *
 * @author dcicerone
 */
public final class FileDelta {

    public enum Delta {
        ADDED, CHANGED, REMOVED
    }

    @JsonProperty("delta")
    private final Delta delta;

    @JsonProperty("fileName")
    private final String fileName;

    @JsonProperty("filePath")
    private final String filePath;

    public FileDelta(Delta delta, IFile file) {
        checkNotNull(delta);
        checkNotNull(file);

        this.delta = delta;
        this.fileName = EclipseResources.getFileName(file);
        this.filePath = EclipseResources.getFilePath(file);
    }

    public Delta getDelta() {
        return this.delta;
    }

    public String getFileName() {
        return this.fileName;
    }

    public String getFilePath() {
        return this.filePath;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
            .add("delta", this.delta)
            .add("fileName", this.fileName)
            .add("filePath", this.filePath)
            .toString();
    }
}

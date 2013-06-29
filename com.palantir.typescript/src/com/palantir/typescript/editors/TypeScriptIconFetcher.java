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

import java.util.Map;

import org.eclipse.swt.graphics.Device;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.widgets.Display;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.palantir.typescript.tsbridge.autocomplete.CompletionEntryDetails;
import com.palantir.typescript.tsbridge.autocomplete.ExtendedKindModifiers;

/**
 * This class manages fetching icons.
 *
 * @author tyleradams
 */
public final class TypeScriptIconFetcher {
    private final String rootDirectory;
    private final String fileExtension = ".png";
    private final String defaultIconLocation;

    private final Map<String, Image> map = Maps.newHashMap();
    private final Device device;

    public TypeScriptIconFetcher() {
        this.device = Display.getCurrent();
        this.rootDirectory = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath() + "icons/AutoComplete/";
        this.defaultIconLocation = this.rootDirectory + "0" + this.fileExtension;

    }

    public Image getIcon(CompletionEntryDetails completionEntryDetails) {
        Preconditions.checkNotNull(completionEntryDetails);

        String kind = completionEntryDetails.getKind();
        String rawKindModifiers = completionEntryDetails.getKindModifiers();
        String docComment = completionEntryDetails.getDocComment();
        ExtendedKindModifiers kindModifiers = new ExtendedKindModifiers(rawKindModifiers, docComment);
        return this.getIcon(kind, kindModifiers);
    }

    private Image getIcon(String kind, ExtendedKindModifiers kindModifiers) {
        Preconditions.checkNotNull(kind);
        Preconditions.checkNotNull(kindModifiers);

        String fileNumber = kind + kindModifiers.hashCode();
        String fileLocation = this.rootDirectory + fileNumber + this.fileExtension;
        return getIcon(fileLocation);
    }

    private Image getIcon(String fileLocation) {
        Preconditions.checkNotNull(fileLocation);
        if (this.map.containsKey(fileLocation)) {
            return this.map.get(fileLocation);
        }
        Image img = new Image(this.device, this.defaultIconLocation); //TODO: use the custom fileLocations, not the default file.
        this.map.put(fileLocation, img);
        return img;
    }

}

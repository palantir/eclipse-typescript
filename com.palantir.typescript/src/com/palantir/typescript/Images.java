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

package com.palantir.typescript;

import static com.google.common.base.Preconditions.checkNotNull;

import java.net.URL;
import java.util.List;

import org.eclipse.core.runtime.FileLocator;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.jface.resource.ImageRegistry;
import org.eclipse.swt.graphics.Image;

import com.palantir.typescript.services.language.ScriptElementKind;
import com.palantir.typescript.services.language.ScriptElementModifierKind;

/**
 * Provides access to all of the images.
 *
 * @author dcicerone
 */
public final class Images {

    private static final ImageRegistry REGISTRY = new ImageRegistry();

    public static Image getImage(ScriptElementKind kind, List<ScriptElementModifierKind> kindModifiers) {
        checkNotNull(kind);
        checkNotNull(kindModifiers);

        final String imageName;
        switch (kind) {
            case CLASS_ELEMENT:
                imageName = "class";
                break;
            case CONSTRUCTOR_IMPLEMENTATION_ELEMENT:
                imageName = "memberFunctionPublic";
                break;
            case ENUM_ELEMENT:
                imageName = "enum";
                break;
            case LOCAL_FUNCTION_ELEMENT:
            case FUNCTION_ELEMENT:
                imageName = "function";
                break;
            case INTERFACE_ELEMENT:
                imageName = "interface";
                break;
            case MEMBER_FUNCTION_ELEMENT:
                if (kindModifiers.contains(ScriptElementModifierKind.PRIVATE_MEMBER_MODIFIER)) {
                    imageName = "memberFunctionPrivate";
                } else { // public
                    imageName = "memberFunctionPublic";
                }
                break;
            case MEMBER_VARIABLE_ELEMENT:
                if (kindModifiers.contains(ScriptElementModifierKind.PRIVATE_MEMBER_MODIFIER)) {
                    imageName = "memberVariablePrivate";
                } else { // public
                    imageName = "memberVariablePublic";
                }
                break;
            case MODULE_ELEMENT:
                imageName = "module";
                break;
            case PARAMETER_ELEMENT:
                imageName = "parameter";
                break;
            case LOCAL_VARIABLE_ELEMENT:
            case VARIABLE_ELEMENT:
                imageName = "variable";
                break;
            case UNKNOWN:
            default:
                imageName = "unknown";
                break;
        }

        return getImage("$nl$/icons/elements/" + imageName + ".png");
    }

    private static Image getImage(String path) {
        if (REGISTRY.getDescriptor(path) == null) {
            IPath path2 = new Path(path);
            URL imageUrl = FileLocator.find(Activator.getDefault().getBundle(), path2, null);
            ImageDescriptor descriptor = ImageDescriptor.createFromURL(imageUrl);

            REGISTRY.put(path, descriptor);
        }

        return REGISTRY.get(path);
    }

    private Images() {
        // prevent instantiation
    }
}

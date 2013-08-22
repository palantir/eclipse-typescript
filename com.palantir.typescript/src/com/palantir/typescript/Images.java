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

        final String imageName = getImageName(kind, kindModifiers);

        return getImage("$nl$/icons/elements/" + imageName + ".png");
    }

    private static String getImageName(ScriptElementKind kind, List<ScriptElementModifierKind> kindModifiers) {
        switch (kind) {
            case CLASS_ELEMENT:
                return "class";
            case CONSTRUCTOR_IMPLEMENTATION_ELEMENT:
                return "memberFunctionPublic";
            case ENUM_ELEMENT:
                return "enum";
            case LOCAL_FUNCTION_ELEMENT:
            case FUNCTION_ELEMENT:
                return "function";
            case INTERFACE_ELEMENT:
                return "interface";
            case CALL_SIGNATURE_ELEMENT:
            case INDEX_SIGNATURE_ELEMENT:
            case MEMBER_FUNCTION_ELEMENT:
            case MEMBER_GET_ACCESSOR_ELEMENT:
            case MEMBER_SET_ACCESSOR_ELEMENT:
                if (kindModifiers.contains(ScriptElementModifierKind.PRIVATE_MEMBER_MODIFIER)) {
                    return "memberFunctionPrivate";
                } else { // public
                    return "memberFunctionPublic";
                }
            case MEMBER_VARIABLE_ELEMENT:
                if (kindModifiers.contains(ScriptElementModifierKind.PRIVATE_MEMBER_MODIFIER)) {
                    return "memberVariablePrivate";
                } else { // public
                    return "memberVariablePublic";
                }
            case MODULE_ELEMENT:
                return "module";
            case PARAMETER_ELEMENT:
                return "parameter";
            case LOCAL_VARIABLE_ELEMENT:
            case VARIABLE_ELEMENT:
                return "variable";
            case UNKNOWN:
            default:
                return "unknown";
        }
    }

    private static Image getImage(String path) {
        if (REGISTRY.getDescriptor(path) == null) {
            IPath path2 = new Path(path);
            URL imageUrl = FileLocator.find(TypeScriptPlugin.getDefault().getBundle(), path2, null);
            ImageDescriptor descriptor = ImageDescriptor.createFromURL(imageUrl);

            REGISTRY.put(path, descriptor);
        }

        return REGISTRY.get(path);
    }

    private Images() {
        // prevent instantiation
    }
}

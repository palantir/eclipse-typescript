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

package com.palantir.typescript.bridge.language;

import static com.google.common.base.Preconditions.checkNotNull;

import java.net.URL;
import java.util.List;

import org.eclipse.core.runtime.FileLocator;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.jface.resource.ImageRegistry;
import org.eclipse.swt.graphics.Image;

import com.fasterxml.jackson.annotation.JsonValue;
import com.palantir.typescript.Activator;

/**
 * Corresponds to the class with the same name in languageService.ts.
 *
 * @author dcicerone
 */
public enum ScriptElementKind {

    UNKNOWN(""),

    // predefined type (void) or keyword (class)
    KEYWORD("keyword"),

    // top level script node
    SCRIPT_ELEMENT("script"),

    // module foo {}
    MODULE_ELEMENT("module"),

    // class X {}
    CLASS_ELEMENT("class"),

    // interface Y {}
    INTERFACE_ELEMENT("interface"),

    // enum E
    ENUM_ELEMENT("enum"),

    // Inside module and script only
    // var v(..
    VARIABLE_ELEMENT("var"),

    // Inside function
    LOCAL_VARIABLE_ELEMENT("local var"),

    // Inside module and script only
    // function f() { }
    FUNCTION_ELEMENT("function"),

    // Inside function
    LOCAL_FUNCTION_ELEMENT("local function"),

    // class X { [public|private]* foo() {} }
    MEMBER_FUNCTION_ELEMENT("method"),

    // class X { [public|private]* [get|set] foo:number), }
    MEMBER_GET_ACCESSOR_ELEMENT("getter"),
    MEMBER_SET_ACCESSOR_ELEMENT("setter"),

    // class X { [public|private]* foo:number), }
    // interface Y { foo:number), }
    MEMBER_VARIABLE_ELEMENT("property"),

    // class X { constructor() { } }
    CONSTRUCTOR_IMPLEMENTATION_ELEMENT("constructor"),

    // interface Y { ():number), }
    call_signature_element("call"),

    // interface Y { []:number), }
    INDEX_SIGNATURE_ELEMENT("index"),

    // interface Y { new():Y), }
    CONSTRUCT_SIGNATURE_ELEMENT("construct"),

    // function foo(*Y*: string)
    PARAMETER_ELEMENT("parameter"),

    TYPE_PARAMETER_ELEMENT("type parameter"),

    PRIMITIVE_TYPE("primitive type");

    private static final ImageRegistry REGISTRY = new ImageRegistry();

    private final String value;

    private ScriptElementKind(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return this.value;
    }

    public Image getImage(List<ScriptElementModifierKind> kindModifiers) {
        checkNotNull(kindModifiers);

        final String imageName;
        switch (this) {
            case CLASS_ELEMENT:
                imageName = "class";
                break;
            case CONSTRUCTOR_IMPLEMENTATION_ELEMENT:
                imageName = "memberFunctionPublic";
                break;
            case ENUM_ELEMENT:
                imageName = "enum";
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
}

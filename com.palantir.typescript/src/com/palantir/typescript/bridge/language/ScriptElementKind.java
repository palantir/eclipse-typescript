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

import com.fasterxml.jackson.annotation.JsonValue;

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

    private final String value;

    private ScriptElementKind(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return this.value;
    }
}

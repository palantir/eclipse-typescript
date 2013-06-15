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

import org.eclipse.swt.graphics.RGB;

/**
 * This is a way for allowing clean calls to color constants; the actual colors are defined here.
 *
 * @author tyleradams
 */
public interface ITypeScriptColorConstants {
    RGB BLACK = new RGB(0, 0, 0);

    RGB DEFAULT = BLACK;
}

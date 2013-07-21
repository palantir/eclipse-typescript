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

package com.palantir.typescript.text.icons;

import java.io.InputStream;

import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.widgets.Display;

/**
 * The icons.
 *
 * @author dcicerone
 */
public final class Icons {

    public static final Image CIRCLE = loadImage("circle.png");

    private static Image loadImage(String resourceName) {
        Display currentDisplay = Display.getCurrent();
        InputStream resourceStream = Icons.class.getResourceAsStream(resourceName);

        return new Image(currentDisplay, resourceStream);
    }

    private Icons() {
        // prevent instantiation
    }
}

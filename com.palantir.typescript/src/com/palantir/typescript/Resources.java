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

import java.text.MessageFormat;
import java.util.ResourceBundle;

/**
 * Provides access to the resources (strings, icon paths, etc...).
 *
 * @author dcicerone
 */
public final class Resources {

    public static final ResourceBundle BUNDLE = ResourceBundle.getBundle("com.palantir.typescript.resources");

    public static String format(String key, Object... arguments) {
        checkNotNull(key);

        String pattern = BUNDLE.getString(key);

        return MessageFormat.format(pattern, arguments);
    }

    private Resources() {
        // prevent instantiation
    }
}

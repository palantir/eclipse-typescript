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

import java.io.File;
import java.util.List;

import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.eclipse.ui.texteditor.AbstractDecoratedTextEditorPreferenceConstants;
import org.osgi.framework.BundleContext;

import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.palantir.typescript.services.language.LanguageVersion;
import com.palantir.typescript.services.language.ModuleGenTarget;

/**
 * The TypeScript plug-in for the Eclipse platform.
 *
 * @author tyleradams
 */
public final class TypeScriptPlugin extends AbstractUIPlugin {

    public static final String ID = "com.palantir.typescript";

    private static final String OS_NAME = System.getProperty("os.name");
    private static final Splitter PATH_SPLITTER = Splitter.on(File.pathSeparatorChar);

    private static TypeScriptPlugin PLUGIN;

    @Override
    public void start(BundleContext context) throws Exception {
        super.start(context);

        PLUGIN = this;
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        PLUGIN = null;

        super.stop(context);
    }

    /**
     * Returns the shared instance.
     *
     * @return the shared instance
     */
    public static TypeScriptPlugin getDefault() {
        return PLUGIN;
    }

    /**
     * Returns an image descriptor for the image file at the given plug-in relative path.
     *
     * @param path
     * @return the image descriptor
     */
    public static ImageDescriptor getImageDescriptor(String path) {
        return imageDescriptorFromPlugin(TypeScriptPlugin.ID, path);
    }

    @Override
    protected void initializeDefaultPluginPreferences() {
        IPreferenceStore store = TypeScriptPlugin.getDefault().getPreferenceStore();

        store.setDefault(IPreferenceConstants.COMPILER_CODE_GEN_TARGET, LanguageVersion.ECMASCRIPT3.toString());
        store.setDefault(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE, false);
        store.setDefault(IPreferenceConstants.COMPILER_MAP_SOURCE_FILES, false);
        store.setDefault(IPreferenceConstants.COMPILER_MODULE_GEN_TARGET, ModuleGenTarget.UNSPECIFIED.toString());
        store.setDefault(IPreferenceConstants.COMPILER_NO_LIB, false);
        store.setDefault(IPreferenceConstants.COMPILER_REMOVE_COMMENTS, false);

        store.setDefault(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS, true);
        store.setDefault(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_TAB_WIDTH, 4);
        store.setDefault(IPreferenceConstants.EDITOR_CLOSE_BRACES, true);
        store.setDefault(IPreferenceConstants.EDITOR_CLOSE_JSDOCS, true);
        store.setDefault(IPreferenceConstants.EDITOR_INDENT_SIZE, 4);
        store.setDefault(IPreferenceConstants.EDITOR_MATCHING_BRACKETS, true);
        store.setDefault(IPreferenceConstants.EDITOR_MATCHING_BRACKETS_COLOR, "128,128,128");

        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_COMMA_DELIMITER, true);
        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_FUNCTION_KEYWORD_FOR_ANONYMOUS_FUNCTIONS, false);
        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_KEYWORDS_IN_CONTROL_FLOW_STATEMENTS, true);
        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_OPENING_AND_BEFORE_CLOSING_NONEMPTY_PARENTHESIS, false);
        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_AFTER_SEMICOLON_IN_FOR_STATEMENTS, true);
        store.setDefault(IPreferenceConstants.FORMATTER_INSERT_SPACE_BEFORE_AND_AFTER_BINARY_OPERATORS, true);
        store.setDefault(IPreferenceConstants.FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_CONTROL_BLOCKS, false);
        store.setDefault(IPreferenceConstants.FORMATTER_PLACE_OPEN_BRACE_ON_NEW_LINE_FOR_FUNCTIONS, false);

        store.setDefault(IPreferenceConstants.GENERAL_NODE_PATH, findNodejs());
    }

    private static String findNodejs() {
        String nodeFileName = getNodeFileName();
        String path = System.getenv("PATH");
        List<String> directories = Lists.newArrayList(PATH_SPLITTER.split(path));

        // ensure /usr/local/bin is included for OS X
        if (OS_NAME.startsWith("Mac OS X")) {
            directories.add("/usr/local/bin");
        }

        // search for Node.js in the PATH directories
        for (String directory : directories) {
            File nodeFile = new File(directory, nodeFileName);

            if (nodeFile.exists()) {
                return nodeFile.getAbsolutePath();
            }
        }

        return "";
    }

    private static String getNodeFileName() {
        if (OS_NAME.startsWith("Windows")) {
            return "node.exe";
        }

        return "node";
    }
}

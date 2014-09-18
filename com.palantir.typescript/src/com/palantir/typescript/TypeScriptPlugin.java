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
import java.util.Set;

import org.eclipse.core.resources.IResourceChangeEvent;
import org.eclipse.core.resources.IResourceChangeListener;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.jface.preference.IPreferenceStore;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.eclipse.ui.texteditor.AbstractDecoratedTextEditorPreferenceConstants;
import org.osgi.framework.BundleContext;

import com.google.common.base.Splitter;
import com.google.common.base.StandardSystemProperty;
import com.google.common.collect.Lists;
import com.palantir.typescript.TypeScriptProjects.Folders;
import com.palantir.typescript.services.classifier.Classifier;
import com.palantir.typescript.services.language.FileDelta;
import com.palantir.typescript.services.language.LanguageEndpoint;
import com.palantir.typescript.services.language.LanguageVersion;
import com.palantir.typescript.services.language.ModuleGenTarget;

/**
 * The TypeScript plug-in for the Eclipse platform.
 *
 * @author tyleradams
 */
public final class TypeScriptPlugin extends AbstractUIPlugin {

    public static final String ID = "com.palantir.typescript";

    private static final String OS_NAME = StandardSystemProperty.OS_NAME.value();
    private static final Splitter PATH_SPLITTER = Splitter.on(File.pathSeparatorChar);

    private static TypeScriptPlugin PLUGIN;

    private LanguageEndpoint builderLanguageEndpoint;
    private Classifier classifier;
    private LanguageEndpoint editorLanguageEndpoint;
    private LanguageEndpoint reconcilerLanguageEndpoint;
    private MyResourceChangeListener resourceChangeListener;

    @Override
    public void start(BundleContext context) throws Exception {
        super.start(context);

        PLUGIN = this;

        this.resourceChangeListener = new MyResourceChangeListener();

        ResourcesPlugin.getWorkspace().addResourceChangeListener(this.resourceChangeListener, IResourceChangeEvent.POST_CHANGE);
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        ResourcesPlugin.getWorkspace().removeResourceChangeListener(this.resourceChangeListener);

        if (this.builderLanguageEndpoint != null) {
            this.builderLanguageEndpoint.dispose();
        }

        if (this.classifier != null) {
            this.classifier.dispose();
        }

        if (this.editorLanguageEndpoint != null) {
            this.editorLanguageEndpoint.dispose();
        }

        if (this.reconcilerLanguageEndpoint != null) {
            this.reconcilerLanguageEndpoint.dispose();
        }

        PLUGIN = null;

        super.stop(context);
    }

    /**
     * Returns the shared instance.
     */
    public static TypeScriptPlugin getDefault() {
        return PLUGIN;
    }

    /**
     * Returns an image descriptor for the image file at the given plug-in relative path.
     */
    public static ImageDescriptor getImageDescriptor(String path) {
        return imageDescriptorFromPlugin(TypeScriptPlugin.ID, path);
    }

    public synchronized LanguageEndpoint getBuilderLanguageEndpoint() {
        if (this.builderLanguageEndpoint == null) {
            this.builderLanguageEndpoint = new LanguageEndpoint("LANGUAGE-BUILDER");
        }

        return this.builderLanguageEndpoint;
    }

    public synchronized Classifier getClassifier() {
        if (this.classifier == null) {
            this.classifier = new Classifier("CLASSIFIER");
        }

        return this.classifier;
    }

    public synchronized LanguageEndpoint getEditorLanguageEndpoint() {
        if (this.editorLanguageEndpoint == null) {
            this.editorLanguageEndpoint = new LanguageEndpoint("LANGUAGE-EDITOR");
        }

        return this.editorLanguageEndpoint;
    }

    public synchronized LanguageEndpoint getReconcilerLanguageEndpoint() {
        if (this.reconcilerLanguageEndpoint == null) {
            this.reconcilerLanguageEndpoint = new LanguageEndpoint("LANGUAGE-RECONCILER");
        }

        return this.reconcilerLanguageEndpoint;
    }

    @Override
    protected void initializeDefaultPluginPreferences() {
        IPreferenceStore store = TypeScriptPlugin.getDefault().getPreferenceStore();

        store.setDefault(IPreferenceConstants.COMPILER_CODE_GEN_TARGET, LanguageVersion.ECMASCRIPT3.toString());
        store.setDefault(IPreferenceConstants.COMPILER_COMPILE_ON_SAVE, false);
        store.setDefault(IPreferenceConstants.COMPILER_GENERATE_DECLARATION_FILES, false);
        store.setDefault(IPreferenceConstants.COMPILER_MAP_SOURCE_FILES, false);
        store.setDefault(IPreferenceConstants.COMPILER_MODULE_GEN_TARGET, ModuleGenTarget.UNSPECIFIED.toString());
        store.setDefault(IPreferenceConstants.COMPILER_NO_IMPLICIT_ANY, false);
        store.setDefault(IPreferenceConstants.COMPILER_NO_LIB, false);
        store.setDefault(IPreferenceConstants.COMPILER_REMOVE_COMMENTS, false);

        store.setDefault(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_DELAY, 200);
        store.setDefault(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_ENABLED, true);
        store.setDefault(IPreferenceConstants.CONTENT_ASSIST_AUTO_ACTIVATION_TRIGGERS, ".");

        store.setDefault(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_SPACES_FOR_TABS, true);
        store.setDefault(AbstractDecoratedTextEditorPreferenceConstants.EDITOR_TAB_WIDTH, 4);
        store.setDefault(IPreferenceConstants.EDITOR_CLOSE_BRACES, false);
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

        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_COMMENT_COLOR, "63,127,95");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_IDENTIFIER_COLOR, "0,0,0");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_KEYWORD_COLOR, "127,0,85");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_NUMBER_LITERAL_COLOR, "0,0,0");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_OPERATOR_COLOR, "0,0,0");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_PUNCTUATION_COLOR, "0,0,0");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_REG_EXP_LITERAL_COLOR, "219,0,0");
        store.setDefault(IPreferenceConstants.SYNTAX_COLORING_STRING_LITERAL_COLOR, "42,0,255");
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

    private final class MyResourceChangeListener implements IResourceChangeListener {
        @Override
        public void resourceChanged(IResourceChangeEvent event) {
            IResourceDelta delta = event.getDelta();
            Set<FileDelta> fileDeltas = TypeScriptProjects.getFileDeltas(Folders.SOURCE_AND_EXPORTED, delta);

            if (TypeScriptPlugin.this.editorLanguageEndpoint != null) {
                TypeScriptPlugin.this.editorLanguageEndpoint.updateFiles(fileDeltas);
            }

            if (TypeScriptPlugin.this.reconcilerLanguageEndpoint != null) {
                TypeScriptPlugin.this.reconcilerLanguageEndpoint.updateFiles(fileDeltas);
            }
        }
    }
}

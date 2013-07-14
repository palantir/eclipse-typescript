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

import java.util.List;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceChangeEvent;
import org.eclipse.core.resources.IResourceChangeListener;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.osgi.framework.BundleContext;

import com.google.common.collect.Lists;
import com.palantir.typescript.bridge.TypeScriptBridge;
import com.palantir.typescript.bridge.language.LanguageService;

/**
 * The activator class controls the plug-in life cycle.
 *
 * @author tyleradams
 */
public final class Activator extends AbstractUIPlugin {

    private static Activator PLUGIN;

    private TypeScriptBridge bridge;

    @Override
    public void start(BundleContext context) throws Exception {
        super.start(context);

        this.bridge = new TypeScriptBridge();

        this.intializeWorkspace();

        PLUGIN = this;
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        PLUGIN = null;

        this.bridge.stop();
        this.bridge = null;

        super.stop(context);
    }

    public static TypeScriptBridge getBridge() {
        return PLUGIN.bridge;
    }

    /**
     * Returns the shared instance.
     *
     * @return the shared instance
     */
    public static Activator getDefault() {
        return PLUGIN;
    }

    /**
     * Returns an image descriptor for the image file at the given plug-in relative path.
     *
     * @param path
     * @return the image descriptor
     */
    public static ImageDescriptor getImageDescriptor(String path) {
        return imageDescriptorFromPlugin("com.palantir.typescript", path);
    }

    private void intializeWorkspace() throws CoreException {
        final List<String> files = Lists.newArrayList();

        // add all the TypeScript files in the workspace
        for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
            project.accept(new IResourceVisitor() {
                @Override
                public boolean visit(IResource resource) throws CoreException {
                    if (isTypeScriptFile(resource)) {
                        String file = resource.getRawLocation().toOSString();

                        files.add(file);
                    }

                    return true;
                }
            });
        }
        this.bridge.getLanguageService().addFiles(files);

        // listen to the resource deltas for additional TypeScript files
        this.listenToResourceDeltas();
    }

    private void listenToResourceDeltas() {
        ResourcesPlugin.getWorkspace().addResourceChangeListener(new MyResourceChangeListener());
    }

    private static boolean isTypeScriptFile(IResource resource) {
        return resource.getType() == IResource.FILE && resource.getName().endsWith(".ts");
    }

    private final class MyResourceChangeListener implements IResourceChangeListener {
        @Override
        public void resourceChanged(IResourceChangeEvent event) {
            if (event.getType() == IResourceChangeEvent.POST_CHANGE) {
                try {
                    event.getDelta().accept(new MyResourceDeltaVisitor());
                } catch (CoreException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    private final class MyResourceDeltaVisitor implements IResourceDeltaVisitor {
        @Override
        public boolean visit(IResourceDelta delta) throws CoreException {
            IResource resource = delta.getResource();

            if (isTypeScriptFile(resource)) {
                LanguageService languageService = Activator.this.bridge.getLanguageService();
                String file = resource.getRawLocation().toOSString();

                switch (delta.getKind()) {
                    case IResourceDelta.ADDED:
                        languageService.addFile(file);
                        break;
                    case IResourceDelta.CHANGED:
                        languageService.updateFile(file);
                        break;
                    case IResourceDelta.REMOVED:
                        languageService.removeFile(file);
                        break;
                }
            }

            return true;
        }
    }
}

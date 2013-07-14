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

import org.eclipse.core.resources.IResourceChangeEvent;
import org.eclipse.core.resources.IResourceChangeListener;
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.osgi.framework.BundleContext;

import com.google.common.base.Preconditions;
import com.palantir.typescript.bridge.TypeScriptBridge;
import com.palantir.typescript.editors.TypeScriptFileManager;

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
        this.bridge.getFileManagerService().intializeWorkspace();
        manageResourceListeners();
        PLUGIN = this;
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        PLUGIN = null;
        this.bridge.stop();

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

    private void manageResourceListeners() {
        IWorkspace workspace = ResourcesPlugin.getWorkspace();
        IResourceChangeListener listener = new IResourceChangeListener() {
            @Override
            public void resourceChanged(IResourceChangeEvent event) {
                Preconditions.checkNotNull(event);

                if (event.getType() == IResourceChangeEvent.POST_CHANGE) {
                    try {
                        event.getDelta().accept(new TypeScriptFileManager());
                    } catch (CoreException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        };
        workspace.addResourceChangeListener(listener);
    }
}

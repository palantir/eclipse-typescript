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

import org.eclipse.core.resources.ICommand;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IProjectDescription;
import org.eclipse.core.resources.IProjectNature;
import org.eclipse.core.runtime.CoreException;

/**
 * The TypeScript project nature.
 * <p>
 * This is used for identifying projects which have opted into using the TypeScript plug-in.
 *
 * @author dcicerone
 */
public final class ProjectNature implements IProjectNature {

    public static final String ID = "com.palantir.typescript.typeScriptNature";

    private IProject project;

    @Override
    public void configure() throws CoreException {
        IProjectDescription description = this.project.getDescription();
        ICommand[] commands = description.getBuildSpec();

        for (int i = 0; i < commands.length; ++i) {
            if (commands[i].getBuilderName().equals(TypeScriptBuilder.ID)) {
                return;
            }
        }

        ICommand[] newCommands = new ICommand[commands.length + 1];
        System.arraycopy(commands, 0, newCommands, 0, commands.length);
        ICommand command = description.newCommand();
        command.setBuilderName(TypeScriptBuilder.ID);
        newCommands[newCommands.length - 1] = command;
        description.setBuildSpec(newCommands);
        this.project.setDescription(description, null);
    }

    @Override
    public void deconfigure() throws CoreException {
        IProjectDescription description = getProject().getDescription();
        ICommand[] commands = description.getBuildSpec();
        for (int i = 0; i < commands.length; ++i) {
            if (commands[i].getBuilderName().equals(TypeScriptBuilder.ID)) {
                ICommand[] newCommands = new ICommand[commands.length - 1];
                System.arraycopy(commands, 0, newCommands, 0, i);
                System.arraycopy(commands, i + 1, newCommands, i,
                    commands.length - i - 1);
                description.setBuildSpec(newCommands);
                this.project.setDescription(description, null);
                return;
            }
        }
    }

    @Override
    public IProject getProject() {
        return this.project;
    }

    @Override
    public void setProject(IProject project) {
        this.project = project;
    }
}

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

package com.palantir.typescript.navigate;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import org.eclipse.jface.viewers.BaseLabelProvider;
import org.eclipse.jface.viewers.ILabelProvider;
import org.eclipse.swt.graphics.Image;

import com.palantir.typescript.Images;
import com.palantir.typescript.services.language.NavigationBarItem;
import com.palantir.typescript.services.language.ScriptElementKind;
import com.palantir.typescript.services.language.ScriptElementModifierKind;

/**
 * A label provider which provides labels for a {@link NavigationBarItem}.
 *
 * @author dcicerone
 */
public final class NavigationBarItemLabelProvider extends BaseLabelProvider implements ILabelProvider {

    @Override
    public Image getImage(Object element) {
        checkNotNull(element);

        NavigationBarItem item = (NavigationBarItem) element;
        ScriptElementKind kind = item.getKind();
        List<ScriptElementModifierKind> kindModifiers = item.getKindModifiers();

        return Images.getImage(kind, kindModifiers);
    }

    @Override
    public String getText(Object element) {
        checkNotNull(element);

        NavigationBarItem item = (NavigationBarItem) element;

        return item.getText();
    }
}

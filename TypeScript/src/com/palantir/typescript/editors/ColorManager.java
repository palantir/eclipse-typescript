
package com.palantir.typescript.editors;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.RGB;
import org.eclipse.swt.widgets.Display;

public class ColorManager {

    private Map<RGB, Color> fColorTable = new HashMap<>();

    public void dispose() {
        Iterator<Color> e = fColorTable.values().iterator();
        while (e.hasNext()) {
            e.next().dispose();
        }
    }

    public Color getColor(RGB rgb) {
        Color color = fColorTable.get(rgb);
        if (color == null) {
            color = new Color(Display.getCurrent(), rgb);
            fColorTable.put(rgb, color);
        }
        return color;
    }
}

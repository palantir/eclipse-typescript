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

package com.palantir.typescript.util;

/**
 * Subset of org.eclipse.jdt.core.compiler.CharOperation used to support path pattern matching.
 *
 * @author rserafin
 */
public final class CharOperation {
    /**
     * Answers true if the pattern matches the filepath using the pathSepatator, false otherwise.
     * Path char[] pattern matching, accepting wild-cards '**', '*' and '?' (using Ant directory
     * tasks conventions, also see
     * "http://jakarta.apache.org/ant/manual/dirtasks.html#defaultexcludes"). Path pattern matching
     * is enhancing regular pattern matching in supporting extra rule where '**' represent any
     * folder combination. Special rule: - foo\ is equivalent to foo\** When not case sensitive, the
     * pattern is assumed to already be lowercased, the name will be lowercased character per
     * character as comparing.
     *
     * @param pattern
     *            the given pattern
     * @param filepath
     *            the given path
     * @param isCaseSensitive
     *            to find out whether or not the matching should be case sensitive
     * @param pathSeparator
     *            the given path separator
     * @return true if the pattern matches the filepath using the pathSepatator, false otherwise
     */
    public static boolean pathMatch(
            char[] pattern,
            char[] filepath,
            boolean isCaseSensitive,
            char pathSeparator) {

        if (filepath == null)
            return false; // null name cannot match
        if (pattern == null)
            return true; // null pattern is equivalent to '*'

        // offsets inside pattern
        int pSegmentStart = pattern[0] == pathSeparator ? 1 : 0;
        int pLength = pattern.length;
        int pSegmentEnd = CharOperation.indexOf(pathSeparator, pattern, pSegmentStart + 1);
        if (pSegmentEnd < 0)
            pSegmentEnd = pLength;

        // special case: pattern foo\ is equivalent to foo\**
        boolean freeTrailingDoubleStar = pattern[pLength - 1] == pathSeparator;

        // offsets inside filepath
        int fSegmentStart;
        int fLength = filepath.length;
        if (filepath[0] != pathSeparator) {
            fSegmentStart = 0;
        } else {
            fSegmentStart = 1;
        }
        if (fSegmentStart != pSegmentStart) {
            return false; // both must start with a separator or none.
        }
        int fSegmentEnd = CharOperation.indexOf(pathSeparator, filepath, fSegmentStart + 1);
        if (fSegmentEnd < 0)
            fSegmentEnd = fLength;

        // first segments
        while (pSegmentStart < pLength
                && !(pSegmentEnd == pLength && freeTrailingDoubleStar
                || (pSegmentEnd == pSegmentStart + 2
                        && pattern[pSegmentStart] == '*'
                        && pattern[pSegmentStart + 1] == '*'))) {

            if (fSegmentStart >= fLength)
                return false;
            if (!CharOperation
                .match(
                    pattern,
                    pSegmentStart,
                    pSegmentEnd,
                    filepath,
                    fSegmentStart,
                    fSegmentEnd,
                    isCaseSensitive)) {
                return false;
            }

            // jump to next segment
            pSegmentEnd =
                    CharOperation.indexOf(
                        pathSeparator,
                        pattern,
                        pSegmentStart = pSegmentEnd + 1);
            // skip separator
            if (pSegmentEnd < 0)
                pSegmentEnd = pLength;

            fSegmentEnd =
                    CharOperation.indexOf(
                        pathSeparator,
                        filepath,
                        fSegmentStart = fSegmentEnd + 1);
            // skip separator
            if (fSegmentEnd < 0)
                fSegmentEnd = fLength;
        }

        /* check sequence of doubleStar+segment */
        int pSegmentRestart;
        if ((pSegmentStart >= pLength && freeTrailingDoubleStar)
                || (pSegmentEnd == pSegmentStart + 2
                        && pattern[pSegmentStart] == '*'
                        && pattern[pSegmentStart + 1] == '*')) {
            pSegmentEnd =
                    CharOperation.indexOf(
                        pathSeparator,
                        pattern,
                        pSegmentStart = pSegmentEnd + 1);
            // skip separator
            if (pSegmentEnd < 0)
                pSegmentEnd = pLength;
            pSegmentRestart = pSegmentStart;
        } else {
            if (pSegmentStart >= pLength)
                return fSegmentStart >= fLength; // true if filepath is done too.
            pSegmentRestart = 0; // force fSegmentStart check
        }
        int fSegmentRestart = fSegmentStart;
        checkSegment: while (fSegmentStart < fLength) {

            if (pSegmentStart >= pLength) {
                if (freeTrailingDoubleStar)
                    return true;
                // mismatch - restart current path segment
                pSegmentEnd =
                        CharOperation.indexOf(pathSeparator, pattern, pSegmentStart = pSegmentRestart);
                if (pSegmentEnd < 0)
                    pSegmentEnd = pLength;

                fSegmentRestart =
                        CharOperation.indexOf(pathSeparator, filepath, fSegmentRestart + 1);
                // skip separator
                if (fSegmentRestart < 0) {
                    fSegmentRestart = fLength;
                } else {
                    fSegmentRestart++;
                }
                fSegmentEnd =
                        CharOperation.indexOf(pathSeparator, filepath, fSegmentStart = fSegmentRestart);
                if (fSegmentEnd < 0)
                    fSegmentEnd = fLength;
                continue checkSegment;
            }

            /* path segment is ending */
            if (pSegmentEnd == pSegmentStart + 2
                    && pattern[pSegmentStart] == '*'
                    && pattern[pSegmentStart + 1] == '*') {
                pSegmentEnd =
                        CharOperation.indexOf(pathSeparator, pattern, pSegmentStart = pSegmentEnd + 1);
                // skip separator
                if (pSegmentEnd < 0)
                    pSegmentEnd = pLength;
                pSegmentRestart = pSegmentStart;
                fSegmentRestart = fSegmentStart;
                if (pSegmentStart >= pLength)
                    return true;
                continue checkSegment;
            }
            /* chech current path segment */
            if (!CharOperation.match(
                pattern,
                pSegmentStart,
                pSegmentEnd,
                filepath,
                fSegmentStart,
                fSegmentEnd,
                isCaseSensitive)) {
                // mismatch - restart current path segment
                pSegmentEnd =
                        CharOperation.indexOf(pathSeparator, pattern, pSegmentStart = pSegmentRestart);
                if (pSegmentEnd < 0)
                    pSegmentEnd = pLength;

                fSegmentRestart =
                        CharOperation.indexOf(pathSeparator, filepath, fSegmentRestart + 1);
                // skip separator
                if (fSegmentRestart < 0) {
                    fSegmentRestart = fLength;
                } else {
                    fSegmentRestart++;
                }
                fSegmentEnd =
                        CharOperation.indexOf(pathSeparator, filepath, fSegmentStart = fSegmentRestart);
                if (fSegmentEnd < 0)
                    fSegmentEnd = fLength;
                continue checkSegment;
            }
            // jump to next segment
            pSegmentEnd =
                    CharOperation.indexOf(
                        pathSeparator,
                        pattern,
                        pSegmentStart = pSegmentEnd + 1);
            // skip separator
            if (pSegmentEnd < 0)
                pSegmentEnd = pLength;

            fSegmentEnd =
                    CharOperation.indexOf(
                        pathSeparator,
                        filepath,
                        fSegmentStart = fSegmentEnd + 1);
            // skip separator
            if (fSegmentEnd < 0)
                fSegmentEnd = fLength;
        }

        return (pSegmentRestart >= pSegmentEnd)
                || (fSegmentStart >= fLength && pSegmentStart >= pLength)
                || (pSegmentStart == pLength - 2
                        && pattern[pSegmentStart] == '*'
                        && pattern[pSegmentStart + 1] == '*')
                || (pSegmentStart == pLength && freeTrailingDoubleStar);
    }

    /**
     * Answers the first index in the array for which the corresponding character is equal to
     * toBeFound starting the search at index start. Answers -1 if no occurrence of this character
     * is found. <br>
     * <br>
     * For example:
     * <ol>
     * <li>
     *
     * <pre>
     *    toBeFound = 'c'
     *    array = { ' a', 'b', 'c', 'd' }
     *    start = 2
     *    result => 2
     * </pre>
     *
     * </li>
     * <li>
     *
     * <pre>
     *    toBeFound = 'c'
     *    array = { ' a', 'b', 'c', 'd' }
     *    start = 3
     *    result => -1
     * </pre>
     *
     * </li>
     * <li>
     *
     * <pre>
     *    toBeFound = 'e'
     *    array = { ' a', 'b', 'c', 'd' }
     *    start = 1
     *    result => -1
     * </pre>
     *
     * </li>
     * </ol>
     *
     * @param toBeFound
     *            the character to search
     * @param array
     *            the array to be searched
     * @param start
     *            the starting index
     * @return the first index in the array for which the corresponding character is equal to
     *         toBeFound, -1 otherwise
     * @throws NullPointerException
     *             if array is null
     * @throws ArrayIndexOutOfBoundsException
     *             if start is lower than 0
     */
    public static int indexOf(char toBeFound, char[] array, int start) {
        for (int i = start; i < array.length; i++)
            if (toBeFound == array[i])
                return i;
        return -1;
    }

    /**
     * Answers true if a sub-pattern matches the subpart of the given name, false otherwise. char[]
     * pattern matching, accepting wild-cards '*' and '?'. Can match only subset of name/pattern.
     * end positions are non-inclusive. The subpattern is defined by the patternStart and
     * pattternEnd positions. When not case sensitive, the pattern is assumed to already be
     * lowercased, the name will be lowercased character per character as comparing. <br>
     * <br>
     * For example:
     * <ol>
     * <li>
     *
     * <pre>
     *    pattern = { '?', 'b', '*' }
     *    patternStart = 1
     *    patternEnd = 3
     *    name = { 'a', 'b', 'c' , 'd' }
     *    nameStart = 1
     *    nameEnd = 4
     *    isCaseSensitive = true
     *    result => true
     * </pre>
     *
     * </li>
     * <li>
     *
     * <pre>
     *    pattern = { '?', 'b', '*' }
     *    patternStart = 1
     *    patternEnd = 2
     *    name = { 'a', 'b', 'c' , 'd' }
     *    nameStart = 1
     *    nameEnd = 4
     *    isCaseSensitive = true
     *    result => false
     * </pre>
     *
     * </li>
     * </ol>
     *
     * @param pattern
     *            the given pattern
     * @param patternStart
     *            the given pattern start
     * @param patternEnd
     *            the given pattern end
     * @param name
     *            the given name
     * @param nameStart
     *            the given name start
     * @param nameEnd
     *            the given name end
     * @param isCaseSensitive
     *            flag to know if the matching should be case sensitive
     * @return true if a sub-pattern matches the subpart of the given name, false otherwise
     */
    public static boolean match(
            char[] pattern,
            int patternStart,
            int patternEnd,
            char[] name,
            int nameStart,
            int nameEnd,
            boolean isCaseSensitive) {

        if (name == null)
            return false; // null name cannot match
        if (pattern == null)
            return true; // null pattern is equivalent to '*'
        int iPattern = patternStart;
        int iName = nameStart;

        if (patternEnd < 0)
            patternEnd = pattern.length;
        if (nameEnd < 0)
            nameEnd = name.length;

        /* check first segment */
        char patternChar = 0;
        while (true) {
            if (iPattern == patternEnd) {
                if (iName == nameEnd)
                    return true; // the chars match
                return false; // pattern has ended but not the name, no match
            }
            if ((patternChar = pattern[iPattern]) == '*') {
                break;
            }
            if (iName == nameEnd) {
                return false; // name has ended but not the pattern
            }
            if (patternChar
                        != (isCaseSensitive
                    ? name[iName]
                    : Character.toLowerCase(name[iName]))
                    && patternChar != '?') {
                return false;
            }
            iName++;
            iPattern++;
        }
        /* check sequence of star+segment */
        int segmentStart;
        if (patternChar == '*') {
            segmentStart = ++iPattern; // skip star
        } else {
            segmentStart = 0; // force iName check
        }
        int prefixStart = iName;
        checkSegment: while (iName < nameEnd) {
            if (iPattern == patternEnd) {
                iPattern = segmentStart; // mismatch - restart current segment
                iName = ++prefixStart;
                continue checkSegment;
            }
            /* segment is ending */
            if ((patternChar = pattern[iPattern]) == '*') {
                segmentStart = ++iPattern; // skip start
                if (segmentStart == patternEnd) {
                    return true;
                }
                prefixStart = iName;
                continue checkSegment;
            }
            /* check current name character */
            if ((isCaseSensitive ? name[iName] : Character.toLowerCase(name[iName]))
                        != patternChar
                    && patternChar != '?') {
                iPattern = segmentStart; // mismatch - restart current segment
                iName = ++prefixStart;
                continue checkSegment;
            }
            iName++;
            iPattern++;
        }

        return (segmentStart == patternEnd)
                || (iName == nameEnd && iPattern == patternEnd)
                || (iPattern == patternEnd - 1 && pattern[iPattern] == '*');
    }

    private CharOperation() {
        // hiding constructot.
    }
}

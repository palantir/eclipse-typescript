/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.

Adopted with permission: https://github.com/Microsoft/TypeScript/issues/1709
***************************************************************************** */

/// <reference path="textSpan.ts" />

module Bridge {
    export class TextChangeRange implements ts.TextChangeRange {
        public static unchanged = new TextChangeRange(new TextSpan(0, 0), 0);

        public span: TextSpan;
        public newLength: number;

        /**
         * Initializes a new instance of TextChangeRange.
         */
        constructor(span: TextSpan, newLength: number) {
            if (span == null || newLength < 0) {
                throw new Error();
            }

            this.span = span;
            this.newLength = newLength;
        }

        /**
         * Called to merge all the changes that occurred across several versions of a script snapshot
         * into a single change.  i.e. if a user keeps making successive edits to a script we will
         * have a text change from V1 to V2, V2 to V3, ..., Vn.
         *
         * This function will then merge those changes into a single change range valid between V1 and
         * Vn.
         */
        public static collapseChangesAcrossMultipleVersions(changes: TextChangeRange[]): TextChangeRange {
            if (changes.length === 0) {
                return TextChangeRange.unchanged;
            }

            if (changes.length === 1) {
                return changes[0];
            }

            // We change from talking about { { oldStart, oldLength }, newLength } to { oldStart, oldEnd, newEnd }
            // as it makes things much easier to reason about.
            var change0 = changes[0];

            var oldStartN = change0.span.start;
            var oldEndN = change0.span.end();
            var newEndN = oldStartN + change0.newLength;

            for (var i = 1; i < changes.length; i++) {
                var nextChange = changes[i];

                // Consider the following case:
                // i.e. two edits.  The first represents the text change range { { 10, 50 }, 30 }.  i.e. The span starting
                // at 10, with length 50 is reduced to length 30.  The second represents the text change range { { 30, 30 }, 40 }.
                // i.e. the span starting at 30 with length 30 is increased to length 40.
                //
                //      0         10        20        30        40        50        60        70        80        90        100
                //      -------------------------------------------------------------------------------------------------------
                //                |                                                 /
                //                |                                            /----
                //  T1            |                                       /----
                //                |                                  /----
                //                |                             /----
                //      -------------------------------------------------------------------------------------------------------
                //                                     |                            \
                //                                     |                               \
                //   T2                                |                                 \
                //                                     |                                   \
                //                                     |                                      \
                //      -------------------------------------------------------------------------------------------------------
                //
                // Merging these turns out to not be too difficult.  First, determining the new start of the change is trivial
                // it's just the min of the old and new starts.  i.e.:
                //
                //      0         10        20        30        40        50        60        70        80        90        100
                //      ------------------------------------------------------------*------------------------------------------
                //                |                                                 /
                //                |                                            /----
                //  T1            |                                       /----
                //                |                                  /----
                //                |                             /----
                //      ----------------------------------------$-------------------$------------------------------------------
                //                .                    |                            \
                //                .                    |                               \
                //   T2           .                    |                                 \
                //                .                    |                                   \
                //                .                    |                                      \
                //      ----------------------------------------------------------------------*--------------------------------
                //
                // (Note the dots represent the newly inferrred start.
                // Determining the new and old end is also pretty simple.  Basically it boils down to paying attention to the
                // absolute positions at the asterixes, and the relative change between the dollar signs. Basically, we see
                // which if the two $'s precedes the other, and we move that one forward until they line up.  in this case that
                // means:
                //
                //      0         10        20        30        40        50        60        70        80        90        100
                //      --------------------------------------------------------------------------------*----------------------
                //                |                                                                     /
                //                |                                                                /----
                //  T1            |                                                           /----
                //                |                                                      /----
                //                |                                                 /----
                //      ------------------------------------------------------------$------------------------------------------
                //                .                    |                            \
                //                .                    |                               \
                //   T2           .                    |                                 \
                //                .                    |                                   \
                //                .                    |                                      \
                //      ----------------------------------------------------------------------*--------------------------------
                //
                // In other words (in this case), we're recognizing that the second edit happened after where the first edit
                // ended with a delta of 20 characters (60 - 40).  Thus, if we go back in time to where the first edit started
                // that's the same as if we started at char 80 instead of 60.
                //
                // As it so happens, the same logic applies if the second edit precedes the first edit.  In that case rahter
                // than pusing the first edit forward to match the second, we'll push the second edit forward to match the
                // first.
                //
                // In this case that means we have { oldStart: 10, oldEnd: 80, newEnd: 70 } or, in TextChangeRange
                // semantics: { { start: 10, length: 70 }, newLength: 60 }
                //
                // The math then works out as follows.
                // If we have { oldStart1, oldEnd1, newEnd1 } and { oldStart2, oldEnd2, newEnd2 } then we can compute the
                // final result like so:
                //
                // {
                //      oldStart3: Min(oldStart1, oldStart2),
                //      oldEnd3  : Max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1)),
                //      newEnd3  : Max(newEnd2, newEnd2 + (newEnd1 - oldEnd2))
                // }

                var oldStart1 = oldStartN;
                var oldEnd1 = oldEndN;
                var newEnd1 = newEndN;

                var oldStart2 = nextChange.span.start;
                var oldEnd2 = nextChange.span.end();
                var newEnd2 = oldStart2 + nextChange.newLength;

                oldStartN = Math.min(oldStart1, oldStart2);
                oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
                newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
            }

            return new TextChangeRange(new TextSpan(oldStartN, oldEndN - oldStartN), /*newLength: */newEndN - oldStartN);
        }
    }
}

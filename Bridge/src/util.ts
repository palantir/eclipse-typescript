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

module Bridge {

    export function isProjectFile(projectName: string, fileName: string) {
        return fileName.indexOf("eclipse:/" + projectName + "/") == 0;
    }

    export function isReferencedProjectFile(referencedProjects: string[], fileName: string) {
        return referencedProjects.some((value, i, arr) => isProjectFile(value, fileName));
    }

    export function isEmpty(str: string) {
        return (str == null || str.length == 0);
    }
}

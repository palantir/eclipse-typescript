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

var gulp = require('gulp');
var typescript = require('gulp-tsc');

var tsc_bin = 'Bridge/typescript/bin/tsc';
var all_src = 'Bridge/src/**/*.ts';
var src = 'Bridge/src/main.ts';
var out = 'com.palantir.typescript/bin/bridge.js';

gulp.task('tsc', function() {
  return gulp.src(src)
    .pipe(
      typescript({
        tscPath: tsc_bin,
        out: out,
        sourcemap: true,
        keepTree: false
      })
    );
});

gulp.task('watch', function() {
  gulp.watch(all_src, ['tsc'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['tsc']);
gulp.task('travis', ['default']);


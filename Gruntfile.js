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

module.exports = function(grunt) {
  'use strict';

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    tslint: {
      options: {
        configuration: grunt.file.readJSON('.tslintrc')
      },
      files: {
        src: ["Bridge/src/**/*.ts"]
      }
    },

    typescript: {
      compile: {
        options: {
          target: 'es5'
        },
        src: ['Bridge/src/main.ts'],
        dest: 'com.palantir.typescript/bin/bridge.js'
      }
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-typescript');

  // other tasks
  grunt.registerTask('default', ['typescript', 'tslint']);
  grunt.registerTask('travis', ['default']);
};

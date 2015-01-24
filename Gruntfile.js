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

    concat: {
      dist: {
        src: ['Bridge/lib/typescriptServices.js', 'Bridge/build/bridge.js'],
        dest: 'com.palantir.typescript/bin/bridge.js'
      }
    },

    ts: {
      options: {
        compiler: "Bridge/bin/tsc",
        fast: "never"
      },
      compile: {
        src: ['Bridge/src/main.ts', 'Bridge/typings/*.d.ts'],
        out: 'Bridge/build/bridge.js',
        options: {
          declaration: true
        }
      }
    },

    watch: {
      scripts: {
        files: ['Bridge/src/*.ts', 'Bridge/typings/*.d.ts'],
        tasks: ['default'],
      },
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ts');

  // other tasks
  grunt.registerTask('default', ['ts:compile', 'concat']);
};

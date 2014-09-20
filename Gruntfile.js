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

    chmod: {
      execute: {
        options: {
          mode: '744'
        },
        src: ['Bridge/TypeScript/bin/tsc']
      },
      noexecute: {
        options: {
          mode: '644'
        },
        src: ['Bridge/TypeScript/bin/tsc']
      }
    },

    tsc: {
      compile: {
        options: {
          bin: 'Bridge/TypeScript/bin/tsc'
        },
        src: ['Bridge/src/main.ts'],
        dest: 'com.palantir.typescript/bin/bridge.js'
      }
    },

    watch: {
      scripts: {
        files: ['Bridge/src/*.ts'],
        tasks: ['default'],
      },
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // load our custom tasks
  grunt.loadTasks("tasks");

  // other tasks
  grunt.registerTask('default', ['chmod:execute', 'tsc', 'chmod:noexecute']);
  grunt.registerTask('travis', ['default']);
};

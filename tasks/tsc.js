/*
 * Runs a tsc command.
 *
 * Copyright 2013 Palantir Technologies, Inc. All rights reserved.
 */

module.exports = function(grunt) {
  "use strict";

  grunt.registerMultiTask("tsc", function() {
    var done = this.async();
    var options = this.options();
    var args = [];

    this.files.forEach(function(file) {
      file.src.filter(function(filepath) {
        args.push(filepath);
      });

      args.push("--out");
      args.push(file.dest);
    });

    grunt.log.write("Running tsc...");
    grunt.util.spawn({
      cmd: options.bin,
      args: args
    }, function(err) {
      if (err) {
        grunt.warn("tsc exited unexpectedly with error: " + err.message);
      } else {
        grunt.log.ok();
      }

      done();
    });
  });

};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      compile: {
        options: {
          module: "amd",
          sourcemap: true,
          target: "es5"
        },
        src: ["Bridge/src/bridge.ts"],
        dest: "com.palantir.typescript/bin/bridge.js"
      }
    }
  });

  //load NPM tasks
  grunt.loadNpmTasks('grunt-typescript');

  // Default task(s).
  grunt.registerTask('default', ["typescript"]);
  grunt.registerTask('travis', ["typescript"]);

};

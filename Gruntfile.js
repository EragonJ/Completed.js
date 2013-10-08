module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/Init.js', 'src/keyMap.js', 'src/Utils.js', 'src/Getter.js', 'src/AutoComplete.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
};

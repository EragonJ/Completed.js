module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
            'src/Init.js',
            'src/keyMap.js',
            'src/Utils.js',
            'src/Getter.js',
            'src/Console.js',
            'src/Completed.js'
        ],
        dest: 'dist/<%= pkg.name %>'
      }
    },
    watch: {
      files: ['src/*.js'],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat']);
};

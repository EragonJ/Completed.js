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
            dest: 'dist/<%= pkg.name %>.js'
          }
      },
      watch: {
        files: ['src/*.js'],
        tasks: ['concat', 'uglify']
      },
      uglify: {
        my_target: {
            files: {
                'dist/<%= pkg.name %>.min.js': [
                    'dist/<%= pkg.name %>.js '
                ]
            }
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);
};

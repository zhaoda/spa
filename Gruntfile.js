module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
              ' * <%= pkg.title %> v<%= pkg.version %>\n' +
              ' * <%= pkg.description %>\n' +
              ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author[0].name %> <<%= pkg.author[0].url %>>\n' +
              ' * Licensed under <%= pkg.license.type %> <%= pkg.license.url %>\n' +
              ' */\n\n',

    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      build: {
        src: 'src/spa.js'
      }
    },

    clean: ['dist'],

    copy: {
      build: {
        src: 'src/spa.js',
        dest: 'dist/spa.js'
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
      },
      build: {
        src: 'dist/spa.js',
        dest: 'dist/spa.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'dist/spa.js',
        dest: 'dist/spa.min.js'        
      }
    }
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'copy', 'concat', 'uglify'])

}
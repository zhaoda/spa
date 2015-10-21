module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
              ' * <%= pkg.title %> v<%= pkg.version %>\n' +
              ' * <%= pkg.description %>\n' +
              ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author[0].name %> <<%= pkg.author[0].url %>>\n' +
              ' * Licensed under <%= pkg.license %>\n' +
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
        src: [
          'src/spa.js',
          'src/spa-apis.js'
        ]
      }
    },

    clean: ['dist'],

    copy: {
      build: {
        src: 'src/spa.js',
        dest: 'dist/spa.js'
      }
    },

    replace: {
      version: {
        src: 'dist/spa.js',
        dest: 'dist/spa.js',
        replacements: [{
          from: '$.spa.version = \'\'',
          to: '$.spa.version = \'<%= pkg.version %>\''
        }]
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
      },
      buildWithApis: {
        src: [
          'dist/spa.js',
          'src/spa-apis.js'
        ],
        dest: 'dist/spa-apis.js'
      },
      buildWithoutAPis: {
        src: 'dist/spa.js',
        dest: 'dist/spa.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      buildEvent: {
        src: 'dist/spa.js',
        dest: 'dist/spa.min.js'
      },
      buildApis: {
        src: 'dist/spa-apis.js',
        dest: 'dist/spa-apis.min.js'
      }
    }
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-text-replace')

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'copy', 'replace', 'concat', 'uglify'])

}
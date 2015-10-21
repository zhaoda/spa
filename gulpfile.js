var pkg = require('./package.json')
var gulp = require('gulp')
var jshint = require('gulp-jshint')
var clean = require('gulp-clean')
var concat = require('gulp-concat')
var header = require('gulp-header')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var replace = require('gulp-replace')

var banner = '/*!\n' +
            ' * ' + pkg.title + ' v' + pkg.version + '\n' +
            ' * ' + pkg.description + '\n' +
            ' * Copyright ' + (new Date().getFullYear()) + ' ' + pkg.author[0].name + ' <' + pkg.author[0].url + '>\n' +
            ' * Licensed under ' + pkg.license + '\n' +
            ' */\n\n'

gulp.task('lint', function() {
  gulp.src(['src/*.js', 'Gruntfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('clean', function () {
  gulp.src('dist/*', {read: false})
    .pipe(clean())
})

gulp.task('default', ['lint', 'clean'], function() {
  gulp.src('src/spa.js')
    .pipe(header(banner))
    .pipe(replace(/\$\.spa\.version = ''/g, '$.spa.version = \'' + pkg.version + '\''))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(banner))
    .pipe(gulp.dest('dist'))
  
  gulp.src(['src/spa.js', 'src/spa-apis.js'])
    .pipe(concat('spa-apis.js'))
    .pipe(header(banner))
    .pipe(replace(/\$\.spa\.version = ''/g, '$.spa.version = \'' + pkg.version + '\''))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(banner))
    .pipe(gulp.dest('dist'))
})
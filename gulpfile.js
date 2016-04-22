// BASED ON TUTORIAL AT:
// https://travismaynard.com/writing/getting-started-with-gulp

// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');

var version = require("./package.json").version;

// Lint Task
gulp.task('lint', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(replace("$VERSION", version))
    .pipe(concat('build.js'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('build.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/build'));
});

// Concat and Minify SCSS files
gulp.task('css', function() {
  return gulp.src('app/css/*.scss')
    .pipe(concat('build.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('app/build'));
});

// Concat and Minify JS dependencies
gulp.task('script-dependencies', function() {
  return gulp.src(['bower_components/angular/angular.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap.js',
      'bower_components/angular-ui-router/release/angular-ui-router.min.js',
      'bower_components/ng-maps/dist/ng-maps.js',
      'bower_components/angular-slider/dist/slider.js'],
      {base: 'bower_components/'})
    .pipe(concat('dependencies.js'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('dependencies.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/build'));
});

// Concat and Minify CSS dependencies
gulp.task('css-dependencies', function() {
  return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
      'bower_components/angular-slider/dist/slider.css'],
      {base: 'bower_components/'})
    .pipe(concat('dependencies.css'))
    .pipe(gulp.dest('app/build'));
});

// Default Task
gulp.task('default', ['lint', 'css', 'scripts']);

// Dependencies takes a while so don't run that by default
gulp.task('dependencies', ['script-dependencies', 'css-dependencies']);
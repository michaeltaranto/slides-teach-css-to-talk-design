'use strict';

var pkg = require('./package.json'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  connect = require('gulp-connect'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  jade = require('gulp-jade'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  del = require('del'),
  through = require('through'),
  opn = require('opn'),
  ghpages = require('gh-pages'),
  path = require('path'),
  isDist = process.argv.indexOf('serve') === -1;

gulp.task('js', ['clean:js'], function() {
  return gulp.src('src/scripts/main.js')
    .pipe(isDist ? through() : plumber())
    .pipe(browserify({ transform: ['debowerify'], debug: !isDist }))
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(connect.reload());
});

gulp.task('html', ['clean:html'], function() {
  return gulp.src('src/index.jade')
    .pipe(isDist ? through() : plumber())
    .pipe(jade({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({
      // Allow CSS to be imported from node_modules and bower_components
      'include css': true,
      'paths': ['./node_modules', './bower_components']
    }))
    .pipe(autoprefixer('last 2 versions', { map: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(connect.reload());
});

gulp.task('images', ['clean:images'], function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(connect.reload());
});

gulp.task('fonts', ['clean:fonts'], function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(connect.reload());
});

gulp.task('examples', ['clean:examples'], function() {
  return gulp.src('examples/**/*')
    .pipe(gulp.dest('dist/examples'))
    .pipe(connect.reload());
});

gulp.task('clean', function(done) {
  del('dist', done);
});

gulp.task('clean:html', function(done) {
  del('dist/index.html', done);
});

gulp.task('clean:js', function(done) {
  del('dist/build/build.js', done);
});

gulp.task('clean:css', function(done) {
  del('dist/build/build.css', done);
});

gulp.task('clean:examples', function(done) {
  del('dist/examples', done);
});

gulp.task('clean:images', function(done) {
  del('dist/images', done);
});

gulp.task('clean:fonts', function(done) {
  del('dist/fonts', done);
});

gulp.task('connect', ['build'], function() {
  connect.server({
    root: 'dist',
    livereload: true,
    port: 8888
  });
});

gulp.task('open', ['connect'], function (done) {
  opn('http://localhost:8888', done);
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.jade', ['html']);
  gulp.watch('src/styles/**/*.styl', ['css']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/fonts/**/*', ['fonts']);
  gulp.watch([
    'src/scripts/**/*.js',
    'bespoke-theme-*/dist/*.js' // Allow themes to be developed in parallel
  ], ['js']);
});

gulp.task('deploy', ['build'], function(done) {
  ghpages.publish(path.join(__dirname, 'dist'), { logger: gutil.log }, done);
});

gulp.task('build', ['js', 'html', 'css', 'images', 'fonts', 'examples']);

gulp.task('serve', ['open', 'watch']);

gulp.task('default', ['build']);

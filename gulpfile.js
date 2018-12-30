var gulp = require('gulp');

var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var postCss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');

var sourcemaps = require('gulp-sourcemaps');
var child = require('child_process');
var gulpUtil = require('gulp-util');
var shell = require('gulp-shell');

var minify = composer(uglifyjs, console);

let assetsBaseOutput = 'site/assets';

var minify = composer(uglifyjs, console);

gulp.task('site', shell.task('eleventy'));

gulp.task('css', function() {
  return gulp.src('src/less/[^_]*.less')
    .pipe(less())
    .pipe(postCss([ autoprefixer() ]))
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest(assetsBaseOutput + '/style/'));
});

gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(minify())
      .on('error', err => console.log('uglify error', err))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(assetsBaseOutput + '/scripts/'));
});

gulp.task('vega', function() {
  return gulp.src('src/vg/**/*.json')
    .pipe(gulp.dest(assetsBaseOutput + '/vega/'));
});

gulp.task('html-partials', function () {
  return gulp.src('src/html-partials/**/*.html')
    .pipe(gulp.dest(assetsBaseOutput + '/html-partials/'));
});

gulp.task('redirect-rules', function () {
  return gulp.src('src/_redirects')
    .pipe(gulp.dest('site'));
});

let all = () => gulp.series('site', gulp.parallel('css', 'js', 'vega', 'html-partials', 'redirect-rules'));

gulp.task('default', all());

gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', all());
  gulp.watch('src/less/**/*.less', all());
  gulp.watch('src/vg/**/*.json', all());
  gulp.watch('src/html-patials/**/*.html', all());
  gulp.watch(['_config.yml', 'src/eleventy/**/*'], all());
});


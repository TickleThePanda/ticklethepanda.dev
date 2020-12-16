const gulp = require('gulp');

const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');

const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');

const sourcemaps = require('gulp-sourcemaps');
const gulpUtil = require('gulp-util');
const shell = require('gulp-shell');

const minify = composer(uglifyjs, console);

const assetsBaseOutput = 'site/assets';

gulp.task('site', shell.task('eleventy'));

gulp.task('css', function() {
  return gulp.src('src/css/[^_]*.less')
    .pipe(less())
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
  gulp.watch('src/js/**/*.js', gulp.parallel('js'));
  gulp.watch('src/css/**/*.less', gulp.parallel('css'));
  gulp.watch('src/vg/**/*.json', gulp.parallel('vega'));
  gulp.watch('src/html-partials/**/*.html', gulp.parallel('html-partials'));
  gulp.watch('.eleventy.js', gulp.parallel('site'));
  gulp.watch('src/views/**/*', gulp.parallel('site'));
});

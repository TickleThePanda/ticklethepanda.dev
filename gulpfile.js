var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var sourcemaps = require('gulp-sourcemaps');

var minify = composer(uglifyjs, console);

let assetsBaseOutput = 'assets';

gulp.task('css', function() {
  return gulp.src('_less/[^_]*.less')
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest(assetsBaseOutput + '/style/'));
});

gulp.task('js', function() {
  return gulp.src('_js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(minify())
      .on('error', err => console.log('uglify error', err))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(assetsBaseOutput + '/scripts/'));
});

gulp.task('vega', function() {
  return gulp.src('_vg/**/*.json')
    .pipe(gulp.dest(assetsBaseOutput + '/vega/'));
});

gulp.task('images', function () {
  gulp.src('_images/**/*')
    .pipe(gulp.dest(assetsBaseOutput + '/images/'));
});

gulp.task('default', [ 'css', 'js', 'vega', 'images' ]);

gulp.task('watch', function() {
  gulp.watch('_js/**/*.js', ['js']);
  gulp.watch('_less/**/*.less', ['css']);
  gulp.watch('_vg/**/*.json', ['vega']);
  gulp.watch('_images/**/*', ['images']);
});

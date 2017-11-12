var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var sourcemaps = require('gulp-sourcemaps');

var minify = composer(uglifyjs, console);

gulp.task('css', function() {
  return gulp.src('_less/[^_]*.less')
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest('public/style/'));
});

gulp.task('js', function() {
  return gulp.src('_js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(minify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('public/scripts/'));
});

gulp.task('vega', function() {
  return gulp.src('_vg/**/*.json')
    .pipe(gulp.dest('public/vega/'));
});

gulp.task('default', [ 'css', 'js', 'vega' ]);

gulp.task('watch', function() {
  gulp.watch('_js/**/*.js', ['js']);
  gulp.watch('_less/**/*.less', ['css']);
  gulp.watch('_vg/**/*.json', ['vega']);
});

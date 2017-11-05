var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('css', function() {
  return gulp.src('_less/[^_]*.less')
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest('public/style/'));
});

gulp.task('js', function() {
  return gulp.src('_js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(uglify())
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

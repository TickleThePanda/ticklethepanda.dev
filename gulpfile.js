var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');

gulp.task('css', function() {
  return gulp.src('_less/*.less')
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest('public/style/'));
});

gulp.task('js', function() {
  return gulp.src('_js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('public/scripts/'));
});

gulp.task('default', [ 'css', 'js' ]);


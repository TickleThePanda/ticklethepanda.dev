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

var minify = composer(uglifyjs, console);

let assetsBaseOutput = 'site/assets';

var minify = composer(uglifyjs, console);

gulp.task('jekyll', function (done) {
  const jekyll = child.spawn('jekyll', ['build', '--incremental']);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gulpUtil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);

  jekyll.on('close', (code) => {
    done()
  });
});

gulp.task('css', ['jekyll'], function() {
  return gulp.src('_less/[^_]*.less')
    .pipe(less())
    .pipe(postCss([ autoprefixer() ]))
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest(assetsBaseOutput + '/style/'));
});

gulp.task('js', ['jekyll'], function() {
  return gulp.src('_js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(minify())
      .on('error', err => console.log('uglify error', err))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(assetsBaseOutput + '/scripts/'));
});

gulp.task('vega', ['jekyll'], function() {
  return gulp.src('_vg/**/*.json')
    .pipe(gulp.dest(assetsBaseOutput + '/vega/'));
});

gulp.task('images', ['jekyll'], function () {
  gulp.src('_images/**/*')
    .pipe(gulp.dest(assetsBaseOutput + '/images/'));
});

gulp.task('html-partials', ['jekyll'], function () {
  gulp.src('_html-partials/**/*.html')
    .pipe(gulp.dest(assetsBaseOutput + '/html-partials/'));
});

gulp.task('redirect-rules', ['jekyll'], function () {
  gulp.src('_redirect')
    .pipe(gulp.dest('site'));
});

gulp.task('default', ['jekyll', 'css', 'js', 'vega', 'images', 'html-partials', 'redirect-rules']);

gulp.task('watch', function() {
  gulp.watch('_js/**/*.js', ['js']);
  gulp.watch('_less/**/*.less', ['css']);
  gulp.watch('_vg/**/*.json', ['vega']);
  gulp.watch('_html-partials/**/*.html', ['html-partials']);
  gulp.watch('_images/**/*', ['images']);
  gulp.watch(['_config.yml', '_jekyll/**/*'], ['jekyll']);
});

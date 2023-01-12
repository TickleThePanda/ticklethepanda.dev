const gulp = require("gulp");

const less = require("gulp-less");
const cleanCss = require("gulp-clean-css");

const uglifyjs = require("uglify-es");
const composer = require("gulp-uglify/composer");

const sourcemaps = require("gulp-sourcemaps");
const gulpUtil = require("gulp-util");
const shell = require("gulp-shell");

const minify = composer(uglifyjs, console);

const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const assetsBaseOutput = "site/assets";

gulp.task("site", shell.task("eleventy"));

gulp.task("less", function () {
  return gulp
    .src("src/css/[^_]*.less")
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest(assetsBaseOutput + "/style/"));
});

gulp.task("raw-css", function () {
  return gulp
    .src("src/css/[^_]*.css")
    .pipe(gulp.dest(assetsBaseOutput + "/style/"));
});

const css = () => gulp.parallel("less", "raw-css");

gulp.task("js", function () {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(minify())
    .on("error", (err) => console.log("uglify error", err))
    .pipe(sourcemaps.write("maps"))
    .pipe(gulp.dest(assetsBaseOutput + "/scripts/"));
});

gulp.task("fonts", function () {
  return gulp.src("src/fonts/*").pipe(gulp.dest(assetsBaseOutput + "/fonts/"));
});

gulp.task("vega", function () {
  return gulp
    .src("src/vg/**/*.json")
    .pipe(gulp.dest(assetsBaseOutput + "/vega/"));
});

gulp.task("redirect-rules", function () {
  return gulp.src("src/_redirects").pipe(gulp.dest("site"));
});

gulp.task("images", function () {
  return gulp
    .src("src/images/**/*")
    .pipe(gulp.dest(assetsBaseOutput + "/images/"));
});

let all = () =>
  gulp.series(
    "site",
    gulp.parallel(css(), "js", "vega", "redirect-rules", "fonts", "images")
  );

gulp.task("default", all());

gulp.task("watch", function () {
  gulp.watch("src/js/**/*.{js,ts}", gulp.parallel("js"));
  gulp.watch("src/css/**/*.{less,css}", css());
  gulp.watch("src/vg/**/*.json", gulp.parallel("vega"));
  gulp.watch("src/fonts/*", gulp.parallel("fonts"));
  gulp.watch(".eleventy.js", gulp.parallel("site"));
  gulp.watch("src/views/**/*", gulp.parallel("site"));
  gulp.watch("src/images/**/*", gulp.parallel("images"));
});

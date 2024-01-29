const gulp = require("gulp");

const less = require("gulp-less");
const cleanCss = require("gulp-clean-css");

const shell = require("gulp-shell");

const ts = require("typescript");
const tsify = require("tsify");
const esbuild = require("esbuild");

const rename = require("gulp-rename");
const { glob } = require("glob");
const source = require("vinyl-source-stream");
const es = require("event-stream");

const assetsBaseOutput = "site/assets";

gulp.task("site", shell.task("eleventy"));

gulp.task("css", function () {
  return gulp
    .src("src/css/[^_]*.less")
    .pipe(less())
    .pipe(cleanCss({ skipAggressiveMerging: true }))
    .pipe(gulp.dest(assetsBaseOutput + "/style/"));
});

gulp.task("js", async function () {

  return await esbuild.build({
    entryPoints: await glob("src/js/*.ts"),
    format: "esm",
    loader: {
      '.ts': 'ts'
    },
    bundle: true,
    splitting: true,
    treeShaking: true,
    minify: true,
    sourcemap: true,
    outdir: assetsBaseOutput + "/scripts"
  });
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
    gulp.parallel("css", "js", "vega", "redirect-rules", "fonts", "images")
  );

gulp.task("default", all());

gulp.task("watch", function () {
  gulp.watch("src/js/**/*.{js,ts}", gulp.parallel("js"));
  gulp.watch("src/css/**/*.{js,less}", gulp.parallel("css"));
  gulp.watch("src/vg/**/*.json", gulp.parallel("vega"));
  gulp.watch("src/fonts/*", gulp.parallel("fonts"));
  gulp.watch(".eleventy.js", gulp.parallel("site"));
  gulp.watch("src/views/**/*", gulp.parallel("site"));
  gulp.watch("src/images/**/*", gulp.parallel("images"));
});

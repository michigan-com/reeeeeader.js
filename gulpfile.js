var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var less = require('gulp-less');
var jade = require('gulp-jade');
var autoprefixer = require('gulp-autoprefixer');
var insert = require('gulp-insert');

gulp.task('default', ['jade', 'browserify', 'less']);

gulp.task('jade', function() {
  return gulp.src('./views/*.jade')
    .pipe(jade({ client: true }))
    .pipe(insert.prepend("var jade = require('jade/runtime');\n\n"))
    .pipe(insert.append(";\n\nmodule.exports = template;"))
    .pipe(gulp.dest('./interim/views/'));
});

gulp.task('browserify', function() {
  browserify('./src/index.js', {
      debug: true,
    })
    .transform(babelify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(rename('reeeeeader.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('less', function() {
  return gulp.src('./styles/styles.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['default'], function() {
  gulp.watch('./src/**/*.js', ['browserify']);
  gulp.watch('./styles/*.less', ['less']);
  gulp.watch('./views/*.jade', ['jade', 'browserify']);
});

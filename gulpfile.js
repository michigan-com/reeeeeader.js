var gulp = require('gulp');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var less = require('gulp-less');
var jade = require('gulp-jade');
var autoprefixer = require('gulp-autoprefixer');
var insert = require('gulp-insert');

gulp.task('default', ['jade', 'babel', 'less']);

gulp.task('jade', function() {
  return gulp.src('./views/*.jade')
    .pipe(jade({ client: true }))
    .pipe(insert.prepend("var jade = require('jade/runtime');\n\n"))
    .pipe(insert.append(";\n\nmodule.exports = template;"))
    .pipe(gulp.dest('./lib/compiled-views/'));
});

gulp.task('babel', function() {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./lib'));
});

gulp.task('less', function() {
  return gulp.src('./styles/styles.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['default'], function() {
  gulp.watch('./src/**/*.js', ['babel']);
  gulp.watch('./styles/*.less', ['less']);
  gulp.watch('./views/*.jade', ['jade', 'browserify']);
});

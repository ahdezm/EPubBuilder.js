/* jshint node:true */
var gulp = require("gulp");

var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var useref = require("gulp-useref");

var dotify = require("gulp-dotify");
var defineModule = require("gulp-define-module");

gulp.task("compress",function(){
	return gulp.src("EPubBuilder.js")
		.pipe(uglify())
		.pipe(rename("EPubBuilder.min.js"))
		.pipe(gulp.dest("./"));
});

gulp.task("build",["dot"],function(){
	return gulp.src("index.html")
		.pipe(useref.assets())
		.pipe(uglify())
		.pipe(gulp.dest("./"));
});

gulp.task("dot",function(){
	return gulp.src("templates/*")
		.pipe(dotify({
			root:"templates",
			dictionary:"Views",
			
		}))
		.pipe(concat("templates.js"))
		.pipe(defineModule("hybrid",{
			global:"Views",
			wrapper:"(function(){var Views = {};<%= contents %> return Views;})()"
		}))
		//.pipe(uglify())
		.pipe(gulp.dest("./"));
});
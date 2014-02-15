/* jshint node:true */
var gulp = require("gulp");
var gutil = require("gulp-util");

var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var concat = require("gulp-concat");

var hbs = require("gulp-handlebars");
var declare = require("gulp-declare");

var path = require("path");

gulp.task("compress",function(){
	gulp.src("EPubBuilder.js")
		.pipe(uglify())
		.pipe(rename("EPubBuilder.min.js"))
		.pipe(gulp.dest("./"));
});

gulp.task("hbs",function(){
	gulp.src("templates/*")
		.pipe(hbs({
			outputType:"bare",
			wrapped:true
		}))
		.pipe(declare({
			namespace:"Book.templates",
			processName:function(filePath){
				return path.basename(filePath,path.extname(filePath));
			}
		}))
		.pipe(concat("templates.js"))
		//.pipe(uglify())
		.pipe(gulp.dest("./"));
});
/* jshint node:true */
var gulp = require("gulp");

var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var useref = require("gulp-useref");

var hbs = require("gulp-handlebars");
var declare = require("gulp-declare");

var path = require("path");

gulp.task("compress",function(){
	gulp.src("EPubBuilder.js")
		.pipe(uglify())
		.pipe(rename("EPubBuilder.min.js"))
		.pipe(gulp.dest("./"));
});

gulp.task("build",function(){
	gulp.src("index.html")
		.pipe(useref.assets())
		.pipe(uglify())
		.pipe(gulp.dest("./"));
});

gulp.task("hbs",function(){
	gulp.src("templates/*")
		.pipe(hbs({
			outputType:"bare",
			wrapped:true,
			compilerOprions:{
				knownOnly:true
			}
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
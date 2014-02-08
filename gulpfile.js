/* jshint node:true */
var gulp = require("gulp");
var gutil = require("gulp-util");

var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var concat = require("gulp-concat");

var hbs = require("gulp-handlebars");
var declare = require("gulp-declare");

var path = require("path");
var http = require("http");
var fs = require("fs");

gulp.task("compress",function(){
	gulp.src("EPubBuilder.js")
		.pipe(uglify())
		.pipe(rename("EPubBuilder.min.js"))
		.pipe(gulp.dest("./"));
});

gulp.task("hbs",function(){
	gulp.src("templates/*")
		// Add minifyed xml using pretty data
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

gulp.task("timing",function(done){
	var server = http.createServer(function(req,res){
		var file = fs.createWriteStream("timing.txt",{
			flags:"a",
			encoding:"utf-8"
		});

		req.pipe(file,{
			end:false
		});

		req.on("end",function(){
			file.end("\n");

			res.setHeader("Access-Control-Allow-Origin","*");
			res.end();
		});
	})

	server.on("close",done);

	server.listen(1338);
});
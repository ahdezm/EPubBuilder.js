/* jshint node:true */
var gulp = require("gulp");
var gutil = require("gulp-util");

var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var es = require("event-stream");

var hbs = require("gulp-handlebars");
var declare = require("gulp-declare");

var path = require("path");
var http = require("http");
var fs = require("fs");

var xmlEncoding = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

gulp.task("compress",function(){
	gulp.src("EPubBuilder.js")
		.pipe(uglify())
		.pipe(rename("EPubBuilder.min.js"))
		.pipe(gulp.dest("./"));
});

gulp.task("hbs",function(){
	gulp.src("templates/*")
		.pipe(es.map(function(file,done){
			// TODO: Check for xml
			if(gutil.isBuffer(file.contents) && file.contents.toString("utf8",0,xmlEncoding.length) === xmlEncoding){
				file.contents = new Buffer(file.contents.toString().replace(/>\s{0,}</g,"><"));
			} else if(gutil.isStream(file.contents)) {
				var isXml = false;
				file.contents = es.pipeline(
					file.contents,
					es.split(),
					es.mapSync(function(data){
						if(!isXml && data === xmlEncoding){
							isXml = true;
						} else {
							return data;
						}
						done(null,file);
					}),
					es.replace(/>\s{0,}</g,"><")
				);
			}
			done(null,file);
		}))
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
	var file = fs.createWriteStream("timing.txt",{
		flags:"a",
		encoding:"utf-8"
	});

	var i = 0;
	var server = http.createServer(function(req,res){
		req.pipe(file,{
			end:false
		});

		req.on("end",function(){
			file.write("\n");

			res.setHeader("Access-Control-Allow-Origin","*");
			if(i < 100){
				res.write("true");
			} else {
				done();
			}
			res.end();
		});
		process.stdout.write("\r"+i+"/100");
		i++;
	});

	server.listen(1338);
});
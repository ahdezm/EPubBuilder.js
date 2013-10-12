module.exports = function(grunt){
	grunt.registerTask("compileJSON","Compile template.json file",function(){
		grunt.config.requires(['compileJSON','path'],['compileJSON','dest']);

		var path = grunt.config('compileJSON.path'),
			dest = grunt.config('compileJSON.dest'),
			result = {};
		
		if(!grunt.file.exists(path)){
			return;
		}

		grunt.file.recurse(path,function(abspath,rootdir,subdir,filename){
			filename = filename.slice(0,(filename.indexOf(".") > 0)?filename.indexOf("."):filename.length-1);
			result[filename] = grunt.file.read(abspath);
		});

		grunt.file.write(dest,JSON.stringify(result));
	});
};
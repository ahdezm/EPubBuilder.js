var pd = require('pretty-data').pd;
var Path = require('path');

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
			var ext = Path.extname(filename);
			var name = Path.basename(filename,ext);
			var data = grunt.file.read(abspath);

			// Consider using replace to strip whitespace.
			if(['.xhtml','.opf','.ncx'].indexOf(ext) > 0){
				data = pd.xmlmin(data);
			} else if(ext === '.css'){
				data = pd.cssmin(data);
			}

			result[name] = grunt.file.read(abspath);
		});

		grunt.file.write(dest,pd.jsonmin(JSON.stringify(result)));
	});
};
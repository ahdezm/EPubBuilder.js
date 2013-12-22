module.exports = function(grunt) {
	var path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		useminPrepare: {
			html: 'index.html'
		},
		watch:{
			files:["libs/**",'*.js','*.html'],
			options:{
				livereload:35721
			}
		},
		connect:{
			server:{
				
			}
		},
		uglify:{
			dist:{
				files:{
					'EPubBuilder.min.js':['EPubBuilder.js']
				}
			},
			hbs:{
				files:{
					'templates.js':'templates.js'
				}
			}
		},
		handlebars:{
			all:{
				options:{
					processName:function(filePath){
						return path.basename(filePath,path.extname(filePath))
					},
					namespace:'Book.templates',
				},
				files:{
					'templates.js':['templates/*']
				}
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('server', ['connect','watch']);
	grunt.registerTask('template', ['handlebars','uglify:hbs']);
	grunt.registerTask('default', []);

};
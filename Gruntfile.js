module.exports = function(grunt) {

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
				options:{
				}
			}
		},
		uglify:{
			dist:{
				files:{
					'EPubBuilder.min.js':['EPubBuilder.js']
				}
			}
		},
		compileJSON: {
			path:'templates/',
			dest:'template.json'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.loadTasks('grunt-tasks');

	grunt.registerTask('server', ['connect','watch']);
	grunt.registerTask('default', []);

};
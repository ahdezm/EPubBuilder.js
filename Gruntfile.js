module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		useminPrepare: {
			html: 'index.html'
		},
		watch:{
			files:["libs/**",'*.js','*.html'],
			options:{
				livereload:true
			}
		},
		connect:{
			server:{
				options:{
					livereload:true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('build', ['useminPrepare','concat','uglify']);
	grunt.registerTask('server', ['connect','watch']);
	grunt.registerTask('default', []);

};
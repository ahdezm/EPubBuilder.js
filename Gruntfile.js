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
		},
		bump:{
			options:{
				files: ['package.json','bower.json'],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['-a'],
				createTag:false,
				push: true,
				pushTo: 'origin',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
			},
			major:{
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
			}
		}
	});

	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-bump');

	grunt.renameTask("bump",'release');

	grunt.registerTask('build', ['useminPrepare','concat','uglify']);
	grunt.registerTask('server', ['connect','watch']);
	grunt.registerTask('default', []);

};
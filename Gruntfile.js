module.exports = function(grunt) {
	var fs = require('fs'),
		chalk = require('chalk'),
		PACK = grunt.file.readJSON('package.json'),
		uniqid = function () {
			var md5 = require('md5');
			result = md5((new Date()).getTime()).toString();
			grunt.verbose.writeln("Generate hash: " + chalk.cyan(result) + " >>> OK");
			return result;
		};
	
	String.prototype.hashCode = function() {
		var hash = 0, i, chr;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var optionsPug = {
			doctype: 'html',
			client: false,
			pretty: "",//'\t',
			separator:  "",//'\n',
			data: function(dest, src) {
				return {
					"hash": uniqid(),
				}
			}
		};
	grunt.initConfig({
		globalConfig : {},
		pkg : PACK,
		concat: {
			options: {
				separator: "\n",
			},
			emoji: {
				src: [
					'src/js/emoji.js'
				],
				dest: 'docs/js/emoji.js'
			},
		},
		uglify: {
			options: {
				sourceMap: false,
				compress: {
					drop_console: false
	  			},
	  			output: {
	  				ascii_only: true
	  			}
			},
			app: {
				files: [
					{
						expand: true,
						flatten : true,
						src: [
							'docs/js/emoji.js'
						],
						dest: 'docs/js/',
						filter: 'isFile',
						rename: function (dst, src) {
							return dst + '/' + src.replace('.js', '.min.js');
						}
					}
				]
			},
		},
		less: {
			css: {
				options : {
					compress: false,
					ieCompat: false,
					plugins: [],
					modifyVars: {
						'hash': '\'' + uniqid() + '\'',
					}
				},
				files : {
					'docs/css/emoji.css': [
						'src/less/emoji.less'
					],
					'docs/css/main.css': [
						'src/less/main.less'
					],
				}
			},
		},
		autoprefixer:{
			options: {
				browsers: [
					"last 4 version"
				],
				cascade: true
			},
			css: {
				files: {
					'docs/css/emoji.css' : [
						'docs/css/emoji.css'
					],
					'docs/css/main.css' : [
						'docs/css/main.css'
					],
				}
			},
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			minify: {
				files: {
					'docs/css/emoji.min.css' : [
						'docs/css/emoji.css'
					],
					'docs/css/main.min.css' : [
						'docs/css/main.css'
					],
				}
			},
		},
		pug: {
			serv: {
				options: optionsPug,
				files: [
					{
						expand: true,
						cwd: __dirname + '/src/pug/',
						src: [ '*.pug' ],
						dest: __dirname + '/docs/',
						ext: '.html'
					},
				]
			},
		},
	});
	grunt.registerTask('default',	[
		'concat',
		'uglify',
		'less',
		'autoprefixer',
		'cssmin',
		'pug'
	]);
};

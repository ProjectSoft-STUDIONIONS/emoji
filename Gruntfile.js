module.exports = function(grunt) {
	var fs = require('fs'),
	path = require('path'),
		chalk = require('chalk'),
		PACK = grunt.file.readJSON('package.json'),
		uniqid = function (file = "") {
			var md5 = require('md5');
			let result = "";
			if(!file){
				let time = (new Date()).getTime();
				result = md5(time).toString();
			}else{
				file = path.normalize(path.join(__dirname, file));
				let buff = fs.readFileSync(file, {
					encoding: "utf8"
				}).toString();
				result = md5(buff).toString();
			}
			return result;
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
						'hash': '\'' + uniqid('src/less/main.less') + '\'',
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
				options: {
					doctype: 'html',
					client: false,
					pretty: "",//'\t',
					separator:  "",//'\n',
					data: function(dest, src) {
						return {
							"hash_css": uniqid('docs/css/main.min.css'),
							'hash_css_emoji': uniqid('docs/css/emoji.min.css'),
							'hash_js': uniqid('docs/js/emoji.min.js'),
						}
					}
				},
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
		copy: {
			fonts: {
				expand: true,
				cwd: 'src/fonts',
				src: [
					'**'
				],
				dest: 'docs/fonts/',
			},
		}
	});
	grunt.registerTask('default',	[
		'concat',
		'uglify',
		'less',
		'autoprefixer',
		'cssmin',
		'pug',
		'copy'
	]);
};

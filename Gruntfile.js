module.exports = function(grunt) {
	var fs = require('fs'),
	path = require('path'),
		chalk = require('chalk'),
		hash = function (...args) {
			var md5 = require('md5');
			let result = "",
				arr = [];
			if(!args.length){
				let time = (new Date()).getTime();
				arr.push("Not arguments");
				result = md5(time).toString();
			}else{
				let text = "";
				for(let index in args){
					let file = args[index];
					file = path.normalize(path.join(__dirname, file));
					try{
						let buff = fs.readFileSync(file, {
							encoding: "utf8"
						}).toString();
						text += buff;
						arr.push(file);
					}catch(e){
						// Ничего не делаем
						arr.push("Not found");
					}
				}
				result = md5(text).toString();
			}
			arr.push(result);
			grunt.log.oklns([chalk.cyan("Generate hash:") + "\n" + chalk.yellow(arr.join("\n"))]);
			return result;
		};

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		globalConfig : {},
		pkg : {},
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
						'hash': '\'' + hash('src/less/main.less', 'src/less/emoji.less') + '\'',
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
							"hash_css": hash('docs/css/main.min.css'),
							'hash_css_emoji': hash('docs/css/emoji.min.css'),
							'hash_js': hash('docs/js/emoji.min.js'),
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

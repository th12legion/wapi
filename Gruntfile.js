module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
		  development: {
				options: {
					expand: true
				},
				files: {
				  'css/system.css': ['src/less/source.less']
				}
			}
		 },
	    concat: {// Настройки для конкатенации
			 concat_config: {
				files: {
					// WAPI
					'out/wapi.js': ['src/js/jquery.min.js','src/js/wapi_polyfills.js','src/js/wapi.js','src/js/wapi_mouse.js',
											'src/js/wapi_gui.js','src/js/wapi_file.js','src/js/wapi_demon.js',
											'src/js/wapi_app.js','src/js/wapi_way.js'],
					'out/wapi.css': ['src/css/wapi.css','src/css/wapi_window.css','src/css/wapi_animate.css',
											  'src/css/wapi_tab.css','src/css/wapi_box.css','src/css/wapi_gmenu.css',
											  'src/css/wapi_btn.css']
				}
			 }
	    },
	    uglify: {// Настройки для минификации js
	    	options: {
	    		stripBanners: true,
	    		banner: '/* <%= pkg.name %> - v <%= pkg.version %> */\n' //комментарий который будет в минифицированном файле.
	    	},
 
	    	min_config: {
				files: {
					'out/wapi.min.js': ['out/wapi.js']
				}
	    	}
	    },
		watch: { //Настройки для плагина слежки за изминениями файлов
			scripts: {
		    	files: ['src/js/*.js'],  //следить за всеми js файлами в папке src
		    	tasks: ['concat', 'uglify']  //при их изменении запускать следующие задачи
	    	},
			iscripts: {
		    	files: ['src/ijs/*.js'],  //следить за всеми js файлами в папке src
		    	tasks: ['concat', 'uglify']  //при их изменении запускать следующие задачи
	    	},
			css: {
		    	files: ['src/css/*.css'],  //следить за всеми css файлами в папке src
		    	tasks: ['concat']  //при их изменении запускать следующие задачи
	    	},
			icss: {
		    	files: ['src/css/*.css'],  //следить за всеми css файлами в папке src
		    	tasks: ['concat']  //при их изменении запускать следующие задачи
	    	},
			less: {
		    	files: ['src/less/*.less'],  //следить за всеми less файлами в папке src
		    	tasks: ['less']  //при их изменении запускать следующие задачи
	    	}
	    }
	 
	});
	 
	//погружаем все необходимые модули
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	 
	//забиваем в задачу по умолчению все наши задачи
	grunt.registerTask('default', ['less','concat','uglify','watch']);
};
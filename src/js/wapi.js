/**
*	Класс ВебАпи
*
*	Основнай класс, который объеденяет все ВебАпи воедино.
*
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window){

	var system_translations = {
		'no_translation':'Нет перевода!',
		'error_filling_the_fields':'Одно или несколько полей заполнины не верно!',
		'the_field_name_is_invalid':'Поле %name% заполнено неверно!'
	};

	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {WApi}
	*
	*/
	function WApi(){
		if (!(this instanceof WApi)){return new WApi()};
		window.wjq = $.noConflict(true);
		
		this.config = {
			"ajax_link":"interactions.php",// Настройка используется в модуле WApi.File. Файл взаимодействия
			"ajax_method":"actajax",// Настройка используется в модуле WApi.File. Основной метод взаимодействия
			"load_path":this.get_path('wapi.js'),// Хост загрузки WApi
			"edge_jq":"inside",// Доступность внутреннего JQuery .. inside,system
			"show_func":null,// Функция для перехвата запросов на показ сообщений от WApi
			"error_func":null,// Функция для перехвата запросов на показ ошибок от WApi
			
			"translations":system_translations,// Функция для перехвата запросов на показ ошибок от WApi
			
			"dev_alias":"th12legion" // Автор всей этой ВебАпи
		};
		
		try{// Пытаемся прогрузить пользовательские настройки
			for(var key in WApi_config){
				if(key=="translations"){
					for (var tkey in WApi_config[key]){
						this.config[key][tkey] = WApi_config[key][tkey];
					}
					continue;
				}
				this.config[key] = WApi_config[key];
			}
		}catch(e){}
		
		if (this.config['edge_jq']=="system"){// Выгружаем внутренний JQuery для доступа из вне.
			window.$ = window.wjq;
		}
	}
	
	/**
	*	Функция для взятия системных переводов
	*
	*	@param {String} force_template - Темплейт для перевода
	*
	*	@return {String} - Перевод
	*
	*/
	WApi.prototype.translate = function(force_template,data){
		var translation = "";
		var match_flag = true,
			match = null;
			
		var template = force_template;
		if (typeof data != "undefined"){
			var insert = data;
		}
		
		if (this.config['translations'][template]==undefined){
			translation = '['+template+' - '+this.config['translations']['no_translation']+']';
		}else{
			translation = this.config['translations'][template];
		}
		
		while(match_flag==true){
			if(match = /%(.*?)%/.exec(translation)){
				translation = translation.replace(match[0],((insert)?insert[match[1]]:""));
				match_flag = true;
			}else{
				match_flag = false;
			}
		}
		
		return translation;
	}
	
	/**
	*	Функция для определение адреса подключения файла
	*
	*	@param {String} name - имя файла
	*
	*	@return {String} - Путь подключения
	*
	*/
	WApi.prototype.get_path = function(name){
		var html = document.getElementsByTagName('html')[0].innerHTML,
			sr = new RegExp('<scr'+'ipt[^>]+?src\s*=\s*["\']?([^>]+?/)'+name+'[^>]*>.?</scr'+'ipt>','i'),
			match_rez = html.match(sr);
		if (match_rez) {
			if (match_rez[1].match(/^((https?|file)\:\/{2,}|\w:[\\])/)) return match_rez[1];
			if (match_rez[1].indexOf("/")==0) return match_rez[1];
			b = document.getElementsByTagName('base');
			if (b[0] && b[0].href) return b[0].href+match_rez[1];
			return (document.location.href.match(/(.*[\/\\])/)[0]+match_rez[1]).replace(/^\/+/,"");
		}
		return null;
	}
	
	/**
	*	Функция для определение размера объекта
	*
	*	@param {Object} obj - Объект для которого надо посчитать размер
	*
	*	@return {Int} - Размер объекта
	*
	*/
	WApi.prototype.obj_length = function(obj){
		if(typeof obj!="object"){return 0;}
		var counter = 0;
		for (var key in obj) {
			counter++;
		}
		return counter;
	}
	
	/**
	*	Функция для генирации уникальной сигнатуры
	*
	*	@param {String} str - Строка в виде xxxx-xxxx-xxxx
	*
	*	@return {String} - Возвращаем уникальную строку
	*
	*/
	WApi.prototype.create_uniq_signature = function(str){
		return str.replace(/[x]/g, function(c) {
			var r = Math.random() * 16 | 0;
			return (c == 'x' ? r : (r & 0x3 | 0x8 )).toString(16);
		});
	}
	
	/**
	*	Функция для запуска общесайтового лоадера
	*
	*	@param {String} mode - Режим лоадера включения/отключения
	*
	*	@return {Boolean} - статус лоадера
	*
	*/
	WApi.prototype.loader = function(mode){
		var mode = mode || "off";
		if (mode=="on"){
			this.Gui.LoaderX.create();
			wjq('.wapi_loader_x').css('display','block');
		}else{
			wjq('.wapi_loader_x').css('display','none');
			this.Gui.LoaderX.remove();
		}
	}
	
	/**
	*	Функция для показа сообщений на станице. Используется ВебАпи окно и тень.
	*
	*	@param {Object} storage - Объект с информацией,которую выводим
	*
	*	@return {this} - Возвращаем объект WApi
	*
	*/
	WApi.prototype.show = function (storage) {
		var storage = storage || {};
		storage.title = storage.title || '';
		storage.content = storage.content || '';
		
		if(this.config['show_func']!=null){
			this.config['show_func'](storage);
			return this;
		}
		
		this.shadow("on");
		
		var WIN = this.Gui.WinX,
			WIN_ID = WIN.create({
				'parent':storage.parent || 'body',
				'width':storage.width || "half",
				'height':storage.height || "half",
				'x':storage.x || 'center',
				'y':storage.y || 'center',
				'title':(storage.title || ''),
				'close_cb':function(ID){this.shadow("off");}.bind(this)
			});
			
		WIN.content(WIN_ID,'<div style="padding:10px;">'+(storage.content || "")+'</div>');
		
		return this;
	}
	
	/**
	*	Функция для показа ошибок на станице. Используется ВебАпи окно и тень.
	*
	*	@param {Object} storage - Объект с информацией,которую выводим
	*
	*	@return {this} - Возвращаем объект WApi
	*
	*/
	WApi.prototype.error = function (storage) {
		var storage = storage || {};
		storage.title = storage.title || '';
		storage.content = storage.content || '';
		
		if(this.config['error_func']!=null){
			this.config['error_func'](storage);
			return this;
		}
		
		this.shadow("on");
		
		var WIN = this.Gui.WinX,
			WIN_ID = WIN.create({
				'parent':storage.parent || 'body',
				'width':storage.width || "half",
				'height':storage.height || "half",
				'x':storage.x || 'center',
				'y':storage.y || 'center',
				'title':(storage.title || ''),
				'close_cb':function(ID){this.shadow("off");}.bind(this)
			});
			
		WIN.content(WIN_ID,'<div style="padding:10px;">'+(storage.content || "")+'</div>');
		
		return this;
	}
	
	/**
	*	Функция для включения/отключения общестраничной тени
	*
	*	@param {String} mode - Режим тени on || off 
	*
	*	@return {this} - Возвращаем объект WApi
	*
	*/
	WApi.prototype.shadow = function (mode) {
		if (tar(".wapi-shadow")==null){
			tar("body").appendChild(this.Gui.element('div',{"class":"wapi-shadow"},""));
		}
		if (mode=="on"){
			tar(".wapi-shadow").css("display","block");
		}else if(mode=="off"){
			tar(".wapi-shadow").css("display","none");
		}
		return this;
	}
	
	/**
	*	Функция, чтобы экранировать как одинарные так и двойные кавычки в строке
	*
	*	@param {String} string - Строка,которую надо экранировать
	*
	*	@return {String} - Экранированная строка
	*
	*/
	WApi.prototype.slashes_add = function (string) {
		return (string + '')
			.replace(/[\\"']/g, '\\$&')
			.replace(/\u0000/g, '\\0');
	}
	
	/**
	*	Функция, чтобы закодировать utf
	*
	*	@param {String} string - Строка,которую надо закодировать 
	*
	*	@return {String} - Закодированная строка
	*
	*/
	WApi.prototype.utf8_encode = function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    }
 
	/**
	*	Функция, чтобы раскодировать utf
	*
	*	@param {String} utftext - Строка в формате utf
	*
	*	@return {String} - Раскодированная строка
	*
	*/
    WApi.prototype.utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
 
        while ( i < utftext.length ) {
 
            c = utftext.charCodeAt(i);
 
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    }
	
	/**
	*	Функция, чтобы раскодировать base64
	*
	*	@param {String} data - Строка в формате base64
	*
	*	@return {String} - Раскодированная строка
	*
	*/
	WApi.prototype.base64_decode = function (data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i=0, enc='';
		do {  // unpack four hexets into three octets using index points in b64
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));

			bits = h1<<18 | h2<<12 | h3<<6 | h4;

			o1 = bits>>16 & 0xff;
			o2 = bits>>8 & 0xff;
			o3 = bits & 0xff;

			if (h3 == 64)	  enc += String.fromCharCode(o1);
			else if (h4 == 64) enc += String.fromCharCode(o1, o2);
			else			   enc += String.fromCharCode(o1, o2, o3);
		} while (i < data.length);

		return this.utf8_decode(enc);
	}

	/**
	*	Функция, чтобы фиксировать события и сделать их похожими во всех браузерах
	*
	*	@param {Event} e - Событие, которое нужно привести к единому событию во всех браузерах
	*
	*	@return {Event} - Обработанное событие
	*
	*/
	WApi.prototype.event = function(e){
		// получить объект событие для IE
		var e = e || window.event;

		// добавить pageX/pageY для IE
		if ( e.pageX == null && e.clientX != null ) {
			var html = document.documentElement;
			var body = document.body;
			e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
		}

		// добавить which для IE
		if (!e.which && e.button) {
			e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
		}

		return e;
	}
	
	/**
	*	Функция для определения размеров окна и страницы
	*
	*	@return {Array} - Массив из 4 элементов [Ширина страницы,Высота страницы,Ширина окна,Высота окна]
	*
	*/
	WApi.prototype.size = function(){
		var xScroll, yScroll;

		if (window.innerHeight && window.scrollMaxY) {
			   xScroll = document.body.scrollWidth;
			   yScroll = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
			   xScroll = document.body.scrollWidth;
			   yScroll = document.body.scrollHeight;
		} else if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.offsetHeight){ // Explorer 6 strict mode
			   xScroll = document.documentElement.scrollWidth;
			   yScroll = document.documentElement.scrollHeight;
		} else { // Explorer Mac...would also work in Mozilla and Safari
			   xScroll = document.body.offsetWidth;
			   yScroll = document.body.offsetHeight;
		}

		var windowWidth, windowHeight;
		if (self.innerHeight) { // all except Explorer
			   windowWidth = self.innerWidth;
			   windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
			   windowWidth = document.documentElement.clientWidth;
			   windowHeight = document.documentElement.clientHeight;
		} else if (document.body) { // other Explorers
			   windowWidth = document.body.clientWidth;
			   windowHeight = document.body.clientHeight;
		}

		// for small pages with total height less then height of the viewport
		if(yScroll < windowHeight){
			   pageHeight = windowHeight;
		} else {
			   pageHeight = yScroll;
		}

		// for small pages with total width less then width of the viewport
		if(xScroll < windowWidth){
			   pageWidth = windowWidth;
		} else {
			   pageWidth = xScroll;
		}

		return [pageWidth,pageHeight,windowWidth,windowHeight];
	}

	window.WApi = new WApi();
})(window);
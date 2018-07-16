/**
*	Класс с помощь которого создаются приложения, то есть объекты которые взаимодействуют ХТМЛ,пользователем,
*	демонами и т.д.
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	// Список паттернов для проверки поолей и форм
	var check_input_pattern = {
	   no_empty: /[^\s|\.]+/,                   // любой символ из набора.
	   no_select: /^(?!-1).*$/,             // 
	   
	   num_int: /^\d+$/,                // число целое.
	   num_float: /^\d+(\.|,)?\d*$/,   // число десятичное.
	   num_hfloat: /^\d+(\.)?\d*$/,   // число десятичное.
	   not_num: /^\D+$/,                // кроме чисел.
	   
	   mail:/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // мейл
	   phone:/^\+[0-9]{1,2}\s?\([0-9]{3}\)\s?[0-9]+\-[0-9]+\-[0-9]+$/, // телефон
	   
	   date_slash:/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/, // Дата в формате месяц/дата/год
	   
	   time:/^[0-9]{1,2}:[0-9]{2}$/, // Время в формате часы:минуты
	   
	   word_upper: /^[A-ZА-ЯЁ-]+$/,      // слово на Ru/US в верхнем регистре и знак(-).
	   word_lower: /^[a-zа-яё-]+$/,      // слово на Ru/US в нижнем регистре и знак(-).
	   word_ru_upper: /^[А-ЯЁ-]+$/,       // слово на Ru в верхнем регистре и знак(-).
	   word_ru_lower: /^[а-яё-]+$/,       // слово на Ru в нижнем регистре и знак(-).
	   word_en_upper: /^[A-Z-]+$/,        // слово на US в верхнем регистре и знак(-).
	   word_en_lower: /^[a-z-]+$/,        // слово на US в нижнем регистре и знак(-).
	   
	   string_ru: /^[^a-zA-Z]+$/,        // сторка любая не содержащая US букв.
	   string_en: /^[^а-яА-ЯёЁ]+$/,      // сторка любая не содержащая Ru букв.

	   pass_3:/(?=^[a-zA-Z0-9_]{3,}$)/, // Строчные и прописные латинские буквы, цифры, _ . Минимум 3 символов 
	   pass_6:/(?=^[a-zA-Z0-9_]{6,}$)/, // Строчные и прописные латинские буквы, цифры, _ . Минимум 6 символов 
	   
	   cc: /^[\\d]{4}\\s[\\d]{4}\\s[\\d]{4}\\s[\\d]{4}$/ // кредитная карта в формате 9999 9999 9999 9999.              // номер в формате (999) 9999999.
	};
   
	/**
	*	Функция для сборки radio баттонов приложени
	*	
	*	@param {String} signature подпись приложения
	*
	*	@return {Array} - Массив радио элементов 
	*/
	var get_radio_list = function(signature){
		var radio_btn = [];  
		tar('[data-signature="'+signature+'"] input[type="radio"]',-1).forEach(function(elem){
			var data_check = null,
				data_name = null;
			if (elem.type!=undefined && elem.name!=undefined){
				data_check = elem.getAttribute("data-check");
				data_name = elem.getAttribute("data-name");
				if (radio_btn[elem.name]==undefined){
					radio_btn[elem.name] = [];
					radio_btn[elem.name]["list"] = [];
					radio_btn[elem.name]["value"] = null;
					radio_btn[elem.name]["name"] = null;
					radio_btn[elem.name]["required"] = false;
				}
				if (elem.checked==true){
					radio_btn[elem.name]["value"] = elem.value;
				}
				if (data_check!=null && data_check=="required"){
					radio_btn[elem.name]["required"] = true;
				}
				if (data_name!=null && radio_btn[elem.name]["name"]==null){
					radio_btn[elem.name]["name"] = data_name;
				}
				radio_btn[elem.name]["list"].push(elem);
			}
		});
		return radio_btn;
   }
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {App}
	*
	*/
	function App(app_options){
		if (!(this instanceof App)){return new App(app_options)};
		this.scope = {}; // Объект для хранения информации приложением
		this.html_list = []; // Список инспектируемых инпутов и кнопок приложения
		this.wait_list = [];// Массив подписаных событий, который буду ждать их вызова
		this.input_error = { // Информация которая заноситься сюда после проверки инпутов
			"status":false, // Статус того есть ли ошибки
			"general":"", // Если есть сюда записывается основная ошибка
			"list":[], // Списко ошибок по инпутам
			"values":{} // Здесь хранятся все значения инпутов
		};
		this.options = { // Список опций приложения
			"name":null,// Имя приложения
			"signature":null,// Подпись ХТМЛ контейнера приложения, раполагается в дата атрибуте data-signature=""
			"attach":false,// Указатель искать ли приложение по сигнатуре
			"parent":null,// Родитель, который создает приложение
			"auto":false,// Запускать ли приложение автоматически true || false
			"callback":function(){},// Функция каллбека которую приложение вызывает при создании
			"attach_list":[],// Прикрипления посторонних приложений,демонов и т.д.
			"attach_event":null,// функция, которая должна срабатывать если к приложению кто-то прикрепляется
			"inspect":false, // Включить инспектирование элементов
            "wait_prefix":false, // Включать префикс в вызов вейтов если приложение приаттачено или следит за роутингом
            "wait_prefix_btn_on":false, // Включать префикс для кнопок в вызов вейтов если приложение приаттачено
            "wait_prefix_route_on":false, // Включать префикс для роутов в вызов вейтов если приложение следит за роутами
            "wait_prefix_btn":"btn_", // Дефолтнй префикс для кнопок
            "wait_prefix_route":"route_", // Дефолтный префикс для роутов
            "route":false, // Включать роутинг в приложении или нет
            "route_mode":"query", // Тип роутинга query || hash
            "route_target":"route" // Параметр, который отслеживаем в ротинге
		};
		
		this.started = false;
        this.finded_changed_url =  null;
		
		if (app_options!=undefined && typeof app_options == "object"){ // Если передали объект переписываем свойства в наш объект
			for (var key in app_options){
				this.options[key] = app_options[key];
			}
		}else if(app_options!=undefined && typeof app_options == "function"){ // Если функция, то записываем функцию возврата
			this.options["callback"] = app_options;
		}
		if (this.options["auto"]==true){ // Проверяем запускать ли приложение автоматически
			this.run();
		}
	}
	
	/**
	*	Функция для проверки radio баттонов
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype._inspect_radio = function(){	  
		var radio_btn = get_radio_list(this.options["signature"]);
		for (var key in radio_btn){
			if (radio_btn[key]["required"]==true && radio_btn[key]["value"]==null){
				this.input_error['status'] = true;
				this.input_error['general'] = WApi.translate('error_filling_the_fields');
				if (radio_btn[key]["name"]!=null){
					this.input_error['list'].push(WApi.translate('the_field_name_is_invalid',{'name':radio_btn[key]["name"]}));
				}
			}else{
				this.input_error['values'][key] = (radio_btn[key]["value"]==null)?"":radio_btn[key]["value"];
			}
		}
		return this;
	}
	
	/**
	*	Функция для проверки полей ввода
	*
	*	@param {Node} HTML элемент
	*	
	*	@return {this} - Возвращаем объект App
	*/
	App.prototype._inspect = function (elem){
		var elem = elem.target || elem.currentTarget || elem,
			data_check = elem.getAttribute("data-check"),
			data_name = elem.getAttribute("data-name"),
			name = elem.name;

		if (data_check!=null && data_check!=undefined){
			var template = check_input_pattern[data_check];
			if (template!=undefined){
				if (template.test(elem.value)){
					elem.removeClass("incorect-input");
				}else{
					elem.addClass("incorect-input");
					this.input_error['status'] = true;
					this.input_error['general'] = WApi.translate('error_filling_the_fields');
					if (data_name!=null){
						this.input_error['list'].push("Поле "+data_name+" заполнено не верно!");
					}
				}
			}else if(data_check=="required" && elem.type=="checkbox" && elem.checked==false){
				this.input_error['status'] = true;
				this.input_error['general'] = WApi.translate('error_filling_the_fields');
				if (data_name!=null){
					this.input_error['list'].push(WApi.translate('the_field_name_is_invalid',{'name':data_name}));
				}
			}
		}
		if(name){
			if (elem.type!="checkbox"){
				this.input_error['values'][name] = elem.value;
			}else{
				this.input_error['values'][name] = (elem.checked)?"on":"off";
			}
		}
		return this;
	};
	
	/**
	*	Функция для проверки всех полей ввода
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.inspect = function (){
		this.input_error['general'] = "";
		this.input_error['list'] = [];
		this.input_error['status'] = false;
		var input = tar('[data-signature="'+this.options["signature"]+'"] input:not([type="radio"])',-1),
			select = tar('[data-signature="'+this.options["signature"]+'"] select',-1),
			textarea = tar('[data-signature="'+this.options["signature"]+'"] textarea',-1);
		
		var list_elements = input.concat(select,textarea);
		list_elements.forEach(function(elem){
			this._inspect(elem);
		}.bind(this));
		this._inspect_radio();
		return this.input_error;
	}
	
	/**
	*	Функция для проверики соответствия значения шаблону
	*
	*	@param {String} pattern - шаблон проверки
	*	@param {String} value - значение, которое надо проверить
	*	
	*	@return {Boolean} - true || false
	*
	*/
	App.prototype.pattern_check = function(pattern,value){
		var template = check_input_pattern[pattern];
		return template.test(value);
	}
    
    /**
	*	Функция для взятия списка паттернов
	*	
	*	@return {Object} - Список паттернов
	*
	*/
	App.prototype.pattern_get_list = function(pattern,value){
		return check_input_pattern;
	}
	
	/**
	*	Функция для вызова функции, которую поставили на прослушку
	*
	*	@param {String} target указатель,какую кнопку слушать
	*	@param {Разный тип} data параметры, который надо передать в функцию.
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.beep = function(target){ 
		var args = [];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		if(args.length==0){
			args.push(false);
		}
		var return_value = null;
			
		if (this.wait_list[target]!=undefined){
			return_value = this.wait_list[target].apply(this,args);
		}
		return (return_value==null || return_value==undefined)?this:return_value;
	}
	
	/**
	*	Функция для добавления в список цели для прослушивания кликов на псевдокнопки приложени
	*
	*	@param {String} target указатель,какую кнопку слушать
	*	@param {Function} callback функция вызова, не обязательный параметр
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.wait = function(target,callback){
		this.wait_list[target] = callback;
		return this;
	}
    
    /**
	*	Функция для того, чтобы кинуть бип на вейт
	*
	*	@param {String} url_params - url params в зависимоти от режима.. обычные или хешевские..
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.route = function(url_params){
        if(url_params[this.options['route_target']]==undefined){return this;}
        var curr_beep = url_params[this.options['route_target']];
        curr_beep = (this.options['wait_prefix']==true || this.options['wait_prefix_route_on']==true)?this.options['wait_prefix_route']+curr_beep:curr_beep;
        
		this.beep(curr_beep,url_params);
		return this;
	}
    
    /**
	*	Функция для добавления слушателей на роутинг
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.attach_route = function(){
		if(this.options['route']==false){return this;}
        
        var _this = this,
            route = new WApi.Way();
        
        _this.finded_changed_url = function (){
            if(_this.started==false){return false;}
            var route_url_storage = route.parse(location.href),
                route_params = {};
            
            if(_this.options['route_mode']=="query"){
                route_params = route_url_storage['params'];
            }else if(_this.options['route_mode']=="hash"){
                route_params = route_url_storage['hash_params'];
            }
            
            _this.route(route_params);
        }
        
        if(_this.options['route_mode']=="hash"){
            window.addEventListener("hashchange", _this.finded_changed_url, false);
        }
        
        _this.finded_changed_url();
        
		return this;
	}
	
	/**
	*	Функция для установки слушателей на проверку элементов
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.inspect_app = function(){
		if (this.options["inspect"]==true && this.options["signature"]!=null){
			var input = tar('[data-signature="'+this.options["signature"]+'"] input:not([type="radio"])',-1),
			select = tar('[data-signature="'+this.options["signature"]+'"] select',-1),
			textarea = tar('[data-signature="'+this.options["signature"]+'"] textarea',-1);
			if (this.html_list['inspect']!=undefined){
				this.html_list['inspect'].forEach(function(elem){
					elem.off();
				});
			}
			var list_elements = input.concat(select,textarea);
			this.html_list['inspect'] = list_elements;
			list_elements.forEach(function(elem){
				//elem.off();
				elem.on("change",this._inspect.bind(this));
				elem.on("keyup",this._inspect.bind(this));
				elem.on("blur",this._inspect.bind(this));
			}.bind(this));
		}
		return this;
	}
	
	/**
	*	Функция для прикрипления приложения к хтмл врапперу и выборка кнопок с враппера
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.attach_app = function(){
		if (this.options["attach"]==true  && this.options["signature"]!=null){
			if (this.html_list['btn']!=undefined){
				this.html_list['btn'].forEach(function(elem){
					elem.off();
				});
			}
			
			var _this = this;
			var list_elements = tar("[data-signature='"+this.options["signature"]+"'] [data-btn]",-1);
			this.html_list['btn'] = list_elements;
			list_elements.forEach(function(elem){
				//elem.off("click");
				/*elem.on("click",function(click_elem){
					click_elem.preventDefault();
					console.log(click_elem.target);
					var target = click_elem.target.getAttribute('data-btn');
					if (this.wait_list[target]!=undefined){this.wait_list[target].call(this,click_elem.target)}
				}.bind(this));*/
				
				wjq(elem).click(function(e){
					var target = wjq(this).attr('data-btn');
                    target = (_this.options['wait_prefix']==true || _this.options['wait_prefix_btn_on']==true)?_this.options['wait_prefix_btn']+target:target;
                    
                    console.log(target);
                    
					if (_this.wait_list[target]!=undefined){_this.wait_list[target].call(_this,this);}
				});
			}.bind(this));
		}
		return this;
	}
	
	/**
	*	Функция для сброса прикрепленных кнопок и проверяемых полей
	*	
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.reset_app = function(){
		this.started = false;
		if (this.html_list['btn']!=undefined){
			this.html_list['btn'].forEach(function(elem){
				//elem.off();
				wjq(elem).unbind();
			});
		}
		
		if (this.html_list['inspect']!=undefined){
			this.html_list['inspect'].forEach(function(elem){
				elem.off();
			});
		}
		
		this.html_list = [];
        if(this.finded_changed_url!=null){
            window.removeEventListener("hashchange", this.finded_changed_url);
            this.finded_changed_url =  null;
        }
		
		return this;
	}
	
	/**
	*	Функция для остановки приложения
	*
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.stop = function(){
		this.reset_app();
		
		return this;
	}
	
	/**
	*	Функция для закрытия приложения
	*
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.close = function(){
		this.reset_app();
		this.scope = {};
		
		return this;
	}
	
	/**
	*	Функция для запуска приложения 
	*
	*	@param {Function} callback функция вызова, не обязательный параметр
	*
	*	@return {this} - Возвращаем объект App
	*
	*/
	App.prototype.run = function(callback){
		if(this.started==true){
			return this;
		}
		this.started = true;
		if(callback!=undefined && typeof callback == "function"){this.options["callback"] = callback;}
		
		this.options["callback"].call(this);
		this.inspect_app();
		this.attach_app();
        this.attach_route();
		
		return this;
	}

	window.WApi.App = App;
})(window);
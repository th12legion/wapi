/**
*	Класс для работы с файлами на сервере
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	
	/**
	*	Функция для генерации строки параметров с объекта для ГЕТ запроса
	*
	*	@param {Object} params Объект с параметрами для передачи файлу
	*
	*	@return {String} Строка параметров для передачи на сервер
	*/
	var build_query_get_params = function (params){
		if(params==null || params==""){return "";}
		if(params instanceof FormData){return "";}
		if(typeof params == "string"){return params;}
		if(typeof params != "object"){return "";}
		var temp_arr = [];
		for (var key in params){
			temp_arr.push(key+"="+params[key]);
		}
		return temp_arr.join("&");
	}
	
	/**
	*	Функция для генерации строки параметров с объекта для ПОСТ запроса
	*
	*	@param {Object} params Объект с параметрами для передачи файлу
	*
	*	@return {String} Строка параметров для передачи на сервер
	*/
	var build_query_post_params = function (params){
		if(params==null || params==""){return "";}
		if(params instanceof FormData){return params;}
		if(params instanceof FormData2){return params;}
		if(typeof params == "string"){return params;}
		if(typeof params != "object"){return "";}
		var form = new FormData();
		for (var key in params){
			form.append(key,params[key]);
		}
		return form;
	}
	
	/**
	*	Функция для создания ссылки по которой будет отправлено запрос
	*
	*	@param {String} file_type Строка с типом файла
	*
	*	@return {String} ссылка на которою отправляется запрос
	*/
	var generate_file_finale_link = function (file_type,file_name){
		var rez = "";
		switch(file_type){
			case "al":
				rez = file_name;
			break;
			case "vl":
				rez = WApi.config.ajax_link+"?"+WApi.config.ajax_method+"="+file_name;
			break;
			case "rl":
				rez = WApi.config.ajax_link+"?"+WApi.config.ajax_method+"=realfile&filename="+file_name;
			break;
		}
		
		return rez;
	}
	
	/**
	*	Функция для разбора имени файла
	*
	*	@param {String} name Строка с именем файла
	*
	*	@return {Object} свойствами type и link
	*/
	var parse_file_link = function (name){
		var temp = {
			"type":"vl",
			"name":"",
			"finale_link":""
		},
		reg = /^(AL|VL|RL):(.*)/i,
		parse = name.match(reg);
		if (parse!=null){ 
			temp["type"] = parse[1].toLowerCase();
			temp["name"] = parse[2];
			temp["finale_link"] = generate_file_finale_link(temp["type"],parse[2]);
		}
		
		return temp;
	}
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {File}
	*
	*/
	function File(link){
		var link = link || "";
		if (!(this instanceof File)){return new File(link)};
		var parse_link = parse_file_link(link);
		this.file_link = link;
		this.file_type = parse_link["type"];
		this.file_name = parse_link["name"];
		this.file_finale_link = parse_link["finale_link"];
		this.request_config = [];
		this.func_ok = function(data){this.rezult = data;};
		this.func_error = function(e){console.log("error",e);};
		this.params = null;
		this.rezult = null;
	}
	
	/**
	*	Функция для функция для проверки на ошибки 
	*
	*
	*	@return {Boolean} true если нет ошибок или выброси ошибку
	*/
	File.prototype.eval_error = function (){
		if (this.file_name==""){throw new Error("Не указано имя файла!");}
		if (this.file_finale_link==""){throw new Error("Не создана финальная ссылка!");}
	}
	
	/**
	*	Функция для отправки ГЕТ запроса на сервере
	*
	*	@param {Object} params Объект с параметрами для передачи файлу
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.exec = function (params,callback){
		this.params = params || this.params;
		this.func_ok = callback || this.func_ok;
		var data = build_query_get_params(this.params),
			url_merge = (data=="")?this.file_finale_link:this.file_finale_link+"&"+data,
			config = {
				"type":"GET",
				"dataType":(this.request_config["return_type"]==undefined)?"json":this.request_config["return_type"],
				"url": url_merge,
				"error": this.func_error,
				"success":this.func_ok
			};
		this.eval_error();
		wjq.ajax(config);
		return this;
	}
	
	/**
	*	Функция для отправки ПОСТ запроса на сервере
	*
	*	@param {Object} params Объект с параметрами для передачи файлу
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.call = function (params,callback){
		this.params = params || this.params;
		this.func_ok = callback || this.func_ok;
		var data = build_query_post_params(this.params),
			config = {
				"type":"POST",
				"dataType":(this.request_config["return_type"]==undefined)?"json":this.request_config["return_type"],
				"url": this.file_finale_link,
				"data": data,
				"error": this.func_error,
				"success":this.func_ok
			};
		if (data instanceof FormData || data instanceof FormData2){
			config.contentType = false;
			config.processData = false;
		}	
		this.eval_error();
		wjq.ajax(config);
		return this;
	}
	
	/**
	*	Функция обертка для основного метода, чтобы читать файлы с сервера
	*
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.remove = function (callback){
		if (this.file_type!="rl"){throw new Error("Нельзя использовать метод read с данным типом файлов!");}
		this.func_ok = callback || this.func_ok;
		this.exec("mode=remove");
		return this;
	}
	
	/**
	*	Функция обертка для основного метода, чтобы сохранять файлы на сервере
	*
	*	@param {String} content что записать в файл
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*	
	*	@return {this} File
	*/
	File.prototype.write = function (content,callback){
		if (this.file_type!="rl"){throw new Error("Нельзя использовать метод write с данным типом файлов!");}
		this.func_ok = callback || this.func_ok;
		var content = content || "";
		this.call({"mode":"write","content":content});
		return this;
	}
	
	/**
	*	Функция обертка для основного метода, чтобы читать файлы с сервера
	*
	*
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.read = function (callback){
		if (this.file_type!="rl"){throw new Error("Нельзя использовать метод read с данным типом файлов!");}
		this.func_ok = callback || this.func_ok;
		this.exec("mode=read");
		return this;
	}
	
	/**
	*	Функция обертка для основного метода, чтобы читать файлы с сервера
	*
	*
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.exist = function (callback){
		if (this.file_type!="rl"){throw new Error("Нельзя использовать метод exist с данным типом файлов!");}
		this.func_ok = function(data){
			if (data.status==1){
				callback(false);
			}else{
				callback(true);
			}
		};
		this.exec("mode=exists");
		return this;
	}
	
	/**
	*	Функция для задания функции возврата при не успешном выполнении запроса
	*
	*	@param {Function} callback Функция для вызова при не удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.fail = function (callback){
		this.func_error = callback;
		return this;
	}
	
	/**
	*	Функция для задания функции возврата при успешном выполнении запроса
	*
	*	@param {Function} callback Функция для вызова при удачном выполнение запроса
	*
	*	@return {this} File
	*/
	File.prototype.ok = function (callback){
		this.func_ok = callback;
		return this;
	}
	
	/**
	*	Функция для задания параметров запроса
	*
	*	@param {String} key Ключ насройки
	*	@param {String} value Значение насройки
	*
	*	@return {this} File
	*/
	File.prototype.config = function (key,value){
		this.request_config[key] = value;
		return this;
	}
	
	/**
	*	Функция для возврата параметров последнего запроса
	*
	*	@return Параметры последнего запроса
	*/
	File.prototype.params = function (){
		return this.params;
	}
	
	/**
	*	Функция для задания имени файла к которому идет обращение
	*
	*	@param {String} link Строк с именем файла
	*
	*	@return {this} File
	*/
	File.prototype.target = function (link){
		var link = link || "";
		var parse_link = parse_file_link(link);
		this.file_link = link;
		this.file_type = parse_link["type"];
		this.file_name = parse_link["name"];
		this.file_finale_link = parse_link["finale_link"];
		return this;
	}
	
	
	////////////////////////////////////////////////
	window.WApi.File = File;
})(window);
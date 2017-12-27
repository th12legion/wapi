/**
*	Класс с помощь которого создаются демоны, то есть объекты которы работоют фоново на сайте
*	и выпоняются постоянно.
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {Demon}
	*
	*/
	function Demon(demon_options){
		if (!(this instanceof Demon)){return new Demon(demon_options)};
		this.timer = null;
		this.scope = {};
		this.wait_list = [];
		this.options = {
			"name":null,// Имя демона
			"parent":null,// Родитель, который создает демона
			"auto":true,// Запускать ли Демон автоматически true || false
			"timeout":3*1000,// Время срабатывания демона
			"callback":function(){},// Функция каллбека которую демон должен вызывать при каждой отработке
			"attach_list":[],// Прикрипления посторонних приложений,демонов и т.д.
			"attach_event":null,// функция, которая должна срабатывать если к демону кто-то прикрепляется
			"type":"normal",// normal,server
			"file":"",// Задается если тип server (Обяхательный параметр)
			"param":"",// Задается если тип server и надо передать какие-то параметры
			"eval":true// Флаг проверять ли статус ответа с сервера, относиться к json ответу
		};
		if (demon_options!=undefined && typeof demon_options == "object"){
			for (var key in demon_options){
				this.options[key] = demon_options[key];
			}
		}else if(demon_options!=undefined && typeof demon_options == "function"){
			this.options["callback"] = demon_options;
		}
		if (this.options["auto"]==true){
			this.run();
		}
	}
	
	/**
	*	Циклическая функция,которую все время вызфывет демон 
	*	и она выполняе действия в соотвествии параметрами
	*
	*/
	Demon.prototype.cyclic_function = function (){
		if (this.options["type"]=="normal"){
			this.options["callback"].call(this);
			this.timer = setTimeout(this.cyclic_function.bind(this),this.options["timeout"]);
		}
		if (this.options["type"]=="server"){
			if (this.options["file"]==""){
				throw new Error("Не указано файл на сервере!");
			}
			WApi.File(this.options["file"]).ok(function(data){
				if (this.options["eval"]==true && data["status"]==12){
					this.options["callback"].call(this,data);
				}else if (this.options["eval"]==false){
					this.options["callback"].call(this,data);
				}else{
					console.log("Demon"+((this.options["name"]!=null)?"/"+this.options["name"]:"")+"(server) сервер вернул Data с ошибкой в статусе, Data:",data);
				}
				this.timer = setTimeout(this.cyclic_function.bind(this),this.options["timeout"]);
			}.bind(this)).fail(function(e){
				console.log("Demon"+((this.options["name"]!=null)?"/"+this.options["name"]:"")+"(server) запрос на сервер закончился неудачно, Error:",e);
			}.bind(this)).call(this.options["param"]);
		}
	}
	
	/**
	*	Функция для вызова функции, которую поставили на прослушку
	*
	*	@param {String} target указатель,какую кнопку слушать
	*	@param {Разный тип} data параметры, который надо передать в функцию.
	*	
	*	@return {this} - Возвращаем объект Demon
	*
	*/
	Demon.prototype.beep = function(target,data){
		var data = data || true;
		if (this.wait_list[target]!=undefined){
			this.wait_list[target].call(this,data);
		}
		return this;
	}
	
	/**
	*	Функция для добавления в список цели для прослушивания вызовов
	*
	*	@param {String} target указатель,что слушать
	*	@param {Function} callback функция вызова, не обязательный параметр
	*	
	*	@return {this} - Возвращаем объект Demon
	*
	*/
	Demon.prototype.wait = function(target,callback){
		this.wait_list[target] = callback;
		return this;
	}
	
	/**
	*	Функция для привязки разных параметров к демону от посторонних приложений и демонов и т.д.
	*
	*	@param {Object} params функция вызова, не обязательный параметр
	*
	*	@return {this} - Возвращаем объект Demon
	*
	*/
	Demon.prototype.attach = function(params){
		if (params==undefined || typeof params !="object"){
			console.log("Demon"+((this.options["name"]!=null)?"/"+this.options["name"]:"")+"(attach) проблемы с прикрепляемыми параметрами params:",params);
			return this;
		}
		this.options["attach_list"].push(params);
		if (this.options["attach_event"]!=null && typeof this.options["attach_event"]=="function"){
			this.options["attach_event"].call(this);
		}
		return this;
	}
	
	/**
	*	Функция для остановки демона
	*
	*	@return {this} - Возвращаем объект Demon
	*
	*/
	Demon.prototype.stop = function(){
		clearTimeout(this.timer);
		console.log("Demon"+((this.options["name"]!=null)?"/"+this.options["name"]:"")+" стоп.");
		return this;
	}
	
	/**
	*	Функция для запуска демона 
	*
	*	@param {Function} callback функция вызова, не обязательный параметр
	*
	*	@return {this} - Возвращаем объект Demon
	*
	*/
	Demon.prototype.run = function(callback){
		if(callback!=undefined && typeof callback == "function"){
			this.options["callback"] = callback;
		}
		clearTimeout(this.timer);
		console.log("Demon"+((this.options["name"]!=null)?"/"+this.options["name"]:"")+" старт.");
		this.cyclic_function();
		return this;
	}

	window.WApi.Demon = Demon;
})(window);
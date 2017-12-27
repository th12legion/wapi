/**
*	Класс с помощью которого можно обрабатывать нажатие и отпускание клавиш
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	
	var keys_storage = {},
		call_back_storage = {};
	
	/**
	*	Функция обработчик обратного вызова функций
	*	
	*	@param {Int} key_code - код клавиши
	*
	*/
	var call_back_go = function (key_code){
		for (var key in call_back_storage) {
			if (key==-1 || key==key_code){
				call_back_storage[key]();
			}
		}
	}
	
	/**
	*	Функция обработчик события нажатия клавиши
	*	
	*	@param {Event} event - событие клавиши
	*
	*/
	var on_key_down = function (event) {
		keys_storage[event.keyCode] = true;
		call_back_go(event.keyCode);
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
	}
	
	/**
	*	Функция обработчик события отпускания клавиши
	*	
	*	@param {Event} event - событие клавиши
	*
	*/
	var on_key_up = function (event) {
		delete keys_storage[event.keyCode];
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
	}
	
	// Слушатели на нажатие и отпускание клавиатуры
	//window.addEventListener('keydown',on_key_down);
	//window.addEventListener('keyup',on_key_up);
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {Key}
	*
	*/
	function Key(key_option){
		if (!(this instanceof Key)){return new Key(key_option)};
		this.alias = {
			ALL : -1,
			BACKSPACE : 8,
			TAB : 9,
			ENTER : 13,
			SHIFT : 16,
			CTRL : 17,
			ALT : 18,
			CAPSLOCK : 20,
			ESCAPE : 27,
			SPACE : 32,
			LEFT : 37,
			UP : 38,
			RIGHT : 39,
			DOWN : 40,
			COMMAND : 91,
			A : 65,
			C : 67,
			S : 83,
			R : 82,
			T : 84
		};
	}
	
	/**
	*	Функция, для проверки нажата ли какая-то кнопка
	*
	*	@return {Boolean} - значение нажата ли клавиша
	*	
	*/
	Key.prototype.is_down = function() {
		if(WApi.obj_length(keys_storage)>0){
			return true;
		}else{
			return false
		}
	}
	
	/**
	*	Функция, для проверки конкретно нажатой кнопки
	*	@param {Int} key_code - код клавиши
	*	
	*	@return {Boolean} - значение нажата ли клавиша
	*
	*/
	Key.prototype.check = function(key_code) {
		return keys_storage[keyCode] ? keys_storage[keyCode] : false;
	}
	
	/**
	*	Функция, для установки слушателя на нажатие конкретной кнопки
	*
	*	@param {Int} key_code - код клавиши
	*	@param {Function} func - Функция обратного вызова
	*
	*/
	Key.prototype.listener = function(key_code,func){
		call_back_storage[key_code] = func;
	}
	
	window.WApi.Key = Key();
})(window);
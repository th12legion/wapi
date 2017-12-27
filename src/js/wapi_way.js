/**
*	Класс с помощью которого можно манипулировать с сылками и путями
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	var path = location.href;
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {Way}
	*
	*/
	function Way(way_option){
		if (!(this instanceof Way)){return new Way(way_option)};
		path = location.href;
		path = way_option || path;
	}
	
	/**
	*	Функция, чтобы распарсить урл
	*
	*	@return {Object} - Массив свойст урл
	*
	*/
	Way.prototype.parse = function() {
		var a =  document.createElement('a');
		a.href = path;
		return {
			source: path,
			protocol: a.protocol.replace(':',''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function(){
				var ret = {},
					seg = a.search.replace(/^\?/g,'').split('&'),
					len = seg.length, i = 0, s;
				for (;i<len;i++) {
					if (!seg[i]) { continue; }
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			file: (a.pathname.match(/([^/?#]+)$/i) || [,''])[1],
			hash: a.hash.replace('#',''),
			path: a.pathname.replace(/^([^/])/,'/$1')
		};
	}
	
	/**
	*	Функция, чтобы открыть урл в новой вкладке
	*
	*	@return {this} - Возвращаем объект Way
	*
	*/
	Way.prototype.blank = function(){
		tar("body").appendChild(
			WApi.Gui.element('a',{
				"href":path,
				"target":"blank"
			},"")).mouse_click().remove();
		return this;
	}
	
	/**
	*	Функция, чтобы открыть урл в текущей вкладке
	*
	*	@return {this}  - Возвращаем объект Way
	*
	*/
	Way.prototype.load = function(){
		location.href = path;
		return this;
	}

	window.WApi.Way = Way;
})(window);
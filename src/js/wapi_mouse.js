/**
*	Класс для работы с мышкой
* 
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

(function (window) {
	var targetStorage,
		reg_drag = /^mouse_drag_/i,
		targetObject = null,
		callBackStorageMove = {},
		callBackStorageDown = {},
		callBackStorageUp = {};
		
	var reset_target_storage = function (){
		targetStorage = [];
		targetStorage["element"] = null;
		targetStorage["element_darg"] = null;
		targetStorage["attrs"] = [];
		targetStorage["x"] = 0;
		targetStorage["y"] = 0;
		targetStorage["drag_x"] = 0;
		targetStorage["drag_y"] = 0;
		targetStorage["sync_x"] = 0;
		targetStorage["sync_y"] = 0;
		targetStorage["drag"] = false;
	}

	function mouseMove(event){ 
		event = WApi.event(event);
		targetStorage["x"] = event.pageX;
		targetStorage["y"] = event.pageY;
		targetStorage["drag_x"] = event.pageX-targetStorage["sync_x"];
		targetStorage["drag_y"] = event.pageY-targetStorage["sync_y"];
		
		if (targetStorage["drag"]==true && callBackGo("move")==false){
			targetStorage["element_darg"].style.left = targetStorage["drag_x"]+"px";
			targetStorage["element_darg"].style.top = targetStorage["drag_y"]+"px";
		}
	}
	
	function mouseDown(event){
		event = WApi.event(event);
		targetStorage["x"] = event.pageX;
		targetStorage["y"] = event.pageY;
		targetObject = event.target || event.srcElement;
		
		if (targetObject!=null){
			targetStorage["element"] = targetObject;
			var attrs = targetObject.attributes;
			for (var i = 0; i < attrs.length; i++){
				targetStorage["attrs"][attrs[i].name] = attrs[i].value;
				if (reg_drag.test(attrs[i].value)){
					var wrapper = document.querySelectorAll('[data-mouse="'+(attrs[i].value.replace("drag","move"))+'"')[0],
						left = (wrapper==undefined)?targetObject.style.left:wrapper.style.left,
						top = (wrapper==undefined)?targetObject.style.top:wrapper.style.top;
					targetStorage["element_darg"] = (wrapper==undefined)?targetObject:wrapper;
					targetStorage["drag"] = true;
					targetStorage["sync_x"] = targetStorage["x"] - parseInt(((left!=undefined && left!="")?left:0));
					targetStorage["sync_y"] = targetStorage["y"] - parseInt(((top!=undefined && top!="")?top:0));
				}
			}
			callBackGo("down");
		}
	}
	
	function mouseUp(){
		if (targetStorage["element"]!=null){
			callBackGo("up");
		}
		
		reset_target_storage();
		targetObject = null;
	}
	
	function callBackGo(typeEvent){
		var callBackStorageTmp = {},
			called = false;
		switch(typeEvent){
			case "move":
				callBackStorageTmp = callBackStorageMove;
			break;
			case "down":
				callBackStorageTmp = callBackStorageDown;
			break;
			case "up":
				callBackStorageTmp = callBackStorageUp;
			break;
		}
		
		for (var key in callBackStorageTmp){
			for (key_attr in targetStorage["attrs"]){
				if (key==targetStorage["attrs"][key_attr]){
					callBackStorageTmp[key](targetStorage["attrs"][key_attr]);
					called = true;
				}
			}
		}
		return called;
	}
	
	var start_after_load = function (){
		reset_target_storage();
		var regionEvent = document.getElementsByTagName('body')[0];
		// Для мышки
		regionEvent.onmousemove = mouseMove;
		regionEvent.onmousedown = mouseDown;
		regionEvent.onmouseup = mouseUp;
		
		// Для прикосновений
		regionEvent.addEventListener('touchmove',mouseMove, false);
		regionEvent.addEventListener('touchstart',mouseDown, false);
		regionEvent.addEventListener('touchend',mouseUp, false);
	}
	
	tar(start_after_load);
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {Mouse}
	*
	*/
	function Mouse(){
		if (!(this instanceof Mouse)){return new Mouse()};
	}
	
	Mouse.prototype.target = function(){
		return targetStorage["element"];
	}
	
	Mouse.prototype.X = function(type){
		var type = type || "mouse";
		return (type=="drag")?targetStorage["drag_x"]:targetStorage["x"];
	}
	
	Mouse.prototype.Y = function(type){
		var type = type || "mouse";
		return (type=="drag")?targetStorage["drag_y"]:targetStorage["y"];
	}
	
	Mouse.prototype.listenerMove = function(target,func){
		callBackStorageMove[target] = func;
	}
	
	Mouse.prototype.listenerDown = function(target,func){
		callBackStorageDown[target] = func;
	}
	
	Mouse.prototype.listenerUp = function(target,func){
		callBackStorageUp[target] = func;
	}

	////////////////////////////////////////////////
	window.WApi.Mouse = new Mouse();
})(window);
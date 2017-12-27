/**
*	Полифил для FormData 
*	
*	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*
*/
(function(window) {
    if (window.FormData2){return;}
   
	var old_request_send = XMLHttpRequest.prototype.send;
	
    XMLHttpRequest.prototype.send = function(data) {
		var convert_data = function (data_before){
            data_before = data_before.toString();
			var nBytes = data_before.length, ui8Data = new Uint8Array(nBytes);
			for (var nIdx = 0; nIdx < nBytes; nIdx++) {
				ui8Data[nIdx] = data_before.charCodeAt(nIdx) & 0xff;
			}
			return ui8Data;
		};
		
        if (data instanceof FormData2) {
			var data_for_call = convert_data(data);
			var header = 'multipart/form-data; boundary=' + data.boundary+";";
			this.setRequestHeader('Content-Type', header);
			old_request_send.call(this, data_for_call);
        }else{
			old_request_send.call(this, data);
		}	
		
		return null;
    };
	
	var encode_utf8 = function ( s ){
	  return unescape( encodeURIComponent( s ) );
	}

	var decode_utf8 = function( s ){
	  return decodeURIComponent( escape( s ) );
	}
	
	var get_form_entries = function(elements){
		var entries = [];
		for (var i=0,len = elements.length; i<len; i++){
			if (elements[i].type!="file"){
				entries[elements[i].name] = encode_utf8(elements[i].value);
				continue;
			}
			
			(function(element){
				if (element.files.length==0){return false;}
				var files = element.files;
				for (var j=0; j<files.length; j++){
					var file = element.files[j],
						reader = new FileReader();  
					
					reader.readAsBinaryString(file);
					reader.onload = (function(theFile,index) {
						return function (evt){
							entries[element.name+"<|>"+index] = [];
							entries[element.name+"<|>"+index]["type"] = theFile.type || "text/plain";
							entries[element.name+"<|>"+index]["name"] = encode_utf8(theFile.name) || "file.txt";
							entries[element.name+"<|>"+index]["body"] = evt.target.result;
							console.log(entries);
						}
					})(file,j);
				}
			})(elements[i]);
		}
		
		return entries;
	}
		
	function FormData2(form){
		if (!(this instanceof FormData2)){return new FormData2(form)};
		this.entries = (form!=undefined && form.elements!=undefined)?get_form_entries(form.elements):[];
		this.boundary = "---------------------------" + Math.round(Math.random()*10000000000000);
		//Math.random().toString(36);
	}
	
	FormData2.prototype.toString = function(){
		var body = [];
		for (var key in this.entries){
			if (typeof this.entries[key]!="string"){
				var entrie = this.entries[key];
				if (entrie.body==undefined){
					body = [];
					return "wait";
				}
				body.push("--" + this.boundary + "\r\n"
						  +"Content-Disposition: form-data; name=\""+ (key.split("<|>")[0]) +"\"; filename=\""+entrie.name+"\"\r\n"
						  +"Content-Type: "+entrie.type+"\r\n\r\n"
						  //+"Content-Type: application/octet-stream\r\n\r\n"
						  +entrie.body + "\r\n");
			}else{
				body.push("--" + this.boundary + "\r\n"
						  +"Content-Disposition: form-data; name=\""+ key +"\";\r\n\r\n"
						  +this.entries[key] + "\r\n");
			}
		}
        
        return (body.length>0)?body.join("")+"--" + this.boundary  +"--\r\n":"";
	}
		
	FormData2.prototype.append = function(key,value){
		this.entries[key] = value;
	}
	
	window.FormData2 = FormData2;
})(window);

/**
*	Полифил для Bind
*
*	@author MDN
*
*/
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
			return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

/**
*	Хаки расширяющие возможности работы с дом
*
* 	@author th12legion (Кудиль Павел Николаевич) 
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/

/*------------ Работа с селекторами ------------*/
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.matchesSelector || 
	Element.prototype.mozMatchesSelector ||
	Element.prototype.msMatchesSelector || 
	Element.prototype.oMatchesSelector || 
	Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(css) {
		var node = this;
		while (node) {
			if (node.matches(css)) return node;
			else node = node.parentElement;
		}
		return null;
	};
}

if (!document.querySelectorAll){
	document.querySelectorAll = function (selector){
		var colections = [],
			elements = document.getElementsByTagName("*");
		[].forEach.call(elements,function(el){
			if (el.matches(selector)==true) {
				colections.push(el);
			}
		});
		return colections;
	};
}

if (!Element.prototype.find) {
	Element.prototype.find = function(selector){
		var elemets = this.querySelectorAll(selector);
		return elemets;
	}
}
/*------------ Работа с селекторами ------------*/

/*------------ Работа с классами ------------*/
if (!Element.prototype.addClass) {
	Element.prototype.addClass = function(newClass){
		var node = this,
			list = (node.className=="")?[]:node.className.split(" "),
			addBefore = false;
		list.forEach(function(el){
			if (el==newClass){
				addBefore = true;
			}
		});
		if (addBefore==false){
			list.push(newClass);
		}
		node.className = list.join(" ");
		return node;
	}
}

if (!Element.prototype.hasClass) {
	Element.prototype.hasClass = function(testClass){
		var node = this,
			list =  node.className.split(" "),
			addBefore = false;
		list.forEach(function(el){
			if (el==testClass){
				addBefore = true;
			}
		});
		
		return addBefore;
	}
}

if (!Element.prototype.removeClass) {
	Element.prototype.removeClass = function(removeClass){
		var node = this,
			list =  node.className.split(" "),
			addBefore = false;
		list.forEach(function(el,i){
			if (el==removeClass){
				list.splice(i,1);
			}
		});

		node.className = list.join(" ");
		return node;
	}
}

if (!Element.prototype.toggleClass) {
	Element.prototype.toggleClass = function(toggleClass){
		(this.hasClass(toggleClass))?this.removeClass(toggleClass):this.addClass(toggleClass);
		return this;
	}
}
/*------------ Работа с классами ------------*/

/*------------ Разное ------------*/
if (!Element.prototype.css) {
	Element.prototype.css = function(option,value){
		if (typeof option=="string" && value!=undefined){
			this.style[option] = value;
			return this;
		}else if(typeof option=="string" && value==undefined){
			return (this.style[option]!=undefined)?this.style[option]:"";
		}else if(typeof option == "object"){
			for (var key in option){
				this.style[key] = option[key];
			}
		}
	}
}

if (!Element.prototype.wrap) {
	Element.prototype.wrap = function(parent_element){
		if(parent_element==undefined){return false;}
		parent_element.innerHTML = this.outerHTML;
		this.parentNode.replaceChild(parent_element,this);
		return parent_element;
	}
}

if (!Element.prototype.replace) {
	Element.prototype.replace = function(replace_element){
		if(replace_element==undefined){return false;}
		this.parentNode.replaceChild(replace_element,this);
		return replace_element;
	}
}

if (!Element.prototype.clear) {
	Element.prototype.clear = function(){
		while (this.hasChildNodes()) {
			this.removeChild(this.firstChild);
		}
	}
}

if (!Element.prototype.info) {
	Element.prototype.info = function(){
		var rect_info = this.getBoundingClientRect();
		rect_info.width = (rect_info.width)?rect_info.width:(rect_info.right-rect_info.left);
		rect_info.height = (rect_info.height)?rect_info.height:(rect_info.bottom-rect_info.top);
		
		return {
			'width':rect_info.width,
			'height':rect_info.height,
			'left':rect_info.left,
			'right':rect_info.right,
			'top':rect_info.top,
			'bottom':rect_info.bottom
		};
	}
}

if (!Element.prototype.position) {
	Element.prototype.position = function(){
		console.log(this.getBoundingClientRect());
		var x = (function(elem){
			 var curleft = 0;
			if (elem.offsetParent) {
				while (1) {
					curleft+=elem.offsetLeft;
					if (!elem.offsetParent) {
						break;
					}
					elem=elem.offsetParent;
				}
			} else if (elem.x) {
				curleft+=elem.x;
			}
			return curleft;
		})(this);
		var y = (function(elem){
			var curtop = 0;
			if (elem.offsetParent) {
				while (1) {
					curtop+=elem.offsetTop;
					if (!elem.offsetParent) {
						break;
					}
					elem=elem.offsetParent;
				}
			} else if (elem.y) {
				curtop+=elem.y;
			}
			return curtop;
		})(this);
		
		return {"x":x,"y":y};
	}
}
/*------------ Разное ------------*/

/*------------ Поиск элементов ------------*/

window.tar = function (selector,output,context){
	switch (typeof selector){
		case "function":
			if ( document.addEventListener ){
				document.addEventListener('DOMContentLoaded', selector);
			}else if (document.readyState && !document.onload) {
				document.onreadystatechange = function() {
					if (document.readyState == "loaded" || document.readyState == "complete") {
						document.onreadystatechange = null;
						selector();
					}
				}
			}else{
				document.onload = selector;
			}
		break;
		case "string":
			var context = context || document,
				index = output || 0,
				elemets = null,
				elem = null;
				
			if ( !selector ){
				return null;
			}
			
			if ( context.querySelectorAll ){
				elemets = context.querySelectorAll(selector);
				if (elemets.length>0){
					if (index==-1){
						var sliceArr = (Array.prototype.slice)?[].slice.call(elemets,0):elemets;
						return sliceArr;
					}
					elem = elemets[index];
					return (elem!=undefined)?elem:null;
				}
				if (index==-1){return [];}
			}
		break;
		case "object":
		case "array":
			//if (nj.require_is(filename)){return nj;}
			var callBack = output || function (){return false;},
				loadedStatus = function (loadedFile,cBack){
					if (loadedFile.readyState && !loadedFile.onload) {
						loadedFile.onreadystatechange = function() {
							if (loadedFile.readyState == "loaded" || loadedFile.readyState == "complete") {
								loadedFile.onreadystatechange = null;
								cBack();
							}
						}
					}else{
						loadedFile.onload = cBack;
					}
				},
				file = "",
				reg = /\.(js|css)/i,
				match = null,
				load_status = true;
			for (var i=0,len=selector.length; i<len; i++){
				load_status = true
				file = selector[i];
				match = reg.exec(file);
				if (match==null){continue;}
				tar('script',-1).forEach(function(script){
					if (script.src.indexOf(file)!=-1){
						load_status = false;
						callBack.call(script);
					}
				});
				tar('link',-1).forEach(function(link){
					if (link.href.indexOf(file)!=-1){
						load_status = false;
						callBack.call(link);
					}
				});
				if (load_status==false){
					//console.log("Tar Файл "+file+" уже загружен!");
					continue;
				}
				switch(match[1]){
					case "js":
						var newFile = document.createElement('script'),
							head = document.getElementsByTagName('HEAD')[0];
						newFile.type = 'text/javascript';
						//document.getElementsByTagName('HEAD')[0].appendChild(newFile);
						head.insertBefore(newFile, head.firstChild);
						loadedStatus(newFile,callBack);
						newFile.src = file;
					break;
					case "css":
						var newFile = document.createElement('link'),
							head = document.getElementsByTagName('HEAD')[0];
						newFile.type = 'text/css';
						newFile.rel = 'stylesheet';
						//document.getElementsByTagName('HEAD')[0].appendChild(newFile);
						head.insertBefore(newFile, head.firstChild);
						loadedStatus(newFile,callBack);
						newFile.href = file;
					break;
				}
			}
			
		break;
	}
	return null;
}

/*------------ Поиск элементов ------------*/

/*------------ Слушатели на события ------------*/
if (!Element.prototype.njEventStorage) {
	Element.prototype.njEventStorage = [];
}

if (!Element.prototype.listen) {
	Element.prototype.listen = function(mode,eventName,callBack){
		var mode = mode.toLowerCase();
		if (mode=="on"){
			if (eventName==undefined){return false;}
			var callBack = callBack || function(){};
			this.njEventStorage.push({evt:eventName,func:callBack});
			this.addEventListener(eventName,callBack);
		}else if('off'){
			if (callBack==undefined && eventName==undefined){
				for(var i=0,len = this.njEventStorage.length; i<len; i++){
					this.removeEventListener(this.njEventStorage[i].evt,this.njEventStorage[i].func);
				}
				this.njEventStorage = [];
			}else if(callBack==undefined && eventName!=undefined){
				var tempNewStorage = [];
				for(var i=0,len = this.njEventStorage.length; i<len; i++){
					if (eventName==this.njEventStorage[i].evt){
						this.removeEventListener(this.njEventStorage[i].evt,this.njEventStorage[i].func);
					}else{
						tempNewStorage.push(this.njEventStorage[i]);
					}
				}
				this.njEventStorage = tempNewStorage;
			}else if(callBack!=undefined && eventName!=undefined){
				this.removeEventListener(eventName,callBack);
			}
		}
		return this;
	}
}
if (!Element.prototype.on) {
	Element.prototype.on = function (eventName,callBack){
		return this.listen("on",eventName,callBack);
	}
}

if (!Element.prototype.off) {
	Element.prototype.off = function (eventName,callBack){
		return this.listen("off",eventName,callBack);
	}
}

if (!Element.prototype.mouse_click) {
	Element.prototype.mouse_click = function (){
		var evt = new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
				view: window
			});
		this.dispatchEvent(evt);
		return this;
	}
}

if (!Element.prototype.goFullScreen) {
	Element.prototype.goFullScreen = Element.prototype.requestFullScreen 
	|| Element.prototype.mozRequestFullScreen
	|| Element.prototype.webkitRequestFullScreen;
}

if (!Element.prototype.endFullScreen) {
	Element.prototype.endFullScreen = function (){
		if(document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	};
}
/*------------ Слушатели на события ------------*/

/*------------ Расширение мат возможностей ------------*/
// Замыкание
(function() {
	/**
	* 	Корректировка округления десятичных дробей.
	*
	* 	@param {String}  type  Тип корректировки.
	* 	@param {Number}  value Число.
	* 	@param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
	* 	@return {Number} Скорректированное значение.
	*
   */
	function decimal_adjust(type, value, exp) {
		// Если степень не определена, либо равна нулю...
		if (typeof exp === 'undefined' || +exp === 0) {
		  return Math[type](value);
		}
		value = +value;
		exp = +exp;
		// Если значение не является числом, либо степень не является целым числом...
		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
		  return NaN;
		}
		// Сдвиг разрядов
		value = value.toString().split('e');
		value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
		// Обратный сдвиг
		value = value.toString().split('e');
		return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	// Десятичное округление к ближайшему
	if (!Math.round10) {
		Math.round10 = function(value) {
			return decimal_adjust('round', value, -1);
		};
	}
  
	if (!Math.round100) {
		Math.round100 = function(value) {
			return decimal_adjust('round', value, -2);
		};
	}
	
	// Десятичное округление вниз
	if (!Math.floor10) {
		Math.floor10 = function(value, exp) {
			return decimal_adjust('floor', value, exp);
		};
	}

	// Десятичное округление вверх
	if (!Math.ceil10) {
		Math.ceil10 = function(value, exp) {
			return decimal_adjust('ceil', value, exp);
		};
	}
})();
/*------------ Расширение мат возможностей ------------*/
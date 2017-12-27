/**
*	Класс с помощь которого можно создавать GUI элементы
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
	* 	@this {Gui}
	*
	*/
	function Gui(){
		if (!(this instanceof Gui)){return new Gui()};
	}
	
	/**
	*	Функция для создания ХТМЛ ноде элементов
	*
	*	@param {String} name - Имя элемента 
	*	@param {Object} attributes - Атрибуты элемента
	*	
	*	@return {HTMLNode} - ХТМЛ элемент
	*
	*/
	Gui.prototype.element = function(name,attributes){
		var el = document.createElement(name);
		if ( typeof attributes == 'object' ) {
			for ( var i in attributes ) {
				el.setAttribute( i, attributes[i] );
				if ( i.toLowerCase() == 'class' ) {
					el.className = attributes[i]; // for IE compatibility
				} else if ( i.toLowerCase() == 'style' ) {
					el.style.cssText = attributes[i]; // for IE compatibility
				}
			}
		}
		for ( var i = 2;i < arguments.length; i++ ){
			var val = arguments[i];
			if ( typeof val == 'string' ) { val = document.createTextNode( val ) };
			el.appendChild( val );
		}
		return el;
	}
	
	
	////////////////////////////////////////////////
	window.WApi.Gui = new Gui();
})(window);

/**
*	Класс с помощь которого можно создавать конструкцию лоадера
* 
* 	@author th12legion (Кудиль Павел Николаевич)
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/
(function(window) {
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {LoaderX}
	*
	*/
	function LoaderX(){
		if (!(this instanceof LoaderX)){return new LoaderX()};
		
	}
	
	/**
	*	Функция для создания общесайтового лоадера
	*	
	*	@return {Boolean} - статус создания лоадера
	*
	*/
	LoaderX.prototype.create = function(){
		if (wjq('.wapi_loader_x').length>0){return true;}
		if (wjq('body').length==0){return false;}
		var GUI = WApi.Gui,
			LOADERX_PARENT = wjq('body');
		
		
		LOADERX_PARENT.append(
			GUI.element('div',{'class':'wapi_loader_x'},
				GUI.element('div',{'class':'wapi_loader_x_body'},
					GUI.element('div',{'class':'wapi_loader_x_title'},""),
					GUI.element('div',{'class':'wapi_loader_x_gif'},"")
				)
			)
		);
		return true;
	}
	
	/**
	*	Функция для удаления общесайтового лоадера
	*	
	*	@return {Boolean} - статус удаления лоадера
	*
	*/
	LoaderX.prototype.remove = function(){
		if (wjq('.wapi_loader_x').length==0){return false;}
		wjq('.wapi_loader_x').remove();
		return true;
	}
	
	WApi.Gui.LoaderX = new LoaderX();
	
})(window);

/**
*	Класс с помощь которого можно создавать окна
* 
* 	@author th12legion (Кудиль Павел Николаевич)
* 	@copyright 2016
* 	@license http://opensource.org/licenses/gpl-license.php GNU Public License
*	
*/
(function(Gui) {
	
	var WINX_LIST = [];
	var drag_obj = null,
		e_x_before = null,
		e_y_before = null,
		init_listener = function(){
			// Управляющие копки
			wjq('body').on('click','.wapi_winx_control',function(){
				var control = wjq(this).attr('data-winx-control'),
					control_win = wjq(this).closest('.wapi_winx'),
					winx_id = control_win.attr('data-winx-id');
				if (control_win.length==0){return false;}
				switch(control){
					case 'close':
						control_win.remove();
						WINX_LIST[winx_id]['close_cb'](winx_id);
						delete WINX_LIST[winx_id];
					break;
					case 'max':
						var parent_info = wjq(control_win.attr('data-winx-parent'))[0].info();
						if (WINX_LIST[winx_id]['mode']=='normal'){
							WINX_LIST[winx_id]['mode'] = "full";
							WApi.Gui.WinX.move(winx_id,0,0);
							WApi.Gui.WinX.resize(winx_id,parent_info['width'],parent_info['height']);
						}else{
							WINX_LIST[winx_id]['mode'] = "normal";
							WApi.Gui.WinX.move(winx_id,WINX_LIST[winx_id]['x'],WINX_LIST[winx_id]['y']);
							WApi.Gui.WinX.resize(winx_id,WINX_LIST[winx_id]['width'],WINX_LIST[winx_id]['height']);
						}
					break;
					case 'min':
						control_win.css('display','none');
					break;
				}
			});
			
			// Перетаскивание окон
			wjq('body').on('mousedown','.wapi_winx_drag',function(e){
				drag_obj = wjq(this).closest('.wapi_winx');
				if (drag_obj.length==0){drag_obj=null;}
				wjq('.wapi_winx').css('z-index',145);
				drag_obj.css('z-index',147);
			});
			wjq(document).on({
				mousemove: function(e) {
					if (drag_obj==null){return false;}
					var e_x = (e.pageX || e.clientX),
						e_y = (e.pageY || e.clientY),
						x = parseInt(drag_obj.css('left')),
						y = parseInt(drag_obj.css('top')),
						winx_id = drag_obj.attr('data-winx-id');
					x = (e_x_before==null)?x:x+(e_x-e_x_before);
					y = (e_y_before==null)?y:y+(e_y-e_y_before);
					e_x_before = e_x;
					e_y_before = e_y;
					WApi.Gui.WinX.move(drag_obj.attr('data-winx-id'),x,y);
					WINX_LIST[winx_id]['x'] = x;
					WINX_LIST[winx_id]['y'] = y;
				},
				mouseup: function() {
					drag_obj = e_x_before = e_y_before = null;
				}
			});
		}
	
	/**
	*	Функция конструктор
	*
	*	@constructor
	* 	@this {WinX}
	*
	*/
	function WinX(){
		if (!(this instanceof WinX)){return new WinX()};
		this.win_id = 1;
		tar(function(){
			init_listener();
		});
	}
	
	/**
	*	Функция для подгонки атрибутов
	*
	*	@param {Object} attr - Атрибуты окна
	*	
	*	@return {Object} attr - Обработанные атрибуты окна
	*
	*/
	WinX.prototype.fix_attr = function(attr){
		attr['parent'] = attr['parent'] || 'body';
		attr['parent_obj'] = tar(attr['parent']);
		if(attr['parent_obj']==null){return attr;}
		var parent_info = attr['parent_obj'].info();
		
		attr['width'] = attr['width'] || 'auto';
		attr['height'] = attr['height'] || 'auto';
		attr['width'] = (attr['width']=='auto')?parent_info['width']:attr['width'];
		attr['height'] = (attr['height']=='auto')?parent_info['height']:attr['height'];
		attr['width'] = (attr['width']=='half')?(Math.floor(parent_info['width']/2)):attr['width'];
		attr['height'] = (attr['height']=='half')?(Math.floor(parent_info['height']/2)):attr['height'];
		
		attr['x'] = attr['x'] || 0;
		attr['y'] = attr['y'] || 0;
		
		attr['x'] = (attr['x']=='left')?0:attr['x'];
		attr['x'] = (attr['x']=='center')?(parent_info['width']/2-attr['width']/2):attr['x'];
		attr['x'] = (attr['x']=='right')?(parent_info['width']-attr['width']):attr['x'];
		attr['x'] = (attr['x']=='fourth')?(Math.round(parent_info['width']*0.25)):attr['x'];
		
		attr['y'] = (attr['y']=='top')?0:attr['y'];
		attr['y'] = (attr['y']=='center')?(parent_info['height']/2-attr['height']/2):attr['y'];
		attr['y'] = (attr['y']=='bottom')?(parent_info['height']-attr['height']):attr['y'];
		attr['y'] = (attr['y']=='fourth')?(Math.round(parent_info['height']*0.25)):attr['y'];
		
		attr['title'] = attr['title'] || 'Заголовок окна';
		
		attr['min'] = attr['min'] || 'no';
		attr['max'] = attr['max'] || 'no';
		attr['close'] = attr['max'] || 'yes';
		
		attr['btn_panel'] = attr['btn_panel'] || 'none';
		attr['btn_panel_size_class'] = 'wapi_winx_size_'+attr['btn_panel'];
		attr['btn_panel_size'] = 0;
		attr['btn_panel_size'] = (attr['btn_panel']=='none')?0:attr['btn_panel_size'];
		attr['btn_panel_size'] = (attr['btn_panel']=='small')?30:attr['btn_panel_size'];
		attr['btn_panel_size'] = (attr['btn_panel']=='medium')?50:attr['btn_panel_size'];
		attr['btn_panel_size'] = (attr['btn_panel']=='big')?70:attr['btn_panel_size'];
		
		attr['menu_panel'] = attr['menu_panel'] || 'none';
		attr['menu_panel_size_class'] = 'wapi_winx_size_'+attr['menu_panel'];
		attr['menu_panel_size'] = 0;
		attr['menu_panel_size'] = (attr['menu_panel']=='none')?0:attr['menu_panel_size'];
		attr['menu_panel_size'] = (attr['menu_panel']=='small')?30:attr['menu_panel_size'];
		attr['menu_panel_size'] = (attr['menu_panel']=='medium')?50:attr['menu_panel_size'];
		attr['menu_panel_size'] = (attr['menu_panel']=='big')?70:attr['menu_panel_size'];
		
		attr['close_cb'] = attr['close_cb'] || function(win_id){};
		
		attr['custom_content'] = attr['custom_content'] || '';
		
		attr['signature'] = attr['signature'] || 'no_signature';
		
		return attr;
	}
	
	/**
	*	Функция для изминения размеров окна
	*
	*	@param {String} WINX_ID - ИД окна
	*	@param {Integer} x - Позиция окна по x
	*	@param {Integer} y - Позиция окна по y
	*	
	*	@return {Boolean} - Результат выполнения
	*
	*/
	WinX.prototype.move = function(WINX_ID,x,y){
		wjq('[data-winx-id="'+WINX_ID+'"]').css({'left':x,'top':y});
		return true;
	}
	
	/**
	*	Функция для изминения размеров окна
	*
	*	@param {String} WINX_ID - ИД окна
	*	@param {Integer} width - ширина окна
	*	@param {Integer} height - высота окна
	*	
	*	@return {Boolean} - Результат выполнения
	*
	*/
	WinX.prototype.resize = function(WINX_ID,width,height){
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_fullwidth').css('width',width);
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_fullheight').css('height',height);
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_fullsize').css({'width':width,'height':height});
		wjq('[data-winx-id="'+WINX_ID+'"].wapi_winx_fullsize').css({'width':width,'height':height});
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_content').css({
			'width':(width-10),
			'height':(height-35-WINX_LIST[WINX_ID]['btn_panel']-WINX_LIST[WINX_ID]['menu_panel']),
			'top':(30+WINX_LIST[WINX_ID]['menu_panel'])
		});
		
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_btn_panel').css('width',(width-10));
		wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_menu_panel').css('width',(width-10));
		
		return true;
	}
	
	/**
	*	Функция для заполнения контента окна
	*
	*	@param {String} WinId - Ид окна
	*	@param {String} content - Контент, который надо вставить
	*	
	*	@return {Object} this - объект класса
	*
	*/
	WinX.prototype.content = function(WINX_ID,content){
		var content = content || null;
		if (content!=null){
			wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_content').html(content);
		}else{
			return wjq('[data-winx-id="'+WINX_ID+'"] .wapi_winx_content').html();
		}
		return this;
	}
	
	/**
	*	Функция для создания нового окна
	*
	*	@param {Object} attr - Атрибуты окна
	*	
	*	@return {String} WinId - Ид созданного окна
	*
	*/
	WinX.prototype.create = function(attr){
		var attr = this.fix_attr(attr || {});
		if (attr['parent_obj']==null){return "Нет родительского элемента для вставик окна!";}
		
		
		var GUI = WApi.Gui,
			WINX_PARENT = attr['parent_obj'],
			WINX_ID = 'WIN_ID'+this.win_id;
		var ready_html = null;
		
		WINX_PARENT.appendChild(
			GUI.element(
					'div',{'class': 'wapi_winx wapi_winx_fullsize', 'data-winx-id':WINX_ID, 'data-winx-parent':attr['parent'], 'data-signature':attr['signature']},
						GUI.element('div',{'class': 'wapi_winx_plain wapi_winx_fullsize'},''),
						GUI.element('div',{'class': 'wapi_winx_head wapi_winx_fullwidth'},attr['title']),
						GUI.element('div',{'class': 'wapi_winx_drag wapi_winx_fullwidth'},
							GUI.element('div',{'class': 'wapi_winx_control_wrap'},
								(attr['min']=='yes')?GUI.element('button',{'class': 'wapi_winx_control wapi_winx_min','data-winx-control':'min'},''):'',
								(attr['max']=='yes')?GUI.element('button',{'class': 'wapi_winx_control wapi_winx_max','data-winx-control':'max'},''):'',
								GUI.element('button',{'class': 'wapi_winx_control wapi_winx_close','data-winx-control':'close'},'')
							)
						),
						GUI.element('div',{'class': 'wapi_winx_menu_panel '+attr['menu_panel_size_class']},''),
						GUI.element('div',{'class': 'wapi_winx_content '+attr['custom_content']},''),
						GUI.element('div',{'class': 'wapi_winx_btn_panel '+attr['btn_panel_size_class']},'')
			)
		);
		
		WINX_LIST[WINX_ID] = {
			'width':attr['width'],
			'height':attr['height'],
			'x':attr['x'],
			'y':attr['y'],
			'btn_panel':attr['btn_panel_size'],
			'menu_panel':attr['menu_panel_size'],
			'close_cb':attr['close_cb'],
			'mode':'normal',
		};
		
		this.resize(WINX_ID,attr['width'],attr['height']);
		this.move(WINX_ID,attr['x'],attr['y']);
		
		this.win_id++;
		return WINX_ID;
	}
	
	WApi.Gui.WinX = new WinX();
	
})(WApi.Gui);
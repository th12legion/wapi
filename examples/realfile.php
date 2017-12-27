<?php
	
	if (isset($params["filename"]) AND isset($params["mode"])){
		$file = $_SERVER['DOCUMENT_ROOT']."/".$params["filename"];
		$mode = $params["mode"];
		$role = 99; // 99 - гость , 1 - dev, 2 - админ, 3 - пользователь ... примерно ) 
		
		/* Проверка прав доступа к файлам */
		
		$permissions = explode('/',$file);
		$current_file = array_pop($permissions);
		$permissions_file = implode('/',$permissions).'/master.json';
		$permissions_file = (array)json_decode((file_exists($permissions_file))?file_get_contents($permissions_file):'{"*.*":"0"}');
		
		$file_ext = explode('.',$current_file);
		$file_ext = '*.'.array_pop($file_ext);
		
		$file_name = explode('.',$current_file);
		$file_name = $file_name[0].'.*';
		
		if(isset($permissions_file[$current_file])){
			$levels = explode(',',$permissions_file[$current_file]);
		}elseif(isset($permissions_file[$file_ext])){
			$levels = explode(',',$permissions_file[$file_ext]);
		}elseif(isset($permissions_file[$file_name])){
			$levels = explode(',',$permissions_file[$file_name]);
		}elseif(isset($permissions_file['*.*'])){
			$levels = explode(',',$permissions_file['*.*']);
		}else{
			$levels = array("0");
		}
		
		$key_level = array_search("0", $levels);
		if($key_level!==false){
			$mode = "permissions_fail";
		}else{
			$key_level = array_search("-1", $levels);
			if($key_level===false){
				$key_level = array_search($role, $levels);
				if($key_level===false){
					$mode = "permissions_fail";
				}
			}
		}
		
		/* Проверка прав доступа к файлам */
		
		switch($mode){
			case "permissions_fail":
				$AJAX['status'] = 4;
				$AJAX['content'] = "Недостаточно прав для доступа к єтому файлу!";
			break;
			case "read":
				if (file_exists($file)) {
					$AJAX['status'] = 12;
					$AJAX['content'] = base64_encode(file_get_contents($file));
				}else{
					$AJAX['status'] = 1;
					$AJAX['content'] = "Такой файл не существует!";
				}
			break;
			case "exists":
				if (file_exists($file)) {
					$AJAX['status'] = 12;
					$AJAX['content'] = "Файл существует!";
				}else{
					$AJAX['status'] = 1;
					$AJAX['content'] = "Такой файл не существует!";
				}
			break;
			case "write":
				$content = (isset($params["content"]))?$params["content"]:"";
				file_put_contents($file,$content);
				$AJAX['status'] = 12;
				$AJAX['content'] = "Файл сохранен!";
			break;
			case "remove":
				if (file_exists($file)) {
					$AJAX['status'] = 12;
					$AJAX['content'] = "Файл удален!";
					unlink($file);
				}
				else{
					$AJAX['status'] = 1;
					$AJAX['content'] = "Такой файл не существует!";
				}
			break;
		}
	}else{
		$AJAX['status'] = 2;
		$AJAX['content'] = "Ошибка в передаваемых параметрах!";
	}
?>
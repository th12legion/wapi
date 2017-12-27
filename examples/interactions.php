<?php
	$params = $_REQUEST;
	$AJAX = array(
		'status'=>99,
		'content'=>'Неизвестная ошибка!'
	);
	if (!isset($params['actajax'])){
		$AJAX['status'] = 2;
		$AJAX['content'] = "Ошибка в передаваемых параметрах!";
		exit;
	}
	switch($params['actajax']){
		case "":
			require_once "realfile.php";
		break;
		default:
			$AJAX['status'] = 99;
			$AJAX['content'] = "Неизвестная ошибка!";
		break;
	}
	
	print_r($AJAX);
?>

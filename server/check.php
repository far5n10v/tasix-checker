<?php
// O‘zgarmaslarni qo‘yib olamiz
define('FILE_NAME', 'subnets.txt');
define('STATUS_INVALID', 'invalid');
define('STATUS_ON_TASIX', 'true');
define('STATUS_NOT_ON_TASIX', 'false');
define('EXPIRE_TIME', 60 * 60 * 24 * 7);

// Domen bormi?
if (!isset($_GET['domain'])) exit(STATUS_INVALID);

require 'CIDR.php';

// Domen IPsini olinadi
$ip = gethostbyname($_GET['domain']);
// Agar domen IPsi aniqlanmasa, chiqadi
if (empty($ip) || ($ip == $_GET['domain'])) exit(STATUS_INVALID);

$subnets_file_content = '';

if (file_exists(FILE_NAME)) {
	$subnets_file_content = file_get_contents(FILE_NAME);
}

// Zonalar fayli mavjudmasmi?
// Bo‘shmi?
// Yangilanganiga bir hafta bo‘ldimi?
if (!file_exists(FILE_NAME) || 
	empty($subnets_file_content) || 
	((time() - filemtime(FILE_NAME)) > EXPIRE_TIME)) {
	// yangilanadi zonalar
	$subnets_file_content = update_subnets();
}

// Shunda ham zonalar bo‘sh bo‘lsa, chiqadi
if (empty($subnets_file_content)) exit(STATUS_INVALID);

// IP‘ni zonalarga tekshirish
$cidr_array = explode("\n", $subnets);
$on_tasix = FALSE;
foreach ($cidr_array as $cidr) {
	// IP zona diapazonidami?
	if (CIDR::IPisWithinCIDR($ip, $cidr)) {
		$on_tasix = TRUE;
		break;
	}
}

// Hal qiluvchi lahza
if ($on_tasix) echo STATUS_ON_TASIX;
else echo STATUS_NOT_ON_TASIX;

// Zonalarni voydod saytidan olish va ularni faylga saqlab qo‘yish
function update_subnets() {
	$content = file_get_contents('http://tasix.sarkor.uz/full');
	
	if (!empty($content)) file_put_contents('subnets.txt', $content);

	return $content;
}
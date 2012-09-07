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
// IPning son ko‘rinishini
$ip = ip2long($ip);

$subnets_file_content = '';

// Zonalar fayli mavjudmasmi?
// Bo‘shmi?
// Yangilanganiga bir hafta bo‘ldimi?
if (!file_exists(FILE_NAME) || 
	(strlen($subnets_file_content = file_get_contents(FILE_NAME)) == 0) || 
	((time() - filemtime(FILE_NAME)) > EXPIRE_TIME))
{
	// U holda yangilanadi zonalar
	$subnets_file_content = update_subnets();
}

// Agar zonalar o‘qilmagan bo‘lsa o‘qiladi
if (empty($subnets_file_content)) $subnets_file_content = file_get_contents(FILE_NAME);
// Shunda ham zonalar bo‘sh bo‘lsa, chiqadi
if (empty($subnets_file_content)) exit(STATUS_INVALID);

// IP‘ni zonalarga tekshirish
$subnet_array = explode("\n", $subnets);
$on_tasix = FALSE;
foreach ($subnet_array as $subnet)
{
	$zone = explode("\t", $subnet);
	// IP zona diapazonidami?
	if (($ip >= ip2long($zone[0])) && ($ip <= ip2long($zone[1])))
	{
		$on_tasix = TRUE;
		break;
	}
}

// Hal qiluvchi lahza
if ($on_tasix) echo STATUS_ON_TASIX;
else echo STATUS_NOT_ON_TASIX;

// Zonalarni voydod saytidan olish va ularni faylga saqlab qo‘yish
function update_subnets()
{
	require 'simple_html_dom.php';
	
	$html = file_get_html('http://voydod.uz/tasix_subnets.php');
	$subnets = $html->find('textarea[id=ips]', 0)->innertext;
	
	if (strlen($subnets) > 0) file_put_contents('subnets.txt', $subnets);
	return $subnets;
}
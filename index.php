<?php
// Require SimpleHTMLDOM library
require('lib/simplehtmldom.php');

// Set default timezone for date()
date_default_timezone_set("Europe/Berlin");

// Set default headers
$defaultHeaders = array(
  'Pragma: no-cache',
  'Accept-Encoding: gzip, deflate, sdch',
  'Accept-Language: en-US,en;q=0.8,en-US;q=0.6,en;q=0.4',
  'Upgrade-Insecure-Requests: 1',
  'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2460.0 Safari/537.36',
  'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Cache-Control: no-cache',
  'Connection: keep-alive'
);

// Check for config file
if (!file_exists('config.json')) {
  die('Error: No configuration file found. Make sure to copy the default one to \'config.json\'');
} else {
  $config = json_decode(file_get_contents('config.json'));
}

// Load credentials from config
$username = $config->username;
$password = $config->password;

// Check for possible "target" argument
$target = (isset($argv[1])) ? $argv[1] : "";

/*
 * First HTTP request to parse and store RequestVerificationToken
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,"http://socialclub.rockstargames.com/");
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_ENCODING , "");
curl_setopt($ch, CURLOPT_HTTPHEADER,
  array_merge(
    $defaultHeaders
  )
);

$buf1 = curl_exec($ch);
curl_close ($ch);
unset($ch);

// Store __RequestVerificationToken
$parsed_rvt = str_get_html($buf1)->find('input[name=__RequestVerificationToken]', 0)->value;

/*
 * Second request to sign in using RequestVerificationToken
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_URL,"https://socialclub.rockstargames.com/profile/signin");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_ENCODING , "");
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "login=".$username."&password=".$password."&__RequestVerificationToken=".$parsed_rvt);
curl_setopt($ch, CURLOPT_HTTPHEADER,
  array_merge(
    $defaultHeaders,
    array(
      'Content-Type: application/x-www-form-urlencoded'
    )
  )
);

$buf2 = curl_exec ($ch); // execute the curl command
curl_close ($ch);
unset($ch);

// Check if ReCaptcha tampers into our sign in request
if (strpos($buf2, "showRecaptcha: true")) {
  die('Captcha request detected. Sign into SocialClub using a desktop browser from this machine to please ReCaptcha. Then retry using this parser.');
}

/*
 * Third request to get actual informations using authorized cookie file
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_ENCODING , "gzip");
curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_URL,"http://socialclub.rockstargames.com/games/gtav/career/overviewAjax?character=Freemode&nickname=".$target."&slot=Freemode&gamerHandle=&gamerTag=&_=".time()."000");
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
curl_setopt($ch, CURLOPT_HTTPHEADER,
  array_merge(
    $defaultHeaders,
    array(
      'Accept-Encoding: gzip, deflate',
    )
  )
);

$buf3 = curl_exec ($ch);
curl_close ($ch);
unset($ch);

// Return information
echo "<PRE>".$buf3."</PRE>";

?>

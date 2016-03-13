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

/* Functions */

/**
 * Check for existing cookie jar, will return
 * 'true' if the file is found.
 * @return {BOOL}
 */
function checkExistingCookieJar(){
  return (file_exists('cookie_jar.txt')) ? true : false;
}

/**
 * Check input string for possible captcha, will
 * return 'false' if there was no captacha request
 * detected, otherwise it'll die with an error msg.
 * @param {String} $input
 * @return {BOOL}
 */
function checkForCaptchaRequest($input){
  if (strpos($input, "showRecaptcha: true")) {
    die('Captcha request detected. Sign into SocialClub using a desktop browser from this machine to please ReCaptcha. Then retry using this parser.');
    return true;
  } else {
    return false;
  }
}

/**
 * Check for empty data, will return 'true'
 * if empty/fake data was detected
 * @param {String} $input
 * @return {BOOL}
 */
function checkForEmptyData($input){
  if (strpos($input, "Play Time: 0h 0m 0s")) {
    return true;
  } else {
    return false;
  }
}

/**
 * Function to sign into SocialClub and store the authorized
 * cookie in our cookie jar. Will return 'true' if the
 * authentication was successful.
 * @return {Bool} State of authentication
 */
function renewAuthentication() {
  global $defaultHeaders, $username, $password;
  /* Request to parse __RequestVerificationToken */

  // Initiate curl request
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

  // Store buffer and unset curl variables
  $buffer = curl_exec($ch);
  curl_close ($ch);
  unset($ch);

  // Store __RequestVerificationToken
  $parsed_rvt = str_get_html($buffer)->find('input[name=__RequestVerificationToken]', 0)->value;

  /* Request to sign in and store authorization cookie */

  // Initiate curl request
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

  // Store buffer and unset curl variables
  $buffer = curl_exec ($ch);
  curl_close ($ch);
  unset($ch);

  // Check if there is no captcha request by R*
  if (!checkForCaptchaRequest($buffer)) {
    return true;
  }
}

/**
 * Function to request to get actual informations using
 * authorized session in the cookie file
 * @return {String} SocialClub response
 */
function parseActualInformation(){
  global $target, $defaultHeaders;

  // Initiate curl request
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
  $buffer = curl_exec ($ch);
  curl_close ($ch);
  unset($ch);

  return $buffer;
}

/* Core */

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

// Authenticate if there is no cookie jar file
if (!checkExistingCookieJar()){
  renewAuthentication();
}

// Try to parse data using existing cookie file
$data = parseActualInformation();

// If the string contains empty/fake data ...
if (checkForEmptyData($data)) {
  // ... try to renew the authentication
  if (renewAuthentication()) {
    // ... and actually parse the informations again
    $data = parseActualInformation();
    echo $data;
  }
} else {
  // ... otherwise just return the valid data
  echo $data;
}

// Exit without errors
exit(0);

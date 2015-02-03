<?php
// Require SimpleHTMLDOM library
require('lib/simplehtmldom.php');

// Set default timezone for date()
date_default_timezone_set("Europe/Berlin");

// Parse GET parameters
if (isset($_GET['username']) && isset($_GET['password'])) {
  $username=$_GET['username'];
  $password=$_GET['password'];
} else {
  // If none, die
  die("Error: make sure to pass \"username\" and \"password\" GET parameters!");
}

// Use target GET parameter, if set
if (isset($_GET['target'])) {
  $target=$_GET['target'];
} else {
  // Otherwise, keep it empty
  $target="";
}
/*
 *  First HTTP request to parse and store RequestVerificationToken
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_URL,"http://socialclub.rockstargames.com/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
$buf1 = curl_exec($ch);
curl_close ($ch);
unset($ch);

// Store __RequestVerificationToken
$parsed_rvt = str_get_html($buf1)->find('input[name=__RequestVerificationToken]', 0)->value;

/*
 *  Second request to sign in using RequestVerificationToken
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_URL,"https://socialclub.rockstargames.com/profile/signin");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "login=".$username."&password=".$password."&__RequestVerificationToken=".$parsed_rvt);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/x-www-form-urlencoded'
  )
);

$buf2 = curl_exec ($ch); // execute the curl command
curl_close ($ch);
unset($ch);

/*
 *  Third request to get actual informations using authorized cookie file
 */

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_ENCODING , "gzip");
curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie_jar.txt");
curl_setopt($ch, CURLOPT_URL,"http://socialclub.rockstargames.com/games/gtav/career/overviewAjax?character=Freemode&nickname=".$target."&slot=Freemode&gamerHandle=&gamerTag=&_=".time()."000");
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
  'Accept-Encoding: gzip, deflate',
  )
);

$buf3 = curl_exec ($ch);
curl_close ($ch);
unset($ch);

// Return information
echo "<PRE>".$buf3."</PRE>";

?>

#!/usr/bin/env node

// Load neccessary modules
var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var FileCookieStore = require('tough-cookie-filestore');

// Array with default headers
var DEFAULT_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.8,nl;q=0.6',
    'Connection': 'keep-alive',
    'Host': 'socialclub.rockstargames.com',
    'Origin': 'https://socialclub.rockstargames.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
};

// Check if config file exists
if (fs.existsSync('config.json')) {
    var config = require('./config.json');
} else {
    console.error('[Error] Couldn\'t find configuration file "config.json"');
    process.exit(1);
}

/**
 * Start the script.
 */
function start(forceNewLogin) {

    // Force a new login to SocialClub, for example when the cookies are not valid anymore
    if (forceNewLogin) {
        renewAuthentication(function (cookieJar, verificationToken) {
            printActualInformation(cookieJar);
        });
        return;
    }

    console.log('Checking for existing cookies and verification token');

    async.parallel({
        getCookiesFile: function (done) {
            readFile('cookies.json', function (err, cookieFileData) {
                done(err, cookieFileData);
            });
        },
        getVerificationTokenFile: function (done) {
            readFile('verificationToken.txt', function (err, verificationFileData) {
                done(err, verificationFileData);
            });
        }
    }, function (err, results) {
        if (err) {
            console.error(err);
            return;
        }

        var cookieFileData = results['getCookiesFile'];
        var verificationToken = results['getVerificationTokenFile'];

        // If one or both files doesn't exist, renew the authentication
        if (!cookieFileData || !verificationToken) {
            console.log('No existing cookies and/or verification token found');

            start(true);
            return;
        }

        console.log('Existing cookies and verification token found');

        try {

            // Use the existing cookies and verification token
            var cookieJar = request.jar(new FileCookieStore('cookies.json'));
            printActualInformation(cookieJar);
        } catch (err) {

            // Sometimes an exception is thrown because the cookies.json file contains invalid JSON for some reason
            if (err instanceof SyntaxError) {
                console.log('Existing cookies are unreadable');

                // So renew the authentication in that case
                start(true);
            } else {
                console.error(err);
            }
        }
    });
}

/**
 * Get the contents of a file. If it doesn't exist, an empty string is given to the callback.
 * @param {string} filePath - The file path of the file to be read.
 * @param {function} callback - Function that gets called when the contents of the verification token file is retrieved.
 */
function readFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err && err.code === 'ENOENT') {
            callback('');
            return;
        }

        callback(err, data);
    });
}

/**
 * Get the current timestamp.
 * @returns {number} - The current timestamp.
 */
function getTimestamp() {
    return Math.floor(new Date().getTime());
}

/**
 * Parse a string to an integer, including stripping the 'per mille' sign (,) and the dollar sign ($).
 * @param {string} input - The input to be parsed to an integer.
 * @returns {number} - The parsed integer.
 */
function parseInteger(input) {
    return parseInt(input.replace(/[\$,]/g, '').trim());
}

/* -------------------------------------- */

/**
 * Function to sign into SocialClub to get a "AuthenticateCookie" cookie.
 * @param {function} callback - Function that gets called when the authentication is renewed.
 */
function renewAuthentication(callback) {
    console.log('Renewing the authentication');

    createCookiesJar(function (cookieJar) {
        getVerificationToken(cookieJar, function (cookieJar, verificationToken) {
            signIn(cookieJar, verificationToken, function (cookieJar) {
                callback(cookieJar, verificationToken);
            });
        });
    });
}

/**
 * Creates a new cookie jar.
 * @param callback - Function that gets called when the cookie jar is created.
 */
function createCookiesJar(callback) {

    // Create the cookies jar file
    fs.writeFile('cookies.json', '', function (err) {
        if (err) {
            console.error(err);
            return;
        }

        // Create an empty cookie jar, which will be filled with cookies
        var cookieJar = request.jar(new FileCookieStore('cookies.json'));

        callback(cookieJar);
    });
}

/**
 * Remember a SocialClub verification token. It is saved to a .txt file.
 * @param {string} verificationToken - The SocialClub verification token to be remembered.
 * @param callback - Function that gets called when the verification token is saved.
 */
function rememberVerificationToken(verificationToken, callback) {
    fs.writeFile('verificationToken.txt', verificationToken, function (err) {
        if (err) {
            console.error(err);
            return;
        }

        callback();
    });
}

/**
 * Function to retrieve the login page of SocialClub to get a verification token.
 * @param {RequestJar} cookieJar - An (empty) cookie jar.
 * @param {function} callback - Function that gets called when the verification token is retrieved.
 */
function getVerificationToken(cookieJar, callback) {
    var options = {
        gzip: true,
        headers: DEFAULT_HEADERS,
        jar: cookieJar,
        url: 'https://socialclub.rockstargames.com/profile/signin'
    };

    console.log('Send GET-request to: ' + options.url);
    request.get(options, function (err, response, body) {
        if (err) {
            console.error(err);
            return;
        }

        // Caution: There are multiple "__RequestVerificationToken" in the body, take the right one
        var regExpVerificationToken = new RegExp('</li>[^]*<input name="__RequestVerificationToken" type="hidden" value="(.*)" \/><li class="twitter">');
        var match = body.match(regExpVerificationToken);
        var verificationToken = match ? match[1] : null;

        // When the verification token is not found, the regular expression could be outdated
        if (!verificationToken) {
            console.error('Retrieving the verification token from the homepage of SocialClub failed. ' +
                'It could be that R* has moved the position of the verification token field, ' +
                'or that they have changed everything and this script doesn\'t work anymore.');
            return;
        }

        console.log('Retrieved verification token: ' + verificationToken);

        // Remember the verification token
        rememberVerificationToken(verificationToken, function () {

            // Return the cookie jar filled with some cookies and the verification token
            callback(cookieJar, verificationToken);
        });
    });
}

/**
 * Function to sign into SocialClub to get the "AuthenticateCookie" cookie in the cookie jar.
 * @param {RequestJar} cookieJar - The cookie jar filled with some cookies from the login page of SocialClub.
 * @param {string} verificationToken - The verification token that was retrieved from the homepage of SocialClub.
 * @param {function} callback - Function that gets called when the sign in was successful.
 */
function signIn(cookieJar, verificationToken, callback) {
    var headers = DEFAULT_HEADERS;
    headers['Accept'] = 'application/json, text/javascript, */*; q=0.01';
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    headers['RequestVerificationToken'] = verificationToken;

    var options = {
        body: {
            'login': config.username,
            'password': config.password,
            'rememberme': true
        },
        gzip: true,
        headers: headers,
        jar: cookieJar,
        json: true,
        url: 'https://socialclub.rockstargames.com/profile/signincompact'
    };

    console.log('Send POST-request to: ' + options.url);
    request.post(options, function (err, response, body) {
        if (err) {
            console.error(err);
            return;
        }

        // console.log('Request HTTP headers:', response.request.headers);
        // console.log('Response HTTP headers:', response.headers);

        // When a CAPTCHA is requested, a status code of 403 is returned
        if (response.statusCode === 403) {
            console.error('Signing into SocialClub failed, probably because a CAPTCHA is requested. ' +
                'Using this machine, first sign into SocialClub manually using a browser ' +
                'and then try to run this script again.');
            return;
        }

        // We should get a status code of 200
        if (response.statusCode !== 200) {
            console.error('Signing into SocialClub failed. The problem could be anything. ' +
                'Please make sure the correct headers are in the HTTP request.');
            return;
        }

        var cookies = response.headers['set-cookie'];
        var authenticationCookieReceived = false;

        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf('AuthenticateCookie') !== -1) {
                authenticationCookieReceived = true;
                break;
            }
        }

        if (!authenticationCookieReceived) {
            console.error('No authentication cookie has been sent. Did you provide the correct credentials?');
            return;
        }

        callback(cookieJar);
    });
}

/* -------------------------------------- */


/**
 * Calculate the actual percentage of a progress bar statistic.
 * @param {Cheerio} $ - A Cheerio object loaded with the HTML of the page containing the personal information.
 * @param {string} statsType - The statistic type of which the percentage must be calculated.
 * @returns {number} - The calculated percentage of the given statistic type.
 */
function calculateProgressbarStats($, statsType) {
    var percentage = 0;
    var statsPercentages = $('h5:contains("' + statsType + '")').next().find($('.progress-bar'));

    for (var i = 0; i < 5; i++) {
        var subPercentage = parseInteger(statsPercentages.eq(i).text());

        if (!subPercentage) {
            subPercentage = 0;
        }

        percentage += subPercentage;
    }

    return percentage / 5;
}

/**
 * Constructs an array for all recent activities.
 * @param {Cheerio} $ - A Cheerio object loaded with the HTML of the page containing the personal information.
 * @returns {object[]} - The array with all recent activities.
 */
function getRecentActivity($) {
    var activities = $('#recentActivity ul').find('li[data-type=award]');
    var arr = [];

    activities.each(function (i, elem) {
        arr.push({
            'name': $(this).attr('data-name').trim(),
            'type': $(this).attr('data-award').trim(),
            'image': $(this).find('img').eq(0).attr('src').trim()
        });
    });

    return arr;
}

/**
 * Request, parse and print the actual information.
 * @param {RequestJar} cookieJar - The cookie jar including the "AuthenticateCookie" cookie.
 */
function printActualInformation(cookieJar) {
    var target = process.argv[2] ? process.argv[2] : config.username;

    var headers = DEFAULT_HEADERS;
    //headers['Accept'] = 'application/json, text/javascript, */*; q=0.01';
    //headers['Content-Type'] = 'application/json; charset=UTF-8';

    var options = {
        gzip: true,
        headers: headers,
        jar: cookieJar,
        json: true,
        url: 'http://socialclub.rockstargames.com/games/gtav/career/overviewAjax?character=Freemode&nickname=' + target + '&slot=Freemode&gamerHandle=&gamerTag=&_=' + getTimestamp()
    };

    console.log('Send GET-request to: ' + options.url);
    request.get(options, function (err, response, body) {
        if (err) {
            console.error(err);
            return;
        }

        // Cookies and/or verification code are probably invalid, so renew the authentication and try again
        if (response.statusCode !== 200) {
            start(true);
            return;
        }

        var $ = cheerio.load(body.replace(/\\r\\n|\\n|\\r/g, ''));
        var crewObj = {};
        var favouriteWeapon = {};

        // When the user is in a crew
        if (body.indexOf('Not In A Crew') === -1) {
            crewObj = {
                'name': $('.crewCard .clearfix .left h3 a').first().text().trim(),
                'tag': $('.crewCard .clearfix .left .crewTag span').first().text().trim(),
                'emblem': $('.crewCard .clearfix .avatar').first().attr('src').trim()
            };
        }

        // When the user has a favorite weapon
        if (!$('#faveWeaponWrapper').has($('.noData'))) {
            favouriteWeapon = {
                'name': $('#faveWeaponWrapper .imageHolder h4').first().text().trim(),
                'image': $('#faveWeaponWrapper .imageHolder img').first().attr('src').trim(),
                'stats': {
                    'damage': $('.weaponStats tr td:contains("Damage") span').text().trim(),
                    'fire-rate': $('.weaponStats tr td:contains("Fire Rate") span').text().trim(),
                    'accuracy': $('.weaponStats tr td:contains("Accuracy") span').text().trim(),
                    'range': $('.weaponStats tr td:contains("Range") span').text().trim(),
                    'clip-size': $('.weaponStats tr td:contains("Clip Size") span').text().trim()
                },
                'kills': parseInteger($('h5:contains("Kills")').next().text()),
                'headshots': parseInteger($('h5:contains("Headshots")').next().text()),
                'accuracy': $('h5:contains("Accuracy")').next().text().trim(),
                'time-held': $('h5:contains("Time held")').next().text().trim()
            };
        }

        // The actual information object
        var obj = {
            'general': {
                'rank': parseInt($('.rankHex h3').first().text().trim()),
                'xp': parseInt($('.rankXP .clearfix .left').first().text().trim()),
                'play-time': $('.rankBar h4').first().text().replace('Play Time: ', '').trim(),
                'money': {
                    'cash': $('#cash-value').first().text().trim(),
                    'bank': $('#bank-value').first().text().trim()
                }
            },
            'crew': crewObj,
            'freemode': {
                'races': {
                    'wins': parseInteger($('p[data-name="Races"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Races"]').first().attr('data-loss')),
                    'time': $('p[data-name="Races"]').first().attr('data-extra').trim()
                },
                'deathmatches': {
                    'wins': parseInteger($('p[data-name="Deathmatches"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Deathmatches"]').first().attr('data-loss')),
                    'time': $('p[data-name="Deathmatches"]').first().attr('data-extra').trim()
                },
                'parachuting': {
                    'wins': parseInteger($('p[data-name="Parachuting"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Parachuting"]').first().attr('data-loss')),
                    'perfect-landing': parseInteger($('p[data-name="Parachuting"]').first().attr('data-extra'))
                },
                'darts': {
                    'wins': parseInteger($('p[data-name="Darts"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Darts"]').first().attr('data-loss')),
                    'six-darter': parseInteger($('p[data-name="Darts"]').first().attr('data-extra'))
                },
                'tennis': {
                    'wins': parseInteger($('p[data-name="Tennis"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Tennis"]').first().attr('data-loss')),
                    'aces': parseInteger($('p[data-name="Tennis"]').first().attr('data-extra'))
                },
                'golf': {
                    'wins': parseInteger($('p[data-name="Golf"]').first().attr('data-win')),
                    'losses': parseInteger($('p[data-name="Golf"]').first().attr('data-loss')),
                    'hole-in-one': parseInteger($('p[data-name="Golf"]').first().attr('data-extra'))
                }
            },
            'money': {
                'total': {
                    'spent': $('#cashSpent p').first().text().trim(),
                    'earned': $('#cashEarned p').first().text().trim()
                },
                'earnedby': {
                    'jobs': $('.cash-val[data-name="Jobs"]').first().attr('data-cash').trim(),
                    'shared': $('.cash-val[data-name="Shared"]').first().attr('data-cash').trim(),
                    'betting': $('.cash-val[data-name="Betting"]').first().attr('data-cash').trim(),
                    'car-sales': $('.cash-val[data-name="Car Sales"]').first().attr('data-cash').trim(),
                    'picked-up': $('.cash-val[data-name="Picked Up"]').first().attr('data-cash').trim(),
                    'other': $('.cash-val[data-name="Other"]').first().attr('data-cash').trim()
                }
            },
            'stats': {
                'stamina': calculateProgressbarStats($, 'Stamina') + '%',
                'stealth': calculateProgressbarStats($, 'Stealth') + '%',
                'lung-capacity': calculateProgressbarStats($, 'Lung Capacity') + '%',
                'flying': calculateProgressbarStats($, 'Flying') + '%',
                'shooting': calculateProgressbarStats($, 'Shooting') + '%',
                'strength': calculateProgressbarStats($, 'Strength') + '%',
                'driving': calculateProgressbarStats($, 'Driving') + '%',
                'mental-state': calculateProgressbarStats($, 'Mental State') + '%'
            },
            'criminalrecord': {
                'cops-killed': parseInteger($('h5:contains("Cops killed")').next().text()),
                'wanted-stars': parseInteger($('h5:contains("Wanted stars attained")').next().text()),
                'time-wanted': $('h5:contains("Time Wanted")').next().text().trim(),
                'stolen-vehicles': parseInteger($('h5:contains("Vehicles Stolen")').next().text()),
                'cars-exported': parseInteger($('h5:contains("Cars Exported")').next().text()),
                'store-holdups': parseInteger($('h5:contains("Store Hold Ups")').next().text())
            },
            'favourite-weapon': favouriteWeapon,
            'recent-activity': getRecentActivity($)
        };

        // Print the actual information object
        console.log(obj);
    });
}

/* -------------------------------------- */

start(false);

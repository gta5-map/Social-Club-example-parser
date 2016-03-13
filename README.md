SocialClub-example-parser
=========================

Simple example parser for Rockstar's Social Club written in PHP that makes use of [gta5-map/Social-Club-API-cheat-sheet](https://github.com/gta5-map/Social-Club-API-cheat-sheet).

## Installation

1. Clone repository:  
  `git clone https://github.com/gta5-map/SocialClub-example-parser.git`  
  `cd SocialClub-example-parser`
1. Copy and adjust the config file:  
  `cp config.default.json config.json`  
  `vi config.json`  

## Usage

Execute the parser via terminal like this:  

```shell
$ php index.php 
```

... or incase you want to target another player:  

```shell
$ php index.php RestlessNarwhal 
```

## Configuration

```json
{
  "debug": true,
  "trace": false,
  "username": "SC_username",
  "password": "SC_password"
}
```

- `debug` - can be set to `true` or `false` - Display debug information
- `trace` - can be set to `true` or `false` - Display more detailed information
- `username` - must be a string - Should contain your SocialClub username
- `password` - must be a string - Should contain your SocialClub password

## License

[MIT](LICENSE)

## Version

1.1

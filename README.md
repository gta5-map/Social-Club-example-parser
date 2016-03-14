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

## Example output

```json
{
  "general": {
    "rank": "249",
    "xp": "6.4M",
    "play-time": "64d 20h 34m",
    "money": {
      "cash": "$317,308",
      "bank": "$3,319,570"
    }
  },
  "crew": {
    "name": "GTAAdventuresXB1",
    "tag": "gta1",
    "emblem": "http:\/\/prod.cloud.rockstargames.com\/crews\/sc\/6762\/12096658\/publish\/emblem\/emblem_64.png"
  },
  "freemode": {
    "races": {
      "wins": "76",
      "losses": "199",
      "time": "36h 18m 6s"
    },
    "deathmatches": {
      "wins": "6",
      "losses": "19",
      "time": "4h 59m 53s"
    },
    "parachuting": {
      "wins": "16",
      "losses": "16",
      "perfect-landing": "27"
    },
    "darts": {
      "wins": "0",
      "losses": "0",
      "six-darter": "0"
    },
    "tennis": {
      "wins": "0",
      "losses": "3",
      "aces": "3"
    },
    "golf": {
      "wins": "1",
      "losses": "0",
      "hole-in-one": "No"
    }
  },
  "money": {
    "total": {
      "spent": "$99M",
      "earned": "$103.1M"
    },
    "earnedby": {
      "jobs": "$24.2M",
      "shared": "$218.2K",
      "betting": "$469.5K",
      "car-sales": "$71.2M",
      "picked-up": "$242.4K",
      "other": "$630K"
    }
  },
  "stats": {
    "stamina": 100,
    "stealth": 100,
    "lung-capacity": 100,
    "flying": 100,
    "shooting": 100,
    "strength": 88,
    "driving": 100,
    "mental-state": 0
  },
  "criminalrecord": {
    "cops-killed": "17.1K",
    "wanted-stars": "25.6K",
    "time-wanted": "4d 1h 2m",
    "stolen-vehicles": "4,324",
    "cars-exported": "5",
    "store-holdups": "109"
  },
  "favourite-weapon": {
    "name": "Advanced Rifle",
    "image": "http:\/\/cdn.sc.rockstargames.com\/images\/games\/GTAV\/weapons\/314x120_colour\/W_AR_AdvancedRifle.png",
    "stats": {
      "damage": "70",
      "fire-rate": "70",
      "accuracy": "50",
      "range": "45",
      "clip-size": "40"
    },
    "kills": "6146",
    "headshots": "3053",
    "accuracy": "27.72",
    "time-held": "44:03:02"
  },
  "recent-activity": [
    [{
      "name": "The Widow Maker",
      "type": "Platinum",
      "image": "http:\/\/cdn.sc.rockstargames.com\/images\/games\/GTAV\/multiplayer\/award\/platinum\/OverallKills.png"
    }, {
      "name": "3 For 1",
      "type": "Silver",
      "image": "http:\/\/cdn.sc.rockstargames.com\/images\/games\/GTAV\/multiplayer\/award\/silver\/HatTrickKiller.png"
    }, {
      "name": "Streaker",
      "type": "Bronze",
      "image": "http:\/\/cdn.sc.rockstargames.com\/images\/games\/GTAV\/multiplayer\/award\/bronze\/KillStreak.png"
    }, {
      "name": "Death Toll",
      "type": "Silver",
      "image": "http:\/\/cdn.sc.rockstargames.com\/images\/games\/GTAV\/multiplayer\/award\/silver\/TotalKills.png"
    }]
  ]
}
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

1.2

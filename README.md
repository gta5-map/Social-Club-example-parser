SocialClub-example-parser
=========================

Simple example parser for Rockstar's Social Club written in Javascript that makes use of [gta5-map/Social-Club-API-cheat-sheet](https://github.com/gta5-map/Social-Club-API-cheat-sheet).

## Installation

1. Clone repository:  

    ```
    git clone https://github.com/gta5-map/SocialClub-example-parser.git  
    cd SocialClub-example-parser
    ```

1. Copy and adjust the config file:  
    
    ```
    cp config.default.json config.json  
    vi config.json 
    ```
    
1. Install Node dependencies:

    ```
    npm install
    ```

## Usage

Execute the parser via terminal like this:  

```shell
node index.js 
```

... or incase you want to target another player:  

```shell
node index.js RestlessNarwhal 
```

## Example output

```json
{
    "general": {
        "rank": 279,
        "xp": 7,
        "play-time": "73d 11h 14m",
        "money": {
            "cash": "$49,200",
            "bank": "$8,393,145"
        }
    },
    "crew": {
        "name": "PCEO Division 2",
        "tag": "PCEO",
        "emblem": "https://prod.cloud.rockstargames.com/crews/sc/8420/29265986/publish/emblem/emblem_64.png"
    },
    "freemode": {
        "races": {
            "wins": 77,
            "losses": 233,
            "time": "40h 29m 20s"
        },
        "deathmatches": {
            "wins": 6,
            "losses": 19,
            "time": "5h 6s"
        },
        "parachuting": {
            "wins": 16,
            "losses": 16,
            "perfect-landing": 27
        },
        "darts": {
            "wins": 0,
            "losses": 0,
            "six-darter": 0
        },
        "tennis": {
            "wins": 0,
            "losses": 3,
            "aces": 3
        },
        "golf": {
            "wins": 1,
            "losses": 0,
            "hole-in-one": null
        }
    },
    "money": {
        "total": {
            "spent": "$160.1M",
            "earned": "$169M"
        },
        "earnedby": {
            "jobs": "$26.3M",
            "shared": "$224.1K",
            "betting": "$469.5K",
            "car-sales": "$125.6M",
            "picked-up": "$257.7K",
            "other": "$714K"
        }
    },
    "stats": {
        "stamina": "100%",
        "stealth": "100%",
        "lung-capacity": "100%",
        "flying": "100%",
        "shooting": "100%",
        "strength": "98%",
        "driving": "100%",
        "mental-state": "0%"
    },
    "criminalrecord": {
        "cops-killed": 18,
        "wanted-stars": 28,
        "time-wanted": "4d 12h 42m",
        "stolen-vehicles": 4599,
        "cars-exported": 5,
        "store-holdups": 111
    },
    "favourite-weapon": {},
    "recent-activity": [
        {
            "name": "Vehicle Thief",
            "type": "Platinum",
            "image": "https://cdn.sc.rockstargames.com/images/games/GTAV/multiplayer/award/platinum/JackVehicles.png"
        },
        {
            "name": "Head Banger",
            "type": "Platinum",
            "image": "https://cdn.sc.rockstargames.com/images/games/GTAV/multiplayer/award/platinum/Headshots.png"
        },
        {
            "name": "The Widow Maker",
            "type": "Platinum",
            "image": "https://cdn.sc.rockstargames.com/images/games/GTAV/multiplayer/award/platinum/OverallKills.png"
        },
        {
            "name": "Looking Down The Barrel",
            "type": "Platinum",
            "image": "https://cdn.sc.rockstargames.com/images/games/GTAV/multiplayer/award/platinum/KilledpeoplewithanAssaultRifle.png"
        },
        {
            "name": "The Rocket Man",
            "type": "Platinum",
            "image": "https://cdn.sc.rockstargames.com/images/games/GTAV/multiplayer/award/platinum/KillRocketLauncher.png"
        }
    ]
}
```

## Configuration

```json
{
  "debug": false,
  "username": "SC_username",
  "password": "SC_password"
}
```

- `debug` - can be set to `true` or `false` - Display debug information
- `username` - must be a string - Should contain your SocialClub username
- `password` - must be a string - Should contain your SocialClub password

## License

[MIT](LICENSE)

## Version

1.4.0

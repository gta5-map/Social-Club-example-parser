# SocialClub parser
## Install Node.js
Download Node.js from http://www.nodejs.org/

## Install node dependencies
```
npm install
```
By running the above CLI command from the folder containing the ```package.json``` file, a folder ```node_modules``` will be created with all the dependencies defined in ```package.json```. This folder contains modules that are necessary to run the script.

## Modify credentials
Your SocialClub username and password need to be given at the first two lines of the ```index.js``` file.

## Run the script
```
node .
```
The above CLI command will execute the ```index.js``` file and prints the user information of the user belonging to the username configured in the ```index.js``` file.

```
node . <username>
```
This CLI command executes the ```index.js``` file and prints the user information of the user belonging to the username specified in the command.
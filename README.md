# AutoPokeTS3
Auto Poke for teamspeak 3.
This nodejs project auto poke connected clients.
 - When a new client entered in channel, this plugin poke selected groups.
 - This client need to be a Guest.


##Requirements
NodeJS
Configuration file named : config.json

##Installation

AutoPokeTS3 requires [Node.js](https://nodejs.org/) to run.

Download and extract the lastest build.

Install the dependencies and devDependencies and start application.

```sh
$ cd AutoPokeTS3
$ npm install
$ node server.js
```

##Configuration Example
```sh
{
"host":"Teamspeak IP",
"port":"10011 (or other)",
"user":"serveradmin (or user)",
"password":"password",
"channelid":"(selected channel)",
"groupid":"10/11(selected groups)",
"message": "Someone need your help !",
"botname": "AutoPokeTS3",
"type" : 1
}
```

##Type selection
1 => Only Selected ID groups
  Ex : "1/2/3/4"
2 => Groups with selected name
  Ex : "Admin/Resp"
  Poke groups starting with name Admin and Resp

// Init
try{
  var express     = require('express');
  var app         = express();
  app.use(require('express-promise')());
  var fs = require("fs");
}catch(e){
  console.log('Error : Please execute this command "npm install" !');
  process.exit(1);
}

//Classe Config
var Config = require('./tools/config');
Config.add("host");
Config.add("port");
Config.add("user");
Config.add("password");
Config.add("channelid");
Config.add("groupid");
Config.add("message");
var config = Config.check("config.json");


var TeamSpeak = require('node-teamspeak-api');
var tsClient = new TeamSpeak(config.host, config.port);
tsClient.api.login({
    client_login_name: config.user,
    client_login_password: config.password
}, function(err, resp, req) {
  if(err)
    console.log(err);
  tsClient.api.use({
      sid: 1
  }, function(err, resp, req) {
    tsClient.send("channellist", function(err, resp, req){
      if(err)
        console.log(err);
      resp.data.forEach(elem => {
        if((elem.cid == config.channelid)&&(elem.total_clients = 1)){
          tsClient.send("clientlist", function(err, clientlist, req){
            if(err)
              console.log(err);
            clientlist.data.forEach(elem => {
              if(elem.cid == config.channelid){
                /*
                tsClient.send("clientlist", function(err, resp, req){
                  if(err)
                    console.log(err);
                });
                */
                console.log(elem);
                tsClient.send("servergroupsbyclientid",{cldbid:elem.client_database_id}, function(err, resp, req){
                  if(err)
                    console.log(err);
                    if(!Array.isArray(resp.data)){
                      if(resp.data.name == "Guest"){
                        //Verifier si des personnes du TS appartienne au groupe(s) choisi / Poke ces Personnes (Probablement dans CID == GROUPE ID)

                      }
                    }
                  console.log(resp.data);
                });
              }
            });
            //tsClient.disconnect();
          });
        }
      });
    });
  });
});

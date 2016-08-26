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
          console.log(elem);
          tsClient.send("clientlist", function(err, clientlist, req){
            if(err)
              console.log(err);

            var fctcheck = function(data){
              if(data.cid == config.channelid){
                return true;
              }else{
                return false;
              }
            };
            var clientinchannel = clientlist.data.filter(fctcheck);
            console.log(clientinchannel);
            if(clientinchannel.length == 1){
              clientinchannel.forEach(elem => {
                tsClient.send("servergroupsbyclientid",{cldbid:elem.client_database_id}, function(err, resp, req){
                  if(err)
                    console.log(err);
                    if(!Array.isArray(resp.data)){
                      if(resp.data.name == "Guest"){
                        var groupids = config.groupid.split("/");
                        groupids.forEach(elemg => {
                          clientlist.data.forEach(elemc => {
                            if(elemc.client_type == 0){
                              tsClient.send("servergroupsbyclientid", {cldbid:elemc.client_database_id}, function(err, resp, req){
                                if(err)
                                  console.log(err);
                                  if(resp.data.sgid == elemg){
                                    tsClient.send("clientpoke", {clid: elemc.clid, msg:config.message},function(err, resp, req){
                                      if(err)
                                        console.log(err);
                                    });
                                  }
                              });
                            }
                          });
                        });

                      }
                    }
                });
              });
              setTimeout(function () {
                tsClient.disconnect();
                return true;
              }, 10000);
            }else {
              tsClient.disconnect();
            }
          });
        }
      });

    });
  });
});

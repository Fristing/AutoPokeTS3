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




var autopoke = {
  fct: function(){
    console.log("SCAN");
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
                console.log(clientlist);
                var fctcheck = function(data){
                  if(data.cid == config.channelid){
                    return true;
                  }else{
                    return false;
                  }
                };
                var clientinchannel = clientlist.data.filter(fctcheck);
                if(clientinchannel.length == 1){
                  clientinchannel.forEach(elem => {
                    tsClient.send("servergroupsbyclientid",{cldbid:elem.client_database_id}, function(err, resp, req){
                      if(err)
                        console.log(err);
                        if(!Array.isArray(resp.data)){
                          if(resp.data.name == "Guest"){
                            var groupids = config.groupid.split("/");
                            var fctcheckclitype = function(data){
                              if(data.client_type == 0){
                                return true;
                              }else{
                                return false;
                              }
                            };
                            clientlist = clientlist.data.filter(fctcheckclitype);
                            groupids.forEach(elemg => {
                              clientlist.data.forEach(elemc => {
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
                              });
                            });
                          }
                        }
                    });
                  });
                  setTimeout(function () {
                    tsClient.disconnect();
                  }, 15000);
                  setTimeout(function () {
                    autopoke.fct();
                  }, 300000);
                }else {
                  setTimeout(function () {
                    tsClient.disconnect();
                  }, 15000);
                  setTimeout(function () {
                    autopoke.fct();
                  }, 30000);
                }
              });
            }
          });

        });
      });
    });
  }
};

autopoke.fct();

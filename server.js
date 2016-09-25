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

//Check Configuration
var Config = require('./tools/config');
Config.add("host");
Config.add("port");
Config.add("user");
Config.add("password");
Config.add("channelid");
Config.add("groupid");
Config.add("message");
Config.add("botname");
Config.add("type");
var config = Config.check("config.json");

var dateObj = new Date();
var month = dateObj.getMonth();
var day = dateObj.getDay();
var year = dateObj.getYear();
var hours = dateObj.getHours();
var min = dateObj.getMinutes();
console.log("["+day+"-"+month+"-"+year+" "+hours+":"+min+"] Start !");


var autopoke = {
  fct: function(){
    var dateObj = new Date();
    var month = dateObj.getMonth();
    var day = dateObj.getDay();
    var year = dateObj.getYear();
    var hours = dateObj.getHours();
    var min = dateObj.getMinutes();
    console.log("["+day+"-"+month+"-"+year+" "+hours+":"+min+"] Initialise");
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
        tsClient.send("clientupdate",{client_nickname:config.botname}, function(err, resp, req){
          if(err)
            console.log(err);
            tsClient.send("channellist", function(err, resp, req){
              if(err)
                console.log(err);
                resp.data.forEach(function(elem){
                  if((elem.cid == config.channelid)&&(elem.total_clients = 1)){
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
                      //Double Check
                      if(clientinchannel.length == 1){
                        clientinchannel.forEach(function(elem){
                          var pseudo = elem.client_nickname;
                          tsClient.send("servergroupsbyclientid",{cldbid:elem.client_database_id}, function(err, resp, req){
                            if(err)
                              console.log(err);
                              if(!Array.isArray(resp.data)){
                                //Check if this client is a guest
                                if(resp.data.name == "Guest"){
                                  var fctcheckclitype = function(data){
                                    if(data.client_type == 0){
                                      return true;
                                    }else{
                                      return false;
                                    }
                                  };
                                  clientlist = clientlist.data.filter(fctcheckclitype);
                                  //Poke all connected client with selected group
                                  if(config.type == 1){
                                    var groupids = config.groupid.split("/");
                                    groupids.forEach(function(elemg){
                                      clientlist.data.forEach(function(elemc){
                                        tsClient.send("servergroupsbyclientid", {cldbid:elemc.client_database_id}, function(err, resp, req){
                                          if(err)
                                            console.log(err);
                                            if(resp.data.sgid == elemg){
                                              config.message = config.message.split("%client%").join(pseudo);

                                              tsClient.send("clientpoke", {clid: elemc.clid, msg:config.message},function(err, resp, req){
                                                if(err)
                                                  console.log(err);
                                              });
                                            }
                                        });
                                      });
                                    });
                                    var dateObj = new Date();
                                    var month = dateObj.getMonth();
                                    var day = dateObj.getDay();
                                    var year = dateObj.getYear();
                                    var hours = dateObj.getHours();
                                    var min = dateObj.getMinutes();
                                    console.log("["+day+"-"+month+"-"+year+" "+hours+":"+min+"] Poke Success");
                                  }else{
                                    tsClient.send("servergrouplist", {cldbid:elemc.client_database_id}, function(err, resp, req){
                                      if(err)
                                        console.log(err);
                                        var groupnames = config.groupid.split("/");
                                        var groups = resp.data;
                                        var groupids = [];
                                        groups.forEach(function(group){
                                          groupnames.forEach(function(elemname){
                                            if(group.name.startsWith(elemname)){
                                              clientlist.data.forEach(function(elemc){
                                                tsClient.send("servergroupsbyclientid", {cldbid:elemc.client_database_id}, function(err, resp, req){
                                                  if(err)
                                                    console.log(err);
                                                    if(resp.data.sgid == elem.sgid){
                                                      config.message = config.message.split("%client%").join(pseudo);

                                                      tsClient.send("clientpoke", {clid: elemc.clid, msg:config.message},function(err, resp, req){
                                                        if(err)
                                                          console.log(err);
                                                      });
                                                    }
                                                });
                                              });
                                            }
                                          });
                                        });
                                    });
                                  }
                                  var dateObj = new Date();
                                  var month = dateObj.getMonth();
                                  var day = dateObj.getDay();
                                  var year = dateObj.getYear();
                                  var hours = dateObj.getHours();
                                  var min = dateObj.getMinutes();
                                  console.log("["+day+"-"+month+"-"+year+" "+hours+":"+min+"] Poke Success");
                                }
                              }
                          });
                        });
                        //After 15 secondes Deconnection
                        setTimeout(function () {
                          tsClient.disconnect();
                        }, 15000);
                        //After 30 secondes New check
                        setTimeout(function () {
                          autopoke.fct();
                        }, 300000);
                      }else {
                        //After 15 secondes Deconnection
                        setTimeout(function () {
                          tsClient.disconnect();
                        }, 15000);
                        //After 30 secondes New check
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
    });
  }
};

autopoke.fct();

var fs = require("fs");
var Config = {
  field: [],
  add: function(name){
    this.field.push(name);
  },
  check: function(file){
    try {
      configfile = fs.readFileSync(file);
      config= JSON.parse(configfile);
      flag = true;
      this.field.forEach(function(elem){
        if(!(config.hasOwnProperty(elem)) && (config.prototype.valueOF)){
          flag = false;
        }
      });

      if(flag){
        return config;
      }else{
        throw "Error";
      }
    } catch (err) {
      data = "{\n";
      this.field.forEach(function(elem) {
        data = data.concat("\""+elem+"\":\"\",\n");
      });
      data = data.slice(0, -2);
      data= data.concat("\n}");
      fs.writeFileSync(file, data, 'utf8');
      console.log("Error : Create Configuration File config.json. Please Complete this file !");
      process.exit(1);
    }
  }
};

module.exports = Config;

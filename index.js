var fs = require("fs");
var sqlite3 = require("sqlite3");
var Service, Characteristic, HomebridgeAPI, db;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;

  var dbFile = HomebridgeAPI.user.persistPath() + "/analytics.db";
  var dbExists = fs.existsSync(dbFile);
  db = new sqlite3.Database(dbFile);

  if(!dbExists) {
    db.serialize(function() {
      db.run("CREATE TABLE AccessoryUsage (name TEXT, state INTEGER, updated TIMESTAMP)");
    });
  }

  homebridge.registerPlatform("homebridge-analytics", "Analytics", AnalyticsPlatform);
  homebridge.registerAccessory("homebridge-analytics", "AnalyticsAccessory", AnalyticsAccessory);
}

// #######################
// AnalyticsPlatform
// #######################

function AnalyticsPlatform(log, config){
  this.log = log;
  this.suffix = config['suffix'] || 'Analytics';
  this.switchNames = config['switchNames'];
}

AnalyticsPlatform.prototype = {
  accessories: function(callback) {
    this.accessories = this.switchNames.map((function(switchName) {
      var deviceConfig = {name: switchName};
      return new AnalyticsAccessory(this.log, deviceConfig, this);
    }).bind(this));
    callback(this.accessories);
  }
}

// #######################
// AnalyticsAccessory
// #######################

function AnalyticsAccessory(log, config, platform) {
  this.log = log;
  this.platform = platform;
  this.deviceName = config['name'];
  this.name = this.deviceName;
  if (platform.suffix && platform.suffix.length > 0)
    this.name += " " + platform.suffix;
}

AnalyticsAccessory.prototype = {
  getState: function(callback) {
    db.serialize((function() {
      db.get("SELECT state FROM AccessoryUsage WHERE name = ? ORDER BY updated DESC LIMIT 1", this.deviceName, (function(err, row) {
        var result = (row || {state: 0}).state > 0
        callback(null, result);
      }).bind(this));
    }).bind(this));
  },

  setState: function(powerOn, callback) {
    db.serialize((function() {
      db.run("INSERT INTO AccessoryUsage (name, state, updated) VALUES (?, ?, CURRENT_TIMESTAMP)", this.deviceName, powerOn, callback);
    }).bind(this));
  },

  getServices: function() {
    var service = new Service.Switch(this.name);
    service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setState.bind(this))
        .on('get', this.getState.bind(this));

    return [service];
  }
};

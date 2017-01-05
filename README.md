# homebridge-analytics

https://github.com/neilgupta/homebridge-analytics/

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) to monitor how much you're using your HomeKit devices.

HomeKit does not expose any native way to get alerted when your devices turn on or off, so homebridge-analytics creates fake switches for you that will write their state to a sqlite database whenever they are turned on or off. You can setup HomeKit triggers to toggle the corresponding fake switch whenever one of your devices is turned on or off. This is a sad hack, but it's the best we can do with HomeKit so far. Once you've done the manual setup, you can then query the sqlite database to see your usage history.

## Installation

1. Install homebridge (if not already installed) using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-analytics`
3. Update your configuration file. See below for a sample.

## Configuration

```
"platforms": [
  {
    "platform": "Analytics",
    "suffix" : "Analytics", // suffix to append to all your fake switch names (default: "Analytics")
    "switchNames" : ["Kitchen", "Bar", "Living Room", "Foyer", "Closet", "Bedroom"]
  }
]
```

## Usage

Once you have this plugin configured and running with homebridge, you'll find the `analytics.db` file in your homebridge's `persist` directory. You can query this database via the `node` repl like so:

```
var sqlite3 = require("sqlite3");

var db = new sqlite3.Database("path to analytics.db");

db.all("SELECT * FROM AccessoryUsage", function(err, rows) {
    // do something with rows
});
```

The `AccessoryUsage` table has 3 columns: `name` (text), `state` (int), `updated` (timestamp).

## TODO

* Add support for lights with brightness values rather than just binary switches
* Push status change notifications to a remote db

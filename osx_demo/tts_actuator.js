var vars = require('./variables'); //Contains unique vars for your project
var smartliving = require('../lib/smartliving');
var tts = require('say');

smartliving.DeviceId = vars.deviceId;
smartliving.ClientId = vars.clientId;
smartliving.ClientKey = vars.clientKey;

smartliving.addAsset("2", "A text to speech actuator", "A simple node.js text to speech actuator, use it for notifications, and stuff....", true, "string", function(){
  console.log("beeper actuator enrolled");
});

smartliving.registerActuatorCallback("2", function(message) {
  tts.speak(null, message);
});

smartliving.subscribe(smartliving.baseMQTTUrl, 1883);


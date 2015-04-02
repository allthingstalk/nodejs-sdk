var vars = require('./variables'); //Contains unique vars for your project
var smartliving = require('../lib/smartliving');

smartliving.DeviceId = vars.deviceId;
smartliving.ClientId = vars.clientId;
smartliving.ClientKey = vars.clientKey;

smartliving.addAsset("1", "A notifcation beeper", "A simple node.js system beep actuator, use it for notifications, and stuff....", true, "bool", function(){
  console.log("beeper actuator enrolled");
});

smartliving.registerActuatorCallback("1", function() {
  console.log('\u0007');
});

smartliving.subscribe(smartliving.baseMQTTUrl, 1883);
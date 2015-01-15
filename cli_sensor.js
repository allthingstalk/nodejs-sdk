var smartliving = require('./lib/standard');
var prompt = require('prompt');


smartliving.DeviceId = ("YOUR_DEVICEID");
smartliving.ClientId = ("YOUR_CLIENTID");
smartliving.ClientKey = ("YOUR_CLIENTKEY");

smartliving.addAsset("1", "Command-line input sensor", "A simple node.js 'cli sensor' for you to test your connection with SmartLiving, regardless of OS", false, "string", function(){console.log("uber duber sensor enrolled")});

smartliving.subscribe(smartliving.baseMQTTUrl, 1883);

prompt.start();

 
   prompt.get(['sensorData'], function (err, result) {
    if (err) { return onErr(err); }
    
    console.log('Command-line input sensor received:');
    console.log('  sensordata: ' + result.sensorData);
	  smartliving.send(result.sensorData, "1");

  });


function onErr(err) {
  console.log(err);
  return 1;
}
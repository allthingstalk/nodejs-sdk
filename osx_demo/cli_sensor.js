var vars = require('./variables'); //Contains unique vars for your project
var smartliving = require('./lib/standard');
var prompt = require('prompt');

smartliving.DeviceId = vars.deviceId;
smartliving.ClientId = vars.clientId;
smartliving.ClientKey = vars.clientKey;

smartliving.addAsset("1", "Command-line input sensor", "A simple node.js 'cli sensor' for you to test your connection with SmartLiving, regardless of OS", false, "string", function(){console.log("uber duber sensor enrolled");console.log("Enter your sensor data:");});

smartliving.subscribe(smartliving.baseMQTTUrl, 1883);

prompt.start();

console.log("Enter your sensor payload data");
 
   prompt.get(['sensorData'], function (err, result) {
    if (err) { return onErr(err); }
    
    console.log('Command-line input sensor received:');
    console.log('  sensordata: ' + result.sensorData);
	smartliving.send(result.sensorData, "1");

	console.log("Check out this widget to view your data in a web app:\n\nhttp://widget.smartliving.io/textbox/?deviceid="+vars.deviceId);


	process.exit(1);
  });


function onErr(err) {
  console.log(err);
  return 1;
}
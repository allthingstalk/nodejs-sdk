var smartliving = require('./lib/standard');
var smc = require('smc');

smartliving.DeviceId = ("YOUR_DEVICEID");
smartliving.ClientId = ("YOUR_CLIENTID");
smartliving.ClientKey = ("YOUR_CLIENTKEY");

smartliving.addAsset("1", "Mac CPU Temp", "Monitors the temperature of the top secret nuclear reactor controller... AKA my Mac ", false, "int", function(){console.log("Mac CPU temperature sensor enrolled")});

smartliving.subscribe(smartliving.baseMQTTUrl, 1883);
vloop(); 

function vloop()
{
  smartliving.send(smc.temperature(), "1"); //This "1" is nasty... Let's pass it the asset object instead   
  setTimeout(vloop,1000); 
}
var vars = require('./variables'); //Contains unique vars for your project
var smartliving = require('./lib/standard');
var mraa = require('mraa'); //Wrapper for GPIO Pins


var a0 = new mraa.Aio(0); //setup access analog input Analog pin #0 (A0)
var d8 = new mraa.Gpio(8); //LED hooked up to digital pin 13 (or built in pin on Galileo Gen1 & Gen2)
d8.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = false; //Boolean to hold the state of Led


smartliving.DeviceId = vars.deviceId;
smartliving.ClientId = vars.clientId;
smartliving.ClientKey = vars.clientKey;

smartliving.addAsset("2", "Missle launcher", "Fires 10xD missles at incoming spacecraft, and also a neat LED for some visual feedback...", true, "bool", function(){console.log("Missle LED enrolled")});

smartliving.registerActuatorCallback("2", function() {
 d8.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
 ledState = !ledState; //invert the ledState
});

smartliving.addAsset("3", "Thermoreactor turbine temperature ", "Monitors the temperature of main alpha turbine", false, "int", function(){console.log("Turbine enrolled")});


smartliving.subscribe(smartliving.baseMQTTUrl, 1883);

vloop(); 

function vloop()
{
    var analogValue = a0.read(); //read the value of the analog pin
    smartliving.send(analogValue, "3")
    
  	setTimeout(vloop,1000);
}
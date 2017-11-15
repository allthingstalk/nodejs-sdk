# Node.js SDK

AllThingsTalk Node.js SDK enables easy access to [AllThingsTalk APIs](http://api.allthingstalk.io/swagger/ui/index). Use it to write your IoT applications and send data to the [AllThingsTalk IoT platform](http://maker.allthingstalk.com).

# Installation

After you download and install [Node.js](https://nodejs.org/en/download/), run the command in the terminal:

```bash
npm install allthingstalk
```

*This will initialize a new project, and place all dependencies in it.*

# Tutorial

Basic knowledge of JavaScript is expected in order to use the SDK.

## Importing the library

Create an empty *.js* file and start by importing the library in your code:

```js
const allthingstalk = require('allthingstalk');
```

## Identifying your device on AllThingsTalk Maker

In order to connect your physical device, like a RPI or a web application implemented as a device to the platform, you'll need to map it to the device resource in the platform.

Once you register at [maker.allthingstalk.com](#), and create a device, you'll find **Device Id** and **Device Token** under **Settings** > **Authentication**. Add it to your code:

```js
allthingstalk.credentials = {
  "deviceId": "<yourDeviceId>",
  "token": "<yourDeviceToken>"
};
```

## Adding assets

You'll need to add assets to your device, in order to map the data you're sending to the platform. For more info on assets see [Assets article in our Docs](http://docs.allthingstalk.com/cloud/concepts/assets/).

In most cases you'll be *sending* data to the platform, e.g, your room temperature. Use a `sensor` asset for that.

```js
allthingstalk.addAsset("counter", "Counter", "Count the number of user's visits", "integer")
```

This will create an asset with a unique asset name `counter`, human friendly title, description of what it represents, and type of data that will be sent. Supported profile types are `number`, `integer`, `string`, `boolean` and `object`. For more info on profile types see [Profiles article in our Docs](http://docs.allthingstalk.com/cloud/concepts/assets/profiles/).

Add a success callback argument to the function if you want to handle the response (e.g. print out a status message):

```js
allthingstalk.addAsset("counter", "Counter", "Count the number of user's visits", "integer",
  function (status, statusMsg) {
  console.log(statusMsg)
});
```

## Sending data to the platform

Establish a connection to the platform:

```js
allthingstalk.connect();
```

To send a sensor data to the platform do:

```js
allthingstalk.send(<value>, "<assetName>");
```

To simulate sending counter values to the `counter` asset add:

```js
function sendCount(i) {
    setTimeout(function() {
        allthingstalk.send(i, "counter");
        sendCount(++i);
    }, 2000)
};
    
sendCount(0);
```

## Receiving commands from the platform

If you wish to send a command from the platform to physical device and actuate it, you can use `actuator` assets. In order to create an `actuator` you'll pass actuation callback argument to `addAsset` function which defines what happens when a command from the platform arrives:

```js
allthingstalk.addAsset("led", "Led", "Blue led lamp", "boolean", 
    function() {
          console.log ("Awaiting a command");
    },
    function(message) {
        led.writeSync(0);  // your logic to actuate the device
    });
```

Once the asset is created you'll see in the terminal that your device awaits a command. When that happens a function that turns the led on will run.

# Examples

To obtain the example you can either clone the repository, or copy the examples directly from [GitHub](https://github.com/allthingstalk/nodejs-client/tree/master/examples).

## Sensor example

Sensor example simulates a device which asks for a message and sends it to the platform.

Navigate to the example folder, and add your **Device Id** and **Device Token** to **sensor.js** file**,** e.g:

```js
allthingstalk.credentials = {
    "deviceId": "71DTRZpn8SzXrfGMM7cGQ9Ui",
    "token": "afaketoken:4UT0JCOR9JTfW1VeVsQ1aXliBU4MJtXcLcp9NB7"
};
```

Save the changes and run the example:

```bash
node sensor.js
```

Enter “hello” in the terminal, and the **Message** asset will show your message.

## Actuator example

Actuator example shows how to send commands from AllThingsTalk Maker and receive them in the terminal.

Navigate to the example folder, and add your **Device Id** and **Device Token** to **actuator.js,** e.g:

```js
allthingstalk.credentials = {
    "deviceId": "71DTRZpn8SzXrfGMM7cGQ9Ui",
    "token": "afaketoken:4UT0JCOR9JTfW1VeVsQ1aXliBU4MJtXcLcp9NB7"
};
```

Save the changes and run the example:

```bash
node actuator.js
```

In AllThingsTalk Maker, send a command from the **Commander** asset; you should see that the command is received in the terminal.

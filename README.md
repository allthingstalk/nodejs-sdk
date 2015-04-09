# SmartLiving Internet of Things Node.js library, for Raspberry Pi, Intel Edison/Galileo, Web services

Used to connect your sensors, actuators, apps, services, controllers... cat, dog, grandmother to the SmartLiving IoT cloud platform, and interact with any other hardware or front-end you connect.

## Installing the library
Here's the library and a very simple getting started script

1. git clone http://github.com/allthingstalk/nodejs-client cd nodejs-client
2. npm install
3. node cli_sensor.js

Donezo.

Before running the command line interface sensor you'll need to update the credentials.json file with your own auth tokens and deviceId.

Find these over at [beta.smartliving.io](http://beta.smartliving.io) (You'll also find an example credentials file in the package). 


## Playing with the examples
Beyond the basic library you can find a ton of examples that will run on Intel SBC's and  other desktop demos

- git clone http://github.com/allthingstalk/nodejs-client-examples

Here's a list of the examples

- Intel
	- Getting Started with SmartLiving & the Intel IoT XDK
	- Smart doorbell
	- Get warned when your Smartphone is unplugged
	- Sense and interpret light values
	- Smart shop window
	- Motion dector text-to-speech trigger
- Raspberry Pi
- Desktop demos
	- CLI sensor
	- System beep warning actuator
	- OSX Text-to-speech actuator 
	- OSX CPU temperature and fan speed sensor
	- HTTP Request actuator (Send automated HTTP Requests from SmartLiving via your own service)

## Todo list
- Provide better integration of SmartLiving widgets that can be loaded via the Intel XDK
- Check if the credentials.json exists, if not walk the user through how to get these details eb-styley through the API
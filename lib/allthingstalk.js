/*
   Copyright 2014-2017 AllThingsTalk

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/   

var ATT     = exports;
var util    = require('util');
var request = require('request');
var mqtt    = require('mqtt');

/**
 * Public API
 */
ATT.addAsset  = addAsset;
ATT.connect = connect;
ATT.send      = send;
ATT.onMessage = function() {};
ATT.credentials = {};
ATT.mqttStatus = false;

var mqttClient  = undefined;
ATT.baseHttpUrl = 'http://api.allthingstalk.io';
ATT.baseMQTTUrl = 'api.allthingstalk.io';

var actuationCallbacks = {};

function addAsset(name, title, description, profile, successCallback, actuatorCallback) {

  if (actuatorCallback != null) {
  	actuationCallbacks[name] = actuatorCallback;
  }
  
  var body = {
  	name: name,
	title: title,
    description: description,
    is: actuatorCallback ? 'actuator' : 'sensor',
    profile: {type: profile}
  };
  
  var options = {
    url: ATT.baseHttpUrl + '/device/' + ATT.credentials.deviceId + '/assets',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ATT.credentials.token
    },
    json: true,
    body: body
  };

  request(options, successCallback || function() {});

  return body;
}

function connect(url, port) {
  var mqttId = ATT.credentials.deviceId.length > 22 ? 
  			ATT.credentials.deviceId.substring(0, 22) : ATT.credentials.deviceId;
  var topic = 'device/' + ATT.credentials.deviceId + '/asset/+/command';

  mqttClient = mqtt.createClient(port || 1883, url || ATT.baseMQTTUrl, {
    clientId: mqttId,
    username: ATT.credentials.token,
    password: 'dummyPassword' // AllThingsTalk doesn't require the password, but some
    						  // MQTT clients, like the one used here, do.    						  
  })
  .subscribe(topic)
  .on('message', function onMessage(topic, message, packet) {
    console.log('Incoming message - topic: ' + topic + ', payload: ' + message);
    var topicParts = topic.split('/');
	assetName = topicParts[3];
    
    console.log("Looking for actuator with asset name: " + assetName)
    if (assetName in actuationCallbacks) {
    	actuationCallbacks[assetName](message);
    } else {
      console.log("Looks like there's no actuator with asset name: "
      			  + assetName + ", dropping the message... ");
    }
  })
  .on('connect', function onConnect(client, userdata, rc) {
    console.log('Connected to the MQTT broker.');
    console.log('Subscribing to: ' + topic);
    ATT.mqttStatus = true;
  })
  .on('offline', function onOffline(client, userdata, rc) {
    console.log('Lost connection to the MQTT broker - reconnecting...');
    ATT.mqttStatus = false;
  });
}

function send(value, assetName) {

  if (isUndefined(mqttClient) || isUndefined(assetName) || !ATT.mqttStatus) return;

  var time = Math.round(new Date().getTime() / 1000);
  var message   =  time + '|' + value;
  var topic     = 'device/' + ATT.credentials.deviceId + '/asset/' + assetName + '/state';

  console.log('Publishing message - topic: ' + topic + ', payload: ' + message);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false
  });
}


/*
  UTILS
*/

var isUndefined = function(value) {
  return typeof value == 'undefined';
};

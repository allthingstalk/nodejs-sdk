/*
   Copyright 2014-2016 AllThingsTalk

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
ATT.getActuatorCallback = getActuatorCallback
ATT.registerActuatorCallback = registerActuatorCallback;
ATT.send      = send;
ATT.onMessage = function() {};
ATT.credentials={};
ATT.mqttStatus = false;

var mqttClient  = undefined;
ATT.baseHttpUrl = 'http://api.allthingstalk.io';
ATT.baseMQTTUrl = 'api.allthingstalk.io';

function addAsset(id, name, description, profile, successCallback, actuatorCallback) {

  if(actuatorCallback!=null){
    registerActuatorCallback(id, actuatorCallback);
  }
  
  var body;
  //HOTFIX for profile changes...
  if(typeof dataType == "string"){
    body = {
      name: name,
      description: description,
      is: actuatorCallback ? 'actuator' : 'sensor',
      profile: {
        type: profile
      }
    };
  }else{
     body = {
        name: name,
        description: description,
        is: actuatorCallback ? 'actuator' : 'sensor',
        profile: profile
      };
  }

  var options = {
    url: ATT.baseHttpUrl + '/device/' + ATT.credentials.deviceId + '/asset/'  + id,
    method: 'PUT',
    headers: {
      'Auth-ClientKey': ATT.credentials.clientKey,
      'Auth-ClientId': ATT.credentials.clientId
    },
    json: true,
    body: body
  };

  request(options, successCallback || function() {});

  return body;
}

// WORK IN PROGRESS
var actuatorId= [], actuatorCallback= [];

function registerActuatorCallback(id, callback){
    actuatorId.push(id);
    actuatorCallback.push(callback);
}

function getActuatorCallback(id){
  var position = actuatorId.indexOf(id);
  return actuatorCallback[position];
}
function randomInt () {
    return Math.floor(Math.random() * (999999999 - 1) + 1);
}

function connect(){
  subscribe(ATT.baseMQTTUrl, 1883);
}

function connect(url, port) {
  
  var mqttId   = ATT.credentials.deviceId.length > 23 ? ATT.credentials.deviceId.substring(0, 23) : ATT.credentials.deviceId;
  
  //Funky requirements for RabbitMq MQTT Auth
  var brokerId = ATT.credentials.clientId + ':' + ATT.credentials.clientId;

  var topic = 'client/' + ATT.credentials.clientId + '/in/device/' + ATT.credentials.deviceId + '/asset/+/command';


  mqttClient = mqtt.createClient(port || 1883, url || ATT.baseMQTTUrl, {
    clientId: mqttId,
    username: brokerId,
    password: ATT.credentials.ClientKey
  })
  .subscribe(topic)
  .on('message', function onMessage(topic, message, packet) {
    console.log('Incoming message - topic: ' + topic + ', payload: ' + message);
    var topicParts = topic.split('/');

	//to be fixed: don't know the exact index of the asset id yet. But it no longer contains the device id, this is separate
    //localId = topicParts[6].substring(23);
	localId = topicParts[6];
    console.log("Looking for actuator with localId: " + localId)
     
    callback = getActuatorCallback(localId);

    if(callback!=null){
      callback(message);
      send(message,localId);
    }else{
      console.log("Looks like there's no actuator with localId: " +localId + ", dropping the message... ");
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

function send(value, assetId) {

  if (isUndefined(mqttClient) || isUndefined(assetId) || !ATT.mqttStatus) return;

  var time = Math.round(new Date().getTime() / 1000);
  var message   =  time + '|' + value;
  //to be verified: not yet certain of the new topic structure.
  var topic     = 'client/' + ATT.credentials.clientId + '/out/device/' + ATT.credentials.deviceId + '/asset/' + assetId + '/state';

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

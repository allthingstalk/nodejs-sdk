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
var package = require('../package.json');

/**
 * Public APIs
 */
ATT.addAsset  = addAsset;
ATT.configureAsset = configureAsset;
ATT.deleteAsset = deleteAsset;
ATT.connect = connect;
ATT.send      = send;
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
    headers: getHeaders(),
    json: true,
    body: body
  };

  request(options, function(err, response, body) {
    if(!err) {
      if(successCallback) {
        if (response.statusCode === 201) {
          successCallback(response.statusCode, "Asset " + name + " has been added");
        } else if (response.statusCode === 400) {
          successCallback(response.statusCode, "Asset " + name + " already exists");
        } else if (response.statusCode === 404) {
          successCallback(response.statusCode, "Device is not found");
        } else if (response.statusCode === 403) {
          successCallback(response.statusCode, "Authorization token doesn't match device Id");
        } else {
          successCallback(response.statusCode, "Unexpected error has occured");
        };
      } else {
        if (response.statusCode !== 201 && response.statusCode !== 400) {
          console.log("While attempting to add the asset server responded with " + response.statusCode);
        };
      };
    };
  }); 
};

function configureAsset(name, title, description, profile, successCallback) {

  var body = {
    name: name,
    title: title,
    description: description,
    profile: {type: profile}
  };
  
  var options = {
    url: ATT.baseHttpUrl + '/device/' + ATT.credentials.deviceId + '/asset/' + name,
    method: 'PUT',
    headers: getHeaders(),
    json: true,
    body: body
  };

  request(options, function(err, response, body) {
    if(!err) {
      if(successCallback) {
        if (response.statusCode === 200) {
          successCallback(response.statusCode, "Asset " + name + " has been configured");
        } else if (response.statusCode === 201) {
          successCallback(response.statusCode, "Asset " + name + " has been added");
        } else if (response.statusCode === 400) {
          successCallback(response.statusCode, "Asset " + name + " already exists");
        } else if (response.statusCode === 404) {
          successCallback(response.statusCode, "Device is not found");
        } else if (response.statusCode === 403) {
          successCallback(response.statusCode, "Authorization token doesn't match device Id");
        } else {
          successCallback(response.statusCode, "Unexpected error has occured");
        };
      } else {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          console.log("While attempting to configure the asset server responded with " + response.statusCode);
        };
      };
    };
  }); 
};

function deleteAsset(name, successCallback) {

  var options = {
    url: ATT.baseHttpUrl + '/device/' + ATT.credentials.deviceId + '/asset/' + name,
    method: 'DELETE',
    headers: getHeaders(),
    json: true,
  };

  request(options, function(err, response, body) {
    if(!err) {
      if(successCallback) {
        if (response.statusCode === 204) {
          successCallback(response.statusCode, "Asset " + name + " has been deleted");
        } else if (response.statusCode === 404) {
          successCallback(response.statusCode, "Device is not found");
        } else {
          successCallback(response.statusCode, "Unexpected error occured");
        };
      } else {
        if (response.statusCode !== 204 && response.statusCode !== 404) {
          console.log("While attempting to delete the asset server responded with " + response.statusCode);
        };
      };
    };
  }); 
};

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
    var topicParts = topic.split('/');
	  assetName = topicParts[3];
    console.log('Incoming message - asset: ' + assetName + ', payload: ' + message);

    if (assetName in actuationCallbacks) {
    	actuationCallbacks[assetName](message);
    } else {
      console.log("There is no actuator with asset name: "
      			  + assetName + "; dropping the message");
    }
  })
  .on('connect', function onConnect(client, userdata, rc) {
    console.log('Connected to the MQTT broker');
    ATT.mqttStatus = true;
  })
  .on('offline', function onOffline(client, userdata, rc) {
    console.log('Lost connection to the MQTT broker - reconnecting...');
    ATT.mqttStatus = false;
  });
};

function send(value, assetName) {

  if (isUndefined(mqttClient) || isUndefined(assetName) || !ATT.mqttStatus) return;

  var time = Math.round(new Date().getTime() / 1000);
  var message = time + '|' + value;
  var topic = 'device/' + ATT.credentials.deviceId + '/asset/' + assetName + '/state';

  console.log('Publishing message - asset: ' + assetName + ', payload: ' + message);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false
  });
};


/*
  UTILS
*/

var isUndefined = function(value) {
  return typeof value == 'undefined';
};

var getHeaders = function() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ATT.credentials.token,
    'User-Agent': 'ATTalk-JSSDK/' + package.version
  }
}

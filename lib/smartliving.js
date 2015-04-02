var ATT     = exports;
var util    = require('util');
var request = require('request');
var mqtt    = require('mqtt');

/**
 * Public API
 */
ATT.addAsset  = addAsset;
ATT.subscribe = subscribe;
ATT.getActuatorCallback = getActuatorCallback
ATT.registerActuatorCallback = registerActuatorCallback;
ATT.send      = send;
ATT.onMessage = function() {};

ATT.credentials={};


var mqttClient  = undefined;
var baseHttpUrl = 'http://api.smartliving.io';
var baseMQTTUrl = 'broker.smartliving.io';



function addAsset(id, name, description, isActuator, assetType, callback) {

  var body = {
    name: name,
    description: description,
    is: isActuator ? 'actuator' : 'sensor',
    profile: {
      type: assetType
    },
    deviceId: ATT.credentials.deviceId
  };

  var options = {
    url: baseHttpUrl + '/api/asset/' + ATT.credentials.deviceId + id,
    method: 'PUT',
    headers: {
      'Auth-ClientKey': ATT.credentials.clientKey,
      'Auth-ClientId': ATT.credentials.clientId
    },
    json: true,
    body: body
  };

  request(options, callback || function() {});
}

// WORK IN PROGRESS
// Storing callback objects within a JSON obj causes issues when trying to call... 
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


function subscribe(url, port) {
  
  //TODO This fails if you're using multiple instances of the device Id... Should this be allowed...
  //var mqttId   = ATT.DeviceId.length > 23 ? ATT.DeviceId.substring(0, 23) : ATT.DeviceId;
  
  //Funky requirements for RabbitMq MQTT Auth
  var brokerId = ATT.credentials.clientId + ':' + ATT.credentials.clientId;

  var topic = 'client/' + ATT.credentials.clientId + '/in/device/' + ATT.credentials.deviceId + '/asset/+/command';

  console.log('Subscribing to: ' + topic);

  mqttClient = mqtt.createClient(port || 1883, url || baseMQTTUrl, {
    clientId: brokerId+randomInt(),
    username: brokerId,
    password: ATT.credentials.ClientKey
  })
  .subscribe(topic)
  .on('message', function onMessage(topic, message, packet) {
    console.log('Incoming message - topic: ' + topic + ', payload: ' + message);
    var topicParts = topic.split('/');

    localId = topicParts[6].slice(-1);     
    getActuatorCallback(localId)(message);
    send(message,localId);
  })
  .on('connect', function onConnect(client, userdata, rc) {
    console.log('Connected to the MQTT broker.');
  });
}

function send(value, assetId) {
  if (isUndefined(mqttClient) || isUndefined(assetId)) return;

  var time = Math.round(new Date().getTime() / 1000);
  var message   =  time + '|' + value;
  var topic     = 'client/' + ATT.credentials.clientId + '/out/asset/' + ATT.credentials.deviceId + assetId + '/state';

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
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

var mqttClient  = undefined;
var baseHttpUrl = 'http://api.smartliving.io';
var baseMQTTUrl = 'broker.smartliving.io';

function addAsset(id, name, description, profile, successCallback, actuatorCallback) {

  if(actuatorCallback!=null){
    registerActuatorCallback(id, actuatorCallback);
  }
  
  var body;

  //HOTFIX for profile changes...
  if(typeof dataType == "string"){
    body = {
      localId : id,
      name: name,
      description: description,
      is: actuatorCallback ? 'actuator' : 'sensor',
      profile: {
        type: profile
      },
      deviceId: ATT.credentials.deviceId
    };
  }else{
     body = {
        localId : id,
        name: name,
        description: description,
        is: actuatorCallback ? 'actuator' : 'sensor',
        profile: profile,
        deviceId: ATT.credentials.deviceId
      };
  }

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

  request(options, successCallback || function() {});

  return body;
}

// WORK IN PROGRESS
//  var actuatorId= [], actuatorCallback= [];

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

  console.log('Subscribing to: ' + topic);

  mqttClient = mqtt.createClient(port || 1883, url || baseMQTTUrl, {
    clientId: mqttId,
    username: brokerId,
    password: ATT.credentials.ClientKey
  })
  .subscribe(topic)
  .on('message', function onMessage(topic, message, packet) {
    console.log('Incoming message - topic: ' + topic + ', payload: ' + message);
    var topicParts = topic.split('/');

    localId = topicParts[6].substring(23);
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
  })
  .on('offline', function onOffline(client, userdata, rc) {
    console.log('Lost connection to the MQTT broker - auto attempt to reconnect');
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
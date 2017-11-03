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


const allthingstalk = require('../..');
const readline = require('readline');

allthingstalk.credentials = {
    "deviceId": "",
    "token": ""
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

allthingstalk.addAsset("msg", "message", "This is a sensor test", "string");

allthingstalk.connect();

rl.question('Enter your message: ', function (message) {
  allthingstalk.send(message, "msg");
  rl.close();
})
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

allthingstalk.credentials = {
    "deviceId": "",
    "token": ""
};

allthingstalk.addAsset("counter", "Counter", "Counter example", "integer", 
  function (status, statusMsg) {
   console.log(statusMsg)
});

allthingstalk.connect();

function sendCount(i) {
    setTimeout(function() {
        allthingstalk.send(i, "counter");
        sendCount(++i);
    }, 2000)
};

sendCount(0);

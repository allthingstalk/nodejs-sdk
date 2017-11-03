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

allthingstalk.addAsset("cmd", "commander", "This is an actuator test", "boolean", 
	function(){
  		console.log("Awaiting a command");
	},
	function() {
		console.log('Command received');
	});

allthingstalk.connect();
const mqtt = require('mqtt');
const express = require('express');

const app = express();
const PORT = 3000;

const mqttURL = "mqtt://localhost";
const mqttClient = mqtt.connect(mqttURL);

mqttClient.on("connect",()=>{
    console.log("Connected to the MQTT broker");

    mqttClient.subscribe("Attendance", (err)=>{
        if (!err) {
            console.log("Subscribed to the topic: Attendance");
        }
    });
});


mqttClient.on("message", (topic,message)=>{
    console.log(`Message recieved from Topic - ${topic} : ${message}`);
})
import mqtt from 'mqtt';
import express from 'express';
import db_connect from './db/db.js';
import dotenv from "dotenv";
import { Student } from './models/students.model.js';


dotenv.config("./env");


const app = express();
const PORT = 3000;

const mqttURL = "mqtt://localhost";
const mqttClient = mqtt.connect(mqttURL);

mqttClient.on("connect",()=>{
    console.log("[-] Connected to the MQTT broker");

    mqttClient.subscribe("Attendance", (err)=>{
        if (!err) {
            console.log("[-] Subscribed to the topic: Attendance");
        }
    });
});


mqttClient.on("message", (topic,message)=>{
    console.log(`Message recieved from Topic - ${topic} : ${message}`);
})


db_connect()
.then(()=>{
    app.listen(3000, ()=>{
       console.log("[-] Server Started on port 3000 successfully"); 
    })
})
.catch((error)=>{
    console.log("[X] Database Connection or Server Start failed ",error)
})



app.get("/:student",async (req,res)=>{
    const student = req.params.student;
    const studentobj = await Student.create({
        rollno: 4,
        name: student
    });
    console.log(studentobj._id);

    console.log("[-] Student Created!!")
})
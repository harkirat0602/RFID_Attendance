import mqtt from 'mqtt';
import express from 'express';
import db_connect from './db/db.js';
import dotenv from "dotenv";
import { Attendance } from './models/attendance.model.js';
import { Student } from './models/students.model.js';
import { getAttendanceState } from './utils/attendanceState.js';



dotenv.config("./env");


const app = express();
const PORT = 3000;
let successFlag;
let class_name;
let subject_name;

app.use(express.json({limit: "32kb"}))
app.use(express.urlencoded({extended:true, limit:"32kb"}))


const mqttURL = "mqtt://localhost";
const mqttClient = mqtt.connect(mqttURL,{
    username: "harkirat",
    password: "Harkirat123",
});



mqttClient.on("connect",()=>{
    console.log("[-] Connected to the MQTT broker");

    mqttClient.subscribe("from_arduino_data", (err)=>{
        if (!err) {
            console.log("[-] Subscribed to the topic: from_arduino_data");
        }
    });

    mqttClient.subscribe("from_arduino_response", (err)=>{
        if (!err) {
            console.log("[-] Subscribed to the topic: from_arduino_response");
        }
    });
});


mqttClient.on("message",async (topic,message)=>{
    if(topic==="from_arduino_data"){
        const data= JSON.parse(message)
        console.log(`Attendance Recieved of ${data["firstname"]} ${data["lastname"]} having roll number ${data["rollno"]}`)

        const student = await Student.findOne({ rollno : data["rollno"]})
        const subject = getAttendanceState().subject._id;

        let date = new Date(); date.setTime(0);
        const markflag = await Attendance.exists({student: student._id, date: { $gt: date }, subject:subject})
        if (markflag){
            mqttClient.publish("to_arduino_response",'{success:false, message:"attendance already marked"}')
            return
        }

        const attendance = await Attendance.create({student: student._id, subject, date: Date.now()})
        
        await attendance.save().then(savedattend=>{
            if(savedattend==attendance){mqttClient.publish("to_arduino_response",'{success:true, message:"attendance marked"}')}
            else{mqttClient.publish("to_arduino_response",'{success:false, message:"attendance not marked"}')}
        })

    }else if(topic==="from_arduino_response"){
        const data= JSON.parse(message)
        console.log(data)
        if (data.success) {
            successFlag=true;
        }
    } else{
        console.log(`Message recieved from Topic - ${topic} : ${message}`);
    }
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




app.get("/hello",(req,res)=>{
    res.send(`Hello ${req.query.name}, How are you?`)
})

app.post("/write-data",(req,res)=>{
    const { firstname, lastname, rollno } = req.body;
    const data = {
        firstname,
        lastname,
        rollno
    }
    console.log(req.body)
    mqttClient.publish("to_arduino_data",JSON.stringify(data))

    setTimeout(()=>{

        if (successFlag==true) {
            successFlag =false;
            return res
            .status(201)
            .json({
                message: "sent",
                response_recieved: "success"
            })
        }else{
            return res
            .status(500)
            .json({
                message: "sent",
                response_recieved: "unknown"
            })
        }

    },5000)

})


import attendanceRouter from "./routes/attendance.routes.js"

app.use("/attendance",attendanceRouter)
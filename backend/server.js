import mqtt from 'mqtt';
import express from 'express';
import db_connect from './db/db.js';
import dotenv from "dotenv";
import { Attendance } from './models/attendance.model.js';
import { Student } from './models/students.model.js';
import { getAttendanceState } from './utils/attendanceState.js';
import {Server} from "socket.io"
import http from "http"


dotenv.config("./env");


const app = express();
const PORT = 3000;
let successFlag;
let class_name;
let subject_name;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:4200", // your Angular app
      methods: ["GET", "POST"]
    }
  })

app.use(express.json({limit: "32kb"}))
app.use(express.urlencoded({extended:true, limit:"32kb"}))
app.use(cookieParser())


const mqttURL = "mqtt://localhost";
const mqttClient = mqtt.connect(mqttURL,{
    username: "harkirat",
    password: "Harkirat123",
});


io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
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
        console.log(`Attendance Recieved of roll number ${message}`)

        const student = await Student.findOne({ rollno : message})
        const attendance = getAttendanceState().attendance;
        // console.log(attendance);
        // const classobj = attendance.subject.class;

        // if(student.class._id!=classobj._id){
        //     mqttClient.publish("to_arduino_response",'{success:false, message:"Wrong Class"}')
        //     return
        // }

        
        const markflag = await Attendance.findOne({_id:attendance._id, students: student._id})


        if (markflag){
            mqttClient.publish("to_arduino_response",'ALREADY MARKED')
            return
        }

        const markedattendance = await Attendance.findByIdAndUpdate(
            attendance._id,
            {   $push: { students: student._id }    },
            {   new: true   }
        );
        
        console.log(markedattendance._id.toString(),"===",attendance._id.toString())

        if(markedattendance._id.toString()==attendance._id.toString()){
            mqttClient.publish("to_arduino_response",'SUCCESS')
            io.emit('student-marked-present',{rollno:student.rollno});
        }else{
            mqttClient.publish("to_arduino_response",'FAIL')
        }


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
    server.listen(3000, ()=>{
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
        rollno,
        operation: "write"
    }
    console.log(req.body)
    mqttClient.publish("to_arduino_command",JSON.stringify(data))

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
            .status(600)
            .json({
                message: "sent",
                response_recieved: "unknown"
            })
        }

    },5000)

})


import attendanceRouter from "./routes/attendance.routes.js"
import studentRouter from "./routes/student.routes.js"
import teacherRouter from "./routes/teacher.routes.js"
import cookieParser from 'cookie-parser';
import subjectRouter from "./routes/subject.routes.js"

app.use("/attendance",attendanceRouter)
app.use("/student",studentRouter)
app.use("/teacher",teacherRouter)
app.use("/subject",subjectRouter)
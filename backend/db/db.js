import mongoose from "mongoose";


const db_connect = async()=>{
    try {
        console.log(process.env.DB_URI);
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}Attendance_DB`);
        console.log("[-] DB Connected!");
        console.log(`[-] Connection Instance: ${connectionInstance}`)
    } catch (error) {
        console.error(`[X] Couldnt connect to database, Error ${error}`);
    }

}

export default db_connect;
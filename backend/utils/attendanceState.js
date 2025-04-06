

const AttendanceState = {
    isMarking : false,
    attendance: null,
    subject: null
};


export const getAttendanceState = () => AttendanceState;


export const startAttendance = (subject,attendance) => {
    AttendanceState.isMarking = true;
    AttendanceState.attendance = attendance
    AttendanceState.subject = subject
    // console.log("set Attendance to ",attendance)
}

export const stopAttendance = ()=>{
    AttendanceState.isMarking = false;
    AttendanceState.attendance = null
}

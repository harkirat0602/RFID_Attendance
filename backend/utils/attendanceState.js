

const AttendanceState = {
    isMarking : false,
    attendance: null
};


export const getAttendanceState = () => AttendanceState;


export const startAttendance = (subject, attendance) => {
    AttendanceState.isMarking = true;
    AttendanceState.attendance = attendance
}

export const stopAttendance = ()=>{
    AttendanceState.isMarking = false;
    AttendanceState.attendance = null
}

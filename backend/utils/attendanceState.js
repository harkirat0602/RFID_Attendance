

const AttendanceState = {
    isMarking : false,
    subject: null
};


export const getAttendanceState = () => AttendanceState;


export const startAttendance = (subject) => {
    AttendanceState.isMarking = true;
    AttendanceState.subject = subject;
}

export const stopAttendance = ()=>{
    AttendanceState.isMarking = false;
    AttendanceState.subject = null
}

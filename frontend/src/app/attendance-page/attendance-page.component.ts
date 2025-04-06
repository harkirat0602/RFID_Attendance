import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Classes } from '../class.interface';
import { Subject } from '../subject.interface';
import { Student } from '../student.interface';
import { SocketService } from '../socket.service';
import { forkJoin, of, timer } from 'rxjs';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance-page.component.html',
  imports: [ReactiveFormsModule,CommonModule],
  styleUrl: "./attendance-page.component.css"
})
export class AttendancePageComponent implements OnInit {
  attendanceForm!: FormGroup;
  classes: Classes[] = [];
  subjects: Subject[] = [];
  students: Student[] = [];
  attendanceid: String = "";

  showOverlay = false


  constructor(private fb: FormBuilder, private http: HttpClient, private socketService: SocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.attendanceForm = this.fb.group({
      classes: [],
      subject: []
    });




    // Fetch classes on load
    this.http.get<any>('http://localhost:3000/teacher/getclassinfo',{withCredentials:true}).subscribe(res => {
      this.classes = res.data;
      console.log("Classes: ",this.classes)
    });

    // Fetch subjects when class is selected
    this.attendanceForm.get('classes')?.valueChanges.subscribe(selectedClassId => {
      const selectedClass = this.classes.find(obj => obj._id === selectedClassId);
      this.subjects = selectedClass?.subjects || []; // Reset subjects
      this.attendanceForm.get('subject')?.setValue(''); // Reset subject field

    });
  }

  startAttendance() {
    const { classes: selectedClassID, subject:subjectID } = this.attendanceForm.value;
    console.log(selectedClassID,subjectID);
    // console.log('Starting attendance for', selectedClass, subject);
    // You can send a POST request to backend here

    this.http.post<any>("http://localhost:3000/attendance/start",{
      classID:selectedClassID,subjectID
    },{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          this.attendanceid = response.attendanceid;
          console.log("Attendance Started Successfully");
          this.getStudents(selectedClassID);

          // timer(2000);
          
          

          this.socketService.listen('student-marked-present').subscribe((data: any) => {
            console.log("Real-time present ",data)
            const student = this.students.find(s => s.rollno === data.rollno);
            if (student) student.isPresent = true;
          });

        }
      },
      error: (err)=>{
        console.error(err.error.message);
      }
    })

  }


  closeOverlay() {
    this.http.get<any>("http://localhost:3000/attendance/stop",{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          console.log("Attendance Stopped!")
          this.showOverlay = false;
        }
      },
      error: (err)=>{
        console.log("Error while Stopping Attendance: ",err.error.message);
        this.showOverlay = false;
      }
    })
    
  }


  getStudents(selectedClassID:String){
    this.http.get<any>(`http://localhost:3000/student/getstudents/${selectedClassID}`,{
            withCredentials: true
          }).subscribe({
            next: (response)=>{
              if(response.success){
                this.students = response.data
                console.log("This is assigning of students ",response.data)
                this.fetchInitialAttendance();
              }
            },
            error:(err)=> {
              console.log("Error in Fetching Students: ",err.error.message)
              this.closeOverlay();
            }
          })
  }


  async fetchInitialAttendance() {
    console.log("Fetching Attendance");
    this.http.get<any>(`http://localhost:3000/attendance/getattendance/${this.attendanceid}`,{
      withCredentials: true,
      headers: new HttpHeaders({ 'Cache-Control': 'no-cache' })
    }).subscribe({
      next: async (response)=>{
        if(response.success){
          console.log("This is before",this.students);
          for (const studentobj of response.data) {
            this.students = this.students.map(entry =>
              entry.rollno === studentobj.rollno
                ? { ...entry, isPresent: true }
                : entry
            );
          }
          console.log(this.students);
          this.showOverlay = true;
        }
      }, error: (err)=>{
        console.error("Cannot refresh Attendance");
      }
    })
  }


  trackByRollNo(index:number, student: any){
    return student.rollno;
  }

}
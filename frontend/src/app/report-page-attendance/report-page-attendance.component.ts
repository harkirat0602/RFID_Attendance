import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Classes } from '../class.interface';
import { Subject } from '../subject.interface';
import { Student } from '../student.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-page-attendance',
  imports: [ReactiveFormsModule,CommonModule,MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './report-page-attendance.component.html',
  styleUrl: './report-page-attendance.component.css'
})
export class ReportPageAttendanceComponent {


  constructor(private fb: FormBuilder, private http: HttpClient){}


  classSelectorForm!: FormGroup;
  classes: Classes[] = [];
  subjects: Subject[] = [];
  students!: Student[];

  showOverlay = false;
  OverlayMessage ="";


  ngOnInit(): void {
    this.classSelectorForm = this.fb.group({
      classID: [],
      subjectID: [],
      date: [new Date()]
    });




    // Fetch classes on load
    this.http.get<any>('http://localhost:3000/teacher/getclassinfo',{withCredentials:true}).subscribe(res => {
      this.classes = res.data;
      console.log("Classes: ",this.classes)
    });

    // Fetch subjects when class is selected
    this.classSelectorForm.get('classID')?.valueChanges.subscribe(selectedClassId => {
      console.log("Class Selected");
      
      const selectedClass = this.classes.find(obj => obj._id === selectedClassId);
      this.subjects = selectedClass?.subjects || []; // Reset subjects
      console.log(this.subjects);
      
      this.classSelectorForm.get('subjectID')?.setValue(''); // Reset subject field

    });
  }


  formatDate(date: Date): string | null {
    if (!date) return null;
    // console.log(date.toISOString());
    date.setHours(0,0,0,0)
    
    return date.toISOString(); // format: YYYY-MM-DD
  }


  async getReport(){
    const body ={...this.classSelectorForm.value, date:this.formatDate(this.classSelectorForm.value.date)};
    console.log("Sending This to API:- ",body);

    this.http.get<any>(`http://localhost:3000/student/getstudents/${body.classID}`,{
      withCredentials:true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          this.students = response.data;
          this.updateAttendance(body);
        }
      },
      error: (err)=>{
          console.error(err.error.message);
      },
    })
    
  }


  updateAttendance(body:any){
    this.http.post<any>(`http://localhost:3000/attendance/getattendance/bydate`,body,{
      withCredentials: true,
    }).subscribe({
      next: async (response)=>{
        if(response.success){
          this
          for (const studentobj of response.data) {
            this.students = this.students.map(entry =>
              entry.rollno === studentobj.rollno
                ? { ...entry, isPresent: true }
                : entry
            );
          }
          console.log(this.students);
        }
      }, error: (err)=>{        
        if(err.status==420){
          console.log("No Attendance Marked on the selected Day");
          this.showOverlay = true;
          this.OverlayMessage = err.error.message;
          return;
        }
        console.error("Cannot refresh Attendance");
      }
    })
  }


  changeDate(offset: number): void {
    const newDate = new Date(this.classSelectorForm.value.date);
    newDate.setDate(newDate.getDate() + offset);
    newDate.setHours(0,0,0,0);
    this.classSelectorForm.get('date')?.setValue(newDate); //
    console.log(this.classSelectorForm.value.date);
    this.getReport();
  }

  onDateChange(): void {
    this.getReport();
  }


}

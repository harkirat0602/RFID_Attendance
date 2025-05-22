import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Student } from '../student.interface';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule,ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-student',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './admin-student.component.html',
  styleUrl: './admin-student.component.css'
})
export class AdminStudentComponent {

  constructor(private http: HttpClient, private fb: FormBuilder){
    this.studentForm = this.fb.group({
      firstname: ['',Validators.required],
      lastname: ['',Validators.required],
      dob: [''],
      rollno: ['',Validators.required],
      class_name: ['',Validators.required],
    });
  }

  ngOnInit(){

    this.getallStudents()


    this.http.get<any>("http://localhost:3000/admin/getallclassesname",{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          this.allClasses = response.data;
          console.log("The Classes are:-",this.allClasses);
        }
      },
      error: (err)=>{
        console.log(err.error.message);
      }
    })

  }


  @ViewChild('closebutton') myButton!: ElementRef<HTMLButtonElement>;
  studentForm: FormGroup;
  students!: Student[];
  classes!: String[];
  selectedClass: String = "All Classes";
  allClasses!: String[];
  showform=true;
  isSuccess=false;
  isFailed=false;
  errormessage=""
  



  RegisterStudent() {
    this.showform=false;
    if(!this.studentForm.valid){
      return
    }
    const creds = this.studentForm.value
    console.log(creds);
    this.http.post<any>("http://localhost:3000/student/register",creds,{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          this.isSuccess=true;
          console.log("Student Registered ✅");
          this.getallStudents();
          setTimeout(() => {
            this.myButton.nativeElement.click(); // simulates real button click
            this.showform=true;
            this.isSuccess=false;
            this.isFailed=false;
            this.studentForm.reset();
          }, 2500);      
        }
      },
      error: (err)=>{
        this.isFailed = true;
        this.errormessage = err.error.message;
        setTimeout(() => {
          this.myButton.nativeElement.click(); // simulates real button click
          this.showform=true;
          this.isSuccess=false;
          this.isFailed=false;
          this.studentForm.reset();
        }, 2500);
      }
    })

    // Send to backend here!
  }


  filterStudents(){
    if(this.selectedClass==="All Classes"){
      return this.students
    }
    return this.students.filter(s => s.class === this.selectedClass)
  }


  deleteStudent(rollno: Number){
    this.http.get<any>(`http://localhost:3000/student/remove/${rollno}`,{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          console.log(`Student having Roll no ${rollno} Deleted Successfully`);
          this.students = this.students.filter(s => s.rollno !== rollno);
        }
      }
    })
  }


  getallStudents(){
    this.http.get<any>("http://localhost:3000/admin/getallstudents",{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          this.students = response.data;
          console.log(this.students);
          this.students.forEach((student)=>{
            if(student.dob){
              student.dob = new Date(student.dob);
            }
          })

          this.classes = [...new Set(this.students.map(s=>s.class))]

        }
      },
      error: (err)=>{
        console.log(err.error.message);
      }
    })
  }

}

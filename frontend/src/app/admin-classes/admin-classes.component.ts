import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-classes',
  imports: [CommonModule],
  templateUrl: './admin-classes.component.html',
  styleUrl: './admin-classes.component.css'
})
export class AdminClassesComponent {


  constructor(private http: HttpClient){}


  allClasses! : {
    id:String,
    studentCount: Number,
    class_name: String,
    subjects: Array<any>
  }[];
  expandedClass: any = null;



  ngOnInit(){



    this.http.get<any>("http://localhost:3000/admin/getallclassesinfo",{
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



  toggleExpand(classObj: any): void {
    this.expandedClass = this.expandedClass === classObj ? null : classObj;
  }

}

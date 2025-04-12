import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ModuleWithProviders } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from '../subject.interface';
import { Classes } from '../class.interface';
import { Report } from '../report.interface';
import { NgCircleProgressModule } from 'ng-circle-progress';
import moment from 'moment';
import { AttendanceHeatmap } from '../attendance-heatmap.interface';

@Component({
  standalone:true,
  selector: 'app-report-page',
  imports: [ReactiveFormsModule, CommonModule, NgCircleProgressModule],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.css',
  providers:[(NgCircleProgressModule.forRoot({
    radius: 100,
    outerStrokeWidth: 16,
    innerStrokeWidth: 8,
    outerStrokeColor: '#78C000',
    innerStrokeColor: '#C7E596',
    animationDuration: 300,
  }) as ModuleWithProviders<NgCircleProgressModule>).providers!]
})
export class ReportPageComponent {

  classSelectorForm!: FormGroup;
  classes: Classes[] = [];
  subjects: Subject[] = [];
  report!: Report;
  startDate = moment('2025-04-01');
  endDate = moment('2025-04-30');
  heatmapData: AttendanceHeatmap[]= [];
  moment = moment;


  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.classSelectorForm = this.fb.group({
      classID: [],
      subjectID: [],
      studentRoll: []
    });


    this.http.get<any>('http://localhost:3000/teacher/getclassinfo',{withCredentials:true}).subscribe(res => {
    this.classes = res.data;
    console.log("Classes: ",this.classes)
  });

    // Fetch subjects when class is selected
  this.classSelectorForm.get('classID')?.valueChanges.subscribe(selectedClassId => {
    const selectedClass = this.classes.find(obj => obj._id === selectedClassId);
    this.subjects = selectedClass?.subjects || []; // Reset subjects
    this.classSelectorForm.get('subjectID')?.setValue(''); // Reset subject field

  });


  }


  getReport(){
    // console.log(this.classSelectorForm.value)
    const body = this.classSelectorForm.value

    this.http.post<any>("http://localhost:3000/student/getstudentattendance",body,{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          console.log("Reports Fetched");
          this.report = response.data
          console.log(this.report)
          this.getHeatMapData();
        }
      },
      error: (err)=>{
        console.error(err.error.message);
      }
    })

  }


  getHeatMapData(){
    let current = this.startDate.clone();

    while (current.isSameOrBefore(this.endDate)) {
      const dateStr = current.format('YYYY-MM-DD');

      this.heatmapData.push({
        date: dateStr,
        present: this.report.dates.includes(dateStr)
      });
    
      current.add(1, 'day');

    }

    console.log(this.heatmapData)
  }



}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ModuleWithProviders } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from '../subject.interface';
import { Classes } from '../class.interface';
import { StudentReport } from '../student-report.interface';
import { NgCircleProgressModule } from 'ng-circle-progress';
import moment from 'moment';
import { AttendanceHeatmap } from '../attendance-heatmap.interface';

@Component({
  standalone:true,
  selector: 'app-report-page-students',
  imports: [ReactiveFormsModule, CommonModule, NgCircleProgressModule],
  templateUrl: './report-page-students.component.html',
  styleUrl: './report-page-students.component.css',
  providers:[(NgCircleProgressModule.forRoot({
    radius: 100,
    outerStrokeWidth: 16,
    innerStrokeWidth: 8,
    outerStrokeColor: '#78C000',
    innerStrokeColor: '#C7E596',
    animationDuration: 300,
  }) as ModuleWithProviders<NgCircleProgressModule>).providers!]
})
export class StudentsReportComponent {

  classSelectorForm!: FormGroup;
  classes: Classes[] = [];
  subjects: Subject[] = [];
  report!: StudentReport;
  startDate = moment('2025-04-01');
  startDay = this.startDate.day();
  adjustedDay = (this.startDay + 6) % 7;
  blankCells = Array(this.adjustedDay).fill(null);
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
    this.heatmapData = []
    let current = this.startDate.clone();

    while (current.isSameOrBefore(this.endDate)) {
      const dateStr = current.format('YYYY-MM-DD');

      this.heatmapData.push({
        date: dateStr,
        present: this.report.dates.includes(dateStr)
      });
    
      current.add(1, 'day');

      
    }

    this.startDay = this.startDate.day();
    this.adjustedDay = (this.startDay + 6) % 7;
    this.blankCells = Array(this.adjustedDay).fill(null);
    console.log(this.adjustedDay,this.blankCells);
    

    console.log(this.heatmapData)
  }


  previousmonth(){
    this.startDate = this.startDate.clone().subtract('1','month').startOf('month')
    this.endDate = this.endDate.clone().subtract('1','month').endOf('month')

    this.getHeatMapData()
  }


  nextMonth(){
    this.startDate = this.startDate.clone().add('1','month').startOf('month')
    this.endDate = this.endDate.clone().add('1','month').endOf('month')

    this.getHeatMapData()
  }


  isCurrentMonth(date: moment.Moment):boolean {
    const now = moment();
    return date.month() === now.month() && date.year() === now.year();
  }


  getColor(percent: number): string {
    if (percent >= 0.75) return '#4caf50';   // Green
    if (percent >= 0.50) return '#ff9800';   // Orange
    return '#f44336';                      // Red
  }
  


}

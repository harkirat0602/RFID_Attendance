import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subject } from '../subject.interface';
import { Classes } from '../class.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClassReport } from '../class-report.interface';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-report-page-class',
  imports: [ReactiveFormsModule, CommonModule, BaseChartDirective],
  templateUrl: './report-page-class.component.html',
  styleUrl: './report-page-class.component.css'
})
export class ReportPageClassComponent {

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  classSelectorForm!: FormGroup;
  classes: Classes[] = [];
  subjects: Subject[] = [];
  report!: ClassReport;

  
barChartData: ChartConfiguration<'bar'>['data'] = {
  labels: [],
  datasets: [
    {
      label: 'Attendance %',
      data: [],
      backgroundColor: '#4CAF50'
    }
  ]
};

barChartOptions: ChartConfiguration<'bar'>['options'] = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio:false,
  plugins: {
    title: {
      display: true,
      text: 'Top 5 Students by Attendance',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: {
        top: 50,
        bottom: 30
      },
      align: 'center' // or 'center'
    },
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: { beginAtZero: true, max: 100 }
  }
};


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
    const params = this.classSelectorForm.value;

    this.http.get<any>(`http://localhost:3000/attendance/getbyclass/${params.classID}/${params.subjectID}`,{
      withCredentials: true
    }).subscribe({
      next: (response)=>{
        if(response.success){
          console.log("Reports Fetched");
          this.report = response.data
          console.log(this.report)
          this.updateBarChart()
        }
      },
      error: (err)=>{
        console.error(err.error.message);
      }
    })

  }


  updateBarChart(){
    const labels = this.report.topFiveStudents.map(student=>student.name);
    const data = this.report.topFiveStudents.map(student=>student.attendancePercent*100)

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Attendance %',
          data: data,
          backgroundColor: '#4caf50'
        }
      ]
    };

  }


}

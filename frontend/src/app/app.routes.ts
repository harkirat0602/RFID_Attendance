import { Routes } from '@angular/router';
import { AttendancePageComponent } from './attendance-page/attendance-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { StudentComponent } from './student/student.component';
import { ReportPageComponent } from './report-page/report-page.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    {
        path:'login',
        component: LoginPageComponent,
        title: "Login Page"
    },
    {
        path:"attendance",
        component: AttendancePageComponent,
        title: "Attendance Page"
    },
    {
        path: 'student',
        component: StudentComponent,
        title: "Students Page"
    },
    {
        path: 'reports',
        component: ReportPageComponent,
        title: "Report Page"
    },
    {
        path:'admin',
        component: AdminComponent,
        title:"Admin Dashboard"
    }
];

import { Routes } from '@angular/router';
import { AttendancePageComponent } from './attendance-page/attendance-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { StudentComponent } from './student/student.component';
import { StudentsReportComponent } from './report-page-students/report-page-students.component';
import { AdminComponent } from './admin/admin.component';
import { AdminStudentComponent } from './admin-student/admin-student.component';
import { AdminClassesComponent } from './admin-classes/admin-classes.component';
import { AdminAttendanceComponent } from './admin-attendance/admin-attendance.component';
import { AdminSubjectsComponent } from './admin-subjects/admin-subjects.component';
import { ReportPageComponent } from './report-page/report-page.component';
import { ReportPageAttendanceComponent } from './report-page-attendance/report-page-attendance.component';
import { EmpytWelcomeComponent } from './empyt-welcome.component';
import { ReportPageClassComponent } from './report-page-class/report-page-class.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

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
        title: "Report Page",
        children: [
            { path:'students', component:StudentsReportComponent},
            { path:'attendance', component:ReportPageAttendanceComponent},
            { path:'class', component:ReportPageClassComponent},
            { path: '', component:EmpytWelcomeComponent}
        ]
    },
    {
        path:'admin',
        component: AdminComponent,
        title:"Admin Dashboard",
        children: [
            { path:'students', component:AdminStudentComponent},
            { path:'classes', component:AdminClassesComponent },
            { path:'attendance', component: AdminAttendanceComponent },
            { path:'subjects', component: AdminSubjectsComponent}
        ]
    },
    {
        path:"edit-profile",
        component: EditProfileComponent,
        title: "Edit Profile"
    }
];

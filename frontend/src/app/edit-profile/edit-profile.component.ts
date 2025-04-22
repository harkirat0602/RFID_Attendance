import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Login } from '../login.interface';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  constructor(private authService: AuthService, private http: HttpClient){}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      // console.log('Logged in user:', user);
      this.login = user;
      if(this.login){
        // this.login.name = this.login.name.split(" ")[0]
      }
    });
  }


  login!: Login;
  passwords = {
    oldPassword: '',
    newPassword: ''
  };
  updateMessage = '';
  passwordMessage = '';


  updateProfile() {
    this.http.post("http://localhost:3000/teacher/update-account", this.login,{
      withCredentials:true
    }).subscribe(
      (res: any) => {
        this.updateMessage = 'Account updated successfully!';
        setTimeout(() => this.updateMessage = '', 3000);
      },
      err => {
        this.updateMessage = err.error.updateMessage;
        setTimeout(() => this.updateMessage = '', 3000);
      }
    );
  }

  updatePassword() {
    this.http.post('http://localhost:3000/teacher/change-password', this.passwords,{
      withCredentials: true
    }).subscribe(
      (res: any) => {
        this.passwordMessage = 'Password updated successfully!';
        this.passwords = { oldPassword: '', newPassword: '' };
        setTimeout(() => this.passwordMessage = '', 3000);
      },
      err => {
        this.passwordMessage = err.error.message;
        setTimeout(() => this.passwordMessage = '', 3000);
      }
    );
  }


  // This converts the Date object to YYYY-MM-DD format for the input
  get formattedDob(): string {
    const dob = this.login.dob;
    return dob instanceof Date
      ? dob.toISOString().split('T')[0]
      : new Date(dob || "").toISOString().split('T')[0]; // fallback if dob is string
  }

  // And if the user picks a new date:
  onDobChange(event: any) {
    this.login.dob = new Date(event.target.value);
  }

}

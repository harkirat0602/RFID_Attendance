import { Component } from '@angular/core';
import { Login } from '../login.interface';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-nav',
  imports: [CommonModule],
  templateUrl: './login-nav.component.html',
  styleUrl: './login-nav.component.css'
})
export class LoginNavComponent {

  constructor(private authService: AuthService, private http: HttpClient,private router: Router) {}

ngOnInit() {
  this.authService.user$.subscribe(user => {
    console.log('Logged in user:', user);
    this.login = user;
  });
}

  login: Login ={
    name: "Login",
    isAdmin: false,
    username: undefined,
    dob: undefined,
    _id: undefined
  };

  logout(){
    console.log("Logging you out!!!");

    this.http.get<any>("http://localhost:3000/teacher/logout",{
      withCredentials: true
    }).subscribe(res=>{
      if(res.success){
        this.authService.setUser(undefined)
        this.router.navigate(['/login'])
      }
    })

  }


}

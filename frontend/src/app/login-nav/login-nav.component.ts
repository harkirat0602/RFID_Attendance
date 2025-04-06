import { Component } from '@angular/core';
import { Login } from '../login.interface';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-nav',
  imports: [],
  templateUrl: './login-nav.component.html',
  styleUrl: './login-nav.component.css'
})
export class LoginNavComponent {

  constructor(private authService: AuthService) {}

ngOnInit() {
  this.authService.user$.subscribe(user => {
    console.log('Logged in user:', user);
    this.login = user;
    if(this.login){
      this.login.name = this.login.name.split(" ")[0]
    }
  });
}

  login: Login ={
    name: "Login",
    isAdmin: false,
    username: undefined,
    dob: undefined,
    _id: undefined
  };
}

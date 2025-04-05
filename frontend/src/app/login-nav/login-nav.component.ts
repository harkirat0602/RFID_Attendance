import { Component } from '@angular/core';
import { Login } from '../login.interface';

@Component({
  selector: 'app-login-nav',
  imports: [],
  templateUrl: './login-nav.component.html',
  styleUrl: './login-nav.component.css'
})
export class LoginNavComponent {
  login: Login= {
    name: "Harsimran",
    isAdmin: true
  };
}

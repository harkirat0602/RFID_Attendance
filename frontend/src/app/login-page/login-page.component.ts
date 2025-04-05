import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authservice: AuthService, private router: Router){
    this.loginForm = this.fb.group({
      username: ['',Validators.required],
      password: ['',Validators.required]
    });
  }

  onLogin(){
    if(this.loginForm.valid){
      const creds= this.loginForm.value;
      console.log("Logging with: ",creds);

      this.authservice.login(creds).subscribe({
        next: (response)=>{
          console.log("Logged In");
          console.log(response)
          if(response.success){
            this.authservice.setUser(response.data);
            this.router.navigate(['/attendance'])
          }else{
            this.router.navigate(['/login'])
          }
        },
        error: (err) => {
          this.router.navigate(['/login'])

        }
      })


    }
  }

}


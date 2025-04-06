import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authservice: AuthService, private router: Router, private toastr: ToastrService){
    this.loginForm = this.fb.group({
      username: ['',Validators.required],
      password: ['',Validators.required]
    });

    // this.toastr.success('Hello from Angular',"This is text",{
    //   toastClass: 'ngx-toastr custom-toast'
    // });


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
            localStorage.setItem('login-toast',`Welcome back! ${response.data.name}`)
            this.router.navigate(['/attendance'])
          }else{
            localStorage.setItem('login-toast',`Error: ${response.message}`)
            this.router.navigate(['/login'])
          }
        },
        error: (err) => {
          // this.toastr.error("Error",err.error.message,{
          //   toastClass: "toast bootstrap bg-danger text-black"
          // });

        }
      })


    }
  }

}


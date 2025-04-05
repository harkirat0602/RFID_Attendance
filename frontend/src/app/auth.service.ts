// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Login } from './login.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  currentlogin : Login = {
    name: "login",
    username: undefined,
    isAdmin: false,
    _id: undefined,
    dob: undefined
  };

  constructor(private http: HttpClient) {}

  // Call this on app start or route navigation
  fetchLoginInfo(): Observable<void> {
    return this.http.get<any>('http://localhost:3000/teacher/getlogininfo',{
      withCredentials: true
    }).pipe(
      tap(user => {
        this.setUser(user.data);
      }),
      catchError(error => {
        console.error('Login info fetch failed:', error);
        return of(); // Just return an empty observable so it doesn’t crash the app
      }),
      map(() => void 0)
    );
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>('http://localhost:3000/teacher/login', credentials, {
      withCredentials: true
    });
  }

  setUser(user: Login | any) {
    console.log("User Set Successfully");
    this.userSubject.next(user);
    this.currentlogin = user
  }

  getUser() {
    return this.userSubject.value;
  }
}

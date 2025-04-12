import { NgModule } from '@angular/core';
import { AuthService } from './auth.service';
import { CircleProgressOptions, NgCircleProgressModule } from 'ng-circle-progress';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

export function loadUser(authService: AuthService) {
  return () => authService.fetchLoginInfo().toPromise().then(user => {
    authService.setUser(user);
  }).catch(() => {
    authService.setUser(null);
  });
}

@NgModule({
  imports: [
    BrowserModule,
    NgCircleProgressModule.forRoot({
      radius: 60,
      outerStrokeWidth: 8,
      outerStrokeColor: "#4dd0e1",
      innerStrokeWidth: 4,
      innerStrokeColor: "#e0f7fa",
      animation: true,
      animationDuration: 300,
    }),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: []
})

export class AppModule { }


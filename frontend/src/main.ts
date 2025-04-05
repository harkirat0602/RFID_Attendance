import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, importProvidersFrom, inject } from '@angular/core';
import { AuthService } from './app/auth.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    AuthService,
    {provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AuthService],
      multi: true,
    }
  ]
});



function initializeAppFactory(authService: AuthService) {
  return () => authService.fetchLoginInfo().toPromise().then(user => {
    authService.setUser(user);
  }).catch(err => {
    console.error('User not logged in');
    authService.setUser(null);
  });
}
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, importProvidersFrom, inject } from '@angular/core';
import { AuthService } from './app/auth.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideToastr(),
    provideHttpClient(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
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
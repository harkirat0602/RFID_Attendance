import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthService } from './auth.service';

export function loadUser(authService: AuthService) {
  return () => authService.fetchLoginInfo().toPromise().then(user => {
    authService.setUser(user);
  }).catch(() => {
    authService.setUser(null);
  });
}

export class AppModule { }

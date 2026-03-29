import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.error?.message || 'Login failed' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          const token = response.accessToken;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.role ? [payload.role] : (payload.roles || []);
            
            if (roles.includes('ADMIN')) {
              this.router.navigate(['/admin/dashboard']);
            } else if (roles.includes('LOGISTICS_MANAGER')) {
              this.router.navigate(['/manager/dashboard']);
            } else if (roles.includes('DRIVER')) {
              this.router.navigate(['/driver/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } catch (e) {
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}

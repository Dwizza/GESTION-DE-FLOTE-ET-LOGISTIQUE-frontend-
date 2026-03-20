import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const driverGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.role ? [payload.role] : (payload.roles || []);
            if (roles.includes('DRIVER')) {
                return true;
            }
        } catch (e) {
            console.error('Guard error', e);
        }
    }

    console.log('Driver Guard: Access Denied, redirecting to /login');
    router.navigate(['/login']);
    return false;
};

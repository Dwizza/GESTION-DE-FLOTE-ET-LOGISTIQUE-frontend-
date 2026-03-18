import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (!token) {
        return router.parseUrl('/login');
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = payload.role ? [payload.role] : (payload.roles || []);

        if (roles.includes('ADMIN') || roles.includes('LOGISTICS_MANAGER')) {
            return true;
        }

        return router.parseUrl('/login');
    } catch (error) {
        return router.parseUrl('/login');
    }
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (!token) {
        return router.parseUrl('/login');
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if the role is Admin
        if (payload.role === 'ADMIN' || payload.roles?.includes('ADMIN')) {
            return true;
        }

        // Fallback based on requirement, deny entry
        return router.parseUrl('/login');
    } catch (error) {
        return router.parseUrl('/login');
    }
};

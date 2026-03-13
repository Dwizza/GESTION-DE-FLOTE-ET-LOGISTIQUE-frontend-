import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Only intercept requests for our own API
    const isApiRequest = req.url.startsWith(environment.apiUrl);
    
    // Don't intercept auth endpoints
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register') || !isApiRequest) {
        return next(req);
    }

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};

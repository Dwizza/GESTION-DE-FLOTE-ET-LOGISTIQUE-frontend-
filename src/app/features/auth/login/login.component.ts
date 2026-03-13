import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]]
    });

    isLoading = false;
    errorMessage = '';

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: (res: any) => {
                this.isLoading = false;

                const token = this.authService.getToken();
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const role = payload.role || (payload.roles && payload.roles[0]);
                        const roles = payload.role ? [payload.role] : (payload.roles || []);
                        console.log('Login Payload:', payload);
                        console.log('Detected Roles:', roles);

                        if (role === 'ADMIN' || roles.includes('ADMIN')) {
                            console.log('Navigating to Admin Dashboard');
                            this.router.navigate(['/admin/dashboard']);
                        } else if (roles.includes('LOGISTICS_MANAGER')) {
                            console.log('Navigating to Manager Dashboard');
                            this.router.navigate(['/manager/dashboard']);
                        } else if (roles.includes('DRIVER')) {
                            console.log('Navigating to Driver Dashboard');
                            this.router.navigate(['/driver/dashboard']);
                        } else {
                            console.log('Navigating to Default Dashboard (Fallback)');
                            this.router.navigate(['/dashboard']);
                        }
                    } catch (e) {
                        this.router.navigate(['/']);
                    }
                } else {
                    this.router.navigate(['/']);
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Identifiants invalides. Veuillez réessayer.';
                console.error('Login error', err);
            }
        });
    }

    // Helper getters for easy access in the template
    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
}

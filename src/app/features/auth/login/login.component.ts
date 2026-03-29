import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { selectAuthError, selectIsLoading } from '../../../core/store/auth/auth.selectors';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private store = inject(Store);
    private router = inject(Router);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]]
    });

    isLoading$ = this.store.select(selectIsLoading);
    errorMessage$ = this.store.select(selectAuthError);

    ngOnInit(): void {
        // Clear any previous errors on init
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const credentials = this.loginForm.value;
        this.store.dispatch(AuthActions.login({ credentials }));
    }

    // Helper getters for easy access in the template
    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
}

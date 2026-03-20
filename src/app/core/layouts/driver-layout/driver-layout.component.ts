import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-driver-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './driver-layout.component.html',
    styles: [`
    :host { display: block; }
    :host ::ng-deep .nav-item.active {
      color: #3b82f6 !important;
      background: rgba(59, 130, 246, 0.1) !important;
      font-weight: 600;
    }
    :host ::ng-deep .nav-item.active svg {
      color: #3b82f6 !important;
    }
    :host ::ng-deep .nav-item:hover {
      color: #f4f5f7 !important;
      background: rgba(59, 130, 246, 0.05) !important;
    }
    :host ::ng-deep .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #3b82f6 !important;
    }
    :host ::ng-deep .live-dot {
      animation: blueGlow 2s ease-in-out infinite !important;
      background: #3b82f6 !important;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.5) !important;
    }
    @keyframes blueGlow {
      0%, 100% { box-shadow: 0 0 6px 0 rgba(59, 130, 246, 0.2); }
      50% { box-shadow: 0 0 16px 4px rgba(59, 130, 246, 0.4); }
    }
  `]
})
export class DriverLayoutComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}

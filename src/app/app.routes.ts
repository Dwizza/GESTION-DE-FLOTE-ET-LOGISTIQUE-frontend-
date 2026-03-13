import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { managerGuard } from './core/guards/manager.guard';
import { ManagerLayoutComponent } from './core/layouts/manager-layout/manager-layout.component';
import { driverGuard } from './core/guards/driver.guard';
import { DriverLayoutComponent } from './core/layouts/driver-layout/driver-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'manager',
        component: ManagerLayoutComponent,
        canActivate: [managerGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/manager/clients-list/clients-list.component').then(m => m.ManagerClientsListComponent)
            },
            {
                path: 'trucks',
                loadComponent: () => import('./features/manager/trucks-list/trucks-list.component').then(m => m.ManagerTrucksListComponent)
            },
            {
                path: 'trailers',
                loadComponent: () => import('./features/manager/trailers-list/trailers-list.component').then(m => m.ManagerTrailersListComponent)
            },
            {
                path: 'trips',
                loadComponent: () => import('./features/manager/trips-list/trips-list.component').then(m => m.ManagerTripsListComponent)
            },
            {
                path: 'deliveries',
                loadComponent: () => import('./features/manager/deliveries-list/deliveries-list.component').then(m => m.ManagerDeliveriesListComponent)
            },
            {
                path: 'maintenance',
                loadComponent: () => import('./features/manager/maintenance-list/maintenance-list.component').then(m => m.ManagerMaintenanceListComponent)
            },
            {
                path: 'fuel',
                loadComponent: () => import('./features/manager/fuel-list/fuel-list.component').then(m => m.ManagerFuelListComponent)
            },
            {
                path: 'report',
                loadComponent: () => import('./features/manager/financial-report/financial-report.component').then(m => m.ManagerFinancialReportComponent)
            }
        ]
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'managers',
                loadComponent: () => import('./features/admin/managers-list/managers-list.component').then(m => m.ManagersListComponent)
            },
            {
                path: 'drivers',
                loadComponent: () => import('./features/admin/drivers-list/drivers-list.component').then(m => m.DriversListComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/admin/clients-list/clients-list.component').then(m => m.ClientsListComponent)
            },
            {
                path: 'trucks',
                loadComponent: () => import('./features/admin/trucks-list/trucks-list.component').then(m => m.TrucksListComponent)
            },
            {
                path: 'trailers',
                loadComponent: () => import('./features/admin/trailers-list/trailers-list.component').then(m => m.TrailersListComponent)
            },
            {
                path: 'trips',
                loadComponent: () => import('./features/admin/trips-list/trips-list.component').then(m => m.TripsListComponent)
            },
            {
                path: 'deliveries',
                loadComponent: () => import('./features/admin/deliveries-list/deliveries-list.component').then(m => m.DeliveriesListComponent)
            },
            {
                path: 'maintenance',
                loadComponent: () => import('./features/admin/maintenance-list/maintenance-list.component').then(m => m.MaintenanceListComponent)
            },
            {
                path: 'fuel',
                loadComponent: () => import('./features/admin/fuel-list/fuel-list.component').then(m => m.FuelListComponent)
            },
            {
                path: 'report',
                loadComponent: () => import('./features/admin/financial-report/financial-report.component').then(m => m.FinancialReportComponent)
            }
        ]
    },
    {
        path: 'driver',
        component: DriverLayoutComponent,
        canActivate: [driverGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/driver/dashboard/dashboard.component').then(m => m.DriverDashboardComponent)
            },
            {
                path: 'trips',
                loadComponent: () => import('./features/driver/trips-list/trips-list.component').then(m => m.DriverTripsListComponent)
            }
        ]
    },
    { path: '**', redirectTo: '/login' }
];

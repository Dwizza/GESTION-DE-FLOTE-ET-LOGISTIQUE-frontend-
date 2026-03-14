import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../core/models/analytics.model';

interface ChartSegment {
    label: string;
    value: number;
    color: string;
    percentage: number;
    dashArray: string;
    dashOffset: number;
}

interface BarItem {
    label: string;
    value: number;
    color: string;
    widthPercent: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    metrics: AnalyticsResponse | null = null;
    isLoading = true;
    errorMessage = '';

    // Chart data
    truckStatusSegments: ChartSegment[] = [];
    tripStatusSegments: ChartSegment[] = [];
    financialBars: BarItem[] = [];
    fleetBars: BarItem[] = [];

    // Color maps
    private truckStatusColors: Record<string, string> = {
        'AVAILABLE': '#10b981',
        'IN_TRIP': '#60a5fa',
        'IN_MAINTENANCE': '#f59e0b',
        'BROKEN': '#ef4444'
    };

    private truckStatusLabels: Record<string, string> = {
        'AVAILABLE': 'Disponible',
        'IN_TRIP': 'En trajet',
        'IN_MAINTENANCE': 'Maintenance',
        'BROKEN': 'En panne'
    };

    private tripStatusColors: Record<string, string> = {
        'PLANNED': '#a78bfa',
        'ONGOING': '#60a5fa',
        'COMPLETED': '#10b981',
        'CANCELLED': '#ef4444'
    };

    private tripStatusLabels: Record<string, string> = {
        'PLANNED': 'Planifié',
        'ONGOING': 'En cours',
        'COMPLETED': 'Complété',
        'CANCELLED': 'Annulé'
    };

    private brandColors = ['#f59e0b', '#60a5fa', '#10b981', '#a78bfa', '#ef4444', '#22d3ee', '#f472b6', '#fb923c'];

    ngOnInit(): void {
        this.loadMetrics();
    }

    loadMetrics() {
        this.analyticsService.getDashboardMetrics().subscribe({
            next: (data: AnalyticsResponse) => {
                this.metrics = data;
                this.buildCharts();
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Failed to load dashboard metrics', err);
                // Fallback data for UI demo
                this.metrics = {
                    totalTrucks: 28,
                    totalTrailers: 15,
                    totalDrivers: 34,
                    availableDrivers: 22,
                    activeTrips: 11,
                    totalRevenue: 154200,
                    totalFuelCost: 42800,
                    totalMaintenanceCost: 18500,
                    totalProfit: 92900,
                    trucksByStatus: { 'AVAILABLE': 14, 'IN_TRIP': 8, 'IN_MAINTENANCE': 4, 'BROKEN': 2 },
                    tripsByStatus: { 'PLANNED': 5, 'ONGOING': 11, 'COMPLETED': 42, 'CANCELLED': 3 },
                    trucksByBrand: { 'Scania': 8, 'Volvo': 6, 'Mercedes': 5, 'MAN': 4, 'DAF': 3, 'Renault': 2 },
                    trailersByType: { 'STANDARD': 6, 'FRIGO': 4, 'TANKER': 3, 'FLATBED': 2 }
                };
                this.buildCharts();
                this.isLoading = false;
            }
        });
    }

    private buildCharts() {
        if (!this.metrics) return;
        this.truckStatusSegments = this.buildDonutSegments(this.metrics.trucksByStatus || {}, this.truckStatusColors, this.truckStatusLabels);
        this.tripStatusSegments = this.buildDonutSegments(this.metrics.tripsByStatus || {}, this.tripStatusColors, this.tripStatusLabels);
        this.buildFinancialBars();
        this.buildFleetBars();
    }

    private buildDonutSegments(data: Record<string, number>, colors: Record<string, string>, labels: Record<string, string>): ChartSegment[] {
        if (!data || Object.keys(data).length === 0) return [];
        const total = Object.values(data).reduce((s, v) => s + v, 0);
        if (total === 0) return [];

        const circumference = 2 * Math.PI * 40; // r=40
        let offset = 0;
        const segments: ChartSegment[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value === 0) continue;
            const pct = (value / total) * 100;
            const segLen = (pct / 100) * circumference;
            segments.push({
                label: labels[key] || key,
                value,
                color: colors[key] || '#6b7280',
                percentage: Math.round(pct),
                dashArray: `${segLen} ${circumference - segLen}`,
                dashOffset: -offset
            });
            offset += segLen;
        }
        return segments;
    }

    private buildFinancialBars() {
        if (!this.metrics) return;
        if (this.metrics.totalRevenue == null) return;
        const values = [
            { label: 'Revenue', value: this.metrics.totalRevenue, color: '#f59e0b' },
            { label: 'Carburant', value: this.metrics.totalFuelCost, color: '#ef4444' },
            { label: 'Maintenance', value: this.metrics.totalMaintenanceCost, color: '#60a5fa' },
            { label: 'Profit', value: this.metrics.totalProfit, color: '#10b981' }
        ];
        const max = Math.max(...values.map(v => Math.abs(v.value)), 1);
        this.financialBars = values.map(v => ({
            ...v,
            widthPercent: Math.max((Math.abs(v.value) / max) * 100, 3)
        }));
    }

    private buildFleetBars() {
        if (!this.metrics) return;
        const brandEntries = Object.entries(this.metrics.trucksByBrand || {});
        const typeEntries = Object.entries(this.metrics.trailersByType || {});
        const all = [...brandEntries.map(([k, v], i) => ({ label: k, value: v, color: this.brandColors[i % this.brandColors.length] })),
        ...typeEntries.map(([k, v], i) => ({ label: k, value: v, color: this.brandColors[(brandEntries.length + i) % this.brandColors.length] }))];
        const max = Math.max(...all.map(v => v.value), 1);
        this.fleetBars = all.map(v => ({
            ...v,
            widthPercent: Math.max((v.value / max) * 100, 5)
        }));
    }

    getDonutTotal(segments: ChartSegment[]): number {
        return segments.reduce((s, seg) => s + seg.value, 0);
    }

    formatCurrency(value: number): string {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toString();
    }
}

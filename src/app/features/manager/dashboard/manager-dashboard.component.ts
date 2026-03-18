import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    selector: 'app-manager-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './manager-dashboard.component.html'
})
export class ManagerDashboardComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    metrics: AnalyticsResponse | null = null;
    isLoading = true;

    truckStatusSegments: ChartSegment[] = [];
    tripStatusSegments: ChartSegment[] = [];
    financialBars: BarItem[] = [];

    private truckStatusColors: Record<string, string> = {
        'AVAILABLE': '#10b981',
        'IN_TRIP': '#60a5fa',
        'IN_MAINTENANCE': '#f59e0b',
        'BROKEN': '#ef4444'
    };

    private tripStatusColors: Record<string, string> = {
        'PLANNED': '#a78bfa',
        'ONGOING': '#60a5fa',
        'COMPLETED': '#10b981',
        'CANCELLED': '#ef4444'
    };

    ngOnInit(): void {
        this.loadMetrics();
    }

    loadMetrics() {
        this.analyticsService.getDashboardMetrics().subscribe({
            next: (data) => {
                this.metrics = data;
                this.buildCharts();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load manager metrics', err);
                this.isLoading = false;
            }
        });
    }

    private buildCharts() {
        if (!this.metrics) return;
        this.truckStatusSegments = this.buildDonutSegments(this.metrics.trucksByStatus || {}, this.truckStatusColors);
        this.tripStatusSegments = this.buildDonutSegments(this.metrics.tripsByStatus || {}, this.tripStatusColors);
        this.buildFinancialBars();
    }

    private buildDonutSegments(data: Record<string, number>, colors: Record<string, string>): ChartSegment[] {
        const total = Object.values(data).reduce((s, v) => s + v, 0);
        if (total === 0) return [];

        const circumference = 2 * Math.PI * 40;
        let offset = 0;
        const segments: ChartSegment[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value === 0) continue;
            const pct = (value / total) * 100;
            const segLen = (pct / 100) * circumference;
            segments.push({
                label: key,
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
        const values = [
            { label: 'Revenu', value: this.metrics.totalRevenue || 0, color: '#f59e0b' },
            { label: 'Dépenses', value: (this.metrics.totalFuelCost || 0) + (this.metrics.totalMaintenanceCost || 0), color: '#ef4444' },
            { label: 'Profit', value: this.metrics.totalProfit || 0, color: '#10b981' }
        ];
        const max = Math.max(...values.map(v => Math.abs(v.value)), 1);
        this.financialBars = values.map(v => ({
            ...v,
            widthPercent: Math.max((Math.abs(v.value) / max) * 100, 3)
        }));
    }

    getDonutTotal(segments: ChartSegment[]): number {
        return segments.reduce((s, seg) => s + seg.value, 0);
    }
}

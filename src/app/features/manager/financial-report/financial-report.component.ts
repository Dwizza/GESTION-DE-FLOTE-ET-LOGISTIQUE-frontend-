import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../core/models/analytics.model';

@Component({
    selector: 'app-manager-financial-report',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './financial-report.component.html',
    styleUrls: ['./financial-report.component.css']
})
export class ManagerFinancialReportComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    metrics: AnalyticsResponse | null = null;
    isLoading = true;
    currentDate = new Date();

    ngOnInit(): void {
        this.analyticsService.getDashboardMetrics().subscribe({
            next: (data: AnalyticsResponse) => {
                this.metrics = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading report data', err);
                this.isLoading = false;
            }
        });
    }

    printReport() {
        window.print();
    }
}

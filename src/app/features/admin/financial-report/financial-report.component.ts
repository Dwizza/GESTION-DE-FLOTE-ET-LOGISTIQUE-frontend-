import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../core/models/analytics.model';

@Component({
    selector: 'app-financial-report',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './financial-report.component.html',
    styleUrls: ['./financial-report.component.css']
})
export class FinancialReportComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    metrics: AnalyticsResponse | null = null;
    isLoading = true;
    currentDate = new Date();

    ngOnInit(): void {
        this.analyticsService.getDashboardMetrics().subscribe({
            next: (data) => {
                this.metrics = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading report data', err);
                this.isLoading = false;
            }
        });
    }

    printReport() {
        window.print();
    }
}
